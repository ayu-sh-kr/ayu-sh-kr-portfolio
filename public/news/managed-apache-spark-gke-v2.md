# Google Cloud previews managed Apache Spark on GKE Standard

A nightly job that turns raw event logs into analytics tables can run on the same Kubernetes platform as the apps that produce those events. On November 27, [Google Cloud opened a private preview of Managed Service for Apache Spark on GKE v2](https://docs.cloud.google.com/managed-spark/docs/release-notes#November_27_2026), which runs **managed Spark jobs on GKE Standard clusters**.

## How Spark runs on Kubernetes

Apache Spark splits a large data job across multiple workers. [On Kubernetes](https://spark.apache.org/docs/latest/running-on-kubernetes), a driver coordinates the job and executor pods do the work in parallel. For that nightly job, the executors can process different partitions of the event logs at the same time.

Spark already ran on Google Kubernetes Engine (GKE) before this preview. In Google’s [documented earlier setup](https://docs.cloud.google.com/managed-spark/docs/concepts/gke-overview), you create a Spark virtual cluster backed by GKE node pools, then submit jobs through the managed service’s API. The v2 announcement confirms that the new service runs directly on Standard clusters, but leaves details such as job submission and migration from the earlier setup open.

## Where the new preview fits

[Serverless Spark](https://docs.cloud.google.com/managed-spark/docs/serverless-overview) runs jobs on infrastructure Google provisions for you. Spark on GKE v2 is aimed at teams that already operate Kubernetes and want Spark jobs to run on their own clusters. For the nightly pipeline, the choice is where you want that compute to live: on a cluster your team already operates, or on infrastructure Google provisions for the job.

> **Preview access:** Google is enrolling projects by request. The announcement names GKE Standard; it does not list Autopilot.
