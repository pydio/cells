package hasher

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"hash"
	"io"
	"os"
	"testing"

	// Silently import convey to ease implementation
	. "github.com/smartystreets/goconvey/convey"
)

type testSuite struct {
	hasher        func() hash.Hash
	fileName      string
	blockSize     int
	expectedParts []int
}

func testFunc(suite testSuite, t *testing.T) {
	Convey("Test Block Hasher", t, func() {

		b := NewBlockHash(suite.hasher(), suite.blockSize)
		f, e := os.Open("./testdata/" + suite.fileName)
		So(e, ShouldBeNil)
		defer f.Close()

		// Precompute parts for reference
		all, _ := io.ReadAll(f)
		_, _ = f.Seek(0, 0)
		m := suite.hasher()
		global := suite.hasher()
		for _, p := range suite.expectedParts {
			var compute []byte
			if p == -1 {
				compute = all
			} else {
				compute = all[0:p]
				all = all[p:]
			}
			m.Write(compute)
			pSum := m.Sum(nil)
			global.Write(pSum)
			m.Reset()
			//fmt.Println("Part computed", p, hex.EncodeToString(pSum))
		}
		final := hex.EncodeToString(global.Sum(nil))

		// Now compute using hasher
		_, e = io.Copy(b, f)
		So(e, ShouldBeNil)
		output := b.Sum(nil)
		outString := hex.EncodeToString(output)
		fmt.Println(outString)

		So(outString, ShouldEqual, final)

		// Rewind and do the same with the wrapped reader
		b.Reset()
		_, _ = f.Seek(0, 0)
		reader := Tee(f, func() hash.Hash {
			return NewBlockHash(suite.hasher(), suite.blockSize)
		}, "", func(s string, _ [][]byte) {
			fmt.Println("Wrap Complete", s)
			So(s, ShouldEqual, outString)
		})
		_, _ = io.ReadAll(reader)

	})

}

func TestBlockHasher(t *testing.T) {

	m := func() hash.Hash {
		return md5.New()
	}

	testFunc(testSuite{
		hasher:        m,
		fileName:      "100kB.data",
		blockSize:     30 * 1024,
		expectedParts: []int{30 * 1024, 30 * 1024, 30 * 1024, -1},
	}, t)

	testFunc(testSuite{
		hasher:        m,
		fileName:      "20kB.data",
		blockSize:     20 * 1024,
		expectedParts: []int{-1},
	}, t)

	testFunc(testSuite{
		hasher:        m,
		fileName:      "100kB.data",
		blockSize:     32768,
		expectedParts: []int{32768, 32768, 32768, -1},
	}, t)

	testFunc(testSuite{
		hasher:        m,
		fileName:      "100kB.data",
		blockSize:     10 * 1024,
		expectedParts: []int{10 * 1024, 10 * 1024, 10 * 1024, 10 * 1024, 10 * 1024, 10 * 1024, 10 * 1024, 10 * 1024, 10 * 1024, -1},
	}, t)

	testFunc(testSuite{
		hasher:        m,
		fileName:      "100kB.data",
		blockSize:     40 * 1024,
		expectedParts: []int{40 * 1024, 40 * 1024, -1},
	}, t)

	testFunc(testSuite{
		hasher:        m,
		fileName:      "100kB.data",
		blockSize:     100 * 1024,
		expectedParts: []int{-1},
	}, t)

	testFunc(testSuite{
		hasher:        m,
		fileName:      "100kB.data",
		blockSize:     200 * 1024,
		expectedParts: []int{-1},
	}, t)

}
