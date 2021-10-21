/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package remote

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/x/configx"
	proto "github.com/pydio/config-srv/proto/config"
	go_micro_os_config "github.com/pydio/go-os/config/proto"
)

type remote struct {
	id      string
	service string
	config  configx.Values

	watchers []*receiver
}

func New(service, id string) configx.Entrypoint {

	r := &remote{
		id:      id,
		service: service,
	}

	go func() {
		for {
			cli := proto.NewConfigClient(service, defaults.NewClient())

			stream, err := cli.Watch(context.Background(), &proto.WatchRequest{
				Id: id,
				// 	Path: strings.Join(path, "/"),
			})

			if err != nil {
				fmt.Println("And the error for the config is ? ", err)
				time.Sleep(1 * time.Second)
				continue
			}

			for {
				rsp, err := stream.Recv()
				if err != nil {
					if status.Convert(err).Code() == codes.Unimplemented {
						log.Debug("config watch is not implemented", zap.String("id", id))
						return
					}
					time.Sleep(1 * time.Second)
					break
				}

				c := configx.New(configx.WithJSON())
				c.Set(rsp.ChangeSet.Data)

				for _, w := range r.watchers {

					v := c.Val(w.path...).Bytes()

					select {
					case w.updates <- v:
					default:
					}
				}
			}

			stream.Close()
		}
	}()

	return r
}

func (r *remote) Val(path ...string) configx.Values {
	if r.config == nil {
		r.Get()
	}

	return &wrappedConfig{r.config.Val(path...), r}
}

func (r *remote) Get() configx.Value {
	v := configx.New(configx.WithJSON())

	cli := proto.NewConfigClient(r.service, defaults.NewClient())
	rsp, err := cli.Read(context.TODO(), &proto.ReadRequest{
		Id:   r.id,
		Path: "",
	})

	r.config = v

	if err != nil {
		return v
	}

	m := make(map[string]interface{})
	json.Unmarshal([]byte(rsp.Change.ChangeSet.Data), &m)

	v.Set(m)

	return v
}

func (r *remote) Set(data interface{}) error {

	b, err := json.Marshal(data)
	if err != nil {
		return err
	}

	cli := proto.NewConfigClient(r.service, defaults.NewClient())

	if _, err := cli.Update(context.TODO(), &proto.UpdateRequest{
		Change: &proto.Change{
			Id: r.id,
			ChangeSet: &go_micro_os_config.ChangeSet{
				Data: string(b),
			},
		},
	}); err != nil {
		return err
	}

	return nil
}

func (r *remote) Del() error {
	return nil
}

func (r *remote) Watch(path ...string) (configx.Receiver, error) {
	rcvr := &receiver{
		exit:    make(chan bool),
		path:    path,
		value:   r.Val(path...).Bytes(),
		updates: make(chan []byte),
	}

	r.watchers = append(r.watchers, rcvr)

	return rcvr, nil
}

type receiver struct {
	exit    chan bool
	path    []string
	value   []byte
	updates chan []byte
}

func (r *receiver) Next() (configx.Values, error) {
	for {
		select {
		case <-r.exit:
			return nil, errors.New("watcher stopped")
		case v := <-r.updates:
			if len(r.value) == 0 && len(v) == 0 {
				continue
			}

			if bytes.Equal(r.value, v) {
				continue
			}

			r.value = v

			ret := configx.New(configx.WithJSON())
			if err := ret.Set(v); err != nil {
				return nil, err
			}
			return ret, nil
		}
	}
}

func (r *receiver) Stop() {
	select {
	case <-r.exit:
	default:
		close(r.exit)
	}
}

type wrappedConfig struct {
	configx.Values
	r *remote
}

func (w *wrappedConfig) Set(val interface{}) error {
	err := w.Values.Set(val)
	if err != nil {
		return err
	}

	return w.r.Set(w.Values.Val("#").Map())
}
