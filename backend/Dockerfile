FROM eclipse-temurin:22-jdk-alpine AS build
WORKDIR /app
COPY gradle/ gradle/
COPY gradlew gradlew.bat gradle.properties settings.gradle.kts build.gradle.kts ./
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew
RUN ./gradlew dependencies --no-daemon > /dev/null 2>&1 || true
COPY src/ src/
COPY config/ config/
RUN ./gradlew buildFatJar --no-daemon && mv build/libs/*-all.jar build/libs/app.jar

FROM eclipse-temurin:22-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]