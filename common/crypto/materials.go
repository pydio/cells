package crypto

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
import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"encoding/binary"
	"errors"
	"fmt"
	"github.com/pydio/cells/common/proto/encryption"
	"io"
	"log"
	"strings"
)

var defaultBlockSIze = 4 * 1024 * 1024

const (
	AESGCMAuthTagSize = 16
	AESGCMNonceSize   = 12

	dataLengthMask    uint32 = 0x7FFFFFFF
	headerOptionsFlag uint32 = 0x80000000

	lastOptionFlag    uint8 = 0x80
	noValueOptionFlag uint8 = 0x40
	optionIdMask      uint8 = 0x3F

	optionKey      uint8 = 0x01
	optionPosition uint8 = 0x02
	optionPartId   uint8 = 0x03
	optionUserId   uint8 = 0x04
)

type BlockHandler interface {
	Handle(block *encryption.Block) error
}

type handlerFunc struct {
	handleFunc func(block *encryption.Block) error
}

func (hf *handlerFunc) Handle(b *encryption.Block) error {
	return hf.handleFunc(b)
}

func NewBlockHandlerFunc(hf func(block *encryption.Block) error) BlockHandler {
	return &handlerFunc{
		handleFunc: hf,
	}
}

// EncryptedBlockHeaderOption
type EncryptedBlockHeaderOption struct {
	id    uint8
	value []byte
}

func (op *EncryptedBlockHeaderOption) IsTheLast() bool {
	return op.id&lastOptionFlag == lastOptionFlag
}

func (op *EncryptedBlockHeaderOption) GetID() uint8 {
	return optionIdMask & op.id
}

func (op *EncryptedBlockHeaderOption) GetValue() []byte {
	return op.value
}

func (op *EncryptedBlockHeaderOption) SetIsTheLast(last bool) {
	if last {
		op.id = op.id | lastOptionFlag
	} else {
		op.id = op.id & 0x7F
	}
}

func (op *EncryptedBlockHeaderOption) SetId(id uint8) error {
	if id > optionIdMask {
		return errors.New("id value is greater than 0x3F")
	}
	op.id = id
	return nil
}

func (op *EncryptedBlockHeaderOption) SetValue(value []byte) error {
	l := len(value)
	if l > 0xFF {
		return errors.New("option value too big")
	}
	op.value = value
	return nil
}

func (op *EncryptedBlockHeaderOption) HasValue() bool {
	return op.id&noValueOptionFlag != noValueOptionFlag
}

func (op *EncryptedBlockHeaderOption) Read(reader io.Reader) (int, error) {

	buff := [1]byte{}
	_, err := reader.Read(buff[:])
	if err != nil {
		return 0, err
	}
	op.id = buff[0]

	if op.id&noValueOptionFlag == noValueOptionFlag {
		return 1, nil
	}

	_, err = reader.Read(buff[:])
	if err != nil {
		return 0, err
	}

	op.value = make([]byte, int(buff[0]))
	n, err := reader.Read(op.value)
	if err != nil {
		return 0, err
	}

	if n != int(buff[0]) {
		return 0, errors.New("expected more data")
	}
	return n + 2, nil
}

func (op *EncryptedBlockHeaderOption) Write(writer io.Writer) (int, error) {
	written := 0

	hasValue := op.value != nil || len(op.value) > 0
	if !hasValue {
		op.id = op.id | noValueOptionFlag
	}

	n, err := writer.Write([]byte{op.id})
	if err != nil {
		return 0, err
	}
	written += n

	if hasValue {
		n, err = writer.Write([]byte{uint8(len(op.value))})
		if err != nil {
			return 0, err
		}
		written += n

		n, err = writer.Write(op.value)
		if err != nil {
			return 0, err
		}
		written += n
	}

	return written, nil
}

// EncryptedBlockHeaderOptions
type Options struct {
	Position int16
	PartId   int16
	Key      []byte
	UserId   string
}

