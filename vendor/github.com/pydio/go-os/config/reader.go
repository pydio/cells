package config

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/imdario/mergo"
	hash "github.com/mitchellh/hashstructure"
)

type jsonReader struct{}

func (j *jsonReader) Parse(changes ...*ChangeSet) (*ChangeSet, error) {
	var merged map[string]interface{}

	for _, m := range changes {
		if len(m.Data) == 0 {
			m.Data = []byte(`{}`)
		}

		var data map[string]interface{}
		if err := json.Unmarshal(m.Data, &data); err != nil {
			return nil, err
		}
		if err := mergo.MapWithOverwrite(&merged, data); err != nil {
			return nil, err
		}
	}

	b, err := json.Marshal(merged)
	if err != nil {
		return nil, err
	}

	h, err := hash.Hash(merged, nil)
	if err != nil {
		return nil, err
	}

	return &ChangeSet{
		Timestamp: time.Now(),
		Data:      b,
		Checksum:  fmt.Sprintf("%x", h),
		Source:    "json",
	}, nil
}

func (j *jsonReader) Values(ch *ChangeSet) (Values, error) {
	if ch == nil {
		return nil, errors.New("changeset is nil")
	}
	return newValues(ch)
}

func (j *jsonReader) String() string {
	return "json"
}

// New json reader
func NewReader() Reader {
	return &jsonReader{}
}
