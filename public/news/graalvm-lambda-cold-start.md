# GraalVM native image cut my Lambda cold start to 190ms

The quote form on this site is a Spring Cloud Function behind an API Gateway route. On the JVM it took roughly 2.4 seconds to answer the first request of the day, which is an eternity to sit on someone else's page load for a form that gets used eleven times a month. Provisioned concurrency fixes it and costs more than the form is worth.

Compiling to a GraalVM native image and shipping it as a container image on the Lambda custom runtime took the cold start to 190ms. Warm invocations were already fine and stayed fine.

## What it cost

The build. A JVM jar built in about 40 seconds; the native image takes six minutes on a `t4g.medium` self-hosted runner, and it is memory-bound long before it is CPU-bound. Give the build at least 4GB or it will fail somewhere unhelpful.

```dockerfile
FROM ghcr.io/graalvm/native-image-community:21 AS build
COPY . /src
WORKDIR /src
RUN ./gradlew nativeCompile -Dorg.gradle.jvmargs=-Xmx4g

FROM public.ecr.aws/lambda/provided:al2023
COPY --from=build /src/build/native/nativeCompile/quote ./bootstrap
ENTRYPOINT ["./bootstrap"]
```

Reflection is the other cost. Anything Spring resolves at runtime needs a hint, and the failure mode is a clean-looking build that dies on the first request.

> If a function runs on someone else's page load, a slow build is a cost you pay once and they never see.

## When not to bother

If the function is on a warm path, or invoked often enough that cold starts are noise, this is six minutes of build time buying nothing. I did not do this to the newsletter sender—it runs on a schedule and nobody is waiting for it.
