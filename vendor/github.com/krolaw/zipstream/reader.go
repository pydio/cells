// Package zipstream provides support for reading ZIP archives through an io.Reader.
//
// Zip64 archives are not yet supported.
package zipstream

import (
	"archive/zip"
	"bufio"
	"encoding/binary"
	"hash/crc32"
	"io"
	"io/ioutil"
)

const (
	readAhead  = 28
	maxRead    = 4096
	bufferSize = maxRead + readAhead
)

// A Reader provides sequential access to the contents of a zip archive.
// A zip archive consists of a sequence of files,
// The Next method advances to the next file in the archive (including the first),
// and then it can be treated as an io.Reader to access the file's data.
type Reader struct {
	io.Reader
	br *bufio.Reader
}

// NewReader creates a new Reader reading from r.
func NewReader(r io.Reader) *Reader {
	return &Reader{br: bufio.NewReaderSize(r, bufferSize)}
}

// Next advances to the next entry in the zip archive.
//
// io.EOF is returned when the end of the zip file has been reached.
func (r *Reader) Next() (*zip.FileHeader, error) {
	if r.Reader != nil {
		if _, err := io.Copy(ioutil.Discard, r.Reader); err != nil {
			return nil, err
		}
	}
	sigBytes, err := r.br.Peek(4)
	if err != nil {
		return nil, err
	}

	switch sig := binary.LittleEndian.Uint32(sigBytes); sig {
	case fileHeaderSignature:
		break
	case directoryHeaderSignature: // Directory appears at end of file so we are finished
		return nil, discardCentralDirectory(r.br)
	default:
		return nil, zip.ErrFormat
	}

	headBuf := make([]byte, fileHeaderLen)
	if _, err := io.ReadFull(r.br, headBuf); err != nil {
		return nil, err
	}
	b := readBuf(headBuf[4:])

	f := &zip.FileHeader{
		ReaderVersion:    b.uint16(),
		Flags:            b.uint16(),
		Method:           b.uint16(),
		ModifiedTime:     b.uint16(),
		ModifiedDate:     b.uint16(),
		CRC32:            b.uint32(),
		CompressedSize:   b.uint32(), // TODO handle zip64
		UncompressedSize: b.uint32(), // TODO handle zip64
	}

	filenameLen := b.uint16()
	extraLen := b.uint16()

	d := make([]byte, filenameLen+extraLen)
	if _, err := io.ReadFull(r.br, d); err != nil {
		return nil, err
	}
	f.Name = string(d[:filenameLen])
	f.Extra = d[filenameLen : filenameLen+extraLen]

	dcomp := decompressor(f.Method)
	if dcomp == nil {
		return nil, zip.ErrAlgorithm
	}

	// TODO handle encryption here
	crc := &crcReader{
		hash: crc32.NewIEEE(),
		crc:  &f.CRC32,
	}
	if f.Flags&0x8 != 0 { // If has dataDescriptor
		crc.Reader = dcomp(&descriptorReader{br: r.br, fileHeader: f})
	} else {
		crc.Reader = dcomp(io.LimitReader(r.br, int64(f.CompressedSize)))
		crc.crc = &f.CRC32
	}
	r.Reader = crc
	return f, nil
}
