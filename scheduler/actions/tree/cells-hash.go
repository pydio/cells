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

package tree

import (
	"context"
	"crypto/md5"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"hash"
	"io"
	"path"

	"golang.org/x/crypto/md4"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/hasher"
	"github.com/pydio/cells/v4/common/utils/hasher/simd"
	"github.com/pydio/cells/v4/scheduler/actions"
	"github.com/pydio/cells/v4/scheduler/actions/tools"
)

var (
	cellsHashActionName = "actions.tree.cells-hash"
	cellsHashTypes      = map[string]func() hash.Hash{
		"cells": func() hash.Hash {
			return hasher.NewBlockHash(simd.MD5(), hasher.DefaultBlockSize)
		},
		"md4":    md4.New,
		"md5":    md5.New,
		"sha1":   sha1.New,
		"sha256": sha256.New,
		"sha512": sha512.New,
	}
)

type CellsHashAction struct {
	tools.ScopedRouterConsumer
	forceRecompute string
	hashType       string
	metaName       string
}

func (c *CellsHashAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:                cellsHashActionName,
		Label:             "Compute Hash",
		Icon:              "pound-box",
		Category:          actions.ActionCategoryContents,
		Description:       "Compute file signature using Cells internal algorithm",
		InputDescription:  "Multiple selection of files",
		OutputDescription: "Updated selection of files",
		SummaryTemplate:   "",
		HasForm:           true,
	}
}

// GetParametersForm returns parameters
func (c *CellsHashAction) GetParametersForm() *forms.Form {
	return &forms.Form{
		Groups: []*forms.Group{
			{
				Fields: []forms.Field{
					&forms.FormField{
						Name:        "hashType",
						Type:        forms.ParamSelect,
						Label:       "Hashing Algorithm",
						Description: "Algorithm applied to file contents",
						Default:     "cells",
						ChoicePresetList: []map[string]string{
							{"cells": "Cells Internal"},
							{"md4": "MD4"},
							{"md5": "MD5"},
							{"sha1": "SHA1"},
							{"sha256": "SHA256"},
							{"sha512": "SHA512"},
						},
					},
					&forms.FormField{
						Name:      "metaName",
						Type:      forms.ParamString,
						Label:     "Metadata Name",
						Default:   common.MetaNamespaceHash,
						Mandatory: true,
					},
					&forms.FormField{
						Name:        "forceRecompute",
						Type:        forms.ParamBool,
						Label:       "Force Recompute",
						Description: "Recompute X-Cells-Hash even if it already exists",
						Default:     false,
						Mandatory:   false,
					},
				},
			},
		},
	}
}

// ProvidesProgress implements interface to advertise about progress publication
func (c *CellsHashAction) ProvidesProgress() bool {
	return true
}

// GetName returns this action unique identifier
func (c *CellsHashAction) GetName() string {
	return cellsHashActionName
}

// Init passes parameters to the action
func (c *CellsHashAction) Init(job *jobs.Job, action *jobs.Action) error {
	if b, o := action.Parameters["forceRecompute"]; o {
		c.forceRecompute = b
	}
	c.hashType = "cells"
	if h, o := action.Parameters["hashType"]; o {
		c.hashType = h
	}
	c.metaName = common.MetaNamespaceHash
	if m, o := action.Parameters["metaName"]; o {
		c.metaName = m
	}
	return nil
}

// Run the actual action code
func (c *CellsHashAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		return input.WithIgnore(), nil // Ignore
	}
	if !input.Nodes[0].IsLeaf() || path.Base(input.Nodes[0].Path) == common.PydioSyncHiddenFile {
		return input.WithIgnore(), nil
	}

	forceRecompute, _ := jobs.EvaluateFieldBool(ctx, input, c.forceRecompute)
	hashType := jobs.EvaluateFieldStr(ctx, input, c.hashType)
	factory, found := cellsHashTypes[hashType]
	if !found {
		er := fmt.Errorf("unsupported hash type: %s", hashType)
		return input.WithError(er), er
	}
	metaName := jobs.EvaluateFieldStr(ctx, input, c.metaName)

	ct, cli, e := c.GetHandler(ctx)
	if e != nil {
		return input.WithError(e), e
	}
	ctx = ct
	mc := tree.NewNodeReceiverClient(grpc.ResolveConn(c.GetRuntimeContext(), common.ServiceMeta))
	var outNodes []*tree.Node
	for _, node := range input.Nodes {
		if node.Etag == "" {
			// Reload node if necessary
			resp, er := cli.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
			if er != nil {
				return input.WithError(er), er
			}
			node = resp.GetNode()
		}
		if !forceRecompute && node.GetStringMeta(metaName) != "" {
			// Meta already exists, do not recompute
			continue
		}
		rc, er := cli.GetObject(ctx, node, &models.GetRequestData{Length: node.GetSize()})
		if er != nil {
			return input.WithError(er), er
		}
		status := "Scanning contents of " + path.Base(node.GetPath())
		if node.Size > 500*1024*1024 {
			status += " (this can take some time)"
		}
		channels.StatusMsg <- status

		// Wrap reader for progress and read it into the hash computer
		rc = channels.WrapReader(rc, node.Size)
		bh := factory()
		if _, er := io.Copy(bh, rc); er != nil {
			_ = rc.Close()
			return input.WithError(er), er
		}
		_ = rc.Close()

		// Flush hash and encode to base64
		hh := hex.EncodeToString(bh.Sum(nil))
		n := node.Clone()
		n.MetaStore = make(map[string]string)
		n.MustSetMeta(metaName, hh)
		if _, er = mc.UpdateNode(ctx, &tree.UpdateNodeRequest{From: n, To: n}); er != nil {
			return input.WithError(er), er
		} else {
			log.TasksLogger(ctx).Info("Computed " + metaName + " for " + n.GetPath() + ": " + hh)
		}
		node.MustSetMeta(metaName, hh)
		outNodes = append(outNodes, node)
	}

	// Reset and replace nodes
	output := input.WithNode(nil).WithNodes(outNodes...)
	output.AppendOutput(&jobs.ActionOutput{Success: true})

	return output, nil
}
