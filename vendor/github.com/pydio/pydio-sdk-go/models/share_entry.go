// Code generated by go-swagger; DO NOT EDIT.

package models

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the swagger generate command

import (
	strfmt "github.com/go-openapi/strfmt"

	"github.com/go-openapi/swag"
)

// ShareEntry share entry
// swagger:model ShareEntry
type ShareEntry struct {

	// avatar
	Avatar string `json:"avatar,omitempty"`

	// hidden
	Hidden bool `json:"hidden,omitempty"`

	// id
	ID string `json:"id,omitempty"`

	// label
	Label string `json:"label,omitempty"`

	// right
	Right string `json:"right,omitempty"`

	// type
	Type string `json:"type,omitempty"`
}

// Validate validates this share entry
func (m *ShareEntry) Validate(formats strfmt.Registry) error {
	return nil
}

// MarshalBinary interface implementation
func (m *ShareEntry) MarshalBinary() ([]byte, error) {
	if m == nil {
		return nil, nil
	}
	return swag.WriteJSON(m)
}

// UnmarshalBinary interface implementation
func (m *ShareEntry) UnmarshalBinary(b []byte) error {
	var res ShareEntry
	if err := swag.ReadJSON(b, &res); err != nil {
		return err
	}
	*m = res
	return nil
}
