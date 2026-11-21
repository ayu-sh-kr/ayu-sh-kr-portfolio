# Spring Boot 4.2 and the release train behind it

Upgrading a Spring service can mean moving its framework, database libraries, security and cloud configuration together. This week's **Spring Boot 4.2** release shows how Spring coordinates that work, bringing those dependencies into a new application baseline alongside updates for batch processing and AI.

The scale is visible in [Spring's release calendar](https://spring.io/projects/): it grouped **319 release entries** under November 19, including open-source and Enterprise versions. The headline general-availability announcements landed on November 19–20. That is a calendar count across release lines, not 319 separate projects.

## Why so much arrives together

This timing is deliberate. In September, Spring [compressed its release train from two weeks to one day](https://spring.io/blog/2026/09/21/releasing-spring-for-modern-challenges/): the **Thursday after the third Monday** of each month. Previously, projects shipped on different days according to their position in the dependency tree.

The change responds to security pressure. Spring reported nearly 80 community security reports a month since March, alongside internal scanning. Releasing fixes together reduces the period in which teams receive one project's patch while waiting for the rest of the stack.

Coordination also happens through version management. Framework supplies the foundation; [Boot 4.2's dependency set](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.2-Release-Notes) brings together Framework 7.1, Data 2026.1, Security 7.2 and other projects. Cloud has its own bill of materials, a version list for its modules: **Cloud 2026.0 targets Boot 4.2**.

For an order service using database repositories, authentication and centralised configuration, this provides a defined combination to upgrade and test, instead of independently selecting the newest version of every library.

## What the new releases bring

| Release | A change worth knowing |
| --- | --- |
| [Framework 7.1](https://github.com/spring-projects/spring-framework/releases/tag/v7.1.0) | The core foundation moves with Reactor 2026.0 and Micrometer 1.18; the final release also tightens expression-nesting limits. |
| [Boot 4.2](https://spring.io/blog/2026/11/19/spring-boot-4-2-0-available-now/) | Optimises executable-JAR startup and adds registry-backed build caches that CI runners can share. |
| [Data 2026.1](https://spring.io/blog/2026/11/19/spring-data-2026-1-0-generally-available/) | Adds Redis JSON support and Hibernate 8 support through JPA 4.0. |
| [Security 7.2](https://github.com/spring-projects/spring-security/releases/tag/7.2.0) | Aligns with Framework 7.1 and adds content-security-policy nonce support to its default login and passkey-registration pages. |
| [Batch 6.1](https://spring.io/blog/2026/11/19/spring-batch-6-1-0-available-now/) | Adds `@JobParameter` for injecting job parameters and a new pageable item reader. |
| [Cloud 2026.0, “Paddington”](https://spring.io/blog/2026/11/20/spring-cloud-2026-0-0-has-been-released/) | Brings the distributed-services train onto Boot 4.2, including OAuth 2 authorisation for Config clients. |
| [AI 2.1](https://spring.io/blog/2026/11/20/spring-ai-2-1-0-GA-available-now/) | Builds on Boot 4.2 with session memory, tool-call approvals and support for the newer stateless MCP protocol. |

Boot's startup work optimises how executable JARs find classes and resources. It is a separate improvement from the [native compilation and JVM AOT caching approaches](/blog/java-native-builds-graalvm-vs-leyden/) covered earlier.

## A shared baseline, with room to migrate

The wave also includes [Boot 4.0.10](https://spring.io/blog/2026/11/20/spring-boot-4-0-10-available-now/) and [4.1.3 maintenance releases](https://spring.io/blog/2026/11/20/spring-boot-4-1-3-available-now/), alongside AI 2.0.3. Existing applications have an update path while teams prepare for the newer generation.

Moving to Boot 4.2 still involves application changes. Its release notes deprecate `RestTemplate` support in favour of `RestClient` and describe changed proxy-header and messaging configuration.

For that order service, Spring's significance is the connection between these layers: the database, security rules and cloud configuration can advance against a defined baseline. The coordinated train makes the release set available together; the application's integration tests establish when it is ready to move.