func (opts *Options) getHeaderOptions() []*EncryptedBlockHeaderOption {
	var options []*EncryptedBlockHeaderOption

	if opts.Key != nil {
		op := new(EncryptedBlockHeaderOption)
		op.id = optionKey
		op.value = opts.Key
		options = append(options, op)
	}

	if opts.Position > -1 {
		op := new(EncryptedBlockHeaderOption)
		op.id = optionPosition
		if opts.Position > 0 {
			val := make([]byte, 2)
			binary.BigEndian.PutUint16(val, uint16(opts.Position))
			op.value = val
		}
		options = append(options, op)
	}

	if opts.PartId > -1 {
		op := new(EncryptedBlockHeaderOption)
		op.id = optionPartId
		if opts.PartId > 0 {
			val := make([]byte, 2)
			binary.BigEndian.PutUint16(val, uint16(opts.PartId))
			op.value = val
		}
		options = append(options, op)
	}

	if opts.UserId != "" {
		op := new(EncryptedBlockHeaderOption)
		op.id = optionUserId
		op.value = []byte(opts.UserId)
		options = append(options, op)
	}

	return options
}

func (opts *Options) Read(reader io.Reader) (int, error) {
	totalRead := 0
	for {
		op := new(EncryptedBlockHeaderOption)
		n, err := op.Read(reader)
		if err != nil {
			return 0, err
		}
		totalRead += n

		id := op.GetID()
		switch id {
		case optionPartId:
			if op.HasValue() {
				opts.PartId = int16(binary.BigEndian.Uint16(op.GetValue()))
			}
		case optionUserId:
			opts.UserId = string(op.value)
		case optionPosition:
			if op.HasValue() {
				opts.Position = int16(binary.BigEndian.Uint16(op.GetValue()))
			}
		case optionKey:
			opts.Key = op.GetValue()
		}

		if op.IsTheLast() {
			break
		}
	}
	return totalRead, nil
}

func (opts *Options) Write(writer io.Writer) (int, error) {
	totalWritten := 0
	list := opts.getHeaderOptions()
	if list != nil && len(list) > 0 {
		list[len(list)-1].SetIsTheLast(true)
		for _, op := range list {
			n, err := op.Write(writer)
			if err != nil {
				return 0, err
			}
			totalWritten += n
		}
	}
	return totalWritten, nil
}

// EncryptionBlockHeader
type EncryptedBlockHeader struct {
	Options    *Options
	Nonce      []byte
	dataLength uint32
}

func (h *EncryptedBlockHeader) Write(writer io.Writer) (int, error) {
	totalWritten := 0

	n, err := writer.Write(h.Nonce)
	if err != nil {
		return 0, nil
	}
	totalWritten += n

	hasOptions := h.Options != nil
	lenBytes := make([]byte, 4)

	if hasOptions {
		h.dataLength = h.dataLength | headerOptionsFlag
	}
	binary.BigEndian.PutUint32(lenBytes, h.dataLength)
	n, err = writer.Write(lenBytes)
	if err != nil {
		return 0, nil
	}
	totalWritten += n

	if hasOptions {
		n, err = h.Options.Write(writer)
		if err != nil {
			return 0, err
		}
		totalWritten += n
	}

	return totalWritten, nil
}
func (h *EncryptedBlockHeader) Read(reader io.Reader) (int, error) {
	totalRead := 0

	h.Nonce = make([]byte, 12)
	n, err := reader.Read(h.Nonce)
	if err != nil {
		return 0, err
	}
	totalRead += n

	buff := make([]byte, 4)
	n, err = reader.Read(buff)
	if err != nil {
		return 0, err
	}
	totalRead += n
	h.dataLength = binary.BigEndian.Uint32(buff)

	hasOptions := h.dataLength&headerOptionsFlag == headerOptionsFlag
	if hasOptions {
		h.Options = new(Options)
		n, err = h.Options.Read(reader)
		if err != nil {
			return 0, err
		}
		totalRead += n
	}
	h.dataLength = h.dataLength & dataLengthMask
	return totalRead, nil
}
func (h *EncryptedBlockHeader) GetDataLength() uint32 {
	return h.dataLength & dataLengthMask
}
func (h *EncryptedBlockHeader) String() string {
	sb := strings.Builder{}
	sb.Write([]byte("\n[Header:\n"))
	if h.Options != nil {
		sb.Write([]byte("\t[Options:\n"))
		if h.Options.Key != nil {
			sb.Write([]byte(fmt.Sprintf("\t\t Key  : %s\n", base64.StdEncoding.EncodeToString(h.Options.Key))))
		}

		if h.Options.UserId != "" {
			sb.Write([]byte(fmt.Sprintf("\t\t Owner: %s\n", h.Options.UserId)))
		}

		if h.Options.PartId > -1 {
			sb.Write([]byte(fmt.Sprintf("\t\t Part : %d\n", h.Options.PartId)))
		}

		if h.Options.Position > -1 {
			sb.Write([]byte(fmt.Sprintf("\t\t Pos  : %d\n", h.Options.Position)))
		}
		sb.Write([]byte("\t]\n"))
	}
	sb.Write([]byte(fmt.Sprintf("\tNonce : %s\n", base64.StdEncoding.EncodeToString(h.Nonce))))
	sb.Write([]byte(fmt.Sprintf("\tLength: %d bytes\n", h.dataLength&dataLengthMask)))
	sb.Write([]byte("]"))
	return sb.String()
}

