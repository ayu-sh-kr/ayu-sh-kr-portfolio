# Spring Boot 4.2 and the release train behind it

An order service might use Spring Data for its repositories, Spring Security for authentication and Spring Cloud for configuration. The libraries have separate versions, but they have to work together in the same application. **Spring Boot 4.2** gives that service a new baseline to upgrade to.

[Spring's release calendar](https://spring.io/projects/) grouped **319 open-source and Enterprise release entries** under November 19. The major release announcements appeared on November 19 and 20, spanning the core framework, data access, security, batch jobs, cloud services and AI.

## How Spring ships the updates together

In September, Spring [moved from staggered releases over two weeks to a single release day](https://spring.io/blog/2026/09/21/releasing-spring-for-modern-challenges/): the **Thursday after the third Monday** of each month. Spring reported receiving nearly 80 community security reports a month since March, on top of its own scanning. Publishing fixes together means teams can get updates for different parts of their stack without waiting for each project's release day.

The calendar tells developers when the releases arrive. The [Boot 4.2 dependency set](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.2-Release-Notes) tells them which versions go together: it pairs **Framework 7.1** with **Data 2026.1** and **Security 7.2**, among others. Spring Cloud manages its own modules through a separate version list, called a bill of materials. For the order service, the matching combination is **Boot 4.2 with Cloud 2026.0**.

## What changed across the stack

| Release | A change worth knowing |
| --- | --- |
| [Framework 7.1](https://github.com/spring-projects/spring-framework/releases/tag/v7.1.0) | Moves to Reactor 2026.0 and Micrometer 1.18, and lowers the default expression-nesting limit. |
| [Boot 4.2](https://spring.io/blog/2026/11/19/spring-boot-4-2-0-available-now/) | Speeds up class and resource lookup in executable JARs, a different approach from [native compilation or JVM AOT caching](/blog/java-native-builds-graalvm-vs-leyden/). CI runners can also share a build cache through a registry. |
| [Data 2026.1](https://spring.io/blog/2026/11/19/spring-data-2026-1-0-generally-available/) | Adds Redis JSON support and Hibernate 8 support through JPA 4.0. |
| [Security 7.2](https://github.com/spring-projects/spring-security/releases/tag/7.2.0) | Aligns with Framework 7.1 and adds content-security-policy nonce support to its default login and passkey-registration pages. |
| [Batch 6.1](https://spring.io/blog/2026/11/19/spring-batch-6-1-0-available-now/) | Adds `@JobParameter` for injecting job parameters and a new pageable item reader. |
| [Cloud 2026.0, “Paddington”](https://spring.io/blog/2026/11/20/spring-cloud-2026-0-0-has-been-released/) | Targets Boot 4.2 and lets clients use OAuth 2 to authenticate with Config Server. |
| [AI 2.1](https://spring.io/blog/2026/11/20/spring-ai-2-1-0-GA-available-now/) | Builds on Boot 4.2 with session memory, tool-call approvals and support for the newer stateless MCP protocol. |

## What to check before upgrading

Teams staying on an earlier release line can apply the maintenance updates in [Boot 4.0.10](https://spring.io/blog/2026/11/20/spring-boot-4-0-10-available-now/) or [4.1.3](https://spring.io/blog/2026/11/20/spring-boot-4-1-3-available-now/) while preparing to move. Spring AI also released 2.0.3 alongside 2.1.

For teams moving to Boot 4.2, the release notes deprecate `RestTemplate` support in favour of `RestClient` and explain changes to forwarded headers and messaging configuration.

For the order service, start with the matched Boot and Cloud versions, then run the tests that cross those layers: configuration loading, authenticated requests and repository calls. The release train makes the versions available together. Those tests tell the team whether they work together in its service.
