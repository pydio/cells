package memory

import "github.com/pydio/go-os/config"

type watcher struct {
	Id      string
	Updates chan *config.ChangeSet
	Source  *memory
}

func (w *watcher) Next() (*config.ChangeSet, error) {
	cs := <-w.Updates
	return cs, nil
}

func (w *watcher) Stop() error {
	w.Source.Lock()
	delete(w.Source.Watchers, w.Id)
	w.Source.Unlock()
	return nil
}
