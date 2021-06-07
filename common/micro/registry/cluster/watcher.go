package cluster

import (
	"errors"

	"github.com/micro/go-micro/registry"
)

type clusterWatcher struct {
	id   string
	wo   registry.WatchOptions
	res  chan *registry.Result
	exit chan bool
}

func (w *clusterWatcher) Next() (*registry.Result, error) {
	for {
		select {
		case r := <-w.res:
			if len(w.wo.Service) > 0 && w.wo.Service != r.Service.Name {
				continue
			}
			return r, nil
		case <-w.exit:
			return nil, errors.New("watcher stopped")
		}
	}
}

func (w *clusterWatcher) Stop() {
	select {
	case <-w.exit:
		return
	default:
		close(w.exit)
	}
}
