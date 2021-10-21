/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

// RAFT Transport implementation using NATS

package brokerlog

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"sync"
	"time"

	"github.com/hashicorp/raft"
	"github.com/micro/go-micro/broker"
	"github.com/nats-io/nats"
)

const (
	brokerConnectInbox      = "raft.%s.accept"
	brokerConnectInboxReply = "raft.%s.accept.reply"
	brokerRequestInbox      = "raft.%s.request.%s"
	timeoutForDialAndFlush  = 2 * time.Second
	defaultTPortTimeout     = 10 * time.Second
)

// addr implements the net.Addr interface. An address for the broker
// transport is simply a node id, which is then used to construct a subscription
type addr string

func (n addr) Network() string {
	return "broker"
}

func (n addr) String() string {
	return string(n)
}

type subscribable interface {
	Unsubscribe() error
}

type connectRequestProto struct {
	ID    string `json:"id"`
	Inbox string `json:"inbox"`
}

type connectResponseProto struct {
	Inbox string `json:"inbox"`
}

// brokerConn implements the net.Conn interface by simulating a stream-oriented
// connection between two peers. It does this by establishing a unique inbox at
// each endpoint which the peers use to stream data to each other.
type brokerConn struct {
	broker     broker.Broker
	localAddr  addr
	remoteAddr addr
	sub        subscribable
	outbox     string
	mu         sync.RWMutex
	closed     bool
	reader     *timeoutReader
	writer     io.WriteCloser
	parent     *brokerStreamLayer
}

func (n *brokerConn) Read(b []byte) (int, error) {
	n.mu.RLock()
	closed := n.closed
	n.mu.RUnlock()
	if closed {
		return 0, errors.New("read from closed conn")
	}
	return n.reader.Read(b)
}

func (n *brokerConn) Write(b []byte) (int, error) {
	n.mu.RLock()
	closed := n.closed
	n.mu.RUnlock()
	if closed {
		return 0, errors.New("write to closed conn")
	}

	if len(b) == 0 {
		return 0, nil
	}

	// Send data in chunks to avoid hitting max payload.
	n.broker.Publish(n.outbox, &broker.Message{
		Body: b,
	})

	return len(b), nil
}

func (n *brokerConn) Close() error {
	return n.close(true)
}

func (n *brokerConn) close(signalRemote bool) error {
	n.mu.Lock()
	defer n.mu.Unlock()

	if n.closed {
		return nil
	}

	if err := n.sub.Unsubscribe(); err != nil {
		return err
	}

	if signalRemote {
		// Send empty message to signal EOF for a graceful disconnect. Not
		// concerned with errors here as this is best effort.
		n.broker.Publish(n.outbox, nil)
	}

	n.closed = true
	n.parent.mu.Lock()
	delete(n.parent.conns, n)
	n.parent.mu.Unlock()
	n.writer.Close()

	return nil
}

func (n *brokerConn) LocalAddr() net.Addr {
	return n.localAddr
}

func (n *brokerConn) RemoteAddr() net.Addr {
	return n.remoteAddr
}

func (n *brokerConn) SetDeadline(t time.Time) error {
	if err := n.SetReadDeadline(t); err != nil {
		return err
	}
	return n.SetWriteDeadline(t)
}

func (n *brokerConn) SetReadDeadline(t time.Time) error {
	n.reader.SetDeadline(t)
	return nil
}

func (n *brokerConn) SetWriteDeadline(t time.Time) error {
	return nil
}

func (n *brokerConn) msgHandler(pub broker.Publication) error {
	msg := pub.Message()

	// Check if remote peer disconnected.
	if len(msg.Body) == 0 {
		n.close(false)
		return nil
	}

	_, err := n.writer.Write(msg.Body)

	return err
}

// brokerStreamLayer implements the raft.StreamLayer interface.
type brokerStreamLayer struct {
	broker    broker.Broker
	localAddr addr
	sub       subscribable
	pub       chan broker.Publication
	logger    *log.Logger
	conns     map[*brokerConn]struct{}
	mu        sync.Mutex
	// This is the timeout we will use for flush and dial (request timeout),
	// not the timeout that RAFT will use to call SetDeadline.
	dfTimeout time.Duration
}

func newBrokerStreamLayer(id string, b broker.Broker, logger *log.Logger, timeout time.Duration) (*brokerStreamLayer, error) {
	n := &brokerStreamLayer{
		localAddr: addr(id),
		broker:    b,
		pub:       make(chan broker.Publication),
		logger:    logger,
		conns:     map[*brokerConn]struct{}{},
		dfTimeout: timeoutForDialAndFlush,
	}
	// Could be the case in tests...
	if timeout < n.dfTimeout {
		n.dfTimeout = timeout
	}
	sub, err := b.Subscribe(fmt.Sprintf(brokerConnectInbox, id), func(pub broker.Publication) error {
		n.pub <- pub

		return nil
	})
	if err != nil {
		return nil, err
	}

	n.sub = sub
	return n, nil
}

func (n *brokerStreamLayer) newBrokerConn(address string) *brokerConn {
	// TODO: probably want a buffered pipe.
	reader, writer := io.Pipe()
	return &brokerConn{
		broker:     n.broker,
		localAddr:  n.localAddr,
		remoteAddr: addr(address),
		reader:     newTimeoutReader(reader),
		writer:     writer,
		parent:     n,
	}
}

