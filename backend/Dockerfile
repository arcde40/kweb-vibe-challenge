FROM gradle:9.3-jdk22-alpine AS build
WORKDIR /app
COPY gradle/ gradle/
COPY gradlew gradlew.bat gradle.properties settings.gradle.kts build.gradle.kts ./
RUN gradle dependencies --no-daemon > /dev/null 2>&1 || true
COPY src/ src/
COPY config/ config/
RUN gradle buildFatJar --no-daemon && mv build/libs/*-all.jar build/libs/app.jar

FROM eclipse-temurin:22-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]