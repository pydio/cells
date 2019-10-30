package pydio8

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/go-openapi/errors"
	"github.com/go-openapi/runtime"
	"github.com/go-openapi/strfmt"

	"github.com/pydio/cells/common/service/frontend"
	"github.com/pydio/pydio-sdk-go/config"
)

type ClientV1 struct {
	cli runtime.ClientTransport
}

/*GetConfigParams contains all the parameters to send to the API endpoint
for the get people operation typically these are written to a http.Request
*/
type GetConfigParams struct {
	Format *string
	Plugin string

	timeout    time.Duration
	Context    context.Context
	HTTPClient *http.Client
}

// WriteToRequest writes these params to a swagger request
func (o *GetConfigParams) WriteToRequest(r runtime.ClientRequest, reg strfmt.Registry) error {

	if err := r.SetTimeout(o.timeout); err != nil {
		return err
	}
	var res []error

	if o.Format != nil {

		// query param format
		var qrFormat string
		if o.Format != nil {
			qrFormat = *o.Format
		}
		qFormat := qrFormat
		if qFormat != "" {
			if err := r.SetQueryParam("format", qFormat); err != nil {
				return err
			}
		}
	}

	// path param path
	if err := r.SetPathParam("plugin", o.Plugin); err != nil {
		return err
	}

	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}

func (a *ClientV1) GetConfig(params *GetConfigParams) (*GetConfigOK, error) {
	result, err := a.cli.Submit(&runtime.ClientOperation{
		ID:                 "getConfig",
		Method:             "GET",
		PathPattern:        "/settings/get_plugin_manifest/{plugin}",
		ProducesMediaTypes: []string{"application/json", "application/xml"},
		ConsumesMediaTypes: []string{""},
		Schemes:            []string{"http"},
		Params:             params,
		Reader:             &GetConfigReader{},
		Context:            params.Context,
		Client:             params.HTTPClient,
	})

	if err != nil {
		return nil, err
	}
	return result.(*GetConfigOK), nil
}

// GetConfigReader is a Reader for the GetConfig structure.
type GetConfigReader struct {
	formats strfmt.Registry
}

// ReadResponse reads a server response into the received o.
func (o *GetConfigReader) ReadResponse(response runtime.ClientResponse, consumer runtime.Consumer) (interface{}, error) {

	switch response.Code() {

	case 200:
		result := NewGetConfigOK()
		if err := result.readResponse(response, consumer, o.formats); err != nil {
			return nil, err
		}

		return result, nil

	default:
		return nil, runtime.NewAPIError("unknown error", response, response.Code())
	}
}

// NewGetConfigOK creates a GetConfigOK with default headers values
func NewGetConfigOK() *GetConfigOK {
	return &GetConfigOK{}
}

/*GetConfigOK handles this case with default header values.

A list of roles represented as standard nodes
*/
type GetConfigOK struct {
	PluginSettingsValues *frontend.Cplugin_settings_values
}

func (o *GetConfigOK) Error() string {
	return fmt.Sprintf("[GET /settings/get_plugin_manifest/][%d] getCoreAuthOK  %+v", 200, o)
}

func (o *GetConfigOK) readResponse(response runtime.ClientResponse, consumer runtime.Consumer, formats strfmt.Registry) error {
	data := new(frontend.Cadmin_data)

	// response payload
	if err := consumer.Consume(response.Body(), &data); err != nil && err != io.EOF {
		return err
	}

	o.PluginSettingsValues = data.Cplugin_settings_values

	return nil
}

type GetAdvancedUserInfoResponse struct {
	Login      string `json:"login"`
	AuthSource string `json:"authsource,omitempty"`
	Password   string `json:"password,omitempty"`
	Profile    string `json:"profile,omitempty"`
	OwnerLogin string `json:"parent,omitempty"`
}

type GetDomainNameResponse struct {
	DomainName string `json:"domainname"`
}

