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

package jsm

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/nats-io/nats.go"

	"github.com/nats-io/jsm.go/api"
)

type Manager struct {
	nc          *nats.Conn
	timeout     time.Duration
	trace       bool
	validator   api.StructValidator
	apiPrefix   string
	eventPrefix string

	sync.Mutex
}

func New(nc *nats.Conn, opts ...Option) (*Manager, error) {
	m := &Manager{
		nc:      nc,
		timeout: 5 * time.Second,
	}

	for _, opt := range opts {
		opt(m)
	}

	if m.nc == nil {
		return nil, fmt.Errorf("nats connection not supplied")
	}

	if m.timeout < 500*time.Millisecond {
		m.timeout = 500 * time.Millisecond
	}

	return m, nil
}

// IsJetStreamEnabled determines if JetStream is enabled for the current account
func (m *Manager) IsJetStreamEnabled() bool {
	info, err := m.JetStreamAccountInfo()
	if err != nil {
		return false
	}

	if info == nil {
		return false
	}

	return true
}

// JetStreamAccountInfo retrieves information about the current account limits and more
func (m *Manager) JetStreamAccountInfo() (info *api.JetStreamAccountStats, err error) {
	var resp api.JSApiAccountInfoResponse
	err = m.jsonRequest(api.JSApiAccountInfo, nil, &resp)
	if err != nil {
		return nil, err
	}

	return resp.JetStreamAccountStats, nil
}

func (m *Manager) jsonRequest(subj string, req interface{}, response interface{}) (err error) {
	var body []byte

	switch {
	case req == nil:
		body = []byte("")
	default:
		body, err = json.Marshal(req)
		if err != nil {
			return err
		}
	}

	msg, err := m.request(m.apiSubject(subj), body)
	if err != nil {
		return err
	}

	err = json.Unmarshal(msg.Data, response)
	if err != nil {
		return err
	}

	jsr, ok := response.(jetStreamResponseError)
	if !ok {
		return nil
	}

	if jsr.ToError() != nil {
		return jsr.ToError()
	}

	if m.validator == nil {
		return nil
	}

	jv, ok := response.(apiValidatable)
	if !ok {
		return fmt.Errorf("invalid validator specified")
	}

	valid, errs := jv.Validate(m.validator)
	if valid {
		return nil
	}

	return fmt.Errorf("server response is not a valid %q message: %s", jv.SchemaType(), strings.Join(errs, "\n"))
}

// StreamNamesFilter limits the names being returned by the names API
type StreamNamesFilter struct {
	// Subject filter the names to those consuming messages matching this subject or wildcard
	Subject string `json:"subject,omitempty"`
}

// StreamNames is a sorted list of all known Streams filtered by filter
func (m *Manager) StreamNames(filter *StreamNamesFilter) (names []string, err error) {
	var resp api.JSApiStreamNamesResponse
	req := &api.JSApiStreamNamesRequest{JSApiIterableRequest: api.JSApiIterableRequest{Offset: 0}}
	if filter != nil {
		req.Subject = filter.Subject
	}

	err = m.iterableRequest(api.JSApiStreamNames, req, &resp, func(page interface{}) error {
		apiresp, ok := page.(*api.JSApiStreamNamesResponse)
		if !ok {
			return fmt.Errorf("invalid response type from iterable request")
		}

		names = append(names, apiresp.Streams...)

		return nil
	})
	if err != nil {
		return nil, err
	}

	sort.Strings(names)

	return names, nil
}

func (m *Manager) iterableRequest(subj string, req apiIterableRequest, response apiIterableResponse, cb func(interface{}) error) (err error) {
	offset := 0
	for {
		req.SetOffset(offset)

		err = m.jsonRequest(subj, req, response)
		if err != nil {
			return err
		}

		err = cb(response)
		if err != nil {
			return err
		}

		if response.LastPage() {
			break
		}

		offset += response.ItemsLimit()
	}

	return nil
}

func (m *Manager) request(subj string, data []byte) (res *nats.Msg, err error) {
	return m.requestWithTimeout(subj, data, m.timeout)
}

