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

package pydio8

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/go-openapi/errors"
	"github.com/go-openapi/runtime"
	"github.com/go-openapi/strfmt"
	"github.com/go-openapi/swag"

	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/pydio-sdk-go/client"
	"github.com/pydio/pydio-sdk-go/client/provisioning"
	"github.com/pydio/pydio-sdk-go/models"
)

type Client struct {
	cli *client.PydioAPIV2
}

// GetPeople is a client specific rewrite for p8 store
func (a *Client) GetPeople(params *GetPeopleParams) (*GetPeopleOK, error) {

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

	// Format produced in output (defaults to xml)
	Format *string
	// List children of the current resource
	List *bool
	// Path is the User or group identifier, including full group path (optional)
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

//  ROLE client rewrite

func (a *Client) GetRoles(params *provisioning.GetRolesParams) (*GetRolesOK, error) {

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

// GetPeopleReader is a Reader for the GetPeople structure.
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

// NewGetPeopleOK creates a GetPeopleOK with default headers values
func NewGetPeopleOK() *GetPeopleOK {
	return &GetPeopleOK{}
}

//GetPeopleOK handles this case with default header values.
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
