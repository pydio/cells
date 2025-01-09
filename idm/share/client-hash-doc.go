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
	"net/url"
	"path"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons/docstorec"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/config/routing"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/docstore"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/rest"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

const PasswordComplexitySuffix = "#$!Az1"

// StoreHashDocument sends link data to the storage backend, currently the Docstore service.
func (sc *Client) StoreHashDocument(ctx context.Context, ownerUser *idm.User, link *rest.ShareLink, updateHash ...string) error {

	store := docstorec.DocStoreClient(ctx)

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

	storeID := common.DocStoreIdShares
	var removeHash string
	if len(updateHash) > 0 && len(updateHash[0]) > 0 && link.LinkHash != updateHash[0] {
		newHash := updateHash[0]
		// Check if it already exists
		if _, e := store.GetDocument(ctx, &docstore.GetDocumentRequest{StoreID: storeID, DocumentID: newHash}); e == nil {
			return errors.WithMessage(errors.StatusConflict, "hash is already in use, please use another one")
		}
		removeHash = link.LinkHash
		link.LinkHash = newHash
	}

	doc := &docstore.Document{
		ID:            link.LinkHash,
		Data:          string(hashDocMarshaled),
		IndexableMeta: string(hashDocMarshaled),
	}
	_, e := store.PutDocument(ctx, &docstore.PutDocumentRequest{StoreID: storeID, Document: doc, DocumentID: doc.ID})

	if removeHash != "" {
		_, e = store.DeleteDocuments(ctx, &docstore.DeleteDocumentsRequest{StoreID: storeID, DocumentID: removeHash})
	}

	return e

}

// LoadHashDocumentData loads link data from the storage (currently Docstore) by link Uuid.
func (sc *Client) LoadHashDocumentData(ctx context.Context, shareLink *rest.ShareLink, acls []*idm.ACL) error {

	store := docstorec.DocStoreClient(ctx)
	ct, ca := context.WithCancel(ctx)
	defer ca()
	streamer, er := store.ListDocuments(ct, &docstore.ListDocumentsRequest{StoreID: common.DocStoreIdShares, Query: &docstore.DocumentQuery{
		MetaQuery: "+REPOSITORY:\"" + shareLink.Uuid + "\" +SHARE_TYPE:minisite",
	}})
	if er != nil {
		return er
	}
	var linkDoc *docstore.Document
	defer streamer.CloseSend()
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
		return errors.WithMessage(errors.ShareNotFound, "Cannot find link associated to this workspace")
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
		var read, write bool
		switch acl.Action.Name {
		case permissions.AclRead.Name:
			read = true
		case permissions.AclWrite.Name:
			write = true
		case permissions.AclPolicy.Name:
			read, write, _ = sc.InterpretInheritedPolicy(ctx, acl.Action.Value)
		}
		if read {
			if shareLink.ViewTemplateName != "pydio_unique_dl" {
				shareLink.Permissions = append(shareLink.Permissions, rest.ShareLinkAccessType_Preview)
			}
			if !linkData.DownloadDisabled {
				shareLink.Permissions = append(shareLink.Permissions, rest.ShareLinkAccessType_Download)
			}
		}
		if write {
			shareLink.Permissions = append(shareLink.Permissions, rest.ShareLinkAccessType_Upload)
		}
	}

	publicBase := routing.RouteIngressURIContext(ctx, common.RoutePublic, common.DefaultRoutePublic)
	shareLink.LinkUrl = path.Join(publicBase, shareLink.LinkHash)
	if configBase := config.Get(ctx, "services", common.ServiceRestNamespace_+common.ServiceShare, "url").String(); configBase != "" {
		if cfu, e := url.Parse(configBase); e == nil {
			cfu.Path = path.Join(publicBase, shareLink.LinkHash)
			shareLink.LinkUrl = cfu.String()
		}
	}

	return nil

}

// DeleteHashDocument removes link data from the storage.
func (sc *Client) DeleteHashDocument(ctx context.Context, shareId string) error {

	store := docstorec.DocStoreClient(ctx)
	resp, err := store.DeleteDocuments(ctx, &docstore.DeleteDocumentsRequest{StoreID: common.DocStoreIdShares, Query: &docstore.DocumentQuery{
		MetaQuery: "+REPOSITORY:\"" + shareId + "\" +SHARE_TYPE:minisite",
	}})
	if err != nil {
		return err
	}
	if !resp.Success || resp.DeletionCount == 0 {
		return errors.WithMessage(errors.ShareNotFound, "Cannot find hash associated with workspace %s for deletion", shareId)
	}
	return nil

}

// SearchHashDocumentForUser searches the DocStore to find documents that have either PRELOG_USER or PRESET_LOGIN with
// the passed userLogin value.
func (sc *Client) SearchHashDocumentForUser(ctx context.Context, userLogin string) (*docstore.ShareDocument, error) {

	store := docstorec.DocStoreClient(ctx)

	// SEARCH PUBLIC
	streamer, err := store.ListDocuments(ctx, &docstore.ListDocumentsRequest{StoreID: common.DocStoreIdShares, Query: &docstore.DocumentQuery{
		MetaQuery: "+PRELOG_USER:\"" + userLogin + "\" +SHARE_TYPE:minisite",
	}})
	if err != nil {
		return nil, err
	}
	var linkData *docstore.ShareDocument
	defer streamer.CloseSend()
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
	streamer1, err := store.ListDocuments(ctx, &docstore.ListDocumentsRequest{StoreID: common.DocStoreIdShares, Query: &docstore.DocumentQuery{
		MetaQuery: "+PRESET_LOGIN:\"" + userLogin + "\" +SHARE_TYPE:minisite",
	}})
	if err != nil {
		return nil, err
	}
	defer streamer1.CloseSend()
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
