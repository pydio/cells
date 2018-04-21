package config

import (
	"bytes"
	"errors"
	"log"
	"sync"
	"time"

	"github.com/micro/go-micro/client"
)

type os struct {
	exit chan bool
	opts Options

	sync.RWMutex
	cset *ChangeSet
	vals Values

	idx      int
	watchers map[int]*watcher
}

type watcher struct {
	exit    chan bool
	path    []string
	value   Value
	updates chan Value
}

func newOS(opts ...Option) Config {
	options := Options{
		PollInterval: DefaultPollInterval,
		Reader:       NewReader(),
	}

	for _, o := range opts {
		o(&options)
	}

	if options.Client == nil {
		options.Client = client.DefaultClient
	}

	if options.Sources == nil {
		// Set a os source
		options.Sources = append(options.Sources, NewSource(SourceClient(options.Client)))
	}

	o := &os{
		exit:     make(chan bool),
		opts:     options,
		watchers: make(map[int]*watcher),
	}

	go o.run()
	return o
}

func (o *os) run() {
	t := time.NewTicker(o.opts.PollInterval)

	for {
		select {
		case <-t.C:
			o.sync()
		case <-o.exit:
			t.Stop()
			return
		}
	}
}

func (o *os) loaded() bool {
	var loaded bool
	o.RLock()
	if o.vals != nil {
		loaded = true
	}
	o.RUnlock()
	return loaded
}

func (o *os) update() {
	var watchers []*watcher

	o.RLock()
	for _, w := range o.watchers {
		watchers = append(watchers, w)
	}
	o.RUnlock()

	for _, w := range watchers {
		select {
		case w.updates <- o.vals.Get(w.path...):
		default:
		}
	}
}

// sync loads all the sources, calls the parser and updates the config
func (o *os) sync() {
	if len(o.opts.Sources) == 0 {
		log.Printf("Zero sources available to sync")
		return
	}

	var sets []*ChangeSet

	for _, source := range o.opts.Sources {
		ch, err := source.Read()
		// should we actually skip failing sources?
		// best effort merging right? but what if we
		// already have good config? that would be screwed
		if err != nil {
			o.RLock()
			vals := o.vals
			o.RUnlock()

			// if we have no config, we're going to try
			// load something
			if vals == nil {
				continue
			} else {
				return
			}
		}
		sets = append(sets, ch)
	}

	set, err := o.opts.Reader.Parse(sets...)
	if err != nil {
		log.Printf("Failed to parse ChangeSets %v", err)
		return
	}

	o.Lock()
	o.vals, _ = o.opts.Reader.Values(set)
	o.cset = set
	o.Unlock()

	o.update()
}

func (o *os) Close() error {
	select {
	case <-o.exit:
		return nil
	default:
		close(o.exit)
	}
	return nil
}

func (o *os) Get(path ...string) Value {
	if !o.loaded() {
		o.sync()
	}

	o.Lock()
	defer o.Unlock()

	// did sync actually work?
	if o.vals != nil {
		return o.vals.Get(path...)
	}

	ch := o.cset

	// we are truly screwed, trying to load in a hacked way
	v, err := o.opts.Reader.Values(ch)
	if err != nil {
		log.Printf("Failed to read values %v trying again", err)
		// man we're so screwed
		// Let's try hack this
		// We should really be better
		if ch == nil || ch.Data == nil {
			ch = &ChangeSet{
				Timestamp: time.Now(),
				Source:    o.String(),
				Data:      []byte(`{}`),
			}
		}
		v, _ = o.opts.Reader.Values(ch)
	}

	// lets set it just because
	o.vals = v

	if o.vals != nil {
		return o.vals.Get(path...)
	}

	// ok we're going hardcore now
	return newValue(nil)
}

func (o *os) Del(path ...string) {
	if !o.loaded() {
		o.sync()
	}

	o.Lock()
	defer o.Unlock()

	if o.vals != nil {
		o.vals.Del(path...)
	}
}

func (o *os) Set(val interface{}, path ...string) {
	if !o.loaded() {
		o.sync()
	}

	o.Lock()
	defer o.Unlock()

	if o.vals != nil {
		o.vals.Set(val, path...)
	}
}

func (o *os) Bytes() []byte {
	if !o.loaded() {
		o.sync()
	}

	o.Lock()
	defer o.Unlock()

	if o.vals == nil {
		return []byte{}
	}

	return o.vals.Bytes()
}

func (o *os) Options() Options {
	return o.opts
}

func (o *os) String() string {
	return "os"
}

func (o *os) Watch(path ...string) (Watcher, error) {
	value := o.Get(path...)

	o.Lock()

	w := &watcher{
		exit:    make(chan bool),
		path:    path,
		value:   value,
		updates: make(chan Value, 1),
	}

	id := o.idx
	o.watchers[id] = w
	o.idx++

	o.Unlock()

	go func() {
		<-w.exit
		o.Lock()
		delete(o.watchers, id)
		o.Unlock()
	}()

	return w, nil
}

func (w *watcher) Next() (Value, error) {
	for {
		select {
		case <-w.exit:
			return nil, errors.New("watcher stopped")
		case v := <-w.updates:
			if bytes.Equal(w.value.Bytes(), v.Bytes()) {
				continue
			}
			w.value = v
			return v, nil
		}
	}
}

func (w *watcher) Stop() error {
	select {
	case <-w.exit:
	default:
		close(w.exit)
	}
	return nil
}
