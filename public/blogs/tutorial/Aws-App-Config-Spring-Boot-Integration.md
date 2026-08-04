# AWS AppConfig Spring Boot Integration

Keeping configuration in `application.yml` works well until a setting must change
without rebuilding and redeploying the application. AWS AppConfig provides a managed
place to version and deploy that configuration, while Spring Boot's Config Data API
provides a natural way to load it during application startup.

This integration adds an `aws-appconfig:` location to `spring.config.import`. Spring
Boot resolves the location, fetches the deployed YAML from AppConfig, and merges its
properties into the application environment alongside local configuration files.

## Overview

An AppConfig integration has two distinct phases. The first is startup loading: the
application retrieves a deployed profile while Spring Boot is building its
`Environment`. The second is runtime refresh: a running process detects a newer
configuration, installs it as a property source, and updates the beans that consume
those properties.

The complete flow looks like this:

```text
AWS AppConfig deployment
    ↓
Direct AppConfig Data polling or AWS AppConfig Agent
    ↓
New configuration payload detected and validated
    ↓
Spring Environment property source replaced
    ↓
Spring Cloud refresh triggered
    ↓
Mutable properties rebound and refresh-scoped beans recreated lazily
```

The startup half can be implemented entirely with Spring Boot's Config Data API. The
runtime half needs an additional lifecycle: something must detect changes, something
must update the `Environment`, and something must refresh or replace the affected
objects. Treating these as separate responsibilities avoids a common mistake where an
application successfully downloads new bytes but continues using the old values.

## How the configuration models fit together

AWS AppConfig organizes configuration using the following hierarchy:

```text
Application → Environment → Configuration profile → Deployment
```

An application is the top-level container. Environments represent deployment targets
such as `stage` and `prod`. Configuration profiles divide settings by purpose, and a
deployment makes a selected profile version available to an environment.

This hierarchy is related to Spring profiles, but the two are not the same. A Spring
profile chooses which local application configuration is active. An AppConfig
environment identifies where a remote configuration is deployed. One Spring profile
can therefore import several AppConfig profiles:

```text
Spring profile: stage
└── AppConfig application: myapp
    └── AppConfig environment: stage
        ├── db-credentials
        ├── cache-settings
        └── feature-flags
```

Separating profiles this way keeps unrelated settings in independent deployment units.
A database change does not need to be bundled with a feature-flag deployment, even
though both are consumed by the same Spring Boot environment.

## Define the import contract

The application will use a location with three path segments: the AppConfig
application, environment, and configuration profile.

```yaml
spring:
  config:
    import:
      - aws-appconfig:myapp/stage/db-credentials
```

During bootstrap, Spring Boot processes this location in four steps:

1. A location resolver recognizes the `aws-appconfig:` prefix.
2. The resolver converts the path into a typed configuration resource.
3. A loader retrieves the deployed profile from AWS AppConfig.
4. Spring Boot adds the returned YAML property sources to its environment.

The implementation below performs this work once during startup. Runtime refresh is a
different concern and requires a polling process or the AWS AppConfig Agent.

## Add the AWS SDK dependency

The loader uses the AWS SDK for Java 2.x AppConfig Data client. If the project already
imports the AWS SDK BOM, only the `appconfigdata` module is required.

```kotlin
dependencies {
    implementation(platform("software.amazon.awssdk:bom:<aws-sdk-version>"))
    implementation("software.amazon.awssdk:appconfigdata")
}
```

Local authentication through an IAM Identity Center profile also requires the SDK's
`sso` and `ssooidc` modules:

```kotlin
dependencies {
    implementation("software.amazon.awssdk:sso")
    implementation("software.amazon.awssdk:ssooidc")
}
```

## Give the application read access

