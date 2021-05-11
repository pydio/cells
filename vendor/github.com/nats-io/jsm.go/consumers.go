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
	"strconv"
	"strings"
	"time"

	"github.com/nats-io/nats.go"

	"github.com/nats-io/jsm.go/api"
)

// DefaultConsumer is the configuration that will be used to create new Consumers in NewConsumer
var DefaultConsumer = api.ConsumerConfig{
	DeliverPolicy: api.DeliverAll,
	AckPolicy:     api.AckExplicit,
	AckWait:       30 * time.Second,
	ReplayPolicy:  api.ReplayInstant,
}

// SampledDefaultConsumer is the configuration that will be used to create new Consumers in NewConsumer
var SampledDefaultConsumer = api.ConsumerConfig{
	DeliverPolicy:   api.DeliverAll,
	AckPolicy:       api.AckExplicit,
	AckWait:         30 * time.Second,
	ReplayPolicy:    api.ReplayInstant,
	SampleFrequency: "100%",
}

// ConsumerOptions configures consumers
type ConsumerOption func(o *api.ConsumerConfig) error

// Consumer represents a JetStream consumer
type Consumer struct {
	name   string
	stream string
	cfg    *api.ConsumerConfig
	mgr    *Manager
}

// NewConsumerFromDefault creates a new consumer based on a template config that gets modified by opts
func (m *Manager) NewConsumerFromDefault(stream string, dflt api.ConsumerConfig, opts ...ConsumerOption) (consumer *Consumer, err error) {
	if !IsValidName(stream) {
		return nil, fmt.Errorf("%q is not a valid stream name", stream)
	}

	cfg, err := NewConsumerConfiguration(dflt, opts...)
	if err != nil {
		return nil, err
	}

	valid, errs := cfg.Validate()
	if !valid {
		return nil, fmt.Errorf("configuration validation failed: %s", strings.Join(errs, ", "))
	}

	req := api.JSApiConsumerCreateRequest{
		Stream: stream,
		Config: *cfg,
	}

	var createdInfo *api.ConsumerInfo

	switch req.Config.Durable {
	case "":
		createdInfo, err = m.createEphemeralConsumer(req)
	default:
		createdInfo, err = m.createDurableConsumer(req)
	}
	if err != nil {
		return nil, err
	}

	if createdInfo == nil {
		return nil, fmt.Errorf("expected a consumer name but none were generated")
	}

	// TODO: we have the info, avoid this round trip
	return m.LoadConsumer(stream, createdInfo.Name)
}

func (m *Manager) createDurableConsumer(req api.JSApiConsumerCreateRequest) (info *api.ConsumerInfo, err error) {
	var resp api.JSApiConsumerCreateResponse
	err = m.jsonRequest(fmt.Sprintf(api.JSApiDurableCreateT, req.Stream, req.Config.Durable), req, &resp)
	if err != nil {
		return nil, err
	}

	return resp.ConsumerInfo, nil
}

func (m *Manager) createEphemeralConsumer(req api.JSApiConsumerCreateRequest) (info *api.ConsumerInfo, err error) {
	var resp api.JSApiConsumerCreateResponse
	err = m.jsonRequest(fmt.Sprintf(api.JSApiConsumerCreateT, req.Stream), req, &resp)
	if err != nil {
		return nil, err
	}

	return resp.ConsumerInfo, nil
}

// NewConsumer creates a consumer based on DefaultConsumer modified by opts
func (m *Manager) NewConsumer(stream string, opts ...ConsumerOption) (consumer *Consumer, err error) {
	if !IsValidName(stream) {
		return nil, fmt.Errorf("%q is not a valid stream name", stream)
	}

	return m.NewConsumerFromDefault(stream, DefaultConsumer, opts...)
}

// LoadOrNewConsumer loads a consumer by name if known else creates a new one with these properties
func (m *Manager) LoadOrNewConsumer(stream string, name string, opts ...ConsumerOption) (consumer *Consumer, err error) {
	return m.LoadOrNewConsumerFromDefault(stream, name, DefaultConsumer, opts...)
}

