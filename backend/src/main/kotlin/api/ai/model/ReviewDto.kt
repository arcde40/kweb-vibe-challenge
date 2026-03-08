package org.kweb.api.ai.model

data class ReviewRequest(val html: String, val challengeId: Int)

data class ReviewCriteriaItem(val id: Int, val description: String)

data class ReviewResponse(val score: Int, val overallFeedback: String)