The runtime identity needs permission to start an AppConfig Data session and retrieve
its latest deployed configuration. The old `appconfig:GetConfiguration` action is not
needed because that API has been deprecated.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "appconfig:StartConfigurationSession",
        "appconfig:GetLatestConfiguration"
      ],
      "Resource": "arn:aws:appconfig:<region>:<account-id>:application/<application-id>/environment/<environment-id>/configuration/<profile-id>"
    }
  ]
}
```

Use a role attached to the workload when the application runs on EC2, ECS, EKS, or
Lambda. The SDK's default credential provider chain discovers those role credentials,
so the application does not need embedded access keys. A profile encrypted with a
customer-managed KMS key also requires `kms:Decrypt` permission for that key.

For local development, configure an IAM Identity Center profile and sign in before
starting the application:

```bash
aws sso login --profile appconfig-dev
AWS_PROFILE=appconfig-dev AWS_REGION=us-east-1 ./gradlew bootRun
```

The profile supplies temporary credentials and the region through the same default
provider chains used in AWS environments. Running `aws sts assume-role` separately is
not enough unless its returned credentials are written to a profile or exported for
the application process.

## Represent an AppConfig location

A `ConfigDataResource` describes what should be loaded. It contains no AWS logic; it
only carries the three identifiers from the import path through Spring Boot's bootstrap
pipeline.

```kotlin
data class AwsAppConfigDataResource(
    val application: String,
    val environment: String,
    val profile: String
) : ConfigDataResource() {
    val path: String = "$application/$environment/$profile"
}
```

Using a Kotlin data class gives the resource stable equality and hash-code behavior,
which is useful when Spring Boot tracks resolved configuration resources.

## Resolve the import location

The `ConfigDataLocationResolver` owns the URI-like syntax. It claims only locations
with the expected prefix, validates all three path segments, and returns a typed
resource. It deliberately performs no network calls.

```kotlin
class AwsAppConfigLocationResolver :
    ConfigDataLocationResolver<AwsAppConfigDataResource> {

    override fun isResolvable(
        context: ConfigDataLocationResolverContext,
        location: ConfigDataLocation
    ): Boolean = location.hasPrefix(PREFIX)

    override fun resolve(
        context: ConfigDataLocationResolverContext,
        location: ConfigDataLocation
    ): List<AwsAppConfigDataResource> {
        val parts = location.getNonPrefixedValue(PREFIX).split('/')

        require(parts.size == 3 && parts.none(String::isBlank)) {
            "Invalid AWS AppConfig location. Expected " +
                "aws-appconfig:<application>/<environment>/<profile>"
        }

        return listOf(
            AwsAppConfigDataResource(
                application = parts[0],
                environment = parts[1],
                profile = parts[2]
            )
        )
    }

    private companion object {
        const val PREFIX = "aws-appconfig:"
    }
}
```

Keeping parsing in the resolver makes malformed imports fail early with an error that
explains the required format.

## Load the deployed YAML

The `ConfigDataLoader` performs the AWS call. `AppConfigDataClient.create()` resolves
credentials and region through the AWS SDK's default provider chains, starts a session,
and retrieves the current configuration using the session's initial token.

```kotlin
class AwsAppConfigDataLoader : ConfigDataLoader<AwsAppConfigDataResource> {

    override fun load(
        context: ConfigDataLoaderContext,
        resource: AwsAppConfigDataResource
    ): ConfigData = AppConfigDataClient.create().use { client ->
        val session = client.startConfigurationSession { request ->
            request.applicationIdentifier(resource.application)
            request.environmentIdentifier(resource.environment)
            request.configurationProfileIdentifier(resource.profile)
        }

        val response = client.getLatestConfiguration { request ->
            request.configurationToken(session.initialConfigurationToken())
        }

        val propertySources = YamlPropertySourceLoader().load(
            "aws-appconfig:${resource.path}",
            ByteArrayResource(response.configuration().asByteArray())
        )

        ConfigData(propertySources)
    }
}
```

The payload is parsed with Spring Boot's YAML loader, so imported values behave like
properties from a local YAML file. If authentication fails, no deployment exists, or
the payload is invalid YAML, application startup fails. That fail-fast behavior keeps
the service from starting with incomplete configuration.

The client is closed after loading because this implementation does not poll for
changes. A longer-lived refresh implementation would instead retain the session,
replace the configuration token after every response, and respect the server-provided
poll interval.

## Register the resolver and loader

Spring Boot discovers custom Config Data components through
`src/main/resources/META-INF/spring.factories`. Register both implementations with
their fully qualified class names:

```properties
org.springframework.boot.context.config.ConfigDataLocationResolver=\
com.example.config.AwsAppConfigLocationResolver

