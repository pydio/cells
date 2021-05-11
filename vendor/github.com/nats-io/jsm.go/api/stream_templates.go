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

package api

const (
	JSApiTemplateCreateT = "$JS.API.STREAM.TEMPLATE.CREATE.%s"
	JSApiTemplateNames   = "$JS.API.STREAM.TEMPLATE.NAMES"
	JSApiTemplateInfoT   = "$JS.API.STREAM.TEMPLATE.INFO.%s"
	JSApiTemplateDeleteT = "$JS.API.STREAM.TEMPLATE.DELETE.%s"
)

// io.nats.jetstream.api.v1.stream_template_delete_response
type JSApiStreamTemplateDeleteResponse struct {
	JSApiResponse
	Success bool `json:"success,omitempty"`
}

// io.nats.jetstream.api.v1.stream_template_create_response
type JSApiStreamTemplateCreateResponse struct {
	JSApiResponse
	*StreamTemplateInfo
}

// io.nats.jetstream.api.v1.stream_template_names_request
type JSApiStreamTemplateNamesRequest struct {
	JSApiIterableRequest
}

// io.nats.jetstream.api.v1.stream_template_names_response
type JSApiStreamTemplateNamesResponse struct {
	JSApiResponse
	JSApiIterableResponse
	Templates []string `json:"streams"`
}

// io.nats.jetstream.api.v1.stream_template_info_response
type JSApiStreamTemplateInfoResponse struct {
	JSApiResponse
	*StreamTemplateInfo
}

// StreamTemplateConfig is the configuration for a JetStream Stream Template
//
// NATS Schema Type io.nats.jetstream.api.v1.stream_template_configuration
type StreamTemplateConfig struct {
	Name       string        `json:"name"`
	Config     *StreamConfig `json:"config"`
	MaxStreams uint32        `json:"max_streams"`
}

// StreamTemplateInfo
type StreamTemplateInfo struct {
	Config  *StreamTemplateConfig `json:"config"`
	Streams []string              `json:"streams"`
}

// io.nats.jetstream.api.v1.stream_template_create_request
type JSApiStreamTemplateCreateRequest struct {
	StreamTemplateConfig
}
