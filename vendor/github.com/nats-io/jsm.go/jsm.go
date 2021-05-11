// Copyright 2020 The NATS Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Package jsm provides client helpers for managing and interacting with NATS JetStream
package jsm

//go:generate go run api/gen.go

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/nats-io/nats.go"

	"github.com/nats-io/jsm.go/api"
)

// standard api responses with error embedded
type jetStreamResponseError interface {
	ToError() error
}

// jetstream iterable responses
type apiIterableResponse interface {
	ItemsTotal() int
	ItemsOffset() int
	ItemsLimit() int
	LastPage() bool
}

// jetstream iterable requests
type apiIterableRequest interface {
	SetOffset(o int)
}

// all types generated using the api/gen.go which includes all
// the jetstream api types.  Validate() will force validator all
// of these on every jsonRequest
type apiValidatable interface {
	Validate(...api.StructValidator) (valid bool, errors []string)
	SchemaType() string
}

// IsErrorResponse checks if the message holds a standard JetStream error
func IsErrorResponse(m *nats.Msg) bool {
	if strings.HasPrefix(string(m.Data), api.ErrPrefix) {
		return true
	}

	resp := api.JSApiResponse{}
	err := json.Unmarshal(m.Data, &resp)
	if err != nil {
		return false
	}

	return resp.IsError()
}

// ParseErrorResponse parses the JetStream response, if it's an error returns an error instance holding the message else nil
func ParseErrorResponse(m *nats.Msg) error {
	if !IsErrorResponse(m) {
		return nil
	}

	d := string(m.Data)
	if strings.HasPrefix(d, api.ErrPrefix) {
		return fmt.Errorf(strings.TrimSuffix(strings.TrimPrefix(strings.TrimPrefix(d, api.ErrPrefix), " '"), "'"))
	}

	resp := api.JSApiResponse{}
	err := json.Unmarshal(m.Data, &resp)
	if err != nil {
		return err
	}

	return resp.ToError()
}

// IsOKResponse checks if the message holds a standard JetStream error
func IsOKResponse(m *nats.Msg) bool {
	if strings.HasPrefix(string(m.Data), api.OK) {
		return true
	}

	resp := api.JSApiResponse{}
	err := json.Unmarshal(m.Data, &resp)
	if err != nil {
		return false
	}

	return !resp.IsError()
}

// IsValidName verifies if n is a valid stream, template or consumer name
func IsValidName(n string) bool {
	if n == "" {
		return false
	}

	return !strings.ContainsAny(n, ">*. ")
}

// APISubject returns API subject with prefix applied
func APISubject(subject string, prefix string) string {
	if prefix == "" {
		return subject
	}

	return prefix + strings.TrimPrefix(subject, "$JS.API")
}

// EventSubject returns Event subject with prefix applied
func EventSubject(subject string, prefix string) string {
	if prefix == "" {
		return subject
	}

	return prefix + strings.TrimPrefix(subject, "$JS.EVENT")
}
