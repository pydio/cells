package pydio8

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/go-openapi/errors"
	"github.com/go-openapi/runtime"
	"github.com/go-openapi/strfmt"
	"github.com/go-openapi/swag"

	"github.com/pydio/pydio-sdk-go/client"
	"github.com/pydio/pydio-sdk-go/client/provisioning"
	"github.com/pydio/pydio-sdk-go/models"
)

type Client struct {
	cli *client.PydioAPIV2
}

// User Client Rewrite
func (a *Client) GetPeople(params *GetPeopleParams) (*GetPeopleOK, error) {
	// // TODO: Validate the params before sending
	// if params == nil {
	// 	params = NewGetPeopleParams()
	// }

	result, err := a.cli.Transport.Submit(&runtime.ClientOperation{
		ID:                 "getPeople",
		Method:             "GET",
		PathPattern:        "/admin/people/{path}",
		ProducesMediaTypes: []string{"application/json", "application/xml"},
		ConsumesMediaTypes: []string{""},
		Schemes:            []string{"http"},
		Params:             params,
		Reader:             &GetPeopleReader{formats: strfmt.Default},
		Context:            params.Context,
		Client:             params.HTTPClient,
	})
	if err != nil {
		return nil, err
	}
	return result.(*GetPeopleOK), nil

}

/*GetPeopleParams contains all the parameters to send to the API endpoint
for the get people operation typically these are written to a http.Request
*/
type GetPeopleParams struct {

	/*Format
	  Format produced in output (defaults to xml)

	*/
	Format *string
	/*List
	  list children of the current resource

	*/
	List *bool
	/*Path
	  User or group identifier, including full group path (optional)

	*/
	Path string

	Page int64

	timeout    time.Duration
	Context    context.Context
	HTTPClient *http.Client
}

// WriteToRequest writes these params to a swagger request
func (o *GetPeopleParams) WriteToRequest(r runtime.ClientRequest, reg strfmt.Registry) error {

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

	if o.List != nil {

		// query param list
		var qrList bool
		if o.List != nil {
			qrList = *o.List
		}
		qList := swag.FormatBool(qrList)
		if qList != "" {
			if err := r.SetQueryParam("list", qList); err != nil {
				return err
			}
		}

	}

	if o.Page > 0 {
		qPage := swag.FormatInt64(o.Page)
		if qPage != "" {
			if err := r.SetQueryParam("page", qPage); err != nil {
				return err
			}
		}
	}

	// path param path
	if err := r.SetPathParam("path", o.Path); err != nil {
		return err
	}

	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}

// ROLE client rewrite
func (a *Client) GetRoles(params *provisioning.GetRolesParams) (*GetRolesOK, error) {
	// TODO: Validate the params before sending
	if params == nil {
		params = provisioning.NewGetRolesParams()
	}

	result, err := a.cli.Transport.Submit(&runtime.ClientOperation{
		ID:                 "getRoles",
		Method:             "GET",
		PathPattern:        "/admin/roles",
		ProducesMediaTypes: []string{"application/json", "application/xml"},
		ConsumesMediaTypes: []string{""},
		Schemes:            []string{"http"},
		Params:             params,
		Reader:             &GetRolesReader{formats: strfmt.Default},
		Context:            params.Context,
		Client:             params.HTTPClient,
	})
	if err != nil {
		return nil, err
	}
	return result.(*GetRolesOK), nil

}

// GetRolesReader is a Reader for the GetRoles structure.
type GetPeopleReader struct {
	formats strfmt.Registry
}

// ReadResponse reads a server response into the received o.
func (o *GetPeopleReader) ReadResponse(response runtime.ClientResponse, consumer runtime.Consumer) (interface{}, error) {
	switch response.Code() {

	case 200:
		result := NewGetPeopleOK()
		if err := result.readResponse(response, consumer, o.formats); err != nil {
			return nil, err
		}

		return result, nil

	default:
		return nil, runtime.NewAPIError("unknown error", response, response.Code())
	}
}

// NewGetRolesOK creates a GetRolesOK with default headers values
func NewGetPeopleOK() *GetPeopleOK {
	return &GetPeopleOK{}
}

/*GetRolesOK handles this case with default header values.

A list of roles represented as standard nodes
*/
type GetPeopleOK struct {
	Payload *models.NodeList
}

func (o *GetPeopleOK) Error() string {
	return fmt.Sprintf("[GET /admin/people][%d] getPeopleOk %+v", 200, o.Payload)
}

// readResponse may parse response formated as NodeList OR NodeListData
func (o *GetPeopleOK) readResponse(response runtime.ClientResponse, consumer runtime.Consumer, formats strfmt.Registry) error {

	o.Payload = new(models.NodeList)
	var body map[string]interface{}
	if err := consumer.Consume(response.Body(), &body); err != nil && err != io.EOF {
		return err
	}
	if val, ok := body["children"]; ok {
		o.Payload.Data = new(models.NodeListData)
		test, _ := json.Marshal(val)
		if string(test) == "[]" {
			o.Payload.Data.Children = make(map[string]models.Node)
		} else {
			js, _ := json.Marshal(body)
			if err := json.Unmarshal(js, &o.Payload.Data); err != nil {
				return err
			}
		}
	} else {
		js, e := json.Marshal(body)
		if e != nil {
			return e
		}
		var p models.NodeList
		if err := json.Unmarshal(js, &p); err != nil {
			return err
		}
		o.Payload = &p

	}

	return nil
}

// GetRolesReader is a Reader for the GetRoles structure.
type GetRolesReader struct {
	formats strfmt.Registry
}

// ReadResponse reads a server response into the received o.
func (o *GetRolesReader) ReadResponse(response runtime.ClientResponse, consumer runtime.Consumer) (interface{}, error) {
	switch response.Code() {

	case 200:
		result := NewGetRolesOK()
		if err := result.readResponse(response, consumer, o.formats); err != nil {
			return nil, err
		}

		return result, nil

	default:
		return nil, runtime.NewAPIError("unknown error", response, response.Code())
	}
}

// NewGetRolesOK creates a GetRolesOK with default headers values
func NewGetRolesOK() *GetRolesOK {
	return &GetRolesOK{}
}

/*GetRolesOK handles this case with default header values.

A list of roles represented as standard nodes
*/
type GetRolesOK struct {
	Payload *models.NodeList
}

func (o *GetRolesOK) Error() string {
	return fmt.Sprintf("[GET /admin/roles][%d] getRolesOK  %+v", 200, o.Payload)
}

func (o *GetRolesOK) readResponse(response runtime.ClientResponse, consumer runtime.Consumer, formats strfmt.Registry) error {

	o.Payload = new(models.NodeList)

	data := new(models.NodeListData)

	// response payload
	if err := consumer.Consume(response.Body(), &data); err != nil && err != io.EOF {
		return err
	}

	o.Payload.Data = data

	return nil
}
