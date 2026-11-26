# Kawa puts virtual topics and access rules in front of Kafka

Change the Kafka topic behind your application without updating the topic name in every consumer. That’s the idea behind **Kawa’s virtual topics**. Applications use a stable name, while the gateway maps it to the topic that actually stores the events.

**Kawa**, a Kafka gateway from Jonas Geiregat, sits between your applications and Kafka. Alongside topic mapping, it can control access and filter the events consumers receive. The project tagged **v0.1.0** on October 29.

> **Kafka gateway.** A gateway sits between applications and Kafka’s brokers, the servers that store and serve events. Services connect their Kafka clients to Kawa, which forwards their requests to the brokers. They can keep their existing client libraries, with connection settings updated for the gateway.

## How Kawa stays in the request path

Connecting to Kafka involves more than knowing its initial address. A client asks the cluster which broker handles the data it needs, then connects to the addresses returned. Producers and consumers both rely on this discovery process.

Kawa understands those Kafka requests and replies. It replaces broker and group coordinator addresses in discovery replies with its own advertised address, keeping subsequent client connections going through the gateway. It then routes requests to the appropriate broker.

That position lets Kawa apply rules to requests and translate the topic names services use. Producers and consumers can use the same virtual name for writes and reads.

![Centered isometric view of the order service publishing events and shipping and billing reading them through Kawa. The gateway applies access rules and maps orders to orders-v2 across an illustrative two-broker Kafka cluster.](/news/assets/kawa-kafka-gateway/virtual-topic-route.svg)

## Change the mapping, keep the topic name

For example, applications can publish to and read from `orders`, while Kawa routes those requests to `orders-v2` in Kafka. The alias is configured in the gateway. Applications using it can keep the name `orders` when that mapping changes.

That distinction matters during a migration. Updating the mapping can redirect requests, but moving existing events, preserving consumer positions and handling changes to the event format still require planning. A stable name removes one dependency that would otherwise be embedded in every subscribing service.

Kawa can also give consumers filtered views of a topic. Shipping might receive only orders ready for dispatch, while billing reads the broader stream. Role-based access rules control what each client may do, and governance rules can constrain operations such as creating topics or changing partition counts.

Those capabilities add another step to the request path. The tagged project provides no published throughput or latency baseline, so its cost needs to be measured with the application’s own traffic.

Kawa gives you a place to manage topic mappings and access rules as the application grows. For consumers already connected through it, a change to the underlying topic can become a gateway configuration update, with their familiar topic name still in place.

## Sources

- [Geiregat’s announcement](https://www.linkedin.com/posts/jonasgeiregat_kawa-a-kafka-gateway-a-thing-that-sits-activity-7507717508645392384-zvEy).
- [Kawa v0.1.0 source](https://github.com/kawa-platform/kawa-gateway/tree/v0.1.0) and [example Compose setup](https://github.com/kawa-platform/kawa-gateway/blob/v0.1.0/docker-compose.yml).
- [Broker and coordinator address rewriting](https://github.com/kawa-platform/kawa-gateway/blob/v0.1.0/kawa-server/src/main/java/io/jonasg/kawa/server/endpoint/BrokerEndpointInterceptor.java) and [virtual topic configuration](https://github.com/kawa-platform/kawa-gateway/blob/v0.1.0/kawa-config/src/main/java/io/jonasg/kawa/config/VirtualTopicConfig.java).
