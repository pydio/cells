package herodot

import "net/http"

var ErrNotFound = DefaultError{
	StatusField: http.StatusText(http.StatusNotFound),
	ErrorField:  "The requested resource could not be found",
	CodeField:   http.StatusNotFound,
}

var ErrUnauthorized = DefaultError{
	StatusField: http.StatusText(http.StatusUnauthorized),
	ErrorField:  "The request could not be authorized",
	CodeField:   http.StatusUnauthorized,
}

var ErrForbidden = DefaultError{
	StatusField: http.StatusText(http.StatusForbidden),
	ErrorField:  "The requested action was forbidden",
	CodeField:   http.StatusForbidden,
}

var ErrInternalServerError = DefaultError{
	StatusField: http.StatusText(http.StatusInternalServerError),
	ErrorField:  "An internal server error occurred, please contact the system administrator",
	CodeField:   http.StatusInternalServerError,
}

var ErrBadRequest = DefaultError{
	StatusField: http.StatusText(http.StatusBadRequest),
	ErrorField:  "The request was malformed or contained invalid parameters",
	CodeField:   http.StatusBadRequest,
}

var ErrUnsupportedMediaType = DefaultError{
	StatusField: http.StatusText(http.StatusUnsupportedMediaType),
	ErrorField:  "The request is using an unknown content type",
	CodeField:   http.StatusUnsupportedMediaType,
}
