plugins {
    alias(libs.plugins.detekt)
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.ksp)
    alias(libs.plugins.ktor)
    alias(libs.plugins.kotlin.plugin.serialization)
}

group = "org.kweb"
version = "0.0.1"

application {
    mainClass = "io.ktor.server.netty.EngineMain"
}

kotlin {
    jvmToolchain(22)
}

detekt {
    config.setFrom("config/detekt/detekt.yml")
    buildUponDefaultConfig = false
}

dependencies {
    implementation(libs.koin.ktor)
    implementation(libs.koin.logger.slf4j)
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.content.negotiation)
    // implementation(libs.postgresql)
    implementation("org.mariadb.jdbc:mariadb-java-client:3.5.6")
    implementation(libs.h2)
    implementation(libs.exposed.core)
    implementation(libs.exposed.jdbc)
    implementation(libs.konvert.api)
    implementation("io.ktor:ktor-server-host-common:3.4.0")
    implementation("io.ktor:ktor-server-status-pages:3.4.0")
    ksp(libs.konvert)
    implementation(libs.ktor.serialization.jackson)
    implementation(libs.ktor.server.sse)
    implementation(libs.ktor.server.swagger)
    implementation(libs.ktor.server.routing.openapi)
    implementation(libs.ktor.server.cors)
    implementation(libs.ktor.server.netty)
    implementation(libs.logback.classic)
    implementation(libs.ktor.server.config.yaml)
    implementation(libs.ktor.client.core)
    implementation(libs.ktor.client.cio)
    testImplementation(libs.ktor.server.test.host)
    testImplementation(libs.kotlin.test.junit)
}
