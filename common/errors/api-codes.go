package errors

type ApiCode string

const (
	ApiInternalServerError ApiCode = "E_INTERNAL_SERVER_ERROR"
	ApiUnauthorized        ApiCode = "E_UNAUTHORIZED"
	ApiForbidden           ApiCode = "E_FORBIDDEN"
	ApiNotFound            ApiCode = "E_NOT_FOUND"
	ApiResourceLocked      ApiCode = "E_RESOURCE_LOCKED"
	ApiServiceUnavailable  ApiCode = "E_SERVICE_UNAVAILABLE"

	ApiForbiddenEdit ApiCode = "E_FORBIDDEN_EDIT"
	ApiForbiddenRead ApiCode = "E_FORBIDDEN_READ"

	ApiLoginFailed               ApiCode = "E_LOGIN_FAILED"
	ApiUserAlreadyExists         ApiCode = "E_USER_ALREADY_EXISTS"
	ApiUserNotEditable           ApiCode = "E_USER_NOT_EDITABLE"
	ApiUserCannotCreate          ApiCode = "E_USER_CANNOT_CREATE"
	ApiUserCannotCreateProfile   ApiCode = "E_USER_CANNOT_CREATE_PROFILE"
	ApiUserCannotDeleteOwn       ApiCode = "E_USER_CANNOT_DELETE_OWN"
	ApiUserCannotIncreaseProfile ApiCode = "E_USER_CANNOT_INCREASE_PROFILE"
	ApiGroupCannotCreate         ApiCode = "E_GROUP_CANNOT_CREATE"
	ApiGroupCannotDeleteOwn      ApiCode = "E_GROUP_CANNOT_DELETE_OWN"
)
