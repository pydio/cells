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
	"errors"
	"fmt"
	"github.com/pydio/cells/common/proto/encryption"
	"io"
)

const (
	AESGCMAuthTagSize = 16
	AESGCMNonceSize   = 12
)

// AESGCMFileEncryptionBlockSize is the default size of encryption block used in material
var AESGCMFileEncryptionBlockSize = 4 * 1024 * 1024

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
func NewAESGCMMaterials(key []byte, params *encryption.Params) *AESGCMMaterials {
	m := new(AESGCMMaterials)
	m.encryptionKey = key
	if params != nil {
		m.initialBlockSize = params.BlockSize
		m.blockSize = params.BlockSize
		m.nonceBuffer = bytes.NewBuffer(params.Nonce)
		m.nonceBytes = params.Nonce
	} else {
		m.initialBlockSize = int32(AESGCMFileEncryptionBlockSize)
		m.blockSize = int32(AESGCMFileEncryptionBlockSize)
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
	m.blockSize = m.initialBlockSize + AESGCMAuthTagSize

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
				//log.Logger(context.Background()).Error("failed to seal block", zap.Int("Block Num", m.blockCount), zap.Int32("Block size", m.encryptedBlockSize), zap.Int64("Total Read", m.totalRead), zap.Error(err))
				return n, err
			}
			cursor = 0
			m.nonceBuffer.Write(sealed[:AESGCMNonceSize])
			m.bufferedRead.Write(sealed[AESGCMNonceSize:])
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
			nonce := make([]byte, AESGCMNonceSize)
			nl, err := m.nonceBuffer.Read(nonce)
			if err != nil || nl < AESGCMNonceSize {
				fmt.Println("Error while reading nonce for decrypting data!", err.Error())
				return 0, errors.New("Read nonce failed")
			}

			opened, err := Open(m.encryptionKey, nonce, buff[:cursor])
			if err != nil {
				fmt.Println("Error while decrypting data!", err.Error())
				return 0, err
			}
			cursor = 0
			m.bufferedRead.Write(opened)
		}
	}
	return totalSet, nil
}

//*************************************************
//		RANGE ENCRYPTION MATERIAL READER
//*************************************************
type RangeAESGCMMaterials struct {
	encryptedReader    io.Reader
	eof                bool
	bufferedPlainBytes *bytes.Buffer
	//bufferedUnread   *bytes.Buffer
	encryptionKey          []byte
	encryptedBlockSize     int32
	plainBlockSize         int32
	blockSizeFixed         bool
	nonceBytes             []byte
	nonceBuffer            *bytes.Buffer
	blockCount             int
	totalEncryptedRead     int64
	totalPlainBytesRead    int64
	plainRangeOffset       int64
	plainRangeLimit        int64
	skippedPlainBlockCount int
	rangeBlockCount        int
	encryptedRangeOffset   int64
	encryptedRangeLength   int64
	plainDataStreamCursor  int64
	rangeSet               bool
	reachedRangeLimit      bool
}

// NewRangeAESGCMMaterials creates an encryption materials that use AES GCM
func NewRangeAESGCMMaterials(key []byte, params *encryption.Params) *RangeAESGCMMaterials {
	m := new(RangeAESGCMMaterials)
	m.encryptionKey = key
	m.rangeSet = false
	m.reachedRangeLimit = false
	m.plainBlockSize = params.BlockSize
	m.encryptedBlockSize = params.BlockSize
	m.nonceBuffer = bytes.NewBuffer(params.Nonce)
	m.nonceBytes = params.Nonce
	return m
}

// Close closes the underlying stream
func (m *RangeAESGCMMaterials) Close() error {
	closer, ok := m.encryptedReader.(io.Closer)
	if ok {
		return closer.Close()
	}
	return nil
}

func (m *RangeAESGCMMaterials) Read(b []byte) (int, error) {
	return m.decryptRead(b)
}

func (m *RangeAESGCMMaterials) SetPlainRange(offset, length int64) error {
	m.plainRangeOffset = offset
	m.plainRangeLimit = offset + length

	if m.plainRangeOffset < 0 {
		return errors.New("negative offset value")
	}

	if m.plainRangeLimit < 0 {
		return errors.New("negative range length value")
	}
	return nil
}

