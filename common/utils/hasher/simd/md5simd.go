package simd

import (
	"crypto/md5"
	"hash"
	"os"
	"sync"

	md5simd "github.com/minio/md5-simd"
)

var (
	mServer     md5simd.Server
	mServerOnce sync.Once
)

func MD5() hash.Hash {
	if os.Getenv("CELLS_ENABLE_SIMDMD5") != ""{
		mServerOnce.Do(func() {
			mServer = md5simd.NewServer()
		})
		return mServer.NewHash()
	}
	return md5.New()
}
