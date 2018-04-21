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

package rest

import (
	"context"
	"encoding/json"

	"github.com/go-openapi/errors"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/proto/docstore"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/utils"
)

const PasswordComplexitySuffix = "#$!Az1"

type TargetUserEntry struct {
	Display       string `json:"display"`
	DownloadCount int32  `json:"download_count"`
}

// HashDocument is a Json Marshallable representation of a document, compatible with legacy.
type HashDocument struct {
	ShareType             string                      `json:"SHARE_TYPE"`
	ExpireTime            int64                       `json:"EXPIRE_TIME"`
	ShortFormUrl          string                      `json:"SHORT_FORM_URL"`
	RepositoryId          string                      `json:"REPOSITORY"`
	ParentRepositoryId    string                      `json:"PARENT_REPOSITORY_ID"`
	DownloadDisabled      bool                        `json:"DOWNLOAD_DISABLED"`
	ApplicationBase       string                      `json:"PYDIO_APPLICATION_BASE"`
	TemplateName          string                      `json:"PYDIO_TEMPLATE_NAME"`
	DownloadLimit         int64                       `json:"DOWNLOAD_LIMIT"`
	DownloadCount         int64                       `json:"DOWNLOAD_COUNT"`
	PreLogUser            string                      `json:"PRELOG_USER"`
	PresetLogin           string                      `json:"PRESET_LOGIN"`
	Target                string                      `json:"TARGET"`
	TargetUsers           map[string]*TargetUserEntry `json:"TARGET_USERS"`
	RestrictToTargetUsers bool                        `json:"RESTRICT_TO_TARGET_USERS"`
	OwnerId               string                      `json:"OWNER_ID"`
	PreUserUuid           string                      `json:"USER_UUID"`
}

func StoreHashDocument(ctx context.Context, link *rest.ShareLink, updateHash ...string) error {

	store := docstore.NewDocStoreClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE, defaults.NewClient())

	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	hashDoc := &HashDocument{
		OwnerId:       claims.Name,
		TemplateName:  link.ViewTemplateName,
		RepositoryId:  link.Uuid,
		ExpireTime:    link.AccessEnd,
		DownloadLimit: link.MaxDownloads,
		ShareType:     "minisite",
	}

	if link.PasswordRequired {
		hashDoc.PresetLogin = link.UserLogin
	} else {
		hashDoc.PreLogUser = link.UserLogin
	}
	hashDoc.PreUserUuid = link.Uuid

	if link.TargetUsers != nil && len(link.TargetUsers) > 0 {
		hashDoc.TargetUsers = make(map[string]*TargetUserEntry)
		for id, t := range link.TargetUsers {
			hashDoc.TargetUsers[id] = &TargetUserEntry{Display: t.Display, DownloadCount: t.DownloadCount}
		}
		hashDoc.RestrictToTargetUsers = link.RestrictToTargetUsers
	}

	DownloadEnabled := false
	for _, perm := range link.Permissions {
		if perm == rest.ShareLinkAccessType_Download {
			DownloadEnabled = true
			break
		}
	}
	hashDoc.DownloadDisabled = !DownloadEnabled

	hashDocMarshaled, _ := json.Marshal(hashDoc)
	var removeHash string
	if len(updateHash) > 0 && len(updateHash[0]) > 0 {
		removeHash = link.LinkHash
		link.LinkHash = updateHash[0]
	}

	doc := &docstore.Document{
		ID:            link.LinkHash,
		Data:          string(hashDocMarshaled),
		IndexableMeta: string(hashDocMarshaled),
	}
	_, e := store.PutDocument(ctx, &docstore.PutDocumentRequest{Document: doc, DocumentID: doc.ID, StoreID: "share"})

	if removeHash != "" {
		_, e = store.DeleteDocuments(ctx, &docstore.DeleteDocumentsRequest{StoreID: "share", DocumentID: removeHash})
	}

	return e

}

func LoadHashDocumentData(ctx context.Context, shareLink *rest.ShareLink, acls []*idm.ACL) error {

	store := docstore.NewDocStoreClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE, defaults.NewClient())
	streamer, er := store.ListDocuments(ctx, &docstore.ListDocumentsRequest{StoreID: "share", Query: &docstore.DocumentQuery{
		MetaQuery: "+REPOSITORY:\"" + shareLink.Uuid + "\" +SHARE_TYPE:minisite",
	}})
	if er != nil {
		return er
	}
	var linkDoc *docstore.Document
	defer streamer.Close()
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		if resp.Document != nil {
			linkDoc = resp.Document
			break
		}
	}
	if linkDoc == nil {
		return errors.NotFound(common.SERVICE_DOCSTORE, "Cannot find link associated to this workspace")
	}
	shareLink.LinkHash = linkDoc.ID
	var linkData *HashDocument
	if err := json.Unmarshal([]byte(linkDoc.Data), &linkData); err == nil {
		shareLink.ViewTemplateName = linkData.TemplateName
		shareLink.AccessEnd = linkData.ExpireTime
		shareLink.MaxDownloads = linkData.DownloadLimit
		shareLink.CurrentDownloads = linkData.DownloadCount
		if linkData.PresetLogin != "" {
			shareLink.PasswordRequired = true
			shareLink.UserLogin = linkData.PresetLogin
		} else {
			shareLink.UserLogin = linkData.PreLogUser
		}
		shareLink.UserUuid = linkData.PreUserUuid
		if linkData.TargetUsers != nil && len(linkData.TargetUsers) > 0 {
			shareLink.TargetUsers = make(map[string]*rest.ShareLinkTargetUser)
			for id, t := range linkData.TargetUsers {
				shareLink.TargetUsers[id] = &rest.ShareLinkTargetUser{Display: t.Display, DownloadCount: t.DownloadCount}
			}
			shareLink.RestrictToTargetUsers = linkData.RestrictToTargetUsers
		}

	} else {
		return err
	}

	for _, acl := range acls {
		if acl.Action.Name == utils.ACL_READ.Name {
			shareLink.Permissions = append(shareLink.Permissions, rest.ShareLinkAccessType_Preview)
			if !linkData.DownloadDisabled {
				shareLink.Permissions = append(shareLink.Permissions, rest.ShareLinkAccessType_Download)
			}
		} else if acl.Action.Name == utils.ACL_WRITE.Name {
			shareLink.Permissions = append(shareLink.Permissions, rest.ShareLinkAccessType_Upload)
		}
	}

	shareLink.LinkUrl = "https://fakedomain/share/" + shareLink.LinkHash

	return nil

}

func DeleteHashDocument(ctx context.Context, shareId string) error {

	store := docstore.NewDocStoreClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE, defaults.NewClient())
	resp, err := store.DeleteDocuments(ctx, &docstore.DeleteDocumentsRequest{StoreID: "share", Query: &docstore.DocumentQuery{
		MetaQuery: "+REPOSITORY:\"" + shareId + "\" +SHARE_TYPE:minisite",
	}})
	if err != nil {
		return err
	}
	if !resp.Success || resp.DeletionCount == 0 {
		return errors.NotFound(common.SERVICE_SHARE, "Could not delete hash associated to this workspace "+shareId)
	}
	return nil

}
