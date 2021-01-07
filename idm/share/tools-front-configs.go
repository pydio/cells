package share

import (
	"context"
	"time"

	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/x/configx"
)

type PluginOptions struct {
	MaxExpiration           int
	MaxDownloads            int
	HashMinLength           int
	HashEditable            bool
	ShareForcePassword      bool
	enableFilePublicLinks   bool
	enableFileInternal      bool
	enableFolderPublicLinks bool
	enableFolderInternal    bool
}

func CheckLinkOptionsAgainstConfigs(ctx context.Context, link *rest.ShareLink, wss []*tree.WorkspaceRelativePath, files, folders bool) (PluginOptions, error) {

	contextParams, e := aclParams(ctx)
	if e != nil {
		return PluginOptions{}, e
	}
	options := defaultOptions()
	checkScopes := permissions.FrontValuesScopesFromWorkspaceRelativePaths(wss)
	options = filterOptionsFromScopes(options, contextParams, checkScopes)

	if files && !options.enableFilePublicLinks {
		return options, errors.Forbidden("file.public-link.forbidden", "You are not allowed to create public link on files")
	}
	if folders && !options.enableFolderPublicLinks {
		return options, errors.Forbidden("folder.public-link.forbidden", "You are not allowed to create public link on folders")
	}
	if options.MaxDownloads > -1 && link.MaxDownloads >= int64(options.MaxDownloads) {
		return options, errors.Forbidden("link.max-downloads.mandatory", "Please set a maximum number of downloads for links")
	}
	if options.MaxExpiration > -1 && (link.AccessEnd == 0 || (link.AccessEnd-time.Now().Unix()) > int64(options.MaxExpiration*24*60*60)) {
		return options, errors.Forbidden("link.max-expiration.mandatory", "Please set a maximum expiration date for links")
	}
	if options.ShareForcePassword && !link.PasswordRequired {
		return options, errors.Forbidden("link.password.required", "Share links must use a password")
	}

	return options, nil
}

func CheckCellOptionsAgainstConfigs(ctx context.Context, request *rest.PutCellRequest) error {
	router := views.NewRouterEventFilter(views.RouterOptions{})
	acl, e := permissions.AccessListFromContextClaims(ctx)
	if e != nil {
		return e
	}
	contextParams, e := aclParams(ctx)
	if e != nil {
		return e
	}
	options := defaultOptions()
	aclWss := acl.Workspaces
	return router.WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {
		for _, n := range request.Room.RootNodes {
			var files, folders bool
			var wss []*idm.Workspace
			_, internal, _ := inputFilter(ctx, n, "in")
			for _, ws := range aclWss {
				if request.Room.Uuid == ws.UUID { // Ignore current room
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
			loopOptions := filterOptionsFromScopes(options, contextParams, scopes)
			if e != nil {
				return e
			}
			if files && !loopOptions.enableFileInternal {
				return errors.Forbidden("file.share-internal.forbidden", "You are not allowed to create Cells on files")
			}
			if folders && !loopOptions.enableFolderInternal {
				return errors.Forbidden("folder.share-internal.forbidden", "You are not allowed to create Cells on folders")
			}
		}
		return nil
	})
}

func defaultOptions() PluginOptions {
	// Defaults
	configParams := config.Get("frontend", "plugin", "action.share")
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
	}
	return options
}

func aclParams(ctx context.Context) (configx.Values, error) {
	acl, e := permissions.AccessListFromContextClaims(ctx)
	if e != nil {
		return nil, e
	}
	permissions.AccessListLoadFrontValues(ctx, acl)
	return acl.FlattenedFrontValues().Val("parameters", "action.share"), nil
}

func filterOptionsFromScopes(options PluginOptions, contextParams configx.Values, scopes []string) PluginOptions {

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
	}

	return options

}
