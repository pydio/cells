package keyring

import (
	keyring "github.com/zalando/go-keyring"
)

type stdProvider struct {
}

// Set stores user and pass in the keyring under the defined service
// name.
func (p *stdProvider) Set(service, user, pass string) error {
	return keyring.Set(service, user, pass)
}

// Get gets a secret from the keyring given a service name and a user.
func (p *stdProvider) Get(service, user string) (string, error) {
	return keyring.Get(service, user)
}

// Delete deletes a secret, identified by service & user, from the keyring.
func (p *stdProvider) Delete(service, user string) error {
	return keyring.Delete(service, user)
}

// NewStdKeyring places the keyring in a config store
func NewStdKeyring() Keyring {
	return &stdProvider{}
}