// Dial creates a new net.Conn with the remote address. This is implemented by
// performing a handshake over NATS which establishes unique inboxes at each
// endpoint for streaming data.
func (n *brokerStreamLayer) Dial(address raft.ServerAddress, timeout time.Duration) (net.Conn, error) {

	connect := &connectRequestProto{
		ID:    n.localAddr.String(),
		Inbox: fmt.Sprintf(brokerRequestInbox, n.localAddr.String(), nats.NewInbox()),
	}
	data, err := json.Marshal(connect)
	if err != nil {
		panic(err)
	}

	peerConn := n.newBrokerConn(string(address))

	// Setup inbox.
	sub, err := n.broker.Subscribe(connect.Inbox, peerConn.msgHandler)
	if err != nil {
		return nil, err
	}

	replied := make(chan struct{}, 1)

	acceptReplySub, err := n.broker.Subscribe(fmt.Sprintf(brokerConnectInboxReply, address), func(pub broker.Publication) error {
		msg := pub.Message()

		var resp connectResponseProto
		if err := json.Unmarshal(msg.Body, &resp); err != nil {
			sub.Unsubscribe()
			return err
		}

		peerConn.sub = sub
		peerConn.outbox = resp.Inbox

		replied <- struct{}{}

		return nil
	})
	if err != nil {
		sub.Unsubscribe()
		return nil, err
	}

	defer acceptReplySub.Unsubscribe()

	// Make connect request to peer.
	if err := n.broker.Publish(fmt.Sprintf(brokerConnectInbox, address), &broker.Message{
		Body: data,
	}); err != nil {
		sub.Unsubscribe()
		return nil, err
	}

loop:
	for {
		select {
		case <-replied:
			break loop
		case <-time.After(n.dfTimeout):
			return nil, errors.New("reply timed out")
		}
	}

	n.mu.Lock()
	n.conns[peerConn] = struct{}{}
	n.mu.Unlock()

	return peerConn, nil
}

// Accept waits for and returns the next connection to the listener.
func (n *brokerStreamLayer) Accept() (net.Conn, error) {
	for {
		pub := <-n.pub

		msg := pub.Message()

		var connect connectRequestProto
		if err := json.Unmarshal(msg.Body, &connect); err != nil {
			n.logger.Println("[ERR] raft-nats: Invalid connect message (invalid data)")
			continue
		}

		peerConn := n.newBrokerConn(connect.ID)
		peerConn.outbox = connect.Inbox

		// Setup inbox for peer.
		inbox := fmt.Sprintf(brokerRequestInbox, n.localAddr.String(), nats.NewInbox())
		sub, err := n.broker.Subscribe(inbox, peerConn.msgHandler)
		if err != nil {
			n.logger.Printf("[ERR] raft-nats: Failed to create inbox for remote peer: %v", err)
			continue
		}

		// Reply to peer.
		resp := &connectResponseProto{Inbox: inbox}
		data, err := json.Marshal(resp)
		if err != nil {
			panic(err)
		}
		if err := n.broker.Publish(fmt.Sprintf(brokerConnectInboxReply, n.localAddr.String()), &broker.Message{
			Body: data,
		}); err != nil {
			n.logger.Printf("[ERR] raft-nats: Failed to send connect response to remote peer: %v", err)
			sub.Unsubscribe()
			continue
		}
		peerConn.sub = sub
		n.mu.Lock()
		n.conns[peerConn] = struct{}{}
		n.mu.Unlock()
		return peerConn, nil
	}
}

func (n *brokerStreamLayer) Close() error {
	n.mu.Lock()
	// Do not set nc.conn to nil since it is accessed in some functions
	// without the stream layer lock
	conns := make(map[*brokerConn]struct{}, len(n.conns))
	for conn, s := range n.conns {
		conns[conn] = s
	}
	n.mu.Unlock()
	for c := range conns {
		c.Close()
	}
	return nil
}

func (n *brokerStreamLayer) Addr() net.Addr {
	return n.localAddr
}

// NewBrokerTransport creates a new raft.NetworkTransport implemented with NATS
// as the transport layer.
func NewBrokerTransport(id string, b broker.Broker, timeout time.Duration, logOutput io.Writer) (*raft.NetworkTransport, error) {
	if logOutput == nil {
		logOutput = os.Stderr
	}
	return NewBrokerTransportWithLogger(id, b, timeout, log.New(logOutput, "", log.LstdFlags))
}

// NewBrokerTransportWithLogger creates a new raft.NetworkTransport implemented
// with NATS as the transport layer using the provided Logger.
func NewBrokerTransportWithLogger(id string, b broker.Broker, timeout time.Duration, logger *log.Logger) (*raft.NetworkTransport, error) {
	return createBrokerTransport(id, b, logger, timeout, func(stream raft.StreamLayer) *raft.NetworkTransport {
		return raft.NewNetworkTransportWithLogger(stream, 3, timeout, logger)
	})
}

// NewBrokerTransportWithConfig returns a raft.NetworkTransport implemented
// with NATS as the transport layer, using the given config struct.
func NewBrokerTransportWithConfig(id string, b broker.Broker, config *raft.NetworkTransportConfig) (*raft.NetworkTransport, error) {
	if config.Timeout == 0 {
		config.Timeout = defaultTPortTimeout
	}
	return createBrokerTransport(id, b, log.New(os.Stdout, "", log.LstdFlags), config.Timeout, func(stream raft.StreamLayer) *raft.NetworkTransport {
		config.Stream = stream
		return raft.NewNetworkTransportWithConfig(config)
	})
}

func createBrokerTransport(id string, b broker.Broker, logger *log.Logger, timeout time.Duration,
	transportCreator func(stream raft.StreamLayer) *raft.NetworkTransport) (*raft.NetworkTransport, error) {

	stream, err := newBrokerStreamLayer(id, b, logger, timeout)
	if err != nil {
		return nil, err
	}

	return transportCreator(stream), nil
}

func min(x, y int64) int64 {
	if x < y {
		return x
	}
	return y
}