// LoadOrNewConsumerFromDefault loads a consumer by name if known else creates a new one with these properties based on template
func (m *Manager) LoadOrNewConsumerFromDefault(stream string, name string, template api.ConsumerConfig, opts ...ConsumerOption) (consumer *Consumer, err error) {
	if !IsValidName(stream) {
		return nil, fmt.Errorf("%q is not a valid stream name", stream)
	}

	if !IsValidName(name) {
		return nil, fmt.Errorf("%q is not a valid consumer name", name)
	}

	c, err := m.LoadConsumer(stream, name)
	if c == nil || err != nil {
		return m.NewConsumerFromDefault(stream, template, opts...)
	}

	return c, err
}

// LoadConsumer loads a consumer by name
func (m *Manager) LoadConsumer(stream string, name string) (consumer *Consumer, err error) {
	if !IsValidName(stream) {
		return nil, fmt.Errorf("%q is not a valid stream name", stream)
	}

	if !IsValidName(name) {
		return nil, fmt.Errorf("%q is not a valid consumer name", name)
	}

	consumer = m.consumerFromCfg(stream, name, &api.ConsumerConfig{})

	err = m.loadConfigForConsumer(consumer)
	if err != nil {
		return nil, err
	}

	return consumer, nil
}

func (m *Manager) consumerFromCfg(stream string, name string, cfg *api.ConsumerConfig) *Consumer {
	return &Consumer{
		name:   name,
		stream: stream,
		cfg:    cfg,
		mgr:    m,
	}
}

// NewConsumerConfiguration generates a new configuration based on template modified by opts
func NewConsumerConfiguration(dflt api.ConsumerConfig, opts ...ConsumerOption) (*api.ConsumerConfig, error) {
	cfg := dflt

	for _, o := range opts {
		err := o(&cfg)
		if err != nil {
			return nil, err
		}
	}

	return &cfg, nil
}

func (m *Manager) loadConfigForConsumer(consumer *Consumer) (err error) {
	info, err := m.loadConsumerInfo(consumer.stream, consumer.name)
	if err != nil {
		return err
	}

	consumer.cfg = &info.Config

	return nil
}

func (m *Manager) loadConsumerInfo(s string, c string) (info api.ConsumerInfo, err error) {
	var resp api.JSApiConsumerInfoResponse
	err = m.jsonRequest(fmt.Sprintf(api.JSApiConsumerInfoT, s, c), nil, &resp)
	if err != nil {
		return info, err
	}

	return *resp.ConsumerInfo, nil
}

// DeliverySubject is the subject where a Push consumer will deliver its messages
func DeliverySubject(s string) ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		o.DeliverSubject = s
		return nil
	}
}

// DurableName is the name given to the consumer, when not set an ephemeral consumer is created
func DurableName(s string) ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		if !IsValidName(s) {
			return fmt.Errorf("%q is not a valid consumer name", s)
		}

		o.Durable = s
		return nil
	}
}

// StartAtSequence starts consuming messages at a specific sequence in the stream
func StartAtSequence(s uint64) ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		resetDeliverPolicy(o)
		o.DeliverPolicy = api.DeliverByStartSequence
		o.OptStartSeq = s
		return nil
	}
}

// StartAtTime starts consuming messages at a specific point in time in the stream
func StartAtTime(t time.Time) ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		resetDeliverPolicy(o)
		o.DeliverPolicy = api.DeliverByStartTime
		o.OptStartTime = &t
		return nil
	}
}

// DeliverAllAvailable delivers messages starting with the first available in the stream
func DeliverAllAvailable() ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		resetDeliverPolicy(o)
		o.DeliverPolicy = api.DeliverAll
		return nil
	}
}

// StartWithLastReceived starts delivery at the last messages received in the stream
func StartWithLastReceived() ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		resetDeliverPolicy(o)
		o.DeliverPolicy = api.DeliverLast
		return nil
	}
}

// StartWithNextReceived starts delivery at the next messages received in the stream
func StartWithNextReceived() ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		resetDeliverPolicy(o)
		o.DeliverPolicy = api.DeliverNew
		return nil
	}
}

// StartAtTimeDelta starts delivering messages at a past point in time
func StartAtTimeDelta(d time.Duration) ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		resetDeliverPolicy(o)

		t := time.Now().Add(-1 * d)
		o.DeliverPolicy = api.DeliverByStartTime
		o.OptStartTime = &t
		return nil
	}
}

func resetDeliverPolicy(o *api.ConsumerConfig) {
	o.DeliverPolicy = api.DeliverAll
	o.OptStartSeq = 0
	o.OptStartTime = nil
}

// AcknowledgeNone disables message acknowledgement
func AcknowledgeNone() ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		o.AckPolicy = api.AckNone
		return nil
	}
}

// AcknowledgeAll enables an acknowledgement mode where acknowledging message 100 will also ack the preceding messages
func AcknowledgeAll() ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		o.AckPolicy = api.AckAll
		return nil
	}
}

// AcknowledgeExplicit requires that every message received be acknowledged
func AcknowledgeExplicit() ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		o.AckPolicy = api.AckExplicit
		return nil
	}
}

// AckWait sets the time a delivered message might remain unacknowledged before redelivery is attempted
func AckWait(t time.Duration) ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		o.AckWait = t
		return nil
	}
}

// MaxDeliveryAttempts is the number of times a message will be attempted to be delivered
func MaxDeliveryAttempts(n int) ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		if n == 0 {
			return fmt.Errorf("configuration would prevent all deliveries")
		}
		o.MaxDeliver = n
		return nil
	}
}

// FilterStreamBySubject filters the messages in a wildcard stream to those matching a specific subject
func FilterStreamBySubject(s string) ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		o.FilterSubject = s
		return nil
	}
}

// ReplayInstantly delivers messages to the consumer as fast as possible
func ReplayInstantly() ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		o.ReplayPolicy = api.ReplayInstant
		return nil
	}
}

// ReplayAsReceived delivers messages at the rate they were received at
func ReplayAsReceived() ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		o.ReplayPolicy = api.ReplayOriginal
		return nil
	}
}

// SamplePercent configures sampling of a subset of messages expressed as a percentage
func SamplePercent(i int) ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		if i < 0 || i > 100 {
			return fmt.Errorf("sample percent must be 0-100")
		}

		if i == 0 {
			o.SampleFrequency = ""
			return nil
		}

		o.SampleFrequency = fmt.Sprintf("%d%%", i)
		return nil
	}
}

// RateLimitBitsPerSecond limits message delivery to a rate in bits per second
func RateLimitBitsPerSecond(bps uint64) ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		o.RateLimit = bps
		return nil
	}
}

// MaxAckPending maximum number of messages without acknowledgement that can be outstanding, once this limit is reached message delivery will be suspended
func MaxAckPending(pending uint) ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		o.MaxAckPending = int(pending)
		return nil
	}
}

// IdleHeartbeat sets the time before an idle consumer will send a empty message with Status header 100 indicating the consumer is still alive
func IdleHeartbeat(hb time.Duration) ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		o.Heartbeat = hb
		return nil
	}
}

// PushFlowControl enables flow control for push based consumers
func PushFlowControl() ConsumerOption {
	return func(o *api.ConsumerConfig) error {
		o.FlowControl = true
		return nil
	}
}

// Reset reloads the Consumer configuration from the JetStream server
func (c *Consumer) Reset() error {
	return c.mgr.loadConfigForConsumer(c)
}

// NextSubject returns the subject used to retrieve the next message for pull-based Consumers, empty when not a pull-base consumer
func (m *Manager) NextSubject(stream string, consumer string) (string, error) {
	s, err := NextSubject(stream, consumer)
	if err != nil {
		return "", err
	}

	return m.apiSubject(s), err
}

// NextSubject returns the subject used to retrieve the next message for pull-based Consumers, empty when not a pull-base consumer
func (c *Consumer) NextSubject() string {
	if !c.IsPullMode() {
		return ""
	}

	s, _ := c.mgr.NextSubject(c.stream, c.name)

	return s
}

// NextSubject returns the subject used to retrieve the next message for pull-based Consumers, empty when not a pull-base consumer
func NextSubject(stream string, consumer string) (string, error) {
	if !IsValidName(stream) {
		return "", fmt.Errorf("%q is not a valid stream name", stream)
	}
	if !IsValidName(consumer) {
		return "", fmt.Errorf("%q is not a valid consumer name", consumer)
	}

	return fmt.Sprintf(api.JSApiRequestNextT, stream, consumer), nil
}