// EncryptedBlock
type EncryptedBlock struct {
	Header     *EncryptedBlockHeader
	HeaderSize uint32
	Payload    []byte
}

func (b *EncryptedBlock) SetPayload(payload []byte) error {
	l := len(payload)

	if uint32(l) > dataLengthMask {
		return errors.New("payload to big")
	}

	b.Payload = payload
	if b.Header == nil {
		b.Header = new(EncryptedBlockHeader)
	}

	b.Header.dataLength = (dataLengthMask & uint32(l)) | (b.Header.dataLength & headerOptionsFlag)
	return nil
}

func (b *EncryptedBlock) GetPayloadLength() uint32 {
	return b.Header.GetDataLength()
}

func (b *EncryptedBlock) Write(writer io.Writer) (int, error) {
	totalWritten := 0

	n, err := b.Header.Write(writer)
	if err != nil {
		return 0, err
	}

	totalWritten += n
	b.HeaderSize = uint32(totalWritten)

	n, err = writer.Write(b.Payload)
	if err != nil {
		return 0, err
	}
	totalWritten += n

	dataLine := fmt.Sprintf("Data hash 	   : %s\n", base64.StdEncoding.EncodeToString(Md5(b.Payload)))
	countLine := fmt.Sprintf("Total written : %d bytes\n", totalWritten)
	log.Printf("\n\n%s\n%s%s\n\n", b.Header.String(), dataLine, countLine)

	return totalWritten, err
}

func (b *EncryptedBlock) Read(reader io.Reader) (int, error) {
	totalRead := 0

	b.Header = new(EncryptedBlockHeader)
	n, err := b.Header.Read(reader)
	if err != nil {
		return 0, err
	}
	totalRead += n

	b.Payload = make([]byte, b.Header.GetDataLength())
	n, err = reader.Read(b.Payload)
	if err != nil {
		return 0, err
	}

	totalRead += n

	dataLine := fmt.Sprintf("Data hash 	   : %s\n", base64.StdEncoding.EncodeToString(Md5(b.Payload)))
	countLine := fmt.Sprintf("Total read    : %d bytes\n", totalRead)
	log.Printf("%s%s%s", b.Header.String(), dataLine, countLine)

	return totalRead, nil
}

// AESGCMEncryptionMaterials
type AESGCMEncryptionMaterials struct {
	stream            io.Reader
	eof               bool
	bufferedProcessed *bytes.Buffer

	encryptionKey      []byte
	encryptedBlockSize int32
	plainBlockSize     int32
	blockSizeFixed     bool
	nonceBytes         []byte
	nonceBuffer        *bytes.Buffer
	blockCount         int

	totalEncryptedRead    int64
	totalProcessedServed  int64
	plainRangeOffset      int64
	plainRangeLimit       int64
	plainDataStreamCursor int64

	reachedRangeLimit     bool
	encInfo               *encryption.NodeInfo
	encryptedBlockHandler BlockHandler

	mode int
}

