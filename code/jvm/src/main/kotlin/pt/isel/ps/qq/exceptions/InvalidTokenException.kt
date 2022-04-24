package pt.isel.ps.qq.exceptions

open class InvalidTokenException(
    private val reasonForUser: String,
    private val moreDetails: String,
    private val whereDidTheErrorOccurred: ErrorInstance
): ProblemJsonException(
    type = "InvalidTokenException",
    title = reasonForUser,
    status = 403,
    detail = moreDetails,
    instance = whereDidTheErrorOccurred
)