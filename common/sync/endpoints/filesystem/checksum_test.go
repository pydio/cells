/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package filesystem

import (
	"encoding/hex"
	"io"
	"log"
	"math/rand"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"github.com/pydio/cells/v4/common/utils/hasher"
	"github.com/pydio/cells/v4/common/utils/hasher/simd"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func createFakeData() (out []string) {
	tmpDir := os.TempDir()
	for i := 0; i < 100; i++ {
		tmpName := filepath.Join(tmpDir, uuid.New())
		// Write fake data
		p := make([]byte, 1024*1024*4)
		rand.Read(p)
		if e := os.WriteFile(tmpName, p, 0777); e == nil {
			out = append(out, tmpName)
		}
	}
	return
}

func computeChecksum(filename string) (string, error) {
	file, err := os.Open(filename)
	if err != nil {
		return "", err
	}
	defer file.Close()
	bufSize := int64(1 * 1024 * 1024)
	buf := make([]byte, int(bufSize))
	md5Writer := hasher.NewBlockHash(simd.MD5(), hasher.DefaultBlockSize)
	io.CopyBuffer(md5Writer, file, buf)
	checksum := hex.EncodeToString(md5Writer.Sum(nil))
	return checksum, nil
}

func TestSequentialChecksums(t *testing.T) {
	files := createFakeData()
	defer func() {
		for _, f := range files {
			os.Remove(f)
		}
	}()
	start := time.Now()
	for _, f := range files {
		_, e := computeChecksum(f)
		if e != nil {
			log.Fatal(e)
		}
	}
	d := time.Now().Sub(start)
	log.Printf("Took %v for computing %d checksums sequentially\n", d, len(files))
}

func TestParallelChecksums(t *testing.T) {
	files := createFakeData()
	defer func() {
		for _, f := range files {
			os.Remove(f)
		}
	}()
	start := time.Now()
	wg := &sync.WaitGroup{}
	wg.Add(len(files))
	throttle := make(chan struct{}, 10)
	for _, f := range files {
		fName := f
		go func() {
			defer wg.Done()
			throttle <- struct{}{}
			defer func() {
				<-throttle
			}()
			_, e := computeChecksum(fName)
			if e != nil {
				log.Fatal(e)
			}
		}()
	}
	wg.Wait()
	d := time.Now().Sub(start)
	log.Printf("Took %v for computing %d checksums in parallel\n", d, len(files))

}
