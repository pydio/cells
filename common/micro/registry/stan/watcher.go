package stan

import (
	"io"

	"github.com/micro/go-micro/registry"
)

type stanWatcher struct {
	msgCh chan (*PeerEvent)
	wo    registry.WatchOptions
}

func (n *stanWatcher) Next() (*registry.Result, error) {
	result := &registry.Result{}
	for {
		ev := <-n.msgCh

		if ev == nil {
			return nil, io.EOF
		}

		if len(n.wo.Service) > 0 && ev.Service.Name != n.wo.Service {
			continue
		}

		if ev.Type == PeerEventType_REGISTER {
			result.Action = "create"
			result.Service = ev.Service
		} else {
			result.Action = "delete"
			result.Service = ev.Service
		}

		break
	}

	return result, nil
}

func (n *stanWatcher) Stop() {
	// close(n.msgCh)
}
