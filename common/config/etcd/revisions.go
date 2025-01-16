/*
 * Copyright (c) 2019-2022 Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package etcd

import (
	"context"
	"fmt"
	"time"

	clientv3 "go.etcd.io/etcd/client/v3"

	"github.com/pydio/cells/v5/common/config/revisions"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/kv/etcd"
)

type revs struct {
	*etcd.Store
	cli    *clientv3.Client
	prefix string
}

// AsRevisionsStore implements RevisionsProvider interface
func (m *revs) As(out any) bool {
	if v, ok := out.(*revisions.Store); ok {
		*v = m
		return true
	}

	return false
}

func (r *revs) Put(version *revisions.Version) error {
	if er := r.Val("revision").Set(version); er != nil {
		return er
	}
	return r.Store.Save("", "")
}

func (r *revs) unmarshallVersion(id int64, data []byte) (*revisions.Version, error) {
	var raw map[string]interface{}
	if er := json.Unmarshal(data, &raw); er != nil {
		return nil, er
	}
	rev, ok := raw["revision"]
	if !ok {
		return nil, fmt.Errorf("cannot find 'revision' key in data")
	}

	rm, _ := json.Marshal(rev)
	var version *revisions.Version
	if e := json.Unmarshal(rm, &version); e == nil {
		version.Data = raw
		version.Id = uint64(id)
		return version, nil
	} else {
		return nil, e
	}
}

func (r *revs) List(offset uint64, limit uint64) ([]*revisions.Version, error) {

	ctx := context.Background()
	var vv []*revisions.Version
	type s struct {
		version int64
		data    []byte
	}
	var dd []s

	ct, can := context.WithCancel(ctx)
	defer can()
	watcher := r.cli.Watch(ct, r.prefix, clientv3.WithRev(1))
	for resp := range watcher {
		for _, ev := range resp.Events {
			if ev.Kv.Version == 0 { // If key was emptied and recreated, we ignore the previous history
				dd = dd[0:0]
				continue
			}
			dd = append(dd, s{ev.Kv.ModRevision, ev.Kv.Value})
		}
		break
	}
	for i := len(dd) - 1; i >= 0; i-- {
		if v, e := r.unmarshallVersion(dd[i].version, dd[i].data); e == nil {
			vv = append(vv, v)
		} else {
			fmt.Println("[debug] ignoring version", dd[i].version, "as revision key is not found")
			//return nil, e
		}
	}

	return vv, nil
}

func (r *revs) Retrieve(id uint64) (*revisions.Version, error) {

	resp, err := r.cli.Get(context.Background(), r.prefix, clientv3.WithPrefix(), clientv3.WithRev(int64(id)))
	if err != nil {
		return nil, err
	}

	for _, kv := range resp.Kvs {
		return r.unmarshallVersion(kv.Version, kv.Value)
	}
	return nil, fmt.Errorf("version not found")

}

func (r *revs) Save(ctxUser string, ctxMessage string) error {
	// Just update the revision key before saving
	if er := r.Val("revision").Set(&revisions.Version{
		Date: time.Now(),
		User: ctxUser,
		Log:  ctxMessage,
	}); er != nil {
		return er
	}

	return r.Store.Save(ctxUser, ctxMessage)
}
