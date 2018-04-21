package zipstream

// Everything in this file was blatently stolen from golang.org/pkg/archive/zip

// Copyright 2010 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import (
	"compress/flate"
	"encoding/binary"
	"io"
	"io/ioutil"
	"sync"
)

// #### struct.go

// Compression methods.
const (
	Store   uint16 = 0
	Deflate uint16 = 8
)

const (
	fileHeaderSignature      = 0x04034b50
	directoryHeaderSignature = 0x02014b50
	directoryEndSignature    = 0x06054b50
	directory64LocSignature  = 0x07064b50
	directory64EndSignature  = 0x06064b50
	dataDescriptorSignature  = 0x08074b50 // de-facto standard; required by OS X Finder
	fileHeaderLen            = 30         // + filename + extra
	directoryHeaderLen       = 46         // + filename + extra + comment
	directoryEndLen          = 22         // + comment
	dataDescriptorLen        = 16         // four uint32: descriptor signature, crc32, compressed size, size
	dataDescriptor64Len      = 24         // descriptor with 8 byte sizes
	directory64LocLen        = 20         //
	directory64EndLen        = 56         // + extra

	// Constants for the first byte in CreatorVersion
	creatorFAT    = 0
	creatorUnix   = 3
	creatorNTFS   = 11
	creatorVFAT   = 14
	creatorMacOSX = 19

	// version numbers
	zipVersion20 = 20 // 2.0
	zipVersion45 = 45 // 4.5 (reads and writes zip64 archives)

	// limits for non zip64 files
	uint16max = (1 << 16) - 1
	uint32max = (1 << 32) - 1

	// extra header id's
	zip64ExtraId = 0x0001 // zip64 Extended Information Extra Field
)

// #### register.go

// Decompressor is a function that wraps a Reader with a decompressing Reader.
// The decompressed ReadCloser is returned to callers who open files from
// within the archive.  These callers are responsible for closing this reader
// when they're finished reading.
type Decompressor func(io.Reader) io.ReadCloser

var (
	mu sync.RWMutex // guards compressor and decompressor maps

	decompressors = map[uint16]Decompressor{
		Store:   ioutil.NopCloser,
		Deflate: flate.NewReader,
	}
)

// RegisterDecompressor allows custom decompressors for a specified method ID.
func RegisterDecompressor(method uint16, d Decompressor) {
	mu.Lock()
	defer mu.Unlock()

	if _, ok := decompressors[method]; ok {
		panic("decompressor already registered")
	}
	decompressors[method] = d
}

func decompressor(method uint16) Decompressor {
	mu.RLock()
	defer mu.RUnlock()
	return decompressors[method]
}

// #### reader.go

type readBuf []byte

func (b *readBuf) uint16() uint16 {
	v := binary.LittleEndian.Uint16(*b)
	*b = (*b)[2:]
	return v
}

func (b *readBuf) uint32() uint32 {
	v := binary.LittleEndian.Uint32(*b)
	*b = (*b)[4:]
	return v
}

func (b *readBuf) uint64() uint64 {
	v := binary.LittleEndian.Uint64(*b)
	*b = (*b)[8:]
	return v
}
