package file

import (
	"errors"

	"github.com/pydio/go-os/config"
	"github.com/fsnotify/fsnotify"
)

type watcher struct {
	f *file

	fw   *fsnotify.Watcher
	exit chan bool
}

func newWatcher(f *file) (config.SourceWatcher, error) {
	fw, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}

	fw.Add(f.opts.Name)

	return &watcher{
		f:    f,
		fw:   fw,
		exit: make(chan bool),
	}, nil
}

func (w *watcher) Next() (*config.ChangeSet, error) {
	// is it closed?
	select {
	case <-w.exit:
		return nil, errors.New("watcher stopped")
	default:
	}

	// try get the event
	select {
	case <-w.fw.Events:
		c, err := w.f.Read()
		if err != nil {
			return nil, err
		}
		return c, nil
	case err := <-w.fw.Errors:
		return nil, err
	case <-w.exit:
		return nil, errors.New("watcher stopped")
	}
}

func (w *watcher) Stop() error {
	return w.fw.Close()
}
