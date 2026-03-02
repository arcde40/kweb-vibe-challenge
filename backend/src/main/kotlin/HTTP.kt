package org.kweb

import io.ktor.http.*
import io.ktor.openapi.*
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.swagger.*
import io.ktor.server.routing.*

fun Application.configureHTTP() {
    routing {
        swaggerUI(path = "openapi") {
            info = OpenApiInfo(title = "My API", version = "1.0.0")
        }
    }
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
        allowHeader(HttpHeaders.Authorization)
        anyHost() // TODO: restrict to specific hosts in production
    }
}
