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

package cells

import (
	"context"
	"strings"
	"testing"
	"time"

	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/sync/endpoints/cells/transport"
)

// TestBearerContextForwardsClientUuid checks that the client UUID set by getContext reaches the outgoing gRPC
// metadata: the server copies it into change events, which is how Watch drops the echoes of our own operations.
func TestBearerContextForwardsClientUuid(t *testing.T) {
	f := &remoteClientFactory{config: &transport.SdkConfig{
		Url:            "https://client-uuid.test",
		IdToken:        "test-token",
		TokenExpiresAt: int(time.Now().Add(time.Hour).Unix()),
	}}
	c := &Abstract{ClientUUID: "client-uuid-1"}

	ctx, err := f.bearerContext(c.getContext(context.Background()))
	if err != nil {
		t.Fatal(err)
	}
	md, _ := metadata.FromOutgoingContext(ctx)
	if got := md.Get(strings.ToLower(common.XPydioClientUuid)); len(got) != 1 || got[0] != "client-uuid-1" {
		t.Fatalf("outgoing metadata must carry the client UUID, got %v", got)
	}
	if got := md.Get("x-pydio-bearer"); len(got) != 1 || got[0] != "test-token" {
		t.Fatalf("outgoing metadata must still carry the bearer, got %v", got)
	}

	// Without a client UUID in context, nothing is added
	ctx, _ = f.bearerContext(context.Background())
	md, _ = metadata.FromOutgoingContext(ctx)
	if got := md.Get(strings.ToLower(common.XPydioClientUuid)); len(got) != 0 {
		t.Fatalf("unexpected client UUID %v", got)
	}
}

// TestNewRemoteSendsClientUuidHeader checks that HTTP requests (S3 uploads) carry the client UUID as a custom
// header, without modifying the headers map passed by the caller.
func TestNewRemoteSendsClientUuidHeader(t *testing.T) {
	headers := map[string]string{"User-Agent": "cells-sync/test"}
	c := NewRemote(RemoteConfig{Url: "https://client-uuid.test", CustomHeaders: headers}, "root", Options{})

	if got := c.config.CustomHeaders[common.XPydioClientUuid]; got == "" || got != c.ClientUUID {
		t.Fatalf("custom headers must carry the client UUID %q, got %q", c.ClientUUID, got)
	}
	if got := c.config.CustomHeaders["User-Agent"]; got != "cells-sync/test" {
		t.Fatalf("caller headers must be kept, got User-Agent %q", got)
	}
	if _, ok := headers[common.XPydioClientUuid]; ok {
		t.Fatal("the caller headers map must not be modified")
	}
}