// NewRangeAESGCMMaterials creates an encryption materials that use AES GCM
func NewAESGCMMaterials(key []byte, info *encryption.NodeInfo, blockHandler BlockHandler) *AESGCMEncryptionMaterials {
	m := new(AESGCMEncryptionMaterials)
	m.encryptionKey = key
	m.encInfo = info
	m.encryptedBlockHandler = blockHandler
	m.reachedRangeLimit = false
	if info.Node.Legacy {
		m.nonceBuffer = bytes.NewBuffer(info.Block.Nonce)
		m.nonceBytes = info.Block.Nonce
	}
	return m
}

func (m *AESGCMEncryptionMaterials) Close() error {
	closer, ok := m.stream.(io.Closer)
	if ok {
		return closer.Close()
	}
	return nil
}

func (m *AESGCMEncryptionMaterials) Read(b []byte) (int, error) {
	if m.mode == 1 {
		return m.encryptRead(b)
	} else if m.mode == 2 {
		if m.encInfo.Node.Legacy {
			return m.legacyDecryptRead(b)
		} else {
			return m.decryptRead(b)
		}
	} else {
		return 0, errors.New("no mode set")
	}
}

func (m *AESGCMEncryptionMaterials) SetPlainRange(offset, length int64) error {
	m.plainRangeOffset = offset
	if m.plainRangeOffset < 0 {
		return errors.New("negative offset value")
	}

	if length > 0 {
		m.plainRangeLimit = offset + length
	} else {
		m.plainRangeLimit = -1
	}
	return nil
}

func (m *AESGCMEncryptionMaterials) SetupEncryptMode(stream io.Reader) error {
	m.mode = 1
	m.stream = stream
	m.bufferedProcessed = bytes.NewBuffer([]byte{})
	return nil
}

func (m *AESGCMEncryptionMaterials) SetupDecryptMode(stream io.Reader) error {
	m.mode = 2
	m.bufferedProcessed = bytes.NewBuffer([]byte{})
	m.blockSizeFixed = true
	m.encryptedBlockSize = m.plainBlockSize + AESGCMAuthTagSize
	m.stream = stream
	m.eof = false
	m.blockCount = 0
	m.totalEncryptedRead = 0
	return nil
}

func (m *AESGCMEncryptionMaterials) legacyDecryptRead(b []byte) (int, error) {
	leftToRead := m.plainRangeLimit - m.plainRangeOffset - m.totalProcessedServed
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
		//check if there is available already Read and decrypted and buffered data from original stream
		if m.bufferedProcessed.Len() > 0 && !m.reachedRangeLimit {
			n, _ := m.bufferedProcessed.Read(b[totalPlainBytesRead:leftToRead])
			totalPlainBytesRead += n
			m.totalProcessedServed += int64(n)

			m.reachedRangeLimit = m.plainRangeLimit == m.plainRangeOffset+int64(m.totalProcessedServed)
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

		n, err := m.stream.Read(encryptedBuffer[encryptedBufferCursor:])
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
			_, err := m.nonceBuffer.Read(nonce)
			if err != nil {
				return 0, err
			}

			encryptedBufferPart := encryptedBuffer[:encryptedBufferCursor]
			opened, err := Open(m.encryptionKey, nonce, encryptedBufferPart)
			if err != nil {
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
			m.bufferedProcessed.Write(opened)
		}
	}
	return totalPlainBytesRead, nil
}

