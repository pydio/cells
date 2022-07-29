package hasher

import (
	"encoding/hex"
	"hash"
	"io"

	"github.com/pydio/cells/v4/common"
)

const (
	DefaultBlockSize = 10 * 1024 * 1024
)

type HashCloser interface {
	Close()
}

// BlockHash is a hash.Hash implementation that compute sub-hashes on each blocks of BlockSize and re-hash them together
// at the end. It is uses to provide a stable hashing algorithm for standard PUT Object requests vs Multipart Uploads.
// Bewre that this implies that the Multipart PartSize must be a multiple of this block size.
type BlockHash struct {
	hash.Hash
	blockSize int

	writtenSize int
	totalSize   int
	blocks      [][]byte
}

func NewBlockHash(h hash.Hash, blockSize int) *BlockHash {
	return &BlockHash{
		Hash:      h,
		blockSize: blockSize,
	}
}

func (b *BlockHash) Write(p []byte) (n int, err error) {
	n1 := len(p)
	for {
		if b.writtenSize+len(p) > b.blockSize {
			// Split in two parts: hash current, reset and enqueue the rest
			split := b.blockSize - b.writtenSize
			b.Next(p[:split])
			p = p[split:]
		} else {
			break
		}
	}
	n, e := b.Hash.Write(p)
	if e != nil {
		return 0, e
	}
	b.writtenSize += n
	b.totalSize += n
	return n1, nil
}

func (b *BlockHash) Next(p []byte) {
	n, _ := b.Hash.Write(p)
	b.totalSize += n
	b.blocks = append(b.blocks, b.Hash.Sum(nil))
	b.Hash.Reset()
	b.writtenSize = 0
}

func (b *BlockHash) Sum(p []byte) []byte {
	b.Next(p)
	for _, bl := range b.blocks {
		b.Hash.Write(bl)
	}
	if closer, ok := b.Hash.(HashCloser); ok {
		defer closer.Close()
	}
	return b.Hash.Sum(nil)
}

func (b *BlockHash) Reset() {
	b.Hash.Reset()
	b.blocks = [][]byte{}
	b.writtenSize = 0
}

type Reader struct {
	io.Reader
	hash.Hash
	complete func(string, [][]byte)
	done     bool
	total    int

	final string
}

func (r *Reader) Read(p []byte) (n int, err error) {
	n, err = r.Reader.Read(p)
	r.total += n
	if r.done {
		return
	}
	if n > 0 {
		r.Hash.Write(p[:n])
	}
	if err == io.EOF {
		r.done = true
		bb := r.Hash.Sum(nil)
		r.final = hex.EncodeToString(bb)
		if r.complete != nil {
			var blocks [][]byte
			if bh, ok := r.Hash.(*BlockHash); ok {
				blocks = bh.blocks
			}
			r.complete(r.final, blocks)
		}
	}
	return
}

func (r *Reader) ExtractedMeta() (map[string]string, bool) {
	meta := map[string]string{}
	if ex, o := r.Reader.(common.ReaderMetaExtractor); o {
		if mm, ok := ex.ExtractedMeta(); ok {
			meta = mm
		}
	}
	if r.done && r.final != "" {
		meta[common.MetaNamespaceHash] = r.final
	}
	if len(meta) > 0 {
		return meta, true
	}
	return nil, false
}

func Tee(reader io.Reader, hashFunc func() hash.Hash, complete func(s string, hashes [][]byte)) io.Reader {
	return &Reader{
		Reader:   reader,
		Hash:     hashFunc(),
		complete: complete,
	}
}