org.springframework.boot.context.config.ConfigDataLoader=\
com.example.config.AwsAppConfigDataLoader
```

Without this registration, Spring Boot sees `aws-appconfig:` as an unknown import
scheme and neither class is called.

## What happens during startup

The complete startup path is now straightforward:

```text
application.yml
    ↓
aws-appconfig:myapp/stage/db-credentials
    ↓
AwsAppConfigLocationResolver
    ↓
AwsAppConfigDataResource
    ↓
AwsAppConfigDataLoader
    ↓
AWS AppConfig Data API
    ↓
Spring Environment
```

Spring Boot merges the imported property sources according to its normal Config Data
precedence rules. Where an import appears also affects precedence, so keep related
imports together and test deliberate overrides between local and remote values.

## Moving from startup loading to runtime refresh

AWS AppConfig can deploy configuration while an application is running, but the custom
loader above reads only once. Changing a profile does not automatically mutate Spring's
`Environment`, and fields populated through `@Value` or `@ConfigurationProperties` do
not become dynamic merely because a newer payload exists in AWS.

A runtime-refresh design must complete three steps in order:

1. Detect and retrieve a configuration version that differs from the current version.
2. Parse, validate, and replace the AppConfig property source atomically.
3. Rebind mutable properties or recreate the beans that depend on the changed values.

There are two practical ways to implement the first step: poll the AppConfig Data API
directly, or let the AWS AppConfig Agent manage the AWS-facing polling and cache.

## Option 1: Poll the AppConfig Data API directly

A direct poller keeps the `AppConfigDataClient` and configuration session alive after
startup. Every `GetLatestConfiguration` response provides both the token for the next
request and the minimum delay before that request. The poller must replace the token
after every call, even when the configuration body is empty.

Start the polling lifecycle after Spring has finished bootstrapping. An
`ApplicationReadyEvent` listener is a clear place to schedule the first request because
the initial Config Data import and all application beans are available by then.

```kotlin
@Component
class AppConfigPollingLifecycle(
    private val poller: AppConfigPoller,
    private val taskScheduler: TaskScheduler
) {
    private var pollingTask: ScheduledFuture<*>? = null

    @EventListener(ApplicationReadyEvent::class)
    fun start() {
        pollingTask = taskScheduler.scheduleWithFixedDelay(
            poller::pollOnce,
            Duration.ofSeconds(45)
        )
    }

    @PreDestroy
    fun stop() {
        pollingTask?.cancel(false)
    }
}
```

This example shows lifecycle ownership rather than the complete AppConfig protocol. A
production poller should schedule its next call using
`NextPollIntervalInSeconds`, serialize refresh attempts, and trigger an update only
when the response contains a new payload. Comparing a configuration version or content
hash prevents an unchanged response from causing unnecessary bean recreation.

Direct polling gives the application complete control, but it also makes the
application responsible for session tokens, retry behavior, jitter, throttling, cache
availability, and AWS API cost.

## Option 2: Retrieve through AWS AppConfig Agent

The [AWS AppConfig Agent](https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-agent.html)
runs beside the application, polls AppConfig asynchronously, and keeps the latest
configuration in a local cache. The application retrieves that cache through the
agent's HTTP endpoint, which uses port `2772` by default:

```text
GET http://localhost:2772/applications/myapp/environments/stage/configurations/db-credentials
```

Using the agent removes AWS session-token and cache management from application code.
It does not, however, push a callback containing new bytes into the Spring process.
The application still needs a small adapter that periodically reads the local endpoint
and invokes a callback when the returned bytes or version change.

```text
AWS AppConfig Agent
    ↓ polls AWS and updates its cache
