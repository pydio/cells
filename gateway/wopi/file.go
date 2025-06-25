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

// Package wopi implements communication with the backend via the WOPI API.
// It typically enables integration of the Collabora online plugin.
package wopi

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

type File struct {
	BaseFileName     string
	OwnerId          string
	Size             int64
	UserId           string
	Version          string
	UserFriendlyName string
	UserCanWrite     bool
	LastModifiedTime string
	PydioPath        string
}

func getNodeInfos(w http.ResponseWriter, r *http.Request) {
	log.Logger(r.Context()).Debug("WOPI BACKEND - GetNode INFO", zap.Any("vars", mux.Vars(r)))

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")

	n, err := findNodeFromRequest(r)
	if err != nil {
		log.Logger(r.Context()).Error("cannot find node from request", zap.Error(err))
		w.WriteHeader(http.StatusNotFound)
		return
	}

	f := buildFileFromNode(r.Context(), n)

	data, _ := json.Marshal(f)
	w.Write(data)
}

func download(w http.ResponseWriter, r *http.Request) {
	log.Logger(r.Context()).Debug("WOPI BACKEND - Download")

	n, err := findNodeFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	read, err := client.GetObject(r.Context(), n, &models.GetRequestData{StartOffset: 0, Length: -1})
	if err != nil {
		log.Logger(r.Context()).Error("cannot get object", zap.Error(err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", n.GetSize()))
	defer read.Close()
	written, err := io.Copy(w, read)
	if err != nil {
		log.Logger(r.Context()).Error("cannot write response", zap.Error(err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	log.Logger(r.Context()).Debug("data sent to output", zap.Int64("Data Length", written))
}

func uploadStream(w http.ResponseWriter, r *http.Request) {
	log.Logger(r.Context()).Debug("WOPI BACKEND - Upload")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")

	n, err := findNodeFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	// Check if LastModifiedTime changed, ask user to resolve the conflict
	coolTimeStr := r.Header.Get("X-COOL-WOPI-Timestamp")
	if coolTimeStr != "" {
		coolTime, err := time.Parse(time.RFC3339, coolTimeStr)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if !coolTime.Equal(n.GetModTime()) {
			w.WriteHeader(http.StatusConflict)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{
				"COOLStatusCode": 1010,
			})
			return
		}
	}

	var size int64
	if h, ok := r.Header["Content-Length"]; ok && len(h) > 0 {
		size, _ = strconv.ParseInt(h[0], 10, 64)
	}

	written, err := client.PutObject(r.Context(), n, r.Body, &models.PutRequestData{
		Size: size,
	})
	if err != nil {
		log.Logger(r.Context()).Error("cannot put object", zap.Int64("already written data Length", written.Size), zap.Error(err))
		if written.Size == 0 {
			w.WriteHeader(http.StatusForbidden)
		} else {
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}

	log.Logger(r.Context()).Debug("uploaded node", n.Zap(), zap.Int64("Data Length", written.Size))

	// Readnode for info
	n, err = findNodeFromRequest(r)

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"LastModifiedTime": n.GetModTime().Format(time.RFC3339),
	})
}

func buildFileFromNode(ctx context.Context, n *tree.Node) *File {

	f := File{
		BaseFileName:     n.GetStringMeta(common.MetaNamespaceNodeName),
		OwnerId:          "pydio", // TODO get an ownerID?
		Size:             n.GetSize(),
		Version:          fmt.Sprintf("%d", n.GetModTime().Unix()),
		LastModifiedTime: n.GetModTime().Format(time.RFC3339),
		PydioPath:        n.Path,
	}

	// Find user info in claims, if any
	if claims, ok := claim.FromContext(ctx); ok {
		f.UserId = claims.Name
		if claims.DisplayName == "" {
			f.UserFriendlyName = claims.Name
		} else {
			f.UserFriendlyName = claims.DisplayName
		}
		pydioReadOnly := n.GetStringMeta(common.MetaFlagReadonly)
		if pydioReadOnly == "true" {
			f.UserCanWrite = false
		} else {
			f.UserCanWrite = true
		}
	} else {
		log.Logger(ctx).Debug("No Claims Found", zap.Any("ctx", ctx))
	}

	return &f
}

// findNodeFromRequest retrieves a node from the repository using the node id
// prefixed by the relevant workspace slug that is encoded in the current route
func findNodeFromRequest(r *http.Request) (*tree.Node, error) {

	vars := mux.Vars(r)
	uuid := vars["uuid"]
	if uuid == "" {
		return nil, fmt.Errorf("Cannot find uuid in parameters")
	}

	// Now go through all the authorization mechanisms
	resp, err := client.ReadNode(r.Context(), &tree.ReadNodeRequest{
		Node: &tree.Node{Uuid: uuid},
	})
	if err != nil {
		log.Logger(r.Context()).Error("cannot retrieve node with uuid", zap.String(common.KeyNodeUuid, uuid), zap.Error(err))
		return nil, err
	}

	log.Logger(r.Context()).Debug("node retrieved from request with uuid", resp.Node.Zap())
	return resp.Node, nil
}
