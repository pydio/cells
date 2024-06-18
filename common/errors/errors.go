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

package errors

import (
	tozd "gitlab.com/tozd/go/errors"
)

var (
	// CellsError is the parent of all errors
	CellsError = tozd.Base("cells")

	StatusInternalServerError = tozd.BaseWrap(CellsError, "internal")
	StatusForbidden           = tozd.BaseWrap(CellsError, "forbidden")
	StatusUnauthorized        = tozd.BaseWrap(CellsError, "unauthorized")
	StatusTooManyRequests     = tozd.BaseWrap(CellsError, "forbidden")
	StatusRequestTimeout      = tozd.BaseWrap(CellsError, "timeout")
	StatusBadRequest          = tozd.BaseWrap(CellsError, "bad request")
	StatusConflict            = tozd.BaseWrap(CellsError, "conflict")
	StatusPreconditionFailed  = tozd.BaseWrap(CellsError, "precondition failed")
	StatusNotImplemented      = tozd.BaseWrap(CellsError, "not implemented")
	StatusServiceUnavailable  = tozd.BaseWrap(CellsError, "service unavailable")
	StatusNotFound            = tozd.BaseWrap(CellsError, "not found")
	StatusCancelled           = tozd.BaseWrap(CellsError, "cancelled")
	StatusAborted             = tozd.BaseWrap(CellsError, "aborted")
	StatusOutOfRange          = tozd.BaseWrap(CellsError, "out of range")
	StatusDataLoss            = tozd.BaseWrap(CellsError, "data loss")
	StatusLocked              = tozd.BaseWrap(CellsError, "locked")
	StatusQuotaReached        = tozd.BaseWrap(CellsError, "quota reached")

	InvalidParameters = RegisterBaseSentinel(StatusBadRequest, "invalid parameters")

	UserNotFound       = RegisterBaseSentinel(StatusNotFound, "user not found")
	NodeNotFound       = RegisterBaseSentinel(StatusNotFound, "node not found")
	RecycleNotFound    = RegisterBaseSentinel(StatusNotFound, "recycle not found")
	KeyNotFound        = RegisterBaseSentinel(StatusNotFound, "key not found")
	BucketNotFound     = RegisterBaseSentinel(StatusNotFound, "bucket not found")
	ObjectNotFound     = RegisterBaseSentinel(StatusNotFound, "object not found")
	DatasourceNotFound = RegisterBaseSentinel(StatusNotFound, "datasource not found")
	RoleNotFound       = RegisterBaseSentinel(StatusNotFound, "role not found")
	TemplateNotFound   = RegisterBaseSentinel(StatusNotFound, "template not found")
	VersionNotFound    = RegisterBaseSentinel(StatusNotFound, "version not found")
	JobNotFound        = RegisterBaseSentinel(StatusNotFound, "job not found")
	ActionNotFound     = RegisterBaseSentinel(StatusNotFound, "action not found")
	WorkspaceNotFound  = RegisterBaseSentinel(StatusNotFound, "workspace not found")
	CellNotFound       = RegisterBaseSentinel(WorkspaceNotFound, "cell not found")
	ShareNotFound      = RegisterBaseSentinel(WorkspaceNotFound, "share not found")
	DatasourceConflict = RegisterBaseSentinel(StatusConflict, "datasource conflict")
	NodeTypeConflict   = RegisterBaseSentinel(StatusConflict, "file / folder type conflict")

	UserLocked      = RegisterBaseSentinel(StatusUnauthorized, "user is locked")
	LoginNotAllowed = RegisterBaseSentinel(StatusUnauthorized, "login not allowed")
	LoginFailed     = RegisterBaseSentinel(StatusUnauthorized, "login failed")
	InvalidIDToken  = RegisterBaseSentinel(StatusUnauthorized, "invalid id_token")
	EmptyIDToken    = RegisterBaseSentinel(InvalidIDToken, "empty idToken")
	ExpiredIDToken  = RegisterBaseSentinel(InvalidIDToken, "expired idToken")

	AccessListNotFound        = RegisterBaseSentinel(StatusForbidden, "access list not found")
	ContextUserNotFound       = RegisterBaseSentinel(StatusForbidden, "context user not found")
	ExtensionsNotAllowed      = RegisterBaseSentinel(StatusForbidden, "extensions not allowed")
	OutOfAccessibleWorkspaces = RegisterBaseSentinel(StatusForbidden, "node does not belong to any accessible workspace")
	FileLocked                = RegisterBaseSentinel(StatusForbidden, "file locked")
	RoleACLsNotEditable       = RegisterBaseSentinel(StatusForbidden, "role ACLs not editable")
	RoleNotAssignable         = RegisterBaseSentinel(StatusForbidden, "role not assignable")
	NamespaceNotAllowed       = RegisterBaseSentinel(StatusForbidden, "namespace not allowed")

	SharePermissionsForbidden      = RegisterBaseSentinel(StatusForbidden, "share permissions not allowed")
	ShareFileCellsForbidden        = RegisterBaseSentinel(SharePermissionsForbidden, "share file as cells not allowed")
	ShareFolderCellsForbidden      = RegisterBaseSentinel(SharePermissionsForbidden, "share folder as cells not allowed")
	ShareFileLinkForbidden         = RegisterBaseSentinel(SharePermissionsForbidden, "share file as link not allowed")
	ShareFolderLinkForbidden       = RegisterBaseSentinel(SharePermissionsForbidden, "share folder as link not allowed")
	ShareCellMaxExpirationRequired = RegisterBaseSentinel(SharePermissionsForbidden, "share cell max expiration required")
	ShareLinkMaxExpirationRequired = RegisterBaseSentinel(SharePermissionsForbidden, "share link max expiration required")
	ShareLinkMaxDownloadRequired   = RegisterBaseSentinel(SharePermissionsForbidden, "share link max download required")
	ShareLinkPasswordRequired      = RegisterBaseSentinel(SharePermissionsForbidden, "share link max password required")
	ShareLinkHashNotEditable       = RegisterBaseSentinel(SharePermissionsForbidden, "hash not editable")
	ShareLinkHashMinLengthRequired = RegisterBaseSentinel(SharePermissionsForbidden, "hash min length required")
	ShareWrongType                 = RegisterBaseSentinel(SharePermissionsForbidden, "share wrong type, use workspace API")
	ShareNotEditable               = RegisterBaseSentinel(SharePermissionsForbidden, "share not editable")
	ShareLinkNotEditable           = RegisterBaseSentinel(ShareNotEditable, "you are not allowed to edit this link")
	ShareCellNotEditable           = RegisterBaseSentinel(ShareNotEditable, "you are not allowed to edit this cell")

	DAO          = RegisterBaseSentinel(CellsError, "dao")
	ResolveError = RegisterBaseSentinel(DAO, "dao resolution failed")
	SqlDAO       = RegisterBaseSentinel(DAO, "sql")
	MongoDAO     = RegisterBaseSentinel(DAO, "mongo")
	BoltDAO      = RegisterBaseSentinel(DAO, "bolt")
	BleveDAO     = RegisterBaseSentinel(DAO, "bleve")

	PathNotReadable       = RegisterBaseSentinel(StatusForbidden, "path.not.readable")
	PathNotWriteable      = RegisterBaseSentinel(StatusForbidden, "path.not.writeable")
	PathReadonly          = RegisterBaseSentinel(StatusForbidden, "path.readonly")
	PathExplicitDeny      = RegisterBaseSentinel(StatusForbidden, "explicit.deny")
	PathDownloadForbidden = RegisterBaseSentinel(StatusForbidden, "download.forbidden")
	PathUploadForbidden   = RegisterBaseSentinel(StatusForbidden, "upload.forbidden")
	PathDeleteForbidden   = RegisterBaseSentinel(StatusForbidden, "delete.forbidden")
	CellNotEditable       = RegisterBaseSentinel(StatusForbidden, "cell not editable")

	UnmarshalError = RegisterBaseSentinel(StatusInternalServerError, "unmarshal error")

	RestInputError       = RegisterBaseSentinel(StatusBadRequest, "rest input error")
	RestOutputWriteError = RegisterBaseSentinel(StatusBadRequest, "rest output write error")

	BinaryCannotReadStore  = RegisterBaseSentinel(StatusForbidden, "cannot read store")
	BinaryCannotWriteStore = RegisterBaseSentinel(StatusForbidden, "cannot write store")
	BranchInfoMissing      = RegisterBaseSentinel(StatusInternalServerError, "branch info missing")
	BranchInfoRootMissing  = RegisterBaseSentinel(StatusInternalServerError, "branch info root missing")
	BranchInfoACLMissing   = RegisterBaseSentinel(StatusInternalServerError, "branch info ACL missing")

	ServiceError            = RegisterBaseSentinel(StatusInternalServerError, "service error")
	ServiceStartError       = RegisterBaseSentinel(ServiceError, "service start error")
	ServiceNoServerAttached = RegisterBaseSentinel(ServiceError, "no server attached")
)