Local agent endpoint
    ↓ application-owned watcher reads cached bytes
Configuration callback
    ↓ validates and replaces the property source
Spring refresh coordinator
```

An event-driven variation can use AWS AppConfig deployment events delivered through
[Amazon EventBridge](https://docs.aws.amazon.com/eventbridge/latest/ref/events-ref-appconfig.html),
SNS, or SQS. A deployment-complete event tells the application that it should retrieve
the latest configuration; it is not the configuration payload itself. EventBridge
service-event delivery is best effort, so event-driven refresh should still have a
periodic reconciliation path rather than relying on a notification as the only source
of truth.

The agent remains useful in this design because the event handler can read the latest
bytes from localhost instead of every application instance making an immediate AWS API
call after a deployment.

## Add Spring Cloud refresh support

Spring Boot Actuator does not provide `/actuator/refresh` by itself. The refresh
infrastructure comes from
[Spring Cloud Context](https://docs.spring.io/spring-cloud-commons/reference/spring-cloud-commons/application-context-services.html),
while Actuator exposes it as a management endpoint.

```kotlin
dependencies {
    implementation("org.springframework.cloud:spring-cloud-context")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
}
```

Manage the Spring Cloud version through the release-train BOM that matches the Spring
Boot version. To expose the endpoint over HTTP, add it explicitly:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,refresh
```

The endpoint is invoked with a `POST` request:

```bash
curl -X POST http://localhost:8080/actuator/refresh
```

Do not expose a refresh endpoint publicly without authentication and authorization. It
changes live application behavior and should be treated as an operational control, not
as an ordinary application endpoint.

An in-process poller does not need to call its own HTTP endpoint. Spring Cloud exposes
the same operation through `ContextRefresher`:

```kotlin
@Component
class AppConfigRefreshCoordinator(
    private val contextRefresher: ContextRefresher
) {
    fun refresh(): Set<String> = contextRefresher.refresh()
}
```

This works when the AppConfig property source participates in Spring Cloud's refresh
bootstrap and can be loaded again. If the poller or agent callback already supplies the
new bytes, the coordinator must first parse those bytes and replace the existing
property source. Calling refresh without changing the `Environment` only recreates
beans from the same values.

The payload-driven path is conceptually:

```kotlin
fun apply(payload: ByteArray) {
    val changedKeys = propertySourceStore.replace(payload)
    eventPublisher.publishEvent(EnvironmentChangeEvent(changedKeys))
    refreshScope.refreshAll()
}
```

`propertySourceStore.replace` represents application-owned logic that parses the YAML,
validates it, computes added, changed, and removed keys, and atomically replaces the
named `PropertySource`. Publishing `EnvironmentChangeEvent` activates Spring Cloud's
configuration-properties rebinder, while `refreshAll()` invalidates refresh-scoped
targets.

Property removal needs special handling. Spring Cloud does not reliably turn a missing
key into a reset value during ordinary rebinding. Prefer an explicit replacement value,
or rebuild and swap a complete immutable snapshot when deletion must change behavior.

## What a Spring Cloud refresh actually does

A refresh is not a full application restart. It is better understood as a selective,
lazy restart of refresh-aware beans.

Spring Cloud refresh performs two related operations:

- It updates the environment and rebinds supported `@ConfigurationProperties` beans.
- It clears the target cache for beans annotated with `@RefreshScope`.

