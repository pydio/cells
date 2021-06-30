package raft

import (
	"fmt"
	"go.etcd.io/etcd/raft/raftpb"
)

type transport struct {
	errorC chan error
}

func newTransport() *transport {
	errorC := make(chan error)
	return &transport{
		errorC,
	}
}

func (t *transport) Send(messages []raftpb.Message) {
	fmt.Println("Messages ", messages)
}

func (t *transport ) ErrorC() chan error {
	return t.errorC
}