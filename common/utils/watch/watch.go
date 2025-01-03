package watch

import (
	"errors"
	"regexp"
	"strings"
	"sync"
	"time"

	diff "github.com/r3labs/diff/v3"

	"github.com/pydio/cells/v5/common/utils/std"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

var (
	errClosedChannel = errors.New("channel is closed")
)

type Watcher interface {
	Reset()
	Flush()
	Watch(...WatchOption) (Receiver, error)
}

type Watchable[T Cloneable] interface {
	Clone() T
	Cloneable
}

type Cloneable interface {
	Get() any
	Empty()
}

type Caller interface {
	Call(diff.Change) error
}

type Receiver interface {
	Next() (any, error)
	Stop()
}

type WatchOption func(*WatchOptions)

type WatchOptions struct {
	Path        []string
	ChangesOnly bool
}

func WithPath(path ...string) WatchOption {
	return func(o *WatchOptions) {
		o.Path = path
	}
}

func WithChangesOnly() WatchOption {
	return func(o *WatchOptions) {
		o.ChangesOnly = true
	}
}

type watcher[T Cloneable] struct {
	object Watchable[T]

	receiversLocker *sync.RWMutex
	receivers       []*receiver

	reset   chan bool
	timer   *time.Timer
	timeout time.Duration

	snap         T
	snapInitOnce sync.Once
}

func NewWatcher[T Cloneable](object Watchable[T]) Watcher {
	w := &watcher[T]{
		object:          object,
		receiversLocker: new(sync.RWMutex),
		reset:           make(chan bool),
		timeout:         50 * time.Millisecond,
		snapInitOnce:    sync.Once{},
	}

	go w.Flush()

	return w
}

func (w *watcher[T]) Reset() {
	w.reset <- true
}

func (w *watcher[T]) Flush() {
	w.snapInitOnce.Do(func() {
		w.snap = w.object.Clone()
	})

	// Waiting for first call to start the timeout
	select {
	case <-w.reset:
		w.timer = time.NewTimer(w.timeout)
	}

	// Now looping the timer
	for {
		select {
		case <-w.reset:
			w.timer.Reset(w.timeout)
		case <-w.timer.C:
			settings := w.object.Get()
			if settings == nil {
				continue
			}

			snapSettings := w.snap.Get()

			patch, err := diff.Diff(snapSettings, settings, diff.CustomValueDiffers(CustomValueDiffers...), diff.DisableStructValues(), diff.AllowTypeMismatch(true)) // , diff.CustomValueDiffers(config.CustomValueDiffers...))

			if err != nil {
				continue
			}

			w.snap = w.object.Clone()

			for _, op := range patch {
				var updated []*receiver

				w.receiversLocker.RLock()
				for _, r := range w.receivers {
					if err := r.Call(op); err == nil {
						updated = append(updated, r)
					}
				}

				w.receiversLocker.RUnlock()

				w.receiversLocker.Lock()
				w.receivers = updated
				w.receiversLocker.Unlock()
			}
		}
	}
}

func (w *watcher[T]) Watch(opts ...WatchOption) (Receiver, error) {
	w.snapInitOnce.Do(func() {
		w.snap = w.object.Clone()
	})

	r, err := newReceiver("watcher ", opts...)
	if err != nil {
		return nil, err
	}

	w.receiversLocker.Lock()
	w.receivers = append(w.receivers, r)
	w.receiversLocker.Unlock()

	return r, nil
}

type receiver struct {
	name     string
	closed   bool
	sendLock *sync.Mutex

	ch chan diff.Change

	regPath     *regexp.Regexp
	timeout     time.Duration
	level       int
	changesOnly bool

	timer *time.Timer
}

func newReceiver(name string, opts ...WatchOption) (*receiver, error) {
	o := &WatchOptions{}
	for _, opt := range opts {
		opt(o)
	}

	path := std.StringToKeys(o.Path...)

	regPath, err := regexp.Compile("^" + strings.Join(path, "/"))
	if err != nil {
		return nil, err
	}

	return &receiver{
		name:        name,
		closed:      false,
		sendLock:    &sync.Mutex{},
		ch:          make(chan diff.Change),
		regPath:     regPath,
		level:       len(path),
		changesOnly: o.ChangesOnly,
		timeout:     2 * time.Second,
	}, nil
}

func NewReceiver(opts ...WatchOption) (Receiver, error) {
	str := uuid.New()
	return newReceiver("new receiver "+str, opts...)
}

func (r *receiver) Call(op diff.Change) error {
	if r.level == 0 {
		r.sendLock.Lock()

		if r.closed {
			return errClosedChannel
		}

		r.ch <- op

		r.sendLock.Unlock()

		return nil
	}

	if r.level > len(op.Path) {
		childPatch, err := diff.Diff(op.From, op.To)
		if err != nil {
			return nil
		}

		for _, childOp := range childPatch {
			if len(childOp.Path) > 0 {
				path := make([]string, len(op.Path))
				for i := 0; i < len(op.Path); i++ {
					path[i] = op.Path[i]
				}
				childOp.Path = append(path, childOp.Path...)
				r.Call(childOp)
			}
		}

		return nil
	}

	r.sendLock.Lock()

	if r.closed {
		return errClosedChannel
	}

	if r.regPath.MatchString(strings.Join(op.Path, "/")) {
		r.ch <- op
	}

	r.sendLock.Unlock()

	return nil
}

func (r *receiver) Next() (interface{}, error) {
	changes := []diff.Change{}

	select {
	case op := <-r.ch:
		if r.closed {
			return nil, errClosedChannel
		}

		changes = append(changes, op)

		r.timer = time.NewTimer(r.timeout)
	}

	for {
		select {
		case op := <-r.ch:
			if r.closed {
				return nil, errClosedChannel
			}

			changes = append(changes, op)

			r.timer.Reset(r.timeout)
		case <-r.timer.C:
			return changes, nil
		}
	}
}

func (r *receiver) Stop() {
	r.sendLock.Lock()
	r.closed = true
	close(r.ch)
	r.sendLock.Unlock()
}