// AckSampleSubject is the subject used to publish ack samples to
func (c *Consumer) AckSampleSubject() string {
	if c.SampleFrequency() == "" {
		return ""
	}

	return api.JSMetricConsumerAckPre + "." + c.StreamName() + "." + c.name
}

// AdvisorySubject is a wildcard subscription subject that subscribes to all advisories for this consumer
func (c *Consumer) AdvisorySubject() string {
	return api.JSAdvisoryPrefix + ".CONSUMER.*." + c.StreamName() + "." + c.name
}

// MetricSubject is a wildcard subscription subject that subscribes to all metrics for this consumer
func (c *Consumer) MetricSubject() string {
	return api.JSMetricPrefix + ".CONSUMER.*." + c.StreamName() + "." + c.name
}

// NextMsg requests the next message from the server with the manager timeout
func (m *Manager) NextMsg(stream string, consumer string) (*nats.Msg, error) {
	if !m.nc.Opts.UseOldRequestStyle {
		return nil, fmt.Errorf("pull mode requires the use of UseOldRequestStyle() option")
	}

	s, err := m.NextSubject(stream, consumer)
	if err != nil {
		return nil, err
	}

	rj, err := json.Marshal(&api.JSApiConsumerGetNextRequest{
		Expires: m.timeout,
		Batch:   1,
	})
	if err != nil {
		return nil, err
	}

	return m.request(s, rj)
}

// NextMsgRequest creates a request for a batch of messages on a consumer, data or control flow messages will be sent to inbox
func (m *Manager) NextMsgRequest(stream string, consumer string, inbox string, req *api.JSApiConsumerGetNextRequest) error {
	s, err := m.NextSubject(stream, consumer)
	if err != nil {
		return err
	}

	jreq, err := json.Marshal(req)
	if err != nil {
		return err
	}

	if m.trace {
		log.Printf(">>> %s:\n%s\n\n", s, string(jreq))
	}

	return m.nc.PublishMsg(&nats.Msg{Subject: s, Reply: inbox, Data: jreq})
}

// NextMsg requests the next message from the server. This request will wait for as long as the context is
// active. If repeated pulls will be made it's better to use NextMsgRequest()
func (m *Manager) NextMsgContext(ctx context.Context, stream string, consumer string) (*nats.Msg, error) {
	if !m.nc.Opts.UseOldRequestStyle {
		return nil, fmt.Errorf("pull mode requires the use of UseOldRequestStyle() option")
	}

	s, err := m.NextSubject(stream, consumer)
	if err != nil {
		return nil, err
	}

	return m.requestWithContext(ctx, s, []byte(strconv.Itoa(1)))
}

// NextMsgRequest creates a request for a batch of messages, data or control flow messages will be sent to inbox
func (c *Consumer) NextMsgRequest(inbox string, req *api.JSApiConsumerGetNextRequest) error {
	return c.mgr.NextMsgRequest(c.stream, c.name, inbox, req)
}

// NextMsg retrieves the next message, waiting up to manager timeout for a response
func (c *Consumer) NextMsg() (*nats.Msg, error) {
	return c.mgr.NextMsg(c.stream, c.name)
}

// NextMsgContext retrieves the next message, interrupted by the cancel context ctx
func (c *Consumer) NextMsgContext(ctx context.Context) (*nats.Msg, error) {
	return c.mgr.NextMsgContext(ctx, c.stream, c.name)
}

// DeliveredState reports the messages sequences that were successfully delivered
func (c *Consumer) DeliveredState() (api.SequencePair, error) {
	info, err := c.State()
	if err != nil {
		return api.SequencePair{}, err
	}

	return info.Delivered, nil
}

// AcknowledgedFloor reports the highest contiguous message sequences that were acknowledged
func (c *Consumer) AcknowledgedFloor() (api.SequencePair, error) {
	info, err := c.State()
	if err != nil {
		return api.SequencePair{}, err
	}

	return info.AckFloor, nil
}

// PendingAcknowledgement reports the number of messages sent but not yet acknowledged
func (c *Consumer) PendingAcknowledgement() (int, error) {
	info, err := c.State()
	if err != nil {
		return 0, err
	}

	return info.NumAckPending, nil
}

