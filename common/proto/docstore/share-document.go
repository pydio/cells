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

package docstore

type TargetUserEntry struct {
	Display       string `json:"display"`
	DownloadCount int32  `json:"download_count"`
}

// HashDocument is a Json Marshallable representation of a document, compatible with legacy.
type ShareDocument struct {
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