func (m *RangeAESGCMMaterials) CalculateEncryptedRange(plainFileSize int64) (int64, int64) {
	m.rangeSet = true

	// AESGCMAuthTagSize is the GCM authentication tag size
	m.encryptedBlockSize = m.plainBlockSize + AESGCMAuthTagSize

	m.skippedPlainBlockCount = int(m.plainRangeOffset / int64(m.plainBlockSize))
	m.encryptedRangeOffset = int64(m.skippedPlainBlockCount) * int64(m.encryptedBlockSize)
	m.plainDataStreamCursor = int64(m.skippedPlainBlockCount) * int64(m.plainBlockSize)

	plainRangeLength := m.plainRangeLimit - m.plainRangeOffset
	m.rangeBlockCount = int(plainRangeLength / int64(m.plainBlockSize))

	if plainRangeLength%int64(m.plainBlockSize) > 0 {
		m.rangeBlockCount++
	}

	encryptedFileSize := m.calculateEncryptedSize(plainFileSize)
	m.encryptedRangeLength = int64(m.rangeBlockCount) * int64(m.encryptedBlockSize)
	if m.encryptedRangeOffset+m.encryptedRangeLength > encryptedFileSize {
		m.encryptedRangeLength = encryptedFileSize - m.encryptedRangeOffset
	}
	return m.encryptedRangeOffset, m.encryptedRangeLength
}

func (m *RangeAESGCMMaterials) calculateEncryptedSize(plainFileLength int64) int64 {
	blockCount := plainFileLength / int64(m.plainBlockSize)
	rest := plainFileLength % int64(m.plainBlockSize)

	encryptedFileSize := blockCount * int64(m.plainBlockSize+AESGCMAuthTagSize)
	if rest > 0 {
		encryptedFileSize = encryptedFileSize + rest + AESGCMAuthTagSize
	}
	return encryptedFileSize
}

// GetIV returns the IV used to encrypt/decrypt as a string
func (m *RangeAESGCMMaterials) GetIV() (iv string) {
	return ""
}

// GetKey returns the key used to encrypt/decrypt
func (m *RangeAESGCMMaterials) GetKey() (key string) {
	return ""
}

// GetDesc returns a string description of the materials
func (m *RangeAESGCMMaterials) GetDesc() (desc string) {
	return ""
}

// SetupEncryptMode set underlying read function in encrypt mode
func (m *RangeAESGCMMaterials) SetupEncryptMode(stream io.Reader) error {
	return errors.New("only decryption mode is supported")
}

// SetupDecryptMode set underlying read function in decrypt mode
func (m *RangeAESGCMMaterials) SetupDecryptMode(stream io.Reader, iv string, key string) error {
	m.bufferedPlainBytes = bytes.NewBuffer([]byte{})
	m.blockSizeFixed = true
	m.encryptedBlockSize = m.plainBlockSize + AESGCMAuthTagSize
	m.nonceBuffer = bytes.NewBuffer(m.nonceBytes[m.skippedPlainBlockCount*AESGCMNonceSize:])
	m.encryptedReader = stream
	m.eof = false
	m.blockCount = 0
	m.totalEncryptedRead = 0
	return nil
}

// GetEncryptedParameters returns the additional parameters that are generated for encryption
func (m *RangeAESGCMMaterials) GetEncryptedParameters() *encryption.Params {
	return &encryption.Params{
		Nonce:     m.nonceBuffer.Bytes(),
		BlockSize: m.encryptedBlockSize,
	}
}

func (m *RangeAESGCMMaterials) encryptRead(b []byte) (int, error) {
	return -1, errors.New("encryption not supported")
}

