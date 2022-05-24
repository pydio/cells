package crypto

import (
	"encoding/base64"
)

func NewVaultCipher(master string) (VaultCipher, error) {
	passwordBytes, err := base64.StdEncoding.DecodeString(master)
	if err != nil {
		return VaultCipher{}, err
	}
	return VaultCipher{
		key: KeyFromPassword(passwordBytes, 32),
	}, nil
}

// VaultCipher encrypts/decrypts with master key
type VaultCipher struct {
	key []byte
}

func (e VaultCipher) Encrypt(b []byte) (string, error) {
	sealed, err := Seal(e.key, b)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(sealed), nil
}
func (e VaultCipher) Decrypt(s string) ([]byte, error) {
	if s == "" {
		return []byte{}, nil
	}
	if data, err := base64.StdEncoding.DecodeString(s); err != nil {
		return []byte{}, err
	} else {
		return Open(e.key, data[:12], data[12:])
	}
}
