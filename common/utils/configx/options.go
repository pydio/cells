/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package configx

import (
	"context"
	"sync"

	"github.com/spf13/cast"

	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
	yaml "gopkg.in/yaml.v2"

	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

type Unmarshaler interface {
	Unmarshal([]byte, interface{}) error
}

type Marshaller interface {
	Marshal(interface{}) ([]byte, error)
}

type Encrypter interface {
	Encrypt([]byte) (string, error)
}

type Decrypter interface {
	Decrypt(string) ([]byte, error)
}

type Option func(*Options)

type Options struct {
	*sync.RWMutex
	Unmarshaler
	Marshaller
	Encrypter
	Decrypter

	SetCallback func([]string, interface{}) error

	AutoUpdate bool

	// Used to pass other potential options
	Context context.Context
}

type jsonReader struct{}

func (j *jsonReader) Unmarshal(data []byte, out interface{}) error {
	var err error

	switch v := out.(type) {
	case proto.Message:
		err = protojson.UnmarshalOptions{DiscardUnknown: true}.Unmarshal(data, v)
	default:
		err = json.Unmarshal(data, &v)
	}

	return err
}

type jsonWriter struct{}

func (j *jsonWriter) Marshal(in interface{}) ([]byte, error) {
	return json.Marshal(in)
}

func WithJSON() Option {
	return func(o *Options) {
		o.Unmarshaler = &jsonReader{}
		o.Marshaller = &jsonWriter{}
	}
}

type yamlReader struct{}

func (j *yamlReader) Unmarshal(data []byte, out interface{}) error {
	return yaml.Unmarshal(data, out)
}

type yamlWriter struct{}

func (j *yamlWriter) Marshal(in interface{}) ([]byte, error) {
	return yaml.Marshal(in)
}

func WithYAML() Option {
	return func(o *Options) {
		o.Unmarshaler = &yamlReader{}
		o.Marshaller = &yamlWriter{}
	}
}

type stringReader struct{}

func (j *stringReader) Unmarshal(data []byte, out interface{}) error {
	if v, ok := out.(*interface{}); ok {
		*v = cast.ToString(data)
	}

	return nil
}

type stringWriter struct{}

func (j *stringWriter) Marshal(in interface{}) ([]byte, error) {
	return []byte(cast.ToString(in)), nil
}

func WithString() Option {
	return func(o *Options) {
		o.Unmarshaler = &stringReader{}
		o.Marshaller = &stringWriter{}
	}
}

func WithMarshaller(m Marshaller) Option {
	return func(o *Options) {
		o.Marshaller = m
	}
}

func WithUnmarshaler(u Unmarshaler) Option {
	return func(o *Options) {
		o.Unmarshaler = u
	}
}

func WithEncrypt(e Encrypter) Option {
	return func(o *Options) {
		o.Encrypter = e
	}
}

func WithDecrypt(d Decrypter) Option {
	return func(o *Options) {
		o.Decrypter = d
	}
}

func WithLock(m *sync.RWMutex) Option {
	return func(o *Options) {
		o.RWMutex = m
	}
}

func WithSetCallback(f func([]string, interface{}) error) Option {
	return func(o *Options) {
		o.SetCallback = f
	}
}
