package pt.isel.ps.qq.data

import pt.isel.ps.qq.data.elasticdocs.QqStatus
import pt.isel.ps.qq.data.elasticdocs.SessionDoc
import java.awt.DisplayMode

data class SessionSummaryOutputModel(
    val name: String,
    val status: QqStatus,
    val description: String?
) {
    constructor(session: SessionDoc): this(
        name = session.name,
        status = session.status,
        description = session.description
    )
}

data class SessionOutputModel(
    val name: String,
    val status: QqStatus,
    val description: String?,
    val creationDate: Long,
    val guestCode: Int?,
    val limitOfParticipants: Int
) {
    constructor(session: SessionDoc): this(
        name = session.name,
        status = session.status,
        description = session.description,
        creationDate = session.creationDate,
        guestCode = session.guestCode,
        limitOfParticipants = session.limitOfParticipants
    )
}

data class RequestLoginOutputModel(
    val username: String,
    val displayName: String? = null,
    val token: String? = null,
    val timeout: Long? = null
)

data class Acknowledge(
    val acknowledge: Boolean
) {
    companion object {
        val TRUE = Acknowledge(true)
    }
}

data class ListInfo(
    val size: Int,
    val total: Int
)

data class LiveSession(
    val guestCode: String
)
