package memory

import (
	"errors"

	"github.com/micro/go-micro/registry"
)

type memoryWatcher struct {
	id   string
	wo   registry.WatchOptions
	res  chan *registry.Result
	exit chan bool
}

func (m *memoryWatcher) Next() (*registry.Result, error) {
	for {
		select {
		case r := <-m.res:
			if len(m.wo.Service) > 0 && m.wo.Service != r.Service.Name {
				continue
			}
			return r, nil
		case <-m.exit:
			return nil, errors.New("watcher stopped")
		}
	}
}

func (m *memoryWatcher) Stop() {
	select {
	case <-m.exit:
		return
	default:
		close(m.exit)
	}
}
