/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package restv2

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/nodes/uuid"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	searcher "github.com/pydio/cells/v5/data/search/rest"
	"github.com/pydio/cells/v5/data/templates"
	tpl "github.com/pydio/cells/v5/data/templates/rest"
	treeer "github.com/pydio/cells/v5/data/tree/rest"
	"github.com/pydio/cells/v5/idm/meta"
	umeta "github.com/pydio/cells/v5/idm/meta/rest"
	shares "github.com/pydio/cells/v5/idm/share/rest"
	"github.com/pydio/cells/v5/scheduler/actions/images"
)

type Handler struct {
	SearchHandler    *searcher.Handler
	TreeHandler      *treeer.Handler
	TemplatesHandler *tpl.Handler
	SharesHandler    *shares.SharesHandler
	UserMetaHandler  *umeta.UserMetaHandler
}

func NewHandler() *Handler {
	th := &treeer.Handler{}
	return &Handler{
		SearchHandler:    &searcher.Handler{},
		TreeHandler:      th,
		TemplatesHandler: &tpl.Handler{Dao: templates.GetProvider()},
		SharesHandler:    shares.NewSharesHandler(),
		UserMetaHandler:  umeta.NewUserMetaHandler(),
	}
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (h *Handler) SwaggerTags() []string {
	return []string{"NodeService"}
}

// Filter returns a function to filter the swagger path
func (h *Handler) Filter() func(string) string {
	return func(s string) string {
		return strings.Replace(s, "{Path}", "{Path:*}", 1)
	}
}

// UuidClient returns a properly initialized handler
func (h *Handler) UuidClient() nodes.Handler {
	return compose.UuidClient(uuid.WithExternalPath())
}

// TreeNodeToNode converts a tree.Node to rest.Node
func (h *Handler) TreeNodeToNode(n *tree.Node) *rest.Node {
	rn := &rest.Node{
		Uuid:        n.GetUuid(),
		Path:        n.GetPath(),
		Type:        n.GetType(),
		Mode:        rest.Mode_Default,
		Size:        n.GetSize(),
		Modified:    n.GetMTime(),
		StorageETag: n.GetEtag(),

		// TODO Not Impl Yet
		IsRecycled: false,
		Activities: nil,
	}
	for k, v := range n.GetMetaStore() {
		if strings.HasPrefix(k, common.MetaNamespaceReservedPrefix_) {
			continue
		}
		switch k {
		case common.MetaFlagUserSubscriptionsJoined:
			continue
		case common.MetaNamespaceNodeName:
			if v == `"`+common.RecycleBinName+`"` {
				rn.IsRecycleBin = true
			}
		case common.MetaNamespaceInsideRecycle:
			rn.IsRecycled = true
		case common.MetaNamespaceMime:
			rn.ContentType = strings.ReplaceAll(v, "\"", "")
		case common.MetaNamespaceHash:
			rn.ContentsHash = strings.ReplaceAll(v, "\"", "")
		case common.MetaFlagHashingVersion:
			rn.HashingMethod = strings.ReplaceAll(v, "\"", "")
		case common.MetaFlagReadonly:
			rn.Mode = rest.Mode_NodeReadOnly
		case common.MetaFlagWriteOnly:
			rn.Mode = rest.Mode_NodeWriteOnly
		case common.MetaFlagLevelReadonly:
			rn.Mode = rest.Mode_LevelReadOnly
		case common.MetaFlagContentLock:
			rn.ContentLock = &rest.LockInfo{IsLocked: true, Owner: strings.ReplaceAll(v, "\"", "")}
		case meta.ReservedNamespaceBookmark:
			rn.IsBookmarked = true
		case common.MetaFlagUserSubscriptions:
			// Unmarshall to rn.Subscriptions
			_ = json.Unmarshal([]byte(v), &rn.Subscriptions)

		case common.MetaFlagChildrenCount,
			common.MetaFlagChildrenFolders,
			common.MetaFlagChildrenFiles,
			common.MetaFlagRecursiveCount:
			if i, e := strconv.ParseInt(v, 10, 64); e == nil {
				rn.FolderMeta = append(rn.FolderMeta, &rest.CountMeta{Namespace: k, Value: int32(i)})
			}

		case common.MetaFlagEncrypted, common.MetaFlagVersioning:
			if rn.DataSourceFeatures == nil {
				rn.DataSourceFeatures = &rest.DataSourceFeatures{}
			}
			if k == common.MetaFlagEncrypted {
				rn.DataSourceFeatures.Encrypted = true
			} else {
				rn.DataSourceFeatures.Versioned = true
			}

		case common.MetaNamespaceVersionId, common.MetaNamespaceVersionDesc:
			if rn.RevisionMeta == nil {
				rn.RevisionMeta = &rest.RevisionMeta{}
			}
			value := strings.ReplaceAll(v, "\"", "")
			if k == common.MetaNamespaceVersionId {
				rn.RevisionMeta.Uuid = value
			} else {
				rn.RevisionMeta.Description = value
			}

		case images.MetadataImageDimensions,
			images.MetadataCompatImageReadableDimensions,
			images.MetadataCompatImageWidth,
			images.MetadataCompatImageHeight,
			images.MetadataCompatIsImage,
			images.MetadataExif,
			images.MetadataCompatOrientation:
			rn.ImageMeta = h.ImageMeta(rn.ImageMeta, k, v)

		case images.MetadataThumbnails:
			rn.Previews = append(rn.Previews, h.Thumbnails(common.PydioThumbstoreNamespace, n.GetUuid(), v)...)

		case common.MetaFlagWorkspacesShares:
			var share []*idm.Workspace
			if err := json.Unmarshal([]byte(v), &share); err == nil {
				for _, w := range share {
					if w.Scope == idm.WorkspaceScope_LINK {
						// Todo - use flags to load more about this share?
						rn.Shares = append(rn.Shares, &rest.ShareLink{
							Uuid:  w.UUID,
							Label: w.Label,
						})
					}
				}
			} else {
				log.Logger(context.Background()).Error("Cannot unmarshall shares, this is not normal", zap.Error(err))
			}
		default:
			if strings.HasPrefix(k, "ws_") || strings.HasPrefix(k, "repository_") {
				// Build WorkspaceRoot
				rn.ContextWorkspace = h.ContextWorkspace(rn.ContextWorkspace, k, v)
			} else if strings.HasPrefix(k, "usermeta-") {
				// UserMeta
				rn.UserMetadata = append(rn.UserMetadata, &rest.UserMeta{Namespace: k, JsonValue: v})
			} else {
				// OtherMeta
				rn.Metadata = append(rn.Metadata, &rest.JsonMeta{Namespace: k, Value: v})
			}
		}

	}
	return rn
}

// Thumbnails feeds a rest.FilePreview struct with incoming metadata
func (h *Handler) Thumbnails(bucket, nodeId, jsonThumbs string) (ff []*rest.FilePreview) {
	var thumbs *images.ThumbnailsMeta
	e := json.Unmarshal([]byte(jsonThumbs), &thumbs)
	if e != nil {
		return
	}
	for _, t := range thumbs.Thumbnails {
		ff = append(ff, &rest.FilePreview{
			Processing:  thumbs.Processing,
			ContentType: "image/" + t.Format,
			Url:         fmt.Sprintf("/io/%s/%s-%d.%s", bucket, nodeId, t.Size, t.Format),
			Dimension:   int32(t.Size),
		})
	}
	return
}

// ImageMeta feeds a rest.ImageMeta struct with incoming metadata
func (h *Handler) ImageMeta(m *rest.ImageMeta, k, v string) *rest.ImageMeta {
	if m == nil {
		m = &rest.ImageMeta{}
	}
	switch k {
	case images.MetadataCompatIsImage, images.MetadataCompatImageReadableDimensions, images.MetadataImageDimensions:
		// ignore
	case images.MetadataCompatImageHeight:
		if he, e := strconv.ParseInt(v, 10, 64); e == nil {
			m.Height = int32(he)
		}
	case images.MetadataCompatImageWidth:
		if wi, e := strconv.ParseInt(v, 10, 64); e == nil {
			m.Width = int32(wi)
		}
	case images.MetadataCompatOrientation:
		if o, e := strconv.ParseInt(v, 10, 64); e == nil {
			m.Orientation = int32(o)
		}
	case images.MetadataExif:
		m.JsonEXIF = v
	default:

	}
	return m
}

// ContextWorkspace feeds a rest.ContextWorkspace struct with incoming metadata
func (h *Handler) ContextWorkspace(ws *rest.ContextWorkspace, k, v string) *rest.ContextWorkspace {
	if ws == nil {
		ws = &rest.ContextWorkspace{}
	}
	str := strings.ReplaceAll(v, "\"", "")
	switch k {
	case common.MetaFlagWorkspaceRoot:
		ws.IsRoot = true
	case common.MetaFlagWorkspaceSkipRecycle:
		ws.SkipRecycle = true
	case common.MetaFlagWorkspaceSyncable:
		ws.Syncable = v == "true"
	case common.MetaFlagWorkspaceUuid, common.MetaFlagWorkspaceRepoId:
		ws.Uuid = str
	case common.MetaFlagWorkspaceLabel, common.MetaFlagWorkspaceRepoDisplay:
		ws.Label = str
	case common.MetaFlagWorkspaceDescription:
		ws.Description = str
	case common.MetaFlagWorkspacePermissions:
		ws.Permissions = str
	case common.MetaFlagWorkspaceSlug:
		ws.Slug = str
	case common.MetaFlagWorkspaceQuota:
		ws.Quota, _ = strconv.ParseInt(v, 10, 64)
	case common.MetaFlagWorkspaceQuotaUsage:
		ws.QuotaUsage, _ = strconv.ParseInt(v, 10, 64)
	}
	return ws
}

// TreeNodesToNodes applies TreeNodeToNode to all incoming nodes
func (h *Handler) TreeNodesToNodes(nn []*tree.Node) (out []*rest.Node) {
	for _, n := range nn {
		out = append(out, h.TreeNodeToNode(n))
	}
	return out
}