An `@RefreshScope` bean is represented by a lazy proxy. During refresh, Spring keeps
the proxy but discards its current target. The target is constructed again the next
time application code calls the proxy, using the latest values from the environment.
This is why refresh can feel like restarting part of the application lazily, while the
web server, application context, and unrelated singleton beans keep running.

The separate `/actuator/restart` endpoint closes and restarts the application context.
It is disabled by default and has a much larger operational impact. It should not be
confused with `/actuator/refresh`.

Refresh boundaries also matter. Putting `@RefreshScope` on a `@Configuration` class
does not automatically make every bean declared by that class refreshable. A dependent
singleton will continue holding its original dependency unless that dependency is a
refresh-scoped proxy or the consumer itself is recreated.

## Why immutable Kotlin configuration is difficult to refresh

[Spring Boot supports immutable Kotlin data classes](https://docs.spring.io/spring-boot/reference/features/kotlin.html)
with constructor-bound `@ConfigurationProperties`, which is an excellent model for
startup configuration:

```kotlin
@ConfigurationProperties("checkout")
data class CheckoutProperties(
    val enabled: Boolean,
    val timeout: Duration
)
```

Runtime rebinding is different. `ConfigurationPropertiesRebinder` can update a mutable
JavaBean-style object through setters or writable fields, but it cannot reset the
`val` properties of an existing constructor-bound data class. Those fields are final,
and the object was designed to be created as one immutable snapshot.

This is not strictly a Java-versus-Kotlin problem. A mutable Kotlin class with `var`
properties can be rebound, while immutable Java records and other constructor-bound
Java classes have the same limitation.

```kotlin
@ConfigurationProperties("checkout")
class CheckoutProperties {
    var enabled: Boolean = false
    var timeout: Duration = Duration.ofSeconds(2)
}
```

The mutable form works with the rebinder because Spring can write the new values onto
the existing instance. The tradeoff is that consumers can observe individual fields
changing at different moments unless access is coordinated.

Trying to force reflection to write Kotlin `val` fields is fragile and can break final
field assumptions. Safer approaches preserve immutability by replacing an entire
snapshot:

1. Put mutable `@ConfigurationProperties` behind a service boundary and expose only
   read operations to the rest of the application.
2. Recreate an immutable configuration snapshot behind a refresh-scoped interface or
   factory, then let consumers use the proxy rather than the concrete data class.
3. Parse the new payload into a fresh data class and atomically swap it through an
   `AtomicReference`-backed provider.
4. Restart the application instance for infrastructure settings that cannot be changed
   safely while resources are active.

An atomic snapshot provider is explicit and works consistently for Kotlin data
classes:

```kotlin
@Component
class CheckoutSettingsProvider(initial: CheckoutProperties) {
    private val current = AtomicReference(initial)

    fun get(): CheckoutProperties = current.get()

    fun replace(next: CheckoutProperties) {
        current.set(next)
    }
}
```

The AppConfig callback parses and validates a complete `CheckoutProperties` value
before calling `replace`. Every reader sees either the old snapshot or the new one;
there is no partially rebound object. The cost is that consumers must read through the
provider instead of injecting the data class once and retaining it forever.

## Choosing the refresh boundary

Not every property should be refreshed. Feature flags, limits, cohort assignments,
and presentation settings are usually good candidates. Database URLs, thread-pool
construction parameters, and clients with complex internal state may require a
carefully designed refresh-scoped factory or a process restart.

Whichever retrieval option you choose, keep one refresh coordinator responsible for
the transition. It should validate the payload before publishing it, serialize
concurrent refreshes, record the old and new versions, expose success and failure
metrics, and retain the last known-good snapshot. That turns runtime refresh from an
implicit side effect into an observable state transition.

For applications dominated by immutable Kotlin configuration, an atomic snapshot
provider or a controlled instance restart is often simpler than attempting to make
every object rebindable. Spring Cloud refresh is most effective when the refresh
boundary is explicit and the beans inside that boundary were designed to be recreated.
