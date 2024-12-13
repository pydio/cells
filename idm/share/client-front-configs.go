/*
 * Copyright (c) 2022. Abstrium SAS <team (at) pydio.com>
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

package share

import (
	"context"
	"time"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/utils/configx"
)

type PluginOptions struct {
	MaxExpiration           int
	CellsMaxExpiration      int
	MaxDownloads            int
	HashMinLength           int
	HashEditable            bool
	ShareForcePassword      bool
	enableFilePublicLinks   bool
	enableFileInternal      bool
	enableFolderPublicLinks bool
	enableFolderInternal    bool
}

// CheckLinkOptionsAgainstConfigs loads specific share configurations from ACLs and checks that current link complies with these.
func (sc *Client) CheckLinkOptionsAgainstConfigs(ctx context.Context, link *rest.ShareLink, wss []*tree.WorkspaceRelativePath, files, folders bool) (PluginOptions, error) {

	contextParams, e := sc.aclParams(ctx)
	if e != nil {
		return PluginOptions{}, e
	}
	options := sc.DefaultOptions(ctx)
	checkScopes := permissions.FrontValuesScopesFromWorkspaceRelativePaths(wss)
	options = sc.filterOptionsFromScopes(options, contextParams, checkScopes)

	if files && !options.enableFilePublicLinks {
		return options, errors.WithStack(errors.ShareFileLinkForbidden)
	}
	if folders && !options.enableFolderPublicLinks {
		return options, errors.WithStack(errors.ShareFolderLinkForbidden)
	}
	if options.MaxDownloads > 0 && link.MaxDownloads > int64(options.MaxDownloads) {
		return options, errors.WithStack(errors.ShareLinkMaxDownloadRequired)
	}
	if options.MaxExpiration > 0 && (link.AccessEnd == 0 || (link.AccessEnd-time.Now().Unix()) > int64(options.MaxExpiration*24*60*60)) {
		return options, errors.WithStack(errors.ShareLinkMaxExpirationRequired)
	}
	if options.ShareForcePassword && !link.PasswordRequired {
		return options, errors.WithStack(errors.ShareLinkPasswordRequired)
	}

	return options, nil
}

// CheckCellOptionsAgainstConfigs loads specific share configurations from ACLs and checks that current cell complies with these.
func (sc *Client) CheckCellOptionsAgainstConfigs(ctx context.Context, cell *rest.Cell) error {
	router := compose.ReverseClient()
	acl, e := permissions.AccessListFromContextClaims(ctx)
	if e != nil {
		return e
	}
	contextParams, e := sc.aclParams(ctx)
	if e != nil {
		return e
	}
	options := sc.DefaultOptions(ctx)
	aclWss := acl.GetWorkspaces()
	return router.WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {
		for _, n := range cell.RootNodes {
			var files, folders bool
			var wss []*idm.Workspace
			_, internal, _ := inputFilter(ctx, n, "in")
			for _, ws := range aclWss {
				if cell.Uuid == ws.UUID { // Ignore current room
					continue
				}
				if _, ok := router.WorkspaceCanSeeNode(ctx, nil, ws, internal); ok {
					wss = append(wss, ws)
				}
			}
			if n.IsLeaf() {
				files = true
			} else {
				folders = true
			}
			scopes := permissions.FrontValuesScopesFromWorkspaces(wss)
			loopOptions := sc.filterOptionsFromScopes(options, contextParams, scopes)
			if e != nil {
				return e
			}
			if files && !loopOptions.enableFileInternal {
				return errors.WithStack(errors.ShareFileCellsForbidden)
			}
			if folders && !loopOptions.enableFolderInternal {
				return errors.WithStack(errors.ShareFolderCellsForbidden)
			}
			if loopOptions.CellsMaxExpiration > 0 && (cell.AccessEnd == -1 || (cell.AccessEnd-time.Now().Unix()) > int64(loopOptions.CellsMaxExpiration*24*60*60)) {
				return errors.WithStack(errors.ShareCellMaxExpirationRequired)
			}
		}
		return nil
	})
}

// DefaultOptions loads the plugin default options, without further context-based filtering
func (sc *Client) DefaultOptions(ctx context.Context) PluginOptions {
	// Defaults
	configParams := config.Get(ctx, "frontend", "plugin", "action.share")
	options := PluginOptions{
		MaxExpiration:           configParams.Val("FILE_MAX_EXPIRATION").Default(-1).Int(),
		MaxDownloads:            configParams.Val("FILE_MAX_DOWNLOAD").Default(-1).Int(),
		HashMinLength:           configParams.Val("HASH_MIN_LENGTH").Default(12).Int(),
		HashEditable:            configParams.Val("HASH_USER_EDITABLE").Default(true).Bool(),
		enableFilePublicLinks:   configParams.Val("ENABLE_FILE_PUBLIC_LINK").Default(true).Bool(),
		enableFileInternal:      configParams.Val("ENABLE_FILE_INTERNAL_SHARING").Default(true).Bool(),
		enableFolderPublicLinks: configParams.Val("ENABLE_FOLDER_PUBLIC_LINK").Default(true).Bool(),
		enableFolderInternal:    configParams.Val("ENABLE_FOLDER_INTERNAL_SHARING").Default(true).Bool(),
		ShareForcePassword:      configParams.Val("SHARE_FORCE_PASSWORD").Default(false).Bool(),
		CellsMaxExpiration:      configParams.Val("CELLS_MAX_EXPIRATION").Default(-1).Int(),
	}
	return options
}

func (sc *Client) aclParams(ctx context.Context) (configx.Values, error) {
	acl, e := permissions.AccessListFromContextClaims(ctx)
	if e != nil {
		return nil, e
	}
	permissions.AccessListLoadFrontValues(ctx, acl)
	return acl.FlattenedFrontValues().Val("parameters", "action.share"), nil
}

func (sc *Client) filterOptionsFromScopes(options PluginOptions, contextParams configx.Values, scopes []string) PluginOptions {

	// Check expiration time
	for _, scope := range scopes {
		options.MaxExpiration = contextParams.Val("FILE_MAX_EXPIRATION", scope).Default(options.MaxExpiration).Int()
		options.MaxDownloads = contextParams.Val("FILE_MAX_DOWNLOAD", scope).Default(options.MaxDownloads).Int()
		options.HashMinLength = contextParams.Val("HASH_MIN_LENGTH", scope).Default(options.HashMinLength).Int()
		options.HashEditable = contextParams.Val("HASH_USER_EDITABLE", scope).Default(options.HashEditable).Bool()
		options.ShareForcePassword = contextParams.Val("SHARE_FORCE_PASSWORD", scope).Default(options.ShareForcePassword).Bool()
		options.enableFilePublicLinks = contextParams.Val("ENABLE_FILE_PUBLIC_LINK", scope).Default(options.enableFilePublicLinks).Bool()
		options.enableFileInternal = contextParams.Val("ENABLE_FILE_INTERNAL_SHARING", scope).Default(options.enableFileInternal).Bool()
		options.enableFolderPublicLinks = contextParams.Val("ENABLE_FOLDER_PUBLIC_LINK", scope).Default(options.enableFolderPublicLinks).Bool()
		options.enableFolderInternal = contextParams.Val("ENABLE_FOLDER_INTERNAL_SHARING", scope).Default(options.enableFolderInternal).Bool()
		options.CellsMaxExpiration = contextParams.Val("CELLS_MAX_EXPIRATION", scope).Default(options.CellsMaxExpiration).Int()
	}

	return options

}
