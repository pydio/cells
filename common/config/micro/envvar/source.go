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

// Package envvar implements Pydio specific interface for dynamic configurations that are backed by OS environment variables.
package envvar

import (
	"crypto/md5"
	"fmt"
	"os"
	"strings"
	"time"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/imdario/mergo"
	"github.com/pydio/go-os/config"
)

type source struct {
	prefix string
	opts   config.SourceOptions
}

func (s *source) String() string {
	return "envvar"
}

// Read checks all environment variables and builds a JSON representation
// of all environment variables that have this source prefix.
// Various env variable with valid prefix are merged in a single JSON tree thanks to mergo.
// The JSON tree is built by removing the prefix and then adding a level for each token of the var name
//
// For instance PYDIO_DB_LOGIN="user", with prefix pydio, will produce following JSON data:
// {"db":{"login":"user"}}
func (s *source) Read() (*config.ChangeSet, error) {

	// A Key value tree that will
	var changes map[string]interface{}

	for _, env := range os.Environ() {

		if s.prefix != "" {
			notFound := true

			if match, ok := matchPrefix(s.prefix, env); ok {
				env = strings.TrimPrefix(env, match)
				notFound = false
			}

			if notFound {
				continue
			}
		}

		pair := strings.SplitN(env, "=", 2)
		value := pair[1]
		keys := strings.Split(strings.ToLower(pair[0]), "_")
		reverse(keys)

		tmp := make(map[string]interface{})
		for i, k := range keys {
			if i == 0 {
				tmp[k] = value
				continue
			}

			tmp = map[string]interface{}{k: tmp}
		}

		// Dynamically enriches the key / value tree by merging with already existing values.
		if err := mergo.Map(&changes, tmp); err != nil {
			return nil, err
		}
	}

	b, err := json.Marshal(changes)
	if err != nil {
		return nil, err
	}

	h := md5.New()
	h.Write(b)
	checksum := fmt.Sprintf("%x", h.Sum(nil))

	return &config.ChangeSet{
		Data:      b,
		Checksum:  checksum,
		Timestamp: time.Now(),
		Source:    s.String(),
	}, nil
}

func NewSource(opts ...config.SourceOption) config.Source {

	var options config.SourceOptions
	for _, o := range opts {
		o(&options)
	}

	if len(options.Name) == 0 {
		options.Name = config.DefaultSourceName
	}

	return &source{
		prefix: options.Name + "_",
		opts:   options,
	}
}

func (s *source) Watch() (config.SourceWatcher, error) {
	return nil, nil
}

/* Helper functions */

func matchPrefix(p string, s string) (string, bool) {
	if strings.HasPrefix(s, p) {
		return p, true
	}

	return "", false
}

func reverse(ss []string) {
	for i := len(ss)/2 - 1; i >= 0; i-- {
		opp := len(ss) - 1 - i
		ss[i], ss[opp] = ss[opp], ss[i]
	}
}