func (a *ClientV1) GetAdvancedUserInfo(userId string, sdkConfig *config.SdkConfig) (*GetAdvancedUserInfoResponse, error) {

	httpClient := config.GetHttpClient(sdkConfig)
	getUrl := fmt.Sprintf("%s://%s/api/settings/hashedpassword/%s", sdkConfig.Protocol, sdkConfig.Url, userId)

	req, _ := http.NewRequest("GET", getUrl, nil)
	req.SetBasicAuth(sdkConfig.User, sdkConfig.Password)

	resp, e := httpClient.Do(req)
	if e != nil {
		return nil, e
	}
	body, e := ioutil.ReadAll(resp.Body)
	if e != nil {
		return nil, e
	}
	var result GetAdvancedUserInfoResponse
	if e := json.Unmarshal(body, &result); e != nil {
		return nil, e
	}
	return &result, nil

}

func (a *ClientV1) GetDomainName(sdkConfig *config.SdkConfig) (*GetDomainNameResponse, error) {
	httpClient := config.GetHttpClient(sdkConfig)
	getUrl := fmt.Sprintf("%s://%s/api/settings/ldapdomainname", sdkConfig.Protocol, sdkConfig.Url)
	req, _ := http.NewRequest("GET", getUrl, nil)
	req.SetBasicAuth(sdkConfig.User, sdkConfig.Password)

	resp, e := httpClient.Do(req)
	if e != nil {
		return nil, e
	}
	body, e := ioutil.ReadAll(resp.Body)
	if e != nil {
		return nil, e
	}
	var result GetDomainNameResponse
	if e := json.Unmarshal(body, &result); e != nil {
		return nil, e
	}
	return &result, nil
}

type NonTechRole struct {
	RoleId        string                 `json:"role_id"`
	RoleLabel     string                 `json:"role_label"`
	AppliesTo     string                 `json:"applies_to"`
	OwnerId       string                 `json:"owner_id"`
	ForceOverride bool                   `json:"force_override"`
	RoleData      map[string]interface{} `json:"role"`
}

func (a *ClientV1) ListNonTechnicalRoles(teams bool, sdkConfig *config.SdkConfig) (map[string]*NonTechRole, error) {

	httpClient := config.GetHttpClient(sdkConfig)
	var param = ""
	if teams {
		param = "?teams=true"
	}
	getUrl := fmt.Sprintf("%s://%s/api/settings/listroles%s", sdkConfig.Protocol, sdkConfig.Url, param)
	req, _ := http.NewRequest("GET", getUrl, nil)
	req.SetBasicAuth(sdkConfig.User, sdkConfig.Password)

	resp, e := httpClient.Do(req)
	if e != nil {
		return nil, e
	}
	body, e := ioutil.ReadAll(resp.Body)
	if e != nil {
		return nil, e
	}
	var result map[string]*NonTechRole
	if e := json.Unmarshal(body, &result); e != nil {
		return nil, e
	}
	return result, nil

}

const (
	P8GlobalMetaSharedUser  = "AJXP_METADATA_SHAREDUSER"
	P8GlobalMetaWatchRead   = "META_WATCH_READ"
	P8GlobalMetaWatchChange = "META_WATCH_CHANGE"
	P8GlobalMetaWatchBoth   = "META_WATCH_BOTH"
)

type P8GlobalMetaNode struct {
	Watches  map[string]string `json:"WATCH"`
	Bookmark map[string]bool   `json:"BOOKMARK"`
}
type P8GlobalMetaNodes map[string]P8GlobalMetaNode
type P8GlobalMetaUsers map[string]P8GlobalMetaNodes
type P8GlobalMeta map[string]P8GlobalMetaUsers

func (a *ClientV1) ListP8GlobalMeta(sdkConfig *config.SdkConfig) (P8GlobalMeta, error) {

	httpClient := config.GetHttpClient(sdkConfig)
	getUrl := fmt.Sprintf("%s://%s/api/settings/getmetadata", sdkConfig.Protocol, sdkConfig.Url)
	req, _ := http.NewRequest("GET", getUrl, nil)
	req.SetBasicAuth(sdkConfig.User, sdkConfig.Password)

	resp, e := httpClient.Do(req)
	if e != nil {
		return nil, e
	}
	body, e := ioutil.ReadAll(resp.Body)
	if e != nil {
		return nil, e
	}
	var result P8GlobalMeta
	if e := json.Unmarshal(body, &result); e != nil {
		return nil, e
	}
	return result, nil

}
