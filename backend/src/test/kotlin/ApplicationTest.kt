package org.kweb

import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlin.test.Test
import kotlin.test.assertEquals

class ApplicationTest {
    @Test
    fun testHealth() =
        testApplication {
            application {
                module()
            }
            client.get("/openapi").apply {
                assertEquals(HttpStatusCode.OK, status)
            }
        }
}
