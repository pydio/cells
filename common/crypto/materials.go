/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package crypto

import (
	"bytes"
	"context"
	"errors"
	"io"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/encryption"
	"go.uber.org/zap"
)

// AESGCMMaterials ...
type AESGCMMaterials struct {
	mode         int
	reader       io.Reader
	eof          bool
	bufferedRead *bytes.Buffer
	//bufferedUnread   *bytes.Buffer
	encryptionKey    []byte
	blockSize        int32
	initialBlockSize int32
	blockSizeFixed   bool
	nonceBytes       []byte
	nonceBuffer      *bytes.Buffer
	blockCount       int
	totalRead        int64
}

// NewAESGCMMaterials creates an encryption materials that use AES GCM
func NewAESGCMMaterials(key []byte, t *encryption.Params) *AESGCMMaterials {
	m := new(AESGCMMaterials)
	m.encryptionKey = key
	if t != nil {
		m.initialBlockSize = t.BlockSize
		m.blockSize = t.BlockSize
		m.nonceBuffer = bytes.NewBuffer(t.Nonce)
		m.nonceBytes = t.Nonce
	} else {
		m.initialBlockSize = 4096
		m.blockSize = 4096
		m.nonceBuffer = bytes.NewBuffer([]byte{})
	}
	return m
}

// Close closes the underlying stream
func (m *AESGCMMaterials) Close() error {
	closer, ok := m.reader.(io.Closer)
	if ok {
		return closer.Close()
	}
	return nil
}

func (m *AESGCMMaterials) Read(b []byte) (int, error) {
	switch m.mode {
	case 1:
		return m.encryptRead(b)
	case 2:
		return m.decryptRead(b)
	default:
		return 0, errors.New("mode not set")
	}
}

// GetIV returns the IV used to encrypt/decrypt as a string
func (m *AESGCMMaterials) GetIV() (iv string) {
	return ""
}

// GetKey returns the key used to encrypt/decrypt
func (m *AESGCMMaterials) GetKey() (key string) {
	return ""
}

// GetDesc returns a string description of the materials
func (m *AESGCMMaterials) GetDesc() (desc string) {
	return ""
}

// SetupEncryptMode set underlying read function in encrypt mode
func (m *AESGCMMaterials) SetupEncryptMode(stream io.Reader) error {
	m.bufferedRead = bytes.NewBuffer([]byte{})
	m.reader = stream
	m.blockSizeFixed = false
	m.blockSize = m.initialBlockSize
	m.eof = false
	m.mode = 1
	m.blockCount = 0
	m.totalRead = 0
	return nil
}

// SetupDecryptMode set underlying read function in decrypt mode
func (m *AESGCMMaterials) SetupDecryptMode(stream io.Reader, iv string, key string) error {
	m.bufferedRead = bytes.NewBuffer([]byte{})
	m.blockSizeFixed = true
	m.blockSize = m.initialBlockSize + 16

	if m.nonceBytes == nil {
		//Rewind buffer
		m.nonceBytes = m.nonceBuffer.Bytes()
		m.nonceBuffer = bytes.NewBuffer(m.nonceBytes)
	} else {
		m.nonceBuffer = bytes.NewBuffer(m.nonceBytes)
	}

	m.reader = stream
	m.eof = false
	m.mode = 2
	m.blockCount = 0
	m.totalRead = 0
	return nil
}

// GetEncryptedParameters returns the additional parameters that are generated for encryption
func (m *AESGCMMaterials) GetEncryptedParameters() *encryption.Params {
	return &encryption.Params{
		Nonce:     m.nonceBuffer.Bytes(),
		BlockSize: m.blockSize,
	}
}

func (m *AESGCMMaterials) encryptRead(b []byte) (int, error) {
	var totalSet = 0
	var cursor = 0
	l := len(b)
	buff := make([]byte, m.blockSize)

	for totalSet < l {
		readAvailable := m.bufferedRead.Len()
		if readAvailable > 0 {
			n, _ := m.bufferedRead.Read(b[totalSet:])
			totalSet += n
			if totalSet == l {
				return totalSet, nil
			}
		} else if m.eof {
			return totalSet, io.EOF
		}

		n, err := m.reader.Read(buff[cursor:])
		m.totalRead += int64(n)
		if err != nil {
			m.eof = err == io.EOF
			if !m.eof {
				return n, err
			}
		}
		m.blockCount++
		cursor += n

		if cursor != 0 && (cursor == int(m.blockSize) || m.eof) {
			sealed, err := Seal(m.encryptionKey, buff[:cursor])
			if err != nil {
				log.Logger(context.Background()).Error("failed to seal block", zap.Int("Block Num", m.blockCount), zap.Int32("Block size", m.blockSize), zap.Int64("Total Read", m.totalRead), zap.Error(err))
				return n, err
			}
			cursor = 0
			m.nonceBuffer.Write(sealed[:12])
			m.bufferedRead.Write(sealed[12:])
		}
	}
	return totalSet, nil
}

func (m *AESGCMMaterials) decryptRead(b []byte) (int, error) {
	var totalSet = 0
	var cursor = 0
	l := len(b)
	buff := make([]byte, m.blockSize)

	for totalSet < l {
		readAvailable := m.bufferedRead.Len()
		if readAvailable > 0 {
			n, _ := m.bufferedRead.Read(b[totalSet:])
			totalSet += n
			if totalSet == l {
				return totalSet, nil
			}
		} else if m.eof {
			return totalSet, io.EOF
		}

		n, err := m.reader.Read(buff[cursor:])
		m.totalRead += int64(n)
		if err != nil {
			m.eof = err == io.EOF
			if !m.eof {
				return n, err
			}
		}
		m.blockCount++
		cursor += n

		if cursor != 0 && (cursor == int(m.blockSize) || m.eof) {
			nonce := make([]byte, 12)
			nl, err := m.nonceBuffer.Read(nonce)
			if err != nil || nl < 12 {
				return 0, errors.New("Read nonce failed")
			}

			opened, err := Open(m.encryptionKey, nonce, buff[:cursor])
			if err != nil {
				log.Logger(context.Background()).Error("failed to decrypt block", zap.Int("Block Num", m.blockCount), zap.Int32("Block size", m.blockSize), zap.Int64("Total Read", m.totalRead), zap.Error(err))
				return 0, err
			}
			cursor = 0
			m.bufferedRead.Write(opened)
		}
	}
	return totalSet, nil
}
