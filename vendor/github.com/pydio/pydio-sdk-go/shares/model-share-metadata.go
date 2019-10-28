package shares

import (
	"fmt"

	"github.com/pydio/pydio-sdk-go/models"
)

type ShareMetadata struct {
	models.ShareMetadata
}

// NewFromModel creates a ShareMetadata from a parsed models.ShareMetadata
func NewMetaFromModel(metadata *models.ShareMetadata) *ShareMetadata {
	s := &ShareMetadata{}
	s.ShareMetadata = *metadata
	return s
}

// GetParentRepositoryId returns SharedElementParentRepository as string
func (s *ShareMetadata) GetParentRepositoryId() string {
	return fmt.Sprintf("%v", s.SharedElementParentRepository)
}

// GetParentRepositoryLabel returns SharedElementParentRepositoryLabel
func (s *ShareMetadata) GetParentRepositoryLabel() string {
	return s.ShareElementParentRepositoryLabel
}

// GetNodeRelativePath returns original path inside parent repository
func (s *ShareMetadata) GetNodeRelativePath() string {
	return s.OriginalPath
}
