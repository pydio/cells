package server

import "github.com/pydio/cells/v4/common/etl/models"

func (s *server) Equals(differ models.Differ) bool {
	neu, ok := differ.(*server)
	if !ok {
		return false
	}
	return s.ID() == neu.ID() &&
		s.Name() == neu.Name()
}

func (s *server) IsDeletable(m map[string]string) bool {
	return true
}

func (s *server) IsMergeable(differ models.Differ) bool {
	return s.ID() == differ.GetUniqueId()
}

func (s *server) GetUniqueId() string {
	return s.ID()
}

func (s *server) Merge(differ models.Differ, params map[string]string) (models.Differ, error) {
	// Return target
	return differ, nil
}
