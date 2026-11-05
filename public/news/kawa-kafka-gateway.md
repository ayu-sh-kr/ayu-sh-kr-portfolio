# Kawa puts virtual topics and access rules in front of Kafka

An order service writes to `orders`. Behind the scenes, the Kafka team has moved to a topic called `orders-v2`. If every producer and consumer knows the physical topic name, that change means coordinating updates across applications. **Kawa**, a Kafka gateway from Jonas Geiregat, gives those applications a stable name to use while the team manages the mapping centrally. The project tagged **v0.1.0** on October 29.

> **Kafka gateway.** A gateway sits between Kafka clients and the brokers that store and serve events. For example, an order service sends a new purchase event through Kawa, which works out where to send it in Kafka. The application can keep its Kafka client library, though it needs the gateway’s address and any credentials it requires.

## Why Kafka needs more than a TCP relay

A Kafka client first connects to a bootstrap address to discover the cluster. The broker can then tell it which address to contact for a partition or consumer group. If a relay only forwards the first connection, the client may try to reach those broker addresses directly.

Kawa understands the Kafka protocol. It rewrites broker and group coordinator addresses in discovery replies so clients continue to send requests through the gateway. Kawa then talks to the appropriate broker. That gives it a place to apply access rules and translate topic names throughout the interaction.

![Isometric diagram showing a Kafka client sending orders to Kawa, which translates the topic name and routes it to orders-v2 on a Kafka broker.](/news/assets/kawa-kafka-gateway/virtual-topic-route.svg)

## What a virtual topic changes

In the project’s example setup, Kafka contains `orders-v2`. Kawa can expose it to applications as `orders` and translate that alias when handling requests. An alias can keep a name stable during a change, but copying old events and deciding how consumers resume from their offsets are separate migration tasks.

A virtual topic can also filter records on reads. A shipping application might get a view that only returns orders ready for dispatch. Kawa applies the filter as records pass through it, so the original topic can still serve consumers that need every order. The gateway also has role-based authorization and rules for Kafka operations, such as whether a client can create a topic or change its partition count.

## What the extra hop costs

The project describes Kawa as high-performance, but its tagged source provides no published throughput or latency baseline. A useful comparison would run the same producer and consumer directly against Kafka, through Kawa with basic routing, and again with record filtering enabled. The direct comparison would show the cost of inserting the gateway. The filtering run would show what changes when it also has to inspect records. The numbers to watch are sustained throughput and tail latency, especially when traffic spikes.

For the order service, the immediate benefit is a name it can keep using and a single place for the Kafka team to enforce policy. If the team wants to use that flexibility for a cutover, it still needs to plan how consumers resume and measure the gateway under the workload it will actually carry.

## Sources

- [Geiregat’s announcement](https://www.linkedin.com/posts/jonasgeiregat_kawa-a-kafka-gateway-a-thing-that-sits-activity-7507717508645392384-zvEy).
- [Kawa v0.1.0 source](https://github.com/kawa-platform/kawa-gateway/tree/v0.1.0) and [example Compose setup](https://github.com/kawa-platform/kawa-gateway/blob/v0.1.0/docker-compose.yml).
- [Broker and coordinator address rewriting](https://github.com/kawa-platform/kawa-gateway/blob/v0.1.0/kawa-server/src/main/java/io/jonasg/kawa/server/endpoint/BrokerEndpointInterceptor.java) and [virtual topic configuration](https://github.com/kawa-platform/kawa-gateway/blob/v0.1.0/kawa-config/src/main/java/io/jonasg/kawa/config/VirtualTopicConfig.java).
