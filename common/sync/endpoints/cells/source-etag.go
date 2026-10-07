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
	"fmt"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

const (
	// MetaSyncSourceEtag is the core metadata key storing the ETag reported by the sync source for
	// the content written by the router endpoint (see Options.SourceEtags). Value is a JSON-encoded SourceEtag.
	MetaSyncSourceEtag = "x-sync-source-etag"
)

// SourceEtag pairs the Cells hash of a node content with the ETag the sync source reports for the same content.
type SourceEtag struct {
	Hash string `json:"hash"`
	Etag string `json:"etag"`
}

// Marshal encodes the pair as a JSON object, as stored in the node MetaStore.
func (s *SourceEtag) Marshal() (string, error) {
	data, er := json.Marshal(s)
	if er != nil {
		return "", er
	}
	return string(data), nil
}

// UnmarshalSourceEtag decodes a JSON-encoded pair, as stored in the node MetaStore.
func UnmarshalSourceEtag(value string) (*SourceEtag, error) {
	s := &SourceEtag{}
	if er := json.Unmarshal([]byte(value), s); er != nil {
		return nil, er
	}
	return s, nil
}

// applySourceEtag replaces the ETag of a leaf node by the stored source ETag, as long as the
// stored Cells hash still matches the node current ETag (i.e. content has not changed since it was written).
func (c *Abstract) applySourceEtag(n *tree.Node) {
	if !c.Options.SourceEtags || n == nil || !n.IsLeaf() {
		return
	}
	value, ok := n.GetMetaStore()[MetaSyncSourceEtag]
	if !ok || value == "" {
		return
	}
	pair, er := UnmarshalSourceEtag(value)
	if er != nil || pair.Hash == "" || pair.Etag == "" {
		return
	}
	if pair.Hash == n.GetEtag() {
		n.Etag = pair.Etag
	}
}

// recordSourceEtag reloads a freshly written node and stores the pair (Cells hash, source ETag) as
// core metadata if they differ. If they are equal, a previously stored pair is cleared (best effort).
func (c *Abstract) recordSourceEtag(ctx context.Context, p string, source tree.N) error {
	if source == nil || !source.IsLeaf() || source.GetEtag() == "" {
		return nil
	}
	written, er := c.loadNode(ctx, p)
	if er != nil {
		return fmt.Errorf("cannot reload node to record source etag: %w", er)
	}
	hash := written.GetEtag()
	if hash == "" || hash == common.NodeFlagEtagTemporary {
		return fmt.Errorf("cannot record source etag for %s: cells hash is not ready", p)
	}
	if written.GetUuid() == "" {
		return fmt.Errorf("cannot record source etag for %s: node has no uuid", p)
	}
	if c.CoreMetaWriter == nil {
		return fmt.Errorf("cannot record source etag for %s: no core metadata writer", p)
	}
	metaNode := &tree.Node{
		Uuid:      written.GetUuid(),
		Type:      written.GetType(),
		Size:      written.GetSize(),
		MTime:     written.GetMTime(),
		MetaStore: map[string]string{},
	}
	if source.GetEtag() == hash {
		if _, has := written.GetMetaStore()[MetaSyncSourceEtag]; has {
			// Json-encoded empty string deletes the namespace in the meta service
			metaNode.MustSetMeta(MetaSyncSourceEtag, "")
			if e := c.CoreMetaWriter(ctx, metaNode); e != nil {
				log.Logger(ctx).Warn("Cannot clear stale source etag", zap.String("path", p), zap.Error(e))
			}
		}
		return nil
	}
	value, er := (&SourceEtag{Hash: hash, Etag: source.GetEtag()}).Marshal()
	if er != nil {
		return er
	}
	metaNode.MetaStore[MetaSyncSourceEtag] = value
	if er := c.CoreMetaWriter(ctx, metaNode); er != nil {
		return fmt.Errorf("cannot record source etag for %s: %w", p, er)
	}
	return nil
}