// PendingMessages is the number of unprocessed messages for this consumer
func (c *Consumer) PendingMessages() (uint64, error) {
	info, err := c.State()
	if err != nil {
		return 0, err
	}

	return info.NumPending, nil
}

// WaitingClientPulls is the number of clients that have outstanding pull requests against this consumer
func (c *Consumer) WaitingClientPulls() (int, error) {
	info, err := c.State()
	if err != nil {
		return 0, err
	}

	return info.NumWaiting, nil
}

// RedeliveryCount reports the number of redelivers that were done
func (c *Consumer) RedeliveryCount() (int, error) {
	info, err := c.State()
	if err != nil {
		return 0, err
	}

	return info.NumRedelivered, nil
}

// State loads a snapshot of consumer state including delivery counts, retries and more
func (c *Consumer) State() (api.ConsumerInfo, error) {
	return c.mgr.loadConsumerInfo(c.stream, c.name)
}

// Configuration is the Consumer configuration
func (c *Consumer) Configuration() (config api.ConsumerConfig) {
	return *c.cfg
}

// Delete deletes the Consumer, after this the Consumer object should be disposed
func (c *Consumer) Delete() (err error) {
	var resp api.JSApiConsumerDeleteResponse
	err = c.mgr.jsonRequest(fmt.Sprintf(api.JSApiConsumerDeleteT, c.StreamName(), c.Name()), nil, &resp)
	if err != nil {
		return err
	}

	if resp.Success {
		return nil
	}

	return fmt.Errorf("unknown response while removing consumer %s", c.Name())
}

// LeaderStepDown requests the current RAFT group leader in a clustered JetStream to stand down forcing a new election
func (c *Consumer) LeaderStepDown() error {
	var resp api.JSApiConsumerLeaderStepDownResponse
	err := c.mgr.jsonRequest(fmt.Sprintf(api.JSApiConsumerLeaderStepDownT, c.StreamName(), c.Name()), nil, &resp)
	if err != nil {
		return err
	}

	if !resp.Success {
		return fmt.Errorf("unknown error while requesting leader step down")
	}

	return nil
}

func (c *Consumer) Name() string                     { return c.name }
func (c *Consumer) IsSampled() bool                  { return c.SampleFrequency() != "" }
func (c *Consumer) IsPullMode() bool                 { return c.cfg.DeliverSubject == "" }
func (c *Consumer) IsPushMode() bool                 { return !c.IsPullMode() }
func (c *Consumer) IsDurable() bool                  { return c.cfg.Durable != "" }
func (c *Consumer) IsEphemeral() bool                { return !c.IsDurable() }
func (c *Consumer) StreamName() string               { return c.stream }
func (c *Consumer) DeliverySubject() string          { return c.cfg.DeliverSubject }
func (c *Consumer) DurableName() string              { return c.cfg.Durable }
func (c *Consumer) StartSequence() uint64            { return c.cfg.OptStartSeq }
func (c *Consumer) DeliverPolicy() api.DeliverPolicy { return c.cfg.DeliverPolicy }
func (c *Consumer) AckPolicy() api.AckPolicy         { return c.cfg.AckPolicy }
func (c *Consumer) AckWait() time.Duration           { return c.cfg.AckWait }
func (c *Consumer) MaxDeliver() int                  { return c.cfg.MaxDeliver }
func (c *Consumer) FilterSubject() string            { return c.cfg.FilterSubject }
func (c *Consumer) ReplayPolicy() api.ReplayPolicy   { return c.cfg.ReplayPolicy }
func (c *Consumer) SampleFrequency() string          { return c.cfg.SampleFrequency }
func (c *Consumer) RateLimit() uint64                { return c.cfg.RateLimit }
func (c *Consumer) MaxAckPending() int               { return c.cfg.MaxAckPending }
func (c *Consumer) FlowControl() bool                { return c.cfg.FlowControl }
func (c *Consumer) Heartbeat() time.Duration         { return c.cfg.Heartbeat }
func (c *Consumer) StartTime() time.Time {
	if c.cfg.OptStartTime == nil {
		return time.Time{}
	}
	return *c.cfg.OptStartTime
}
