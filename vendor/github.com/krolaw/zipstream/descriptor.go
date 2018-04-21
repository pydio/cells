package zipstream

import (
	"archive/zip"
	"bufio"
	"bytes"
	"encoding/binary"
	"io"
)

type descriptorReader struct {
	br         *bufio.Reader
	size       uint64
	eof        bool
	fileHeader *zip.FileHeader
}

var (
	sigBytes = []byte{0x50, 0x4b}
)

func (r *descriptorReader) Read(p []byte) (n int, err error) {
	if r.eof {
		return 0, io.EOF
	}

	if n = len(p); n > maxRead {
		n = maxRead
	}

	z, err := r.br.Peek(n + readAhead)
	if err != nil {
		if err == io.EOF && len(z) < 46+22 { // Min length of Central directory + End of central directory
			return 0, err
		}
		n = len(z)
	}

	// Look for header of next file or central directory
	discard := n
	s := 16
	for !r.eof && s < n {
		i := bytes.Index(z[s:len(z)-4], sigBytes) + s
		if i == -1 {
			break
		}

		// If directoryHeaderSignature or fileHeaderSignature file could be finished
		if sig := binary.LittleEndian.Uint32(z[i : i+4]); sig == fileHeaderSignature ||
			sig == directoryHeaderSignature {

			// Now check for compressed file sizes to ensure not false positive and if zip64.

			if i < len(z)-8 { // Zip32
				// Zip32 optional dataDescriptorSignature
				offset := 0
				if binary.LittleEndian.Uint32(z[i-16:i-12]) == dataDescriptorSignature {
					offset = 4
				}

				// Zip32 compressed file size
				if binary.LittleEndian.Uint32(z[i-8:i-4]) == uint32(r.size)+uint32(i-12-offset) {
					n, discard = i-12-offset, i
					r.eof = true
					r.fileHeader.CRC32 = binary.LittleEndian.Uint32(z[i-12 : i-8])
					break
				}
			}

			if i > 24 {
				// Zip64 optional dataDescriptorSignature
				offset := 0
				if binary.LittleEndian.Uint32(z[i-24:i-20]) == dataDescriptorSignature {
					offset = 4
				}

				// Zip64 compressed file size
				if i >= 8 && binary.LittleEndian.Uint64(z[i-16:i-8]) == r.size+uint64(i-20-offset) {
					n, discard = i-20-offset, i
					r.eof = true
					break
				}
			}
		}

		s = i + 2
	}
	copy(p, z[:n])
	r.br.Discard(discard)
	r.size += uint64(n)
	return
}
