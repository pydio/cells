package oauth

import (
	"fmt"
	"sync"

	"github.com/pydio/cells/common/proto/auth"
)

type MemDAO struct {
	tokens map[string]*auth.PersonalAccessToken
	tLock  *sync.Mutex
}

func NewMemDao() PatDao {
	m := &MemDAO{
		tokens: make(map[string]*auth.PersonalAccessToken),
		tLock:  &sync.Mutex{},
	}
	return m
}

func (m *MemDAO) Load(accessToken string) (*auth.PersonalAccessToken, error) {
	m.tLock.Lock()
	defer m.tLock.Unlock()
	if t, o := m.tokens[accessToken]; o {
		return t, nil
	} else {
		return nil, fmt.Errorf("not.found")
	}
}

func (m *MemDAO) Store(accessToken string, token *auth.PersonalAccessToken) error {
	m.tLock.Lock()
	defer m.tLock.Unlock()
	m.tokens[accessToken] = token
	return nil
}

func (m *MemDAO) Delete(patUuid string) error {
	m.tLock.Lock()
	defer m.tLock.Unlock()
	for k, v := range m.tokens {
		if v.Uuid == patUuid {
			delete(m.tokens, k)
		}
	}
	return nil
}

func (m *MemDAO) List(byType auth.PatType, byUser string) ([]*auth.PersonalAccessToken, error) {
	m.tLock.Lock()
	defer m.tLock.Unlock()
	var pp []*auth.PersonalAccessToken
	for _, t := range m.tokens {
		if byType != auth.PatType_ANY && t.Type != byType {
			continue
		}
		if byUser != "" && t.UserLogin != byUser {
			continue
		}
		pp = append(pp, t)
	}
	return pp, nil
}
