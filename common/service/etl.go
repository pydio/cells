package service

import "github.com/pydio/cells/v4/common/etl/models"

func (s *service) Equals(differ models.Differ) bool {
	neu, ok := differ.(*service)
	if !ok {
		return false
	}
	return s.ID() == neu.ID() &&
		s.Name() == neu.Name()
}

func (s *service) IsDeletable(m map[string]string) bool {
	return true
}

func (s *service) IsMergeable(differ models.Differ) bool {
	return s.ID() == differ.GetUniqueId()
}

func (s *service) GetUniqueId() string {
	return s.ID()
}

func (s *service) Merge(differ models.Differ, params map[string]string) (models.Differ, error) {
	// Return target
	return differ, nil
}
