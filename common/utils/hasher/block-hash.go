package hasher

import (
	"encoding/hex"
	"hash"
	"io"
)

const (
	DefaultBlockSize = 5 * 1024 * 1024
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
	complete func(string)
	done     bool
	total    int
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
		// fmt.Println("Complete on total", r.total)
		bb := r.Hash.Sum(nil)
		if r.complete != nil {
			r.complete(hex.EncodeToString(bb))
		}
	}
	return
}

func Tee(reader io.Reader, hashFunc func() hash.Hash, complete func(s string)) io.Reader {
	return &Reader{
		Reader:   reader,
		Hash:     hashFunc(),
		complete: complete,
	}
}
