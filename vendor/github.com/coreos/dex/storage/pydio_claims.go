package storage

import (
	"encoding/json"
)

type PydioClaims struct {
	AuthSource  string
	DisplayName string
	Roles       []string
	GroupPath   string
	Profile     string
}

func (pc *PydioClaims) JsonMarshal() string {
	str, err := json.Marshal(pc)
	if err != nil {
		return ""
	}
	return string(str)
}

func (pc *PydioClaims) JsonUnMarshal(str string) (err error) {
	err = json.Unmarshal([]byte(str), pc)
	if err != nil {
		return err
	}
	return nil
}

func (pc *PydioClaims) GetFromClaims(claims *Claims) error {
	pc.AuthSource = claims.AuthSource
	pc.DisplayName = claims.DisplayName
	pc.Roles = claims.Roles
	pc.GroupPath = claims.GroupPath
	pc.Profile = claims.Profile
	return nil
}

func (pc *PydioClaims) SetToClaims(claims *Claims) error {
	claims.AuthSource = pc.AuthSource
	claims.DisplayName = pc.DisplayName
	claims.Roles = pc.Roles
	claims.GroupPath = pc.GroupPath
	claims.Profile = pc.Profile
	return nil
}
