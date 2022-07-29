package simd

import (
	"hash"
	"sync"

	md5simd "github.com/minio/md5-simd"
)

var (
	mServer     md5simd.Server
	mServerOnce sync.Once
)

func MD5() hash.Hash {
	mServerOnce.Do(func() {
		mServer = md5simd.NewServer()
	})
	return mServer.NewHash()
}
