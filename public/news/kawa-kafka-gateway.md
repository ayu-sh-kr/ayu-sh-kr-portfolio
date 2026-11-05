# Kawa puts virtual topics and access rules in front of Kafka

One service publishes an event, and several others depend on it. In an online shop, the order service owns order events, while shipping and billing consume them through Kafka. If the order-service team changes the topic those events are stored in, every consumer tied to that name needs attention. As more services subscribe, a change owned by one team becomes work for several.

**Kawa**, a Kafka gateway from Jonas Geiregat, gives these services a shared point of access to Kafka. It can expose stable topic names, control which clients can use them and filter the events returned to consumers. The project tagged **v0.1.0** on October 29.

> **Kafka gateway.** A gateway sits between applications and Kafka’s brokers, the servers that store and serve events. Services connect their Kafka clients to Kawa, which forwards their requests to the brokers. They can keep their existing client libraries, with connection settings updated for the gateway.

## How Kawa stays in the request path

Connecting to Kafka involves more than knowing its initial address. A client asks the cluster which broker handles the data it needs, then connects to the addresses returned. This happens when the order service publishes events and when shipping or billing reads them.

Kawa understands those Kafka requests and replies. It replaces broker and group coordinator addresses in discovery replies with its own advertised address, keeping subsequent client connections going through the gateway. It then routes requests to the appropriate broker.

That position lets Kawa apply rules to requests and translate the topic names services use. Both the order service’s writes and its subscribers’ reads can go through the same mapping.

![Centered isometric view of the order service publishing events and shipping and billing reading them through Kawa. The gateway applies access rules and maps orders to orders-v2 across an illustrative two-broker Kafka cluster.](/news/assets/kawa-kafka-gateway/virtual-topic-route.svg)

## A stable name for the services consuming orders

Suppose the order-service team stores its events in `orders-v2`. Kawa can expose that physical topic as `orders`. The order service publishes using the alias, and shipping and billing subscribe using it. Kawa translates their requests to the underlying topic. The order-service team still owns the events and their format.

That distinction matters during a migration. Updating the mapping can redirect requests, but the team still needs to handle existing events, consumer positions and any changes to the event format. A stable name removes one dependency that would otherwise be embedded in every subscribing service.

Kawa can also give consumers filtered views of a topic. Shipping might receive only orders ready for dispatch, while billing reads the broader stream. Role-based access rules control what each client may do, and governance rules can constrain operations such as creating topics or changing partition counts.

Those capabilities add another step to the request path. The tagged project provides no published throughput or latency baseline, so its cost needs to be measured with the application’s own traffic.

For the order-service team, Kawa offers a way to manage how its events are exposed to shipping, billing and future subscribers. Those services can share a stable topic name while retaining their own responsibilities. As the application grows, that can reduce the number of teams that need to deploy together when the underlying topic mapping changes.

## Sources

- [Geiregat’s announcement](https://www.linkedin.com/posts/jonasgeiregat_kawa-a-kafka-gateway-a-thing-that-sits-activity-7507717508645392384-zvEy).
- [Kawa v0.1.0 source](https://github.com/kawa-platform/kawa-gateway/tree/v0.1.0) and [example Compose setup](https://github.com/kawa-platform/kawa-gateway/blob/v0.1.0/docker-compose.yml).
- [Broker and coordinator address rewriting](https://github.com/kawa-platform/kawa-gateway/blob/v0.1.0/kawa-server/src/main/java/io/jonasg/kawa/server/endpoint/BrokerEndpointInterceptor.java) and [virtual topic configuration](https://github.com/kawa-platform/kawa-gateway/blob/v0.1.0/kawa-config/src/main/java/io/jonasg/kawa/config/VirtualTopicConfig.java).
