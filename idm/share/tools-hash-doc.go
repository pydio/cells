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

package share

import (
	"context"
	"encoding/json"

	"github.com/go-openapi/errors"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/docstore"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/utils/permissions"
)

const PasswordComplexitySuffix = "#$!Az1"

func StoreHashDocument(ctx context.Context, ownerUser *idm.User, link *rest.ShareLink, updateHash ...string) error {

	store := docstore.NewDocStoreClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE, defaults.NewClient())

	hashDoc := &docstore.ShareDocument{
		OwnerId:       ownerUser.Login,
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
	hashDoc.PreUserUuid = link.UserUuid

	if link.TargetUsers != nil && len(link.TargetUsers) > 0 {
		hashDoc.TargetUsers = make(map[string]*docstore.TargetUserEntry)
		for id, t := range link.TargetUsers {
			hashDoc.TargetUsers[id] = &docstore.TargetUserEntry{Display: t.Display, DownloadCount: t.DownloadCount}
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
	_, e := store.PutDocument(ctx, &docstore.PutDocumentRequest{Document: doc, DocumentID: doc.ID, StoreID: common.DOCSTORE_ID_SHARES})

	if removeHash != "" {
		_, e = store.DeleteDocuments(ctx, &docstore.DeleteDocumentsRequest{StoreID: common.DOCSTORE_ID_SHARES, DocumentID: removeHash})
	}

	return e

}

func LoadHashDocumentData(ctx context.Context, shareLink *rest.ShareLink, acls []*idm.ACL) error {

	store := docstore.NewDocStoreClient(registry.GetClient(common.SERVICE_DOCSTORE))
	streamer, er := store.ListDocuments(ctx, &docstore.ListDocumentsRequest{StoreID: common.DOCSTORE_ID_SHARES, Query: &docstore.DocumentQuery{
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
	var linkData *docstore.ShareDocument
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
		if acl.Action.Name == permissions.AclRead.Name {
			if shareLink.ViewTemplateName != "pydio_unique_dl" {
				shareLink.Permissions = append(shareLink.Permissions, rest.ShareLinkAccessType_Preview)
			}
			if !linkData.DownloadDisabled {
				shareLink.Permissions = append(shareLink.Permissions, rest.ShareLinkAccessType_Download)
			}
		} else if acl.Action.Name == permissions.AclWrite.Name {
			shareLink.Permissions = append(shareLink.Permissions, rest.ShareLinkAccessType_Upload)
		}
	}

	shareLink.LinkUrl = config.Get("defaults", "url").String("") + "/public/" + shareLink.LinkHash

	return nil

}

func DeleteHashDocument(ctx context.Context, shareId string) error {

	store := docstore.NewDocStoreClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE, defaults.NewClient())
	resp, err := store.DeleteDocuments(ctx, &docstore.DeleteDocumentsRequest{StoreID: common.DOCSTORE_ID_SHARES, Query: &docstore.DocumentQuery{
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

// SearchHashDocumentForUser searches the DocStore to find documents that have either PRELOG_USER or PRESET_LOGIN with
// the passed userLogin value.
func SearchHashDocumentForUser(ctx context.Context, userLogin string) (*docstore.ShareDocument, error) {

	store := docstore.NewDocStoreClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE, defaults.NewClient())

	// SEARCH PUBLIC
	streamer, err := store.ListDocuments(ctx, &docstore.ListDocumentsRequest{StoreID: common.DOCSTORE_ID_SHARES, Query: &docstore.DocumentQuery{
		MetaQuery: "+PRELOG_USER:\"" + userLogin + "\" +SHARE_TYPE:minisite",
	}})
	if err != nil {
		return nil, err
	}
	var linkData *docstore.ShareDocument
	defer streamer.Close()
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		if resp.Document != nil {
			if err := json.Unmarshal([]byte(resp.Document.Data), &linkData); err != nil {
				return nil, err
			}
			break
		}
	}
	if linkData != nil {
		return linkData, nil
	}

	// SEARCH PASSWORD PROTECTED
	streamer1, err := store.ListDocuments(ctx, &docstore.ListDocumentsRequest{StoreID: common.DOCSTORE_ID_SHARES, Query: &docstore.DocumentQuery{
		MetaQuery: "+PRESET_LOGIN:\"" + userLogin + "\" +SHARE_TYPE:minisite",
	}})
	if err != nil {
		return nil, err
	}
	defer streamer1.Close()
	for {
		resp, e := streamer1.Recv()
		if e != nil {
			break
		}
		if resp.Document != nil {
			if err := json.Unmarshal([]byte(resp.Document.Data), &linkData); err != nil {
				return nil, err
			}
			break
		}
	}

	return linkData, nil
}
