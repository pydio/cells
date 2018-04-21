package zipstream

import (
	"archive/zip"
	"hash"
	"io"
)

type crcReader struct {
	io.Reader
	hash hash.Hash32
	crc  *uint32
}

func (r *crcReader) Read(b []byte) (n int, err error) {
	n, err = r.Reader.Read(b)
	r.hash.Write(b[:n])
	if err == nil {
		return
	}
	if err == io.EOF {
		if r.crc != nil && *r.crc != 0 && r.hash.Sum32() != *r.crc {
			err = zip.ErrChecksum
		}
	}
	return
}
