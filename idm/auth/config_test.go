/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package auth

import (
	"fmt"
	"testing"

	"github.com/coreos/dex/connector/mock"
	"github.com/coreos/dex/connector/oidc"
	"github.com/coreos/dex/storage"
	"github.com/coreos/dex/storage/sql"
	"github.com/ghodss/yaml"
	"github.com/kylelemons/godebug/pretty"

	. "github.com/smartystreets/goconvey/convey"
)

var _ = yaml.YAMLToJSON

func TestUnmarshalConfig(t *testing.T) {
	rawConfig := []byte(`
issuer: http://127.0.0.1:5556/dex
storage:
  type: sqlite3
  config:
    file: examples/dex.db

web:
  http: 127.0.0.1:5556
staticClients:
- id: example-app
  redirectURIs:
  - 'http://127.0.0.1:5555/callback'
  name: 'Example App'
  secret: ZXhhbXBsZS1hcHAtc2VjcmV0

connectors:
- type: mockCallback
  id: mock
  name: Example
- type: oidc
  id: google
  name: Google
  config:
    issuer: https://accounts.google.com
    clientID: foo
    clientSecret: bar
    redirectURI: http://127.0.0.1:5556/dex/callback/google

enablePasswordDB: true
staticPasswords:
- email: "admin@example.com"
  # bcrypt hash of the string "password"
  hash: "$2a$10$33EMT0cVYVlPy6WAMCLsceLYjWhuHpbz5yuZxu/GAFj03J9Lytjuy"
  username: "admin"
  userID: "08a8684b-db88-4b73-90a9-3cd1661f5466"
- email: "foo@example.com"
  # base64'd value of the same bcrypt hash above. We want to be able to parse both of these
  hash: "JDJhJDEwJDMzRU1UMGNWWVZsUHk2V0FNQ0xzY2VMWWpXaHVIcGJ6NXl1Wnh1L0dBRmowM0o5THl0anV5"
  username: "foo"
  userID: "41331323-6f44-45e6-b3b9-2c4b60c02be5"

expiry:
  signingKeys: "6h"
  idTokens: "24h"

logger:
  level: "debug"
  format: "json"
`)

	want := Config{
		Issuer: "http://127.0.0.1:5556/dex",
		Storage: Storage{
			Type: "sqlite3",
			Config: &sql.SQLite3{
				File: "examples/dex.db",
			},
		},
		Web: Web{
			HTTP: "127.0.0.1:5556",
		},
		StaticClients: []storage.Client{
			{
				ID:     "example-app",
				Secret: "ZXhhbXBsZS1hcHAtc2VjcmV0",
				Name:   "Example App",
				RedirectURIs: []string{
					"http://127.0.0.1:5555/callback",
				},
			},
		},
		StaticConnectors: []Connector{
			{
				Type:   "mockCallback",
				ID:     "mock",
				Name:   "Example",
				Config: &mock.CallbackConfig{},
			},
			{
				Type: "oidc",
				ID:   "google",
				Name: "Google",
				Config: &oidc.Config{
					Issuer:       "https://accounts.google.com",
					ClientID:     "foo",
					ClientSecret: "bar",
					RedirectURI:  "http://127.0.0.1:5556/dex/callback/google",
				},
			},
		},
		EnablePasswordDB: true,
		StaticPasswords: []password{
			{
				Email:    "admin@example.com",
				Hash:     []byte("$2a$10$33EMT0cVYVlPy6WAMCLsceLYjWhuHpbz5yuZxu/GAFj03J9Lytjuy"),
				Username: "admin",
				UserID:   "08a8684b-db88-4b73-90a9-3cd1661f5466",
			},
			{
				Email:    "foo@example.com",
				Hash:     []byte("$2a$10$33EMT0cVYVlPy6WAMCLsceLYjWhuHpbz5yuZxu/GAFj03J9Lytjuy"),
				Username: "foo",
				UserID:   "41331323-6f44-45e6-b3b9-2c4b60c02be5",
			},
		},
		Expiry: Expiry{
			SigningKeys: "6h",
			IDTokens:    "24h",
		},
		Logger: Logger{
			Level:  "debug",
			Format: "json",
		},
	}

	Convey("Test configuration unmarshalling", t, func() {

		var c Config
		err := yaml.Unmarshal(rawConfig, &c)
		So(err, ShouldBeNil)
		So(len(c.StaticConnectors), ShouldEqual, 2)

		// TODO simple convey comparison fails while pretty compare doesn't
		// So(c, ShouldEqual, want)
		diff := pretty.Compare(c, want)
		if diff != "" {
			fmt.Printf("got!=want: %s", diff)
			// t.Errorf("got!=want: %s", diff)
		}
		So(diff, ShouldEqual, "")
	})
}
