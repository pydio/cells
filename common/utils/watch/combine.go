package watch

import (
	"io"
	"sync"
)

var _ Receiver = (*combinedReceiver)(nil)

type event struct {
	n any
	e error
}

type combinedReceiver struct {
	rr   []Receiver
	n    chan *event
	done chan struct{}

	stopOnce sync.Once
}

func NewCombinedReceiver(rr []Receiver) Receiver {
	cw := &combinedReceiver{
		rr:   rr,
		n:    make(chan *event, 1),
		done: make(chan struct{}, 1),
	}

	for _, rcv := range cw.rr {
		go func(receiver Receiver) {
			for {
				select {
				case <-cw.done:
					return
				default:
					n, e := receiver.Next()

					select {
					case <-cw.done:
						return
					case cw.n <- &event{n, e}:
					}
				}
			}
		}(rcv)
	}
	return cw
}

func (c *combinedReceiver) Next() (interface{}, error) {
	select {
	case <-c.done:
		return nil, io.EOF
	case n := <-c.n:
		return n.n, n.e
	}
}

func (c *combinedReceiver) Stop() {
	c.stopOnce.Do(func() {
		close(c.done)
	})

	for _, r := range c.rr {
		r.Stop()
	}
}
