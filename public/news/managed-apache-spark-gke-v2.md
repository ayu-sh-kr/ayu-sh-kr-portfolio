# Cloud data updates: Spark on GKE and Amazon Timestream for InfluxDB

Collecting telemetry and processing it are different jobs. One system might ingest millions of timestamped readings throughout the day; another might turn those readings into a table for tomorrow’s reports. Two November 27 cloud updates give teams more control over the compute behind each job.

## Google Cloud previews managed Apache Spark on GKE v2

A nightly pipeline can use **Apache Spark** to process event logs in parallel. [On Kubernetes](https://spark.apache.org/docs/latest/running-on-kubernetes), a driver coordinates the job, and executor pods each process a slice of the data. [Google Cloud’s v2 private preview](https://docs.cloud.google.com/managed-spark/docs/release-notes#November_27_2026) runs managed Spark workloads directly on **GKE Standard** clusters.

Spark already ran on Google Kubernetes Engine (GKE). In the [earlier managed setup](https://docs.cloud.google.com/managed-spark/docs/concepts/gke-overview), you create a Spark virtual cluster backed by GKE node pools and submit jobs through the managed service’s API. The v2 announcement confirms Standard cluster support but leaves job submission and migration details open.

For teams that don’t want to run a Kubernetes cluster for the nightly job, [Serverless Spark](https://docs.cloud.google.com/managed-spark/docs/serverless-overview) runs it on infrastructure Google provisions for you. The v2 preview is for teams that want Spark jobs to run on clusters they already operate. Google is enrolling projects by request.

## AWS lets you size InfluxDB 3 nodes by role

The same telemetry may also feed a live dashboard. When more people open it, query traffic can rise while devices keep reporting at the same rate. [Amazon Timestream for InfluxDB 3 Enterprise](https://aws.amazon.com/about-aws/whats-new/2026/11/influxdb-heterogeneous-cluster/) now lets you choose a different instance size for **readers, writers and compactors**. Previously, those roles shared one instance size across the cluster.

Readers serve queries, writers ingest new measurements, and compactors merge stored files in the background. A dashboard with memory-heavy queries can now use larger readers while keeping its writers the same size. You can pick sizes when creating a cluster or adding nodes through the console, CLI or SDKs.

> **Availability and pricing:** The AWS update is available in every Region that offers Timestream for InfluxDB. There’s no feature surcharge; each node is billed at the standard rate for its size.

For the nightly Spark job, the decision is **where it runs**: on your GKE cluster or on Google-provisioned infrastructure. For the live InfluxDB dashboard, it’s **which role needs more capacity**. A busier dashboard no longer means buying a bigger instance for every role.
