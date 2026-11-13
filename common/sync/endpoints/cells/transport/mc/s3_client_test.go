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

package mc

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/cells/transport"
)

// TestPutObjectSendsCustomHeaders checks that uploads send the configured custom headers as plain HTTP headers:
// the remote endpoint sets the client UUID there, which the server copies into change events (Watch echo filtering).
func TestPutObjectSendsCustomHeaders(t *testing.T) {
	var mu sync.Mutex
	var putHeader http.Header
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPut {
			mu.Lock()
			putHeader = r.Header.Clone()
			mu.Unlock()
			w.Header().Set("ETag", `"etag"`)
			return
		}
		if _, ok := r.URL.Query()["location"]; ok {
			_, _ = w.Write([]byte(`<?xml version="1.0" encoding="UTF-8"?><LocationConstraint xmlns="http://s3.amazonaws.com/doc/2006-03-01/">us-east-1</LocationConstraint>`))
		}
	}))
	defer srv.Close()

	g := NewS3Client(&transport.SdkConfig{
		Url:            srv.URL,
		IdToken:        "test-token",
		TokenExpiresAt: int(time.Now().Add(time.Hour).Unix()),
		CustomHeaders:  map[string]string{"User-Agent": "cells-sync/test", common.XPydioClientUuid: "client-uuid-1"},
	})
	body := "content"
	_, err := g.PutObject(context.Background(), &tree.Node{Path: "folder/file.txt"}, strings.NewReader(body), &models.PutRequestData{
		Size: int64(len(body)),
	})
	if err != nil {
		t.Fatal(err)
	}
	mu.Lock()
	defer mu.Unlock()
	if putHeader == nil {
		t.Fatal("no PUT received")
	}
	if got := putHeader.Get(common.XPydioClientUuid); got != "client-uuid-1" {
		t.Fatalf("PUT must carry the %s header, got %q", common.XPydioClientUuid, got)
	}
	if got := putHeader.Get("User-Agent"); got != "cells-sync/test" {
		t.Fatalf("custom headers must still be sent, got User-Agent %q", got)
	}
}
