// Package sendgrid provides a simple interface to interact with the SendGrid API
package sendgrid

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/sendgrid/rest" // depends on version 2.2.0
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

// Version is this client library's current version
const (
	Version        = "3.1.0"
	rateLimitRetry = 5
	rateLimitSleep = 1100
)

// Client is the SendGrid Go client
type Client struct {
	// rest.Request
	rest.Request
}

// GetRequest returns a default request object.
func GetRequest(key string, endpoint string, host string) rest.Request {
	if host == "" {
		host = "https://api.sendgrid.com"
	}
	baseURL := host + endpoint
	requestHeaders := map[string]string{
		"Authorization": "Bearer " + key,
		"User-Agent": "sendgrid/" + Version + ";go",
		"Accept": "application/json",
	}
	request := rest.Request{
		BaseURL: baseURL,
		Headers: requestHeaders,
	}
	return request
}

// Send sends an email through SendGrid
func (cl *Client) Send(email *mail.SGMailV3) (*rest.Response, error) {
	cl.Body = mail.GetRequestBody(email)
	return API(cl.Request)
}

// NewSendClient constructs a new SendGrid client given an API key
func NewSendClient(key string) *Client {
	request := GetRequest(key, "/v3/mail/send", "")
	request.Method = "POST"
	return &Client{request}
}

// DefaultClient is used if no custom HTTP client is defined
var DefaultClient = rest.DefaultClient

// API sets up the request to the SendGrid API, this is main interface.
// This function is deprecated. Please use the MakeRequest or
// MakeRequestAsync functions.
func API(request rest.Request) (*rest.Response, error) {
	return DefaultClient.API(request)
}

// MakeRequest attemps a SendGrid request synchronously.
func MakeRequest(request rest.Request) (*rest.Response, error) {
	return DefaultClient.API(request)
}

// MakeRequestRetry a synchronous request, but retry in the event of a rate
// limited response.
func MakeRequestRetry(request rest.Request) (*rest.Response, error) {
	retry := 0
	var response *rest.Response
	var err error

	for {
		response, err = DefaultClient.API(request)
		if err != nil {
			return nil, err
		}

		if response.StatusCode != http.StatusTooManyRequests {
			return response, nil
		}

		if retry > rateLimitRetry {
			return nil, errors.New("Rate limit retry exceeded")
		}
		retry++

		resetTime := time.Now().Add(rateLimitSleep * time.Millisecond)

		reset, ok := response.Headers["X-RateLimit-Reset"]
		if ok && len(reset) > 0 {
			t, err := strconv.Atoi(reset[0])
			if err == nil {
				resetTime = time.Unix(int64(t), 0)
			}
		}
		time.Sleep(resetTime.Sub(time.Now()))
	}
}

// MakeRequestAsync attempts a request asynchronously in a new go
// routine. This function returns two channels: responses
// and errors. This function will retry in the case of a
// rate limit.
func MakeRequestAsync(request rest.Request) (chan *rest.Response, chan error) {
	r := make(chan *rest.Response)
	e := make(chan error)

	go func() {
		response, err := MakeRequestRetry(request)
		if err != nil {
			e <- err
		}
		if response != nil {
			r <- response
		}
	}()

	return r, e
}
