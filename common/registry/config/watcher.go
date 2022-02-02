package configregistry

import (
	"errors"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
)

type watcher struct {
	id   string
	wo   registry.Options
	res  chan registry.Result
	exit chan bool
}

func (m *watcher) Next() (registry.Result, error) {
	for {
		select {
		case r := <-m.res:
			if r.Item() == nil {
				continue
			}

			if len(m.wo.Name) > 0 && m.wo.Name != r.Item().Name() {
				continue
			}

			switch m.wo.Type {
			case pb.ItemType_SERVICE:
				var service registry.Service
				if r.Item().As(&service) && (m.wo.Filter == nil || m.wo.Filter(r.Item())) {
					return r, nil
				}
				continue
			case pb.ItemType_NODE:
				var node registry.Node
				if r.Item().As(&node) && (m.wo.Filter == nil || m.wo.Filter(r.Item())) {
					return r, nil
				}
				continue
			}

			return r, nil
		case <-m.exit:
			return nil, errors.New("watcher stopped")
		}
	}
}

func (m *watcher) Stop() {
	select {
	case <-m.exit:
		return
	default:
		close(m.exit)
	}
}

type result struct {
	action string
	item   registry.Item
}

func (r *result) Action() string {
	return r.action
}

func (r *result) Item() registry.Item {
	return r.item
}
