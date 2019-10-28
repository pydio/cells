package shares

import "github.com/pydio/pydio-sdk-go/models"

type Cursor struct {
	Offset int `json:"0"`
	Limit int `json:"1"`
	Total int `json:"total"`
}

type ListSharesResponse struct {
	Shares map[string]*models.Share `json:"data"`
	Cursor Cursor `json:"cursor"`
}
