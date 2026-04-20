/*
 * Copyright (c) 2026. Abstrium SAS <team (at) pydio.com>
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

// Package wopi implements communication with the backend via the WOPI API.
// It typically enables integration of the Collabora online plugin.
package wopi

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

type SettingsURL struct {
	Url   string `json:"url"`
	Stamp string `json:"stamp"`
}

type FileInfo struct {
	BaseFileName     string
	OwnerId          string
	Size             int64
	UserId           string
	Version          string
	UserFriendlyName string
	UserCanWrite     bool
	LastModifiedTime string

	UserCanRename bool `json:"UserCanRename,omitempty"`

	// DisablePrint disables print functionality in Collabora Online (COOL) backend. If true, HidePrintOption is assumed to be true.
	DisablePrint bool `json:"DisablePrint,omitempty"`
	// PostMessageOrigin is a string for the domain the host page sends/receives PostMessages from, we only listen to
	// messages from this domain.
	PostMessageOrigin string `json:"PostMessageOrigin,omitempty"`
	// SupportsRename indicates if the integration supports renaming the document with the RenameFile operation.
	// Default is false. Starting with 24.04.13, when set to false, the UI buttons and menu to rename the document are hidden.
	SupportsRename bool `json:"SupportsRename,omitempty"`
	// UserCanNotWriteRelative is a boolean flag indicating that the user cannot Save-As on this server. If omitted it is set to true
	UserCanNotWriteRelative bool `json:"UserCanNotWriteRelative,omitempty"`
	// TemplateSource : if the ID of file (like the wopi/files/ID) can be a non-existing file. In that case, the file
	// will be created from a template when the template (eg. an OTT file) is specified as TemplateSource in the CheckFileInfo response.
	//The TemplateSource is supposed to be an URL like https://somewhere/accessible/file.ott that is accessible by the Online.
	TemplateSource string `json:"TemplateSource,omitempty"`

	// IsAdminUser should be true when the user has administrator rights in the integration, and false otherwise.
	// Some functionality of Collabora Online, such as update check and server audit are supposed to be shown to administrators only.
	IsAdminUser bool `json:"IsAdminUser,omitempty"`
	// IsAnonymousUser It should be true when the user is not authenticated in the integration, and false otherwise.
	// Some functionality of Collabora Online is supposed to be shown to authenticated users only.
	IsAnonymousUser bool `json:"IsAnonymousUser,omitempty"`
	// EnableInsertRemoteImage  If set to true, this will enable the insertion of images chosen from the WOPI storage.
	// A UI_InsertGraphic postMessage will be sent to the WOPI host to request the UI to select the file.
	EnableInsertRemoteImage bool `json:"EnableInsertRemoteImage,omitempty"`
	// EnableRemoteLinkPicker If set to true, this will enable the insertion of link chosen from the WOPI host.
	// A UI_PickLink postMessage will be send to the WOPI host to request the UI to select the link.
	EnableRemoteLinkPicker bool `json:"EnableRemoteLinkPicker,omitempty"`
	// EnableInsertRemoteFile If set to true, this will enable the insertion of files (e.g., multimedia) chosen from the WOPI storage.
	// A UI_InsertFile postMessage will be sent to the WOPI host to request the UI to select the file.
	EnableInsertRemoteFile bool `json:"EnableInsertRemoteFile,omitempty"`
	// EnableRemoteAIContent If set to true, this will enable the UI to insert AI generated content provided by the WOPI host.
	// A UI_InsertAIContent postMessage will be sent to the WOPI host to request the UI to select the content.
	EnableRemoteAIContent bool `json:"EnableRemoteAIContent,omitempty"`
	// DisableInsertLocalImage If set to true, this will disable the insertion of image/multimedia chosen from the local device. If
	// EnableInsertRemoteImage is not set to true, then inserting image files is not possible.
	DisableInsertLocalImage bool `json:"DisableInsertLocalImage,omitempty"`
	// HidePrintOption If set to true, hides the print option from the file menu bar in the UI.
	HidePrintOption bool `json:"HidePrintOption,omitempty"`
	// HideSaveOption If set to true, hides the save button from the toolbar and file menubar in the UI.
	HideSaveOption bool `json:"HideSaveOption,omitempty"`
	//HideExportOption Hides Download as option in the file menubar.
	HideExportOption bool `json:"HideExportOption,omitempty"`
	//DisableExport Disables export functionality in backend. If set to true, HideExportOption is assumed to be true.
	DisableExport bool `json:"DisableExport,omitempty"`
	// DisableCopy Disables copying from the document in COOL backend. Pasting into the document would still be possible.
	// However, it is still possible to do an “internal” cut/copy/paste.
	DisableCopy bool `json:"DisableCopy,omitempty"`
	// DisableInactiveMessages disables displaying of the explanation text on the overlay when the document becomes
	// inactive or killed. With this, the JS integration must provide the user with appropriate message when it gets
	// Session_Closed or User_Idle postMessages.
	DisableInactiveMessages bool `json:"DisableInactiveMessages,omitempty"`
	// UserCanOnlyComment If set to true, a specific feature-restricted mode is activated, which is similar to read-only mode,
	// but the user can only add comments to the document. This implies UserCanWrite.
	UserCanOnlyComment bool `json:"UserCanOnlyComment,omitempty"`
	// UserCanOnlyManageRedlines If set to true, a specific feature-restricted mode is activated, which is similar to read-only mode,
	// but allows the user to see and manage tracked changes: accept / reject / comment on them. This implies UserCanWrite.
	UserCanOnlyManageRedlines bool `json:"UserCanOnlyManageRedlines,omitempty"`
	// DownloadAsPostMessage Indicates that the integration wants to handle the downloading of pdf for printing or svg for
	// slideshows or exported document, because it cannot rely on browser’s support for downloading.
	// When this is set to true, the user’s eg. Print action will trigger a postMessage called Download_As, with the following JSON in the Values:
	//{ Type: 'print'|'slideshow'|'export', URL: ...url you use for the actual downloading... }
	DownloadAsPostMessage bool `json:"DownloadAsPostMessage,omitempty"`
	// SaveAsPostmessage - Similar to download as, doctype extensions can be provided for save-as. In this case the new file is loaded
	// in the integration instead of downloaded. {format: '<extension>' }
	// To achieve this, args: {format: '<extension>' } parameter needs to be sent inside UI_SaveAs.
	// The integration should provide dialog with filename, there the extension will be set after the filename. The remaining work is already handled by save-as.
	SaveAsPostmessage bool `json:"SaveAsPostMessage,omitempty"`
	// EnableOwnerTermination if set to true, it allows the document owner (the one with OwnerId =UserId) to send a closedocument message.
	EnableOwnerTermination bool `json:"EnableOwnerTermination,omitempty"`

	// UserExtraInfo is a JSON object that contains additional info about the user, for example the avatar image.
	// Example keys are 'avatar' or 'mail'
	UserExtraInfo map[string]interface{} `json:"UserExtraInfo,omitempty"`
	// UserPrivateInfo is a JSON object that contains additional info about the user, but unlike the UserExtraInfo it is not shared among the views in collaborative editing sessions.
	// When the SignatureCert, SignatureKey and SignatureCa keys in UserPrivateInfo are specified, the document signing functionality gets enabled in Collabora Online’s user interface.
	UserPrivateInfo map[string]interface{} `json:"UserPrivateInfo,omitempty"`
	// ServerPrivateInfo is a JSON object that contains credentials, but unlike UserPrivateInfo, it is meant to be per-server, not per-user.
	// When the ESignatureBaseUrl, ESignatureClientId and ESignatureSecret keys in ServerPrivateInfo are specified, the electronic signing functionality for PDF files gets enabled in Collabora Online’s user interface (the Insert menu has an Electronic signature menu item).
	ServerPrivateInfo map[string]interface{} `json:"ServerPrivateInfo,omitempty"`

	// UserSettings provides a URL to fetch the user’s personal settings using the settings iframe.
	// This must be integrated with the Settings iframe feature (https://sdk.collaboraonline.com/docs/advanced_integration.html?highlight=checkfileinfo#setup-settings-iframe)
	// The URL should include required parameters, as documented in Fetch settings.
	// The stamp should reflect the last update time of the settings (commonly a timestamp or hash). It should only change when the settings have been modified. If the stamp changes without actual updates, Collabora Online will unnecessarily re-fetch the settings from your WOPI host.
	// Example: {
	//  "url": "<base_url>/wopi/settings?access_token=<token>&type=userconfig&fileId=-1",
	//  "stamp": "<valid_stamp>"
	// }
	UserSettings *SettingsURL `json:"UserSettings,omitempty"`

	// SharedSettings is used to provide shared or system-wide settings (commonly managed by administrators). The format is similar to UserSettings and should follow the same structure.
	SharedSettings *SettingsURL `json:"SharedSettings,omitempty"`

	// WatermarkText If set to a non-empty string, is used for rendering a watermark-like text on each tile of the document.
	WatermarkText string `json:"WatermarkText,omitempty"`

	PydioPath string
}

func getNodeInfos(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	log.Logger(ctx).Debug("[wopi] - GetNode INFO", zap.Any("vars", mux.Vars(r)))

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")

	n, err := findNodeFromRequest(r)
	if err != nil {
		log.Logger(ctx).Error("cannot find node from request", zap.Error(err))
		w.WriteHeader(http.StatusNotFound)
		return
	}

	f, err := GetFileInfoResponseBuilder().Build(ctx, n, r)
	if err != nil {
		log.Logger(ctx).Error("cannot build node from request", zap.Error(err))
		w.WriteHeader(http.StatusNotFound)
		return
	}

	data, _ := json.Marshal(f)
	if _, er := w.Write(data); er != nil {
		log.Logger(ctx).Error("error writing response in CheckFileInfo API", zap.Error(er))
	}
}

func download(w http.ResponseWriter, r *http.Request) {
	log.Logger(r.Context()).Debug("WOPI BACKEND - Download")

	n, err := findNodeFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	read, err := client.GetObject(r.Context(), n, &models.GetRequestData{StartOffset: 0, Length: -1})
	if err != nil {
		log.Logger(r.Context()).Error("cannot get object", zap.Error(err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", n.GetSize()))
	defer read.Close()
	written, err := io.Copy(w, read)
	if err != nil {
		log.Logger(r.Context()).Error("cannot write response", zap.Error(err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	log.Logger(r.Context()).Debug("data sent to output", zap.Int64("Data Length", written))
}

func uploadStream(w http.ResponseWriter, r *http.Request) {
	log.Logger(r.Context()).Debug("WOPI BACKEND - Upload")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")

	n, err := findNodeFromRequest(r)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	// Check if LastModifiedTime changed, ask user to resolve the conflict
	coolTimeStr := r.Header.Get("X-COOL-WOPI-Timestamp")
	if coolTimeStr != "" {
		coolTime, err := time.Parse(time.RFC3339, coolTimeStr)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if !coolTime.Equal(n.GetModTime()) {
			w.WriteHeader(http.StatusConflict)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{
				"COOLStatusCode": 1010,
			})
			return
		}
	}

	var size int64
	if h, ok := r.Header["Content-Length"]; ok && len(h) > 0 {
		size, _ = strconv.ParseInt(h[0], 10, 64)
	}

	written, err := client.PutObject(r.Context(), n, r.Body, &models.PutRequestData{
		Size: size,
	})
	if err != nil {
		log.Logger(r.Context()).Error("cannot put object", zap.Int64("already written data Length", written.Size), zap.Error(err))
		if written.Size == 0 {
			w.WriteHeader(http.StatusForbidden)
		} else {
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}

	log.Logger(r.Context()).Debug("uploaded node", n.Zap(), zap.Int64("Data Length", written.Size))

	// Readnode for info
	n, err = findNodeFromRequest(r)

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"LastModifiedTime": n.GetModTime().Format(time.RFC3339),
	})
}

// findNodeFromRequest retrieves a node from the repository using the node id
// prefixed by the relevant workspace slug that is encoded in the current route
func findNodeFromRequest(r *http.Request) (*tree.Node, error) {

	vars := mux.Vars(r)
	uuid := vars["uuid"]
	if uuid == "" {
		return nil, errors.New("Cannot find uuid in parameters")
	}

	// Now go through all the authorization mechanisms
	resp, err := client.ReadNode(r.Context(), &tree.ReadNodeRequest{
		Node: &tree.Node{Uuid: uuid},
	})
	if err != nil {
		log.Logger(r.Context()).Error("cannot retrieve node with uuid", zap.String(common.KeyNodeUuid, uuid), zap.Error(err))
		return nil, err
	}

	log.Logger(r.Context()).Debug("node retrieved from request with uuid", resp.Node.Zap())
	return resp.Node, nil
}
