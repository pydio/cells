package shares

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math"
	"net/http"
	"net/url"
	"path"

	"github.com/pkg/errors"
	"github.com/pydio/pydio-sdk-go/client/provisioning"
	"github.com/pydio/pydio-sdk-go/config"
	"github.com/pydio/pydio-sdk-go/models"
)

var (
	apiConfig       *config.SdkConfig
	loadedAdminRole *models.Role
)

func SetConfig(sdkConfig *config.SdkConfig) {
	apiConfig = sdkConfig
}

func LoadShares() (map[string]*Share, []error, error) {

	httpClient := config.GetHttpClient(apiConfig)
	var cursor Cursor
	var shareErrors []error
	shares := make(map[string]*Share)
	for {
		next, ok := nextPage(cursor)
		if !ok {
			break
		}
		fmt.Println("Loading Shares Page: ", next)
		result, e := loadSharesPage(httpClient, next)
		if e != nil {
			return nil, shareErrors, e
		}
		for key, mS := range result.Shares {
			s, e := NewShareFromModel(key, mS)
			if e != nil {
				shareErrors = append(shareErrors, fmt.Errorf("cannot load share %s: %s", key, e.Error()))
				continue
			}
			shares[key] = s
		}
		cursor = result.Cursor
	}

	return shares, shareErrors, nil

}

func nextPage(cursor Cursor) (int, bool) {
	if (cursor == Cursor{}) {
		return 1, true
	}
	if cursor.Offset+cursor.Limit < cursor.Total {
		next := math.Ceil(float64(cursor.Offset+1)/float64(cursor.Limit)) + 1
		return int(next), true
	}
	return 1, false
}

func loadSharesPage(httpClient *http.Client, page int) (*ListSharesResponse, error) {

	listUri := path.Join(apiConfig.Url, apiConfig.Path, "api/settings/sharelist-load")
	listUrl := fmt.Sprintf("%s://%s/", apiConfig.Protocol, listUri)

	data := url.Values{}
	data.Set("format", "json")
	data.Set("user_context", "global")
	if page > 0 {
		data.Set("page", fmt.Sprintf("%d", page))
	}

	req, _ := http.NewRequest("POST", listUrl, bytes.NewBufferString(data.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; param=value")
	req.SetBasicAuth(apiConfig.User, apiConfig.Password)

	resp, e := httpClient.Do(req)
	if e != nil {
		return nil, e
	}
	body, e := ioutil.ReadAll(resp.Body)
	if e != nil {
		return nil, e
	}
	var result ListSharesResponse
	if e := json.Unmarshal(body, &result); e != nil {
		return nil, e
	}
	return &result, nil
}

// LoadSharedElement performs api call to load_shared_element_data
func LoadSharedElement(s *Share) (*models.ShareElement, error) {

	parentRepoId := s.GetMetadata().GetParentRepositoryId()
	parentRelativePath := s.GetMetadata().GetNodeRelativePath()
	httpClient := config.GetHttpClient(apiConfig)

	if e := OpenAdminPermission(parentRepoId); e != nil {
		return nil, e
	}

	uriParts := path.Join(apiConfig.Url, apiConfig.Path, "api", parentRepoId, "load_shared_element_data/", parentRelativePath)
	apiUrl := fmt.Sprintf("%s://%s", apiConfig.Protocol, uriParts)

	data := url.Values{}
	data.Set("owner", s.GetOwnerId())
	data.Set("merged", "true")

	req, _ := http.NewRequest("POST", apiUrl, bytes.NewBufferString(data.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; param=value")
	req.SetBasicAuth(apiConfig.User, apiConfig.Password)
	req.PostForm = url.Values{}
	req.PostForm.Set("owner", s.GetOwnerId())
	req.PostForm.Set("merged", "true")
	resp1, e := httpClient.Do(req)
	if e != nil {
		return nil, errors.Wrap(e, "Error while loading shared element - "+uriParts)
	}
	body, _ := ioutil.ReadAll(resp1.Body)
	var element models.ShareElement
	if e := json.Unmarshal(body, &element); e != nil {
		return nil, errors.Wrap(e, "Error while parsing shared element - "+uriParts)
	}

	return &element, nil

}

// LoadWorkspace loads AdminWorkspace from API
func LoadWorkspace(repositoryId string) (*models.AdminWorkspace, error) {

	httpClient := config.GetHttpClient(apiConfig)
	apiClient, ctx, err := config.GetPreparedApiClient(apiConfig)
	if err != nil {
		return nil, err
	}
	format := "json"
	wsParams := &provisioning.AdminGetWorkspaceParams{
		Context:     ctx,
		HTTPClient:  httpClient,
		Format:      &format,
		WorkspaceID: repositoryId,
	}
	res, e := apiClient.Provisioning.AdminGetWorkspace(wsParams, nil)
	if e != nil {
		return nil, e
	}

	ws := res.Payload
	return ws, nil
}

func ParseWorkspacePath(ws *models.AdminWorkspace) (string, error) {
	var wsPath string
	parameters, ok := ws.Parameters.(map[string]interface{})
	if !ok {
		return "", errors.New("Cannot cast AdminWorkspace.Parameters to map[string]interface{}")
	}
	if value, ok := parameters["PATH"]; ok {
		wsPath = value.(string)
	} else {
		return "", errors.New("Cannot find PATH in AdminWorkspace.Parameters map")
	}
	return wsPath, nil
}

func OpenAdminPermission(workspaceId string) error {

	httpClient := config.GetHttpClient(apiConfig)
	apiClient, ctx, err := config.GetPreparedApiClient(apiConfig)
	if err != nil {
		return err
	}
	if loadedAdminRole == nil {
		format := "json"
		params := provisioning.NewGetRoleParamsWithContext(ctx).WithHTTPClient(httpClient)
		params.SetFormat(&format)
		params.SetRoleID("AJXP_USR_/" + apiConfig.User)

		res, e := apiClient.Provisioning.GetRole(params, nil)
		if e != nil {
			return e
		}
		loadedAdminRole = res.Payload
	}

	acls, ok := loadedAdminRole.ACL.(map[string]interface{})
	if !ok {
		return fmt.Errorf("Cannot parse admin user ACLs")
	}
	if existing, ok := acls[workspaceId]; ok && existing == "rw" {
		// Already ok, nothing to do
		return nil
	}
	acls[workspaceId] = "rw"
	loadedAdminRole.ACL = acls

	putParams := provisioning.NewUpdateRoleParamsWithContext(ctx).WithHTTPClient(httpClient)
	putParams.SetRoleID("AJXP_USR_/" + apiConfig.User)
	putParams.SetRole(loadedAdminRole)

	_, e := apiClient.Provisioning.UpdateRole(putParams, nil)
	return e

}

func RecurseParentPaths(loadedShares map[string]*Share, share *Share) (newPath string, parentWs *models.AdminWorkspace, topOwnerId string, e error) {

	relativePath := share.GetMetadata().GetNodeRelativePath()
	parentRepository := share.GetMetadata().GetParentRepositoryId()
	// First check if parentRepository is already a share!
	var parent string
	if loaded, ok := loadedShares["repo-"+parentRepository]; ok {

		parent, parentWs, topOwnerId, e = RecurseParentPaths(loadedShares, loaded)
		newPath = path.Join(parent, relativePath)

	} else {

		// Load Parent Repo
		topOwnerId = share.GetOwnerId()
		parentWs, e = LoadWorkspace(parentRepository)
		if e != nil {
			return
		}
		//parent, e = ParseWorkspacePath(parentWs)
		//newPath = path.Join(parent, relativePath)
		newPath = relativePath

	}

	return
}
