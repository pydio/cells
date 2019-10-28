package shares

import (
	"encoding/json"
	"strings"

	"github.com/pydio/pydio-sdk-go/models"
)

type ShareElement struct {
	models.ShareElement
	validLinks map[string]*models.ShareLink
}

func NewElementFromModel(e *models.ShareElement) (*ShareElement, error) {
	sE := &ShareElement{
		validLinks: make(map[string]*models.ShareLink),
	}
	sE.ShareElement = *e

	// Fix Links parsing (can be [] or a valid {..object..})
	t, _ := json.Marshal(e.Links)
	tL := string(t)
	if tL != "" && tL != "[]" && strings.HasPrefix(tL, "{") {
		if e := json.Unmarshal(t, &sE.validLinks); e != nil {
			return nil, e
		}
	}
	return sE, nil
}

func (s *ShareElement) GetLinks() map[string]*models.ShareLink {
	return s.validLinks
}
