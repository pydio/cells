package registry

import (
	"errors"

	pb "github.com/pydio/cells/v4/common/proto/registry"
)

type watcher struct {
	id   string
	wo   Options
	res  chan Result
	exit chan bool
}

func NewWatcher(id string, opts Options, res chan Result) Watcher {
	exit := make(chan bool)
	return &watcher{
		id:   id,
		wo:   opts,
		res:  res,
		exit: exit,
	}
}

func (m *watcher) Next() (Result, error) {
	for {
		select {
		case r := <-m.res:
			if m.wo.Action == pb.ActionType_FULL_LIST && r.Action() != pb.ActionType_FULL_LIST {
				continue
			}

			if (m.wo.Action == pb.ActionType_FULL_DIFF || m.wo.Action >= pb.ActionType_CREATE) && r.Action() < pb.ActionType_CREATE {
				continue
			}

			// Return everything
			if m.wo.Name == "" && m.wo.Type == pb.ItemType_ALL && m.wo.Filter == nil {
				return r, nil
			}

			var items []Item
			for _, item := range r.Items() {
				if len(m.wo.Name) > 0 && m.wo.Name != item.Name() {
					continue
				}

				switch m.wo.Type {
				case pb.ItemType_SERVICE:
					var service Service
					if item.As(&service) && (m.wo.Filter == nil || m.wo.Filter(item)) {
						items = append(items, item)
					}
					continue
				case pb.ItemType_NODE:
					var node Node
					if item.As(&node) && (m.wo.Filter == nil || m.wo.Filter(item)) {
						items = append(items, item)
					}
					continue
				}

				items = append(items, item)
			}

			return &result{
				action: r.Action(),
				items:  items,
			}, nil
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
	action pb.ActionType
	items  []Item
}

func NewResult(action pb.ActionType, items []Item) Result {
	return &result{
		action: action,
		items:  items,
	}
}

func (r *result) Action() pb.ActionType {
	return r.action
}

func (r *result) Items() []Item {
	return r.items
}