func (m *Manager) requestWithTimeout(subj string, data []byte, timeout time.Duration) (res *nats.Msg, err error) {
	if m == nil || m.nc == nil {
		return nil, fmt.Errorf("nats connection is not set")
	}

	var ctx context.Context
	var cancel func()

	if timeout == 0 {
		timeout = m.timeout
	}

	ctx, cancel = context.WithTimeout(context.Background(), timeout)
	defer cancel()

	res, err = m.requestWithContext(ctx, subj, data)
	if err != nil {
		return nil, err
	}

	return res, err
}

func (m *Manager) requestWithContext(ctx context.Context, subj string, data []byte) (res *nats.Msg, err error) {
	if m.trace {
		log.Printf(">>> %s\n%s\n\n", subj, string(data))
	}

	res, err = m.nc.RequestWithContext(ctx, subj, data)
	if err != nil {
		if m.trace {
			log.Printf("<<< %s: %s\n\n", subj, err.Error())
		}

		return res, err
	}

	if m.trace {
		log.Printf("<<< %s\n%s\n\n", subj, string(res.Data))
	}

	return res, ParseErrorResponse(res)
}

// IsKnownStream determines if a Stream is known
func (m *Manager) IsKnownStream(stream string) (bool, error) {
	s, err := m.LoadStream(stream)
	if err != nil {
		jserr, ok := err.(api.ApiError)
		if ok {
			if jserr.NotFoundError() {
				return false, nil
			}
		}

		return false, err
	}

	if s.Name() != stream {
		return false, fmt.Errorf("received invalid stream from load")
	}

	return true, nil
}

// IsKnownStreamTemplate determines if a StreamTemplate is known
func (m *Manager) IsKnownStreamTemplate(template string) (bool, error) {
	t, err := m.LoadStreamTemplate(template)
	if err != nil {
		jserr, ok := err.(api.ApiError)
		if ok {
			if jserr.NotFoundError() {
				return false, nil
			}
		}

		return false, err
	}

	if t.Name() != template {
		return false, fmt.Errorf("received invalid stream template from load")
	}

	return true, nil
}

// IsKnownConsumer determines if a Consumer is known for a specific Stream
func (m *Manager) IsKnownConsumer(stream string, consumer string) (bool, error) {
	c, err := m.LoadConsumer(stream, consumer)
	if err != nil {
		jserr, ok := err.(api.ApiError)
		if ok {
			if jserr.NotFoundError() {
				return false, nil
			}
		}

		return false, err
	}

	if c.Name() != consumer {
		return false, fmt.Errorf("invalid consumer received from load")
	}

	return true, nil
}

// EachStreamTemplate iterates over all known Stream Templates
func (m *Manager) EachStreamTemplate(cb func(*StreamTemplate)) (err error) {
	names, err := m.StreamTemplateNames()
	if err != nil {
		return err
	}

	for _, t := range names {
		template, err := m.LoadStreamTemplate(t)
		if err != nil {
			return err
		}

		cb(template)
	}

	return nil
}

// EachStream iterates over all known Streams
func (m *Manager) EachStream(cb func(*Stream)) (err error) {
	streams, err := m.Streams()
	if err != nil {
		return err
	}

	for _, s := range streams {
		cb(s)
	}

	return nil
}

// Consumers is a sorted list of all known Consumers within a Stream
func (m *Manager) Consumers(stream string) (consumers []*Consumer, err error) {
	if !IsValidName(stream) {
		return nil, fmt.Errorf("%q is not a valid stream name", stream)
	}

	var cinfo []*api.ConsumerInfo

	var resp api.JSApiConsumerListResponse
	err = m.iterableRequest(fmt.Sprintf(api.JSApiConsumerListT, stream), &api.JSApiConsumerListRequest{JSApiIterableRequest: api.JSApiIterableRequest{Offset: 0}}, &resp, func(page interface{}) error {
		apiresp, ok := page.(*api.JSApiConsumerListResponse)
		if !ok {
			return fmt.Errorf("invalid response type from iterable request")
		}

		cinfo = append(cinfo, apiresp.Consumers...)
		return nil
	})
	if err != nil {
		return consumers, err
	}

	sort.Slice(cinfo, func(i int, j int) bool {
		return resp.Consumers[i].Name < resp.Consumers[j].Name
	})

	for _, c := range cinfo {
		consumers = append(consumers, m.consumerFromCfg(c.Stream, c.Name, &c.Config))
	}

	return consumers, nil
}