func (m *AESGCMEncryptionMaterials) encryptRead(b []byte) (int, error) {
	totalRead := 0
	l := len(b)

	for totalRead < l {
		availableData := m.bufferedProcessed.Len()
		if availableData > 0 {
			n, _ := m.bufferedProcessed.Read(b[totalRead:])
			totalRead += n
			if totalRead == l {
				return totalRead, nil
			}
		} else if m.eof {
			return totalRead, io.EOF
		}

		if !m.eof {
			// prepare the next block
			buff := make([]byte, defaultBlockSIze)
			count, err := m.stream.Read(buff)
			if err != nil {
				m.eof = err == io.EOF
				if !m.eof {
					return 0, err
				}
			}

			if count > 0 {
				buff = buff[:count]
				nonce := make([]byte, AESGCMNonceSize)
				_, _ = rand.Read(nonce)

				log.Printf("Encryption key: %s\n", base64.StdEncoding.EncodeToString(m.encryptionKey))

				data, err := SealWithNonce(m.encryptionKey, nonce, buff)
				if err != nil {
					return 0, err
				}

				h := new(EncryptedBlockHeader)
				h.Nonce = nonce
				h.Options = new(Options)
				h.Options.Key = m.encInfo.NodeKey.KeyData
				h.Options.UserId = m.encInfo.NodeKey.OwnerId

				b := &EncryptedBlock{}
				b.Header = h
				err = b.SetPayload(data)
				if err != nil {
					return 0, err
				}

				_, _ = b.Write(m.bufferedProcessed)
				if m.encryptedBlockHandler != nil {
					go func() {
						_ = m.encryptedBlockHandler.Handle(
							&encryption.Block{
								BlockSize:  uint32(len(b.Payload)),
								HeaderSize: b.HeaderSize,
								OwnerId:    m.encInfo.NodeKey.OwnerId,
								Nonce:      nonce,
							})
					}()
				}
			}
		}
	}
	return totalRead, nil
}

func (m *AESGCMEncryptionMaterials) decryptRead(b []byte) (int, error) {
	totalRead := 0
	l := len(b)
	leftToRead := int(m.plainRangeLimit - m.plainRangeOffset - m.totalProcessedServed)
	if leftToRead <= 0 || leftToRead > l {
		leftToRead = l
	}

	for totalRead < l {
		availableData := m.bufferedProcessed.Len()
		if availableData > 0 && !m.reachedRangeLimit {
			n, _ := m.bufferedProcessed.Read(b[totalRead:leftToRead])
			totalRead += n
			m.totalProcessedServed += int64(n)

			m.reachedRangeLimit = m.plainRangeLimit == m.plainRangeOffset+int64(m.totalProcessedServed)
			if leftToRead == l || m.reachedRangeLimit {
				return totalRead, nil
			}

		} else if m.eof || m.reachedRangeLimit {
			//we leave if we reached the limit or the end of original stream
			return totalRead, io.EOF

		} else if m.plainDataStreamCursor > 0 && m.plainDataStreamCursor == m.plainRangeLimit {
			m.reachedRangeLimit = true
			return totalRead, io.EOF
		}

		if !m.eof {
			log.Printf("Decryption key: %s\n", base64.StdEncoding.EncodeToString(m.encryptionKey))
			// decrypt the next block
			b := &EncryptedBlock{}
			count, err := b.Read(m.stream)
			if err != nil {
				m.eof = err == io.EOF
				if !m.eof {
					return 0, err
				}
			}
			if count > 0 {
				data, err := Open(m.encryptionKey, b.Header.Nonce, b.Payload)
				if err != nil {
					return 0, err
				}

				// We skip out of range data
				if m.plainDataStreamCursor < m.plainRangeOffset {
					bytesToConsumeSize := int(m.plainRangeOffset - m.plainDataStreamCursor)
					if bytesToConsumeSize > len(data) {
						m.plainDataStreamCursor = m.plainDataStreamCursor + int64(len(data))
						data = data[0:0]
					} else {
						m.plainDataStreamCursor = m.plainDataStreamCursor + int64(bytesToConsumeSize)
						data = data[bytesToConsumeSize:]
					}
				}
				m.bufferedProcessed.Write(data)
			}
		}
	}
	return totalRead, nil
}