/*func (m *RangeAESGCMMaterials) decryptRead(b []byte) (int, error) {
	var totalPlainBytesRead = 0
	l := len(b)
	encryptedBuffer := make([]byte, m.encryptedBlockSize)
	encryptedBufferCursor := 0

	for totalPlainBytesRead < l {
		//check if there is available already read and decrypted and buffered data from original stream
		availablePlainBufferedData := m.bufferedPlainBytes.Len()
		if availablePlainBufferedData > 0 && !m.reachedRangeLimit {

			// Adjust buffer is buffer size is bigger than size of current range
			limit := int(m.plainRangeLimit - m.plainRangeOffset - int64(totalPlainBytesRead))
			if limit > l {
				limit = l
			}

			n, _ := m.bufferedPlainBytes.Read(b[totalPlainBytesRead:limit])
			totalPlainBytesRead += n

			m.reachedRangeLimit = m.plainRangeLimit == m.plainRangeOffset+int64(totalPlainBytesRead)
			if totalPlainBytesRead == l || m.reachedRangeLimit {
				return totalPlainBytesRead, nil
			}

		} else if m.eof || m.plainDataStreamCursor == m.plainRangeLimit || m.reachedRangeLimit {
			//we leave if we reached the limit or the end of original stream
			return totalPlainBytesRead, io.EOF
		}

		n, err := m.encryptedReader.Read(encryptedBuffer[encryptedBufferCursor:])
		m.totalEncryptedRead += int64(n)
		if err != nil {
			m.eof = err == io.EOF
			if !m.eof {
				return n, err
			}
		}
		m.blockCount++
		encryptedBufferCursor += n

		// if buffer of encryptedBlockSize length is full or we reached the end of the encrypted data stream
		// then we proceed to decryption
		if encryptedBufferCursor != 0 && (encryptedBufferCursor == int(m.encryptedBlockSize) || m.eof) {
			nonce := make([]byte, AESGCMNonceSize)
			nl, err := m.nonceBuffer.Read(nonce)
			if err != nil || nl < AESGCMNonceSize {
				fmt.Println("Error while reading nonce for decrypting data!", err.Error())
				return 0, errors.New("Read nonce failed")
			}

			encryptedBufferPart := encryptedBuffer[:encryptedBufferCursor]
			opened, err := Open(m.encryptionKey, nonce, encryptedBufferPart)
			if err != nil {
				fmt.Printf("Error while decrypting data on range: %d - %d => %s !\n", m.plainRangeOffset, m.plainRangeLimit, err.Error())
				return 0, err
			}
			encryptedBufferCursor = 0

			// We skip out of range data
			if m.plainDataStreamCursor < m.plainRangeOffset {
				bytesToConsumeSize := int(m.plainRangeOffset - m.plainDataStreamCursor)
				if bytesToConsumeSize > len(opened) {
					m.plainDataStreamCursor = m.plainDataStreamCursor + int64(len(opened))
					opened = opened[0:0]
				} else {
					m.plainDataStreamCursor = m.plainDataStreamCursor + int64(bytesToConsumeSize)
					opened = opened[bytesToConsumeSize:]
				}
			}

			// feed plain data buffer
			m.bufferedPlainBytes.Write(opened)
		}
	}
	return totalPlainBytesRead, nil
}*/
func (m *RangeAESGCMMaterials) decryptRead(b []byte) (int, error) {
	leftToRead := m.plainRangeLimit - m.plainRangeOffset - m.totalPlainBytesRead
	if leftToRead == 0 {
		return 0, io.EOF
	}

	var totalPlainBytesRead = 0
	l := len(b)

	if leftToRead > int64(l) {
		leftToRead = int64(l)
	}

	encryptedBuffer := make([]byte, m.encryptedBlockSize)
	encryptedBufferCursor := 0

	for totalPlainBytesRead < l {
		//check if there is available already read and decrypted and buffered data from original stream
		if m.bufferedPlainBytes.Len() > 0 && !m.reachedRangeLimit {
			n, _ := m.bufferedPlainBytes.Read(b[totalPlainBytesRead:leftToRead])
			totalPlainBytesRead += n
			m.totalPlainBytesRead += int64(n)

			m.reachedRangeLimit = m.plainRangeLimit == m.plainRangeOffset+int64(m.totalPlainBytesRead)
			if totalPlainBytesRead == l || m.reachedRangeLimit {
				return totalPlainBytesRead, nil
			}

		} else if m.eof || m.reachedRangeLimit {
			//we leave if we reached the limit or the end of original stream
			return totalPlainBytesRead, io.EOF

		} else if m.plainDataStreamCursor == m.plainRangeLimit {
			m.reachedRangeLimit = true
			return totalPlainBytesRead, io.EOF
		}

		n, err := m.encryptedReader.Read(encryptedBuffer[encryptedBufferCursor:])
		m.totalEncryptedRead += int64(n)
		if err != nil {
			m.eof = err == io.EOF
			if !m.eof {
				return n, err
			}
		}
		m.blockCount++
		encryptedBufferCursor += n

		// if buffer of encryptedBlockSize length is full or we reached the end of the encrypted data stream
		// then we proceed to decryption
		if encryptedBufferCursor != 0 && (encryptedBufferCursor == int(m.encryptedBlockSize) || m.eof) {
			nonce := make([]byte, AESGCMNonceSize)
			nl, err := m.nonceBuffer.Read(nonce)
			if err != nil || nl < AESGCMNonceSize {
				fmt.Println("Error while reading nonce for decrypting data!", err.Error())
				return 0, errors.New("Read nonce failed")
			}

			encryptedBufferPart := encryptedBuffer[:encryptedBufferCursor]
			opened, err := Open(m.encryptionKey, nonce, encryptedBufferPart)
			if err != nil {
				fmt.Printf("Error while decrypting data on range: %d - %d => %s !\n", m.plainRangeOffset, m.plainRangeLimit, err.Error())
				return 0, err
			}
			encryptedBufferCursor = 0

			// We skip out of range data
			if m.plainDataStreamCursor < m.plainRangeOffset {
				bytesToConsumeSize := int(m.plainRangeOffset - m.plainDataStreamCursor)
				if bytesToConsumeSize > len(opened) {
					m.plainDataStreamCursor = m.plainDataStreamCursor + int64(len(opened))
					opened = opened[0:0]
				} else {
					m.plainDataStreamCursor = m.plainDataStreamCursor + int64(bytesToConsumeSize)
					opened = opened[bytesToConsumeSize:]
				}
			}

			// feed plain data buffer
			m.bufferedPlainBytes.Write(opened)
		}
	}
	return totalPlainBytesRead, nil
}
