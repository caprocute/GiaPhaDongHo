# syntax=docker/dockerfile:1
# Build context: backend/
# docker build -f backend/Dockerfile -t giapha-api backend
# Staging/prod CI ưu tiên bootBuildImage (Buildpacks); Dockerfile này cho compose local.

FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /src
COPY gradlew settings.gradle build.gradle gradle.properties ./
COPY gradle ./gradle
# buildSrc chứa convention plugin (jhipster.docker-conventions,
# jhipster.code-quality-conventions) mà build.gradle khai báo — thiếu là build fail.
COPY buildSrc ./buildSrc
COPY src ./src
COPY jdl ./jdl
RUN chmod +x gradlew && ./gradlew bootJar -x test --no-daemon \
  && JAR=$(ls build/libs/giapha-*.jar | grep -v plain | head -1) \
  && cp "$JAR" /src/app.jar

FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl \
  && addgroup -S spring && adduser -S spring -G spring
COPY --from=builder /src/app.jar /app/app.jar
USER spring
EXPOSE 8080
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s \
  CMD curl -fsS http://127.0.0.1:8080/management/health || exit 1
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
