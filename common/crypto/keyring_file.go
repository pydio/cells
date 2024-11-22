package crypto

import (
	"fmt"

	"github.com/pydio/cells/v5/common/config"
)

type configProvider struct {
	store config.Store
}

var (
	// ErrNotFound is the expected error if the secret isn't found in the
	// keyring.
	ErrNotFound = fmt.Errorf("secret not found in keyring")
)

// Set stores user and pass in the keyring under the defined service
// name.
func (p *configProvider) Set(service, user, pass string) error {
	if err := p.store.Val(service, user).Set(pass); err != nil {
		return err
	}

	return p.store.Save("setting "+service+" for "+user, "system")
}

// Get gets a secret from the keyring given a service name and a user.
func (p *configProvider) Get(service, user string) (string, error) {
	str := p.store.Val(service, user).String()
	if str == "" {
		return "", ErrNotFound
	}

	return str, nil
}

// Delete deletes a secret, identified by service & user, from the keyring.
func (p *configProvider) Delete(service, user string) error {
	return p.store.Val(service, user).Del()
}

// NewConfigKeyring places the keyring in a config store
func NewConfigKeyring(store config.Store, opt ...KeyringOption) Keyring {
	opts := new(KeyringOptions)
	for _, o := range opt {
		o(opts)
	}

	var provider Keyring

	provider = &configProvider{store}

	if opts.Auto {
		provider = NewAutoKeyring(provider, opts.AutoLogger)
	}

	return provider
}
