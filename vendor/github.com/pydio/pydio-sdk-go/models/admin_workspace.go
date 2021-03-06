// Code generated by go-swagger; DO NOT EDIT.

package models

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the swagger generate command

import (
	strfmt "github.com/go-openapi/strfmt"

	"github.com/go-openapi/errors"
	"github.com/go-openapi/swag"
	"github.com/go-openapi/validate"
)

// AdminWorkspace Workspace Definition
//
// Parameters of a workspace, as seen by administrator
// swagger:model AdminWorkspace
type AdminWorkspace struct {

	// plugin name to be used as driver to access the storage. Resulting plugin id is "access.accessType".
	// Required: true
	AccessType *string `json:"accessType"`

	// Label for this workspace
	// Required: true
	Display *string `json:"display"`

	// an i18n identifier to adapt the label to the user language
	DisplayStringID interface{} `json:"displayStringId,omitempty"`

	// The additional features parameters.
	Features interface{} `json:"features,omitempty"`

	// If this repository has a groupPath
	GroupPath string `json:"groupPath,omitempty"`

	// Id of this workspace
	ID interface{} `json:"id,omitempty"`

	// info
	Info *AdminWorkspaceInfo `json:"info,omitempty"`

	// wether this is a template or a concrete workspace.
	IsTemplate bool `json:"isTemplate,omitempty"`

	// permission mask applied on workspace files and folders
	Mask interface{} `json:"mask,omitempty"`

	// a key/value object containing all driver parameters.
	Parameters interface{} `json:"parameters,omitempty"`

	// human readable identifier, computed from display
	Slug string `json:"slug,omitempty"`

	// wether this workspace/template is writeable or not (not writeable if defined in bootstrap php configs).
	Writeable bool `json:"writeable,omitempty"`
}

// Validate validates this admin workspace
func (m *AdminWorkspace) Validate(formats strfmt.Registry) error {
	var res []error

	if err := m.validateAccessType(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateDisplay(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateInfo(formats); err != nil {
		res = append(res, err)
	}

	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}

func (m *AdminWorkspace) validateAccessType(formats strfmt.Registry) error {

	if err := validate.Required("accessType", "body", m.AccessType); err != nil {
		return err
	}

	return nil
}

func (m *AdminWorkspace) validateDisplay(formats strfmt.Registry) error {

	if err := validate.Required("display", "body", m.Display); err != nil {
		return err
	}

	return nil
}

func (m *AdminWorkspace) validateInfo(formats strfmt.Registry) error {

	if swag.IsZero(m.Info) { // not required
		return nil
	}

	if m.Info != nil {
		if err := m.Info.Validate(formats); err != nil {
			if ve, ok := err.(*errors.Validation); ok {
				return ve.ValidateName("info")
			}
			return err
		}
	}

	return nil
}

// MarshalBinary interface implementation
func (m *AdminWorkspace) MarshalBinary() ([]byte, error) {
	if m == nil {
		return nil, nil
	}
	return swag.WriteJSON(m)
}

// UnmarshalBinary interface implementation
func (m *AdminWorkspace) UnmarshalBinary(b []byte) error {
	var res AdminWorkspace
	if err := swag.ReadJSON(b, &res); err != nil {
		return err
	}
	*m = res
	return nil
}
