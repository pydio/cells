package shares

import (
	"github.com/pydio/pydio-sdk-go/models"
)

type Share struct {
	models.Share

	listKey   string
	metadata  *ShareMetadata
	element   *ShareElement
	workspace *models.AdminWorkspace
}

func NewShareFromModel(listKey string, ms *models.Share) (*Share, error) {
	s := &Share{
		listKey:  listKey,
		metadata: NewMetaFromModel(ms.Metadata),
	}
	s.Share = *ms
	return s, nil
}

func (s *Share) LoadElement() error {
	// Load Element
	el, er := LoadSharedElement(s)
	if er != nil {
		return er
	}
	element, er := NewElementFromModel(el)
	if er != nil {
		return er
	}
	s.element = element
	return nil
}

func (s *Share) GetElement() *ShareElement {
	return s.element
}

func (s *Share) GetWorkspace() (*models.AdminWorkspace, error) {
	if s.workspace != nil {
		return s.workspace, nil
	}
	if s.element == nil {
		e := s.LoadElement()
		if e != nil {
			return nil, e
		}
	}
	w, e := LoadWorkspace(s.element.Repositoryid)
	if e != nil {
		return nil, e
	}
	s.workspace = w
	return s.workspace, nil
}

func (s *Share) GetSharedUsers() (entries []*models.ShareEntry) {
	for _, entry := range s.GetElement().Entries {
		if !entry.Hidden {
			entries = append(entries, entry)
		}
	}
	return entries
}

func (s *Share) GetSharedUsersIds() (ids []string) {
	entries := s.GetSharedUsers()
	for _, e := range entries {
		ids = append(ids, e.ID)
	}
	return
}

func (s *Share) GetHiddenUser() (*models.ShareEntry, bool) {
	for _, entry := range s.GetElement().Entries {
		if entry.Hidden {
			return entry, true
		}
	}
	return nil, false
}

func (s *Share) GetListKey() string {
	return s.listKey
}

func (s *Share) GetMetadata() *ShareMetadata {
	return s.metadata
}

func (s *Share) GetOwnerId() string {
	return s.OWNERID
}

func (s *Share) GetTemplateName() string {
	return s.AJXPTEMPLATENAME
}

func (s *Share) GetPresetLogin() string {
	return s.PRESETLOGIN
}

func (s *Share) GetPrelogUser() string {
	return s.PRELOGUSER
}
