# Spring Boot 4.2 and Spring Framework 7.1: What Changed Across Spring

The [Spring release calendar](https://spring.io/projects/) grouped **319 release entries** under November 19, including open-source and Enterprise versions. **Spring Boot 4.2** headlined the November 19 and 20 announcements, but the update ran deeper: data access, security, batch and messaging projects moved to a new **Spring Framework 7.1** baseline, with new Cloud and AI releases alongside them.

## How the Spring release train fits together

Spring previously published projects over two weeks in dependency order. In September, it [moved the regular release train to one day](https://spring.io/blog/2026/09/21/releasing-spring-for-modern-challenges/), the Thursday after the third Monday of the month. The goal was to publish fixes across the portfolio together instead of making teams wait for each project’s turn.

While the calendar shows **when** projects release, [Boot 4.2’s managed dependency versions](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.2-Release-Notes#dependency-upgrades) show **which versions go together**. The release notes list **13 Spring project upgrades**: Framework, Data, Security, Batch, AMQP, Kafka, Integration, GraphQL, HATEOAS, LDAP, REST Docs, Session and Web Services. Boot manages those versions together. Spring Cloud has a separate dependency list for its modules, with **Cloud 2026.0** based on Boot 4.2. Spring AI 2.1 also builds on Boot 4.2.

That alignment is visible in the move from `RestTemplate` to `RestClient`. [Framework 7.1 formally deprecates RestTemplate](https://github.com/spring-projects/spring-framework/wiki/Spring-Framework-7.1-Release-Notes); Boot 4.2 deprecates its supporting configuration and test client, and [Integration 7.2 deprecates its RestTemplate-based outbound HTTP configuration](https://spring.io/blog/2026/11/19/spring-integration-7-2-0-available/). One framework change reaches three layers of the stack in the same wave.

## The releases worth a closer look

| Release | What changed |
| --- | --- |
| [Spring Boot 4.2](https://spring.io/blog/2026/11/19/spring-boot-4-2-0-available-now/) | Faster class and resource lookup in executable JARs, separate from [native compilation and JVM AOT caching](/blog/java-native-builds-graalvm-vs-leyden/). Buildpack builds can now share cached layers through a container registry. |
| [Spring Data 2026.1](https://spring.io/blog/2026/11/19/spring-data-2026-1-0-generally-available/) | Redis JSON support and Hibernate 8 support through JPA 4.0. |
| [Spring Security 7.2](https://github.com/spring-projects/spring-security/releases/tag/7.2.0) | Moves to Framework 7.1 and adds content security policy nonce support to the default login and passkey registration pages. |
| [Spring Batch 6.1](https://spring.io/blog/2026/11/19/spring-batch-6-1-0-available-now/) | Adds `@JobParameter` for direct injection and uses Spring Framework’s `JdbcClient` for JDBC job metadata. |
| [Spring Cloud 2026.0](https://spring.io/blog/2026/11/20/spring-cloud-2026-0-0-has-been-released/) | Gateway moves to Spring Framework’s retry API, and Config clients gain OAuth 2 support. |
| [Spring AI 2.1](https://spring.io/blog/2026/11/20/spring-ai-2-1-0-GA-available-now/) | Adds session memory, tool-call approvals and support for the newer stateless MCP protocol. |

## A new baseline, with maintenance releases alongside it

Spring also released [Boot 4.0.10](https://spring.io/blog/2026/11/20/spring-boot-4-0-10-available-now/) and [4.1.3](https://spring.io/blog/2026/11/20/spring-boot-4-1-3-available-now/) for teams staying on those lines. [Cloud 2025.1.5](https://spring.io/blog/2026/11/20/spring-cloud-2025-1-5-has-been-released/) is based on Boot 4.0.10, and Spring AI 2.0.3 shipped alongside 2.1.

The November wave shows two kinds of coordination. The release calendar brings fixes and new versions together. Boot’s managed versions and Cloud’s separate version list show how independently versioned projects fit on the new framework baseline, while the maintenance releases keep earlier lines moving.
