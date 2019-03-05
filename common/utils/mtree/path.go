package mtree

import (
	"hash/fnv"
	"math/big"
	"strconv"
	"sync"
)

var (
	mpathCache = make(map[*MPath]string)

	mpathMutex = &sync.RWMutex{}
)

type MPathProvider interface {
}

// MPath type struct
type MPath []uint64

// NewMPath from mpath
func NewMPath(mpath ...uint64) MPath {
	return MPath(mpath)
}

// NewMPathFromMPath returns a copy of a slice
func NewMPathFromMPath(b MPath) MPath {
	c := make(MPath, len(b))
	copy(c, b)
	return c
}

// String representation of a mpath
func (m MPath) String() string {
	if len(m) == 0 {
		return ""
	}

	s := strconv.FormatUint(m[0], 10)
	for i := 1; i < len(m); i++ {
		s = s + "." + strconv.FormatUint(m[i], 10)
	}

	return s
}

func (m MPath) Hash() uint32 {
	h := fnv.New32a()
	h.Write([]byte(m.String()))
	return h.Sum32()
}

func (m MPath) Index() uint64 {
	return m[len(m)-1]
}

// Sibling of a specific path
func (m MPath) Sibling() MPath {
	spath := make([]uint64, len(m)-1)
	copy(spath, m[0:len(m)-1])
	return append(spath, m[len(m)-1]+1)
}

// Parent of a specific path
func (m MPath) Parent() MPath {
	return m[0 : len(m)-1]
}

func (m MPath) Parents() []MPath {
	var mpathes []MPath
	for i := 0; i < len(m)-1; i++ {
		mpathes = append(mpathes, m[0:i+1])
	}

	return mpathes
}

// Rat representation of a materialized path
func (m MPath) Rat() *Rat {
	id := new(big.Float)
	//id.SetPrec(512)
	id.SetRat(NewFractionFromMaterializedPath(m...).Decimal())

	b, _ := id.GobEncode()

	// Getting Matrix ID and SID Mantissa
	rat := new(Rat)
	rat.GobDecode(b)

	return rat
}