// StreamTemplateNames is a sorted list of all known StreamTemplates
func (m *Manager) StreamTemplateNames() (templates []string, err error) {
	var resp api.JSApiStreamTemplateNamesResponse
	err = m.iterableRequest(api.JSApiTemplateNames, &api.JSApiStreamTemplateNamesRequest{JSApiIterableRequest: api.JSApiIterableRequest{Offset: 0}}, &resp, func(page interface{}) error {
		apiresp, ok := page.(*api.JSApiStreamTemplateNamesResponse)
		if !ok {
			return fmt.Errorf("invalid response type from iterable request")
		}

		templates = append(templates, apiresp.Templates...)

		return nil
	})
	if err != nil {
		return templates, err
	}

	sort.Strings(templates)

	return templates, nil
}

// ConsumerNames is a sorted list of all known consumers within a stream
func (m *Manager) ConsumerNames(stream string) (names []string, err error) {
	if !IsValidName(stream) {
		return nil, fmt.Errorf("%q is not a valid stream name", stream)
	}

	var resp api.JSApiConsumerNamesResponse
	err = m.iterableRequest(fmt.Sprintf(api.JSApiConsumerNamesT, stream), &api.JSApiConsumerNamesRequest{JSApiIterableRequest: api.JSApiIterableRequest{Offset: 0}}, &resp, func(page interface{}) error {
		apiresp, ok := page.(*api.JSApiConsumerNamesResponse)
		if !ok {
			return fmt.Errorf("invalid response type from iterable request")
		}

		names = append(names, apiresp.Consumers...)

		return nil
	})
	if err != nil {
		return nil, err
	}

	sort.Strings(names)

	return names, nil
}

// Streams is a sorted list of all known Streams
func (m *Manager) Streams() (streams []*Stream, err error) {
	var resp api.JSApiStreamListResponse
	err = m.iterableRequest(api.JSApiStreamList, &api.JSApiStreamListRequest{JSApiIterableRequest: api.JSApiIterableRequest{Offset: 0}}, &resp, func(page interface{}) error {
		apiresp, ok := page.(*api.JSApiStreamListResponse)
		if !ok {
			return fmt.Errorf("invalid response type from iterable request")
		}

		sort.Slice(apiresp.Streams, func(i int, j int) bool {
			return apiresp.Streams[i].Config.Name < apiresp.Streams[j].Config.Name
		})

		for _, s := range apiresp.Streams {
			streams = append(streams, m.streamFromConfig(&s.Config, s))
		}

		return nil
	})
	if err != nil {
		return streams, err
	}

	return streams, nil
}

func (m *Manager) apiSubject(subject string) string {
	return APISubject(subject, m.apiPrefix)
}

// MetaLeaderStandDown requests the meta group leader to stand down, must be initiated by a system user
func (m *Manager) MetaLeaderStandDown(placement *api.Placement) error {
	var resp api.JSApiLeaderStepDownResponse
	err := m.jsonRequest(api.JSApiLeaderStepDown, api.JSApiLeaderStepDownRequest{Placement: placement}, &resp)
	if err != nil {
		return err
	}

	if !resp.Success {
		return fmt.Errorf("unknown error while requesting leader step down")
	}

	return nil
}

// MetaPeerRemove removes a peer from the JetStream meta cluster, evicting all streams, consumer etc.  Use with extreme caution.
func (m *Manager) MetaPeerRemove(name string) error {
	var resp api.JSApiMetaServerRemoveResponse
	err := m.jsonRequest(api.JSApiRemoveServer, api.JSApiMetaServerRemoveRequest{Server: name}, &resp)
	if err != nil {
		return err
	}

	if !resp.Success {
		return fmt.Errorf("unknown error while requesting leader step down")
	}

	return nil
}
