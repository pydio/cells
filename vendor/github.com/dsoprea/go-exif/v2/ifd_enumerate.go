package exif

import (
	"bytes"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"encoding/binary"

	"github.com/dsoprea/go-logging"

	"github.com/dsoprea/go-exif/v2/common"
	"github.com/dsoprea/go-exif/v2/undefined"
)

var (
	ifdEnumerateLogger = log.NewLogger("exifjpeg.ifd")
)

var (
	// ErrNoThumbnail means that no thumbnail was found.
	ErrNoThumbnail = errors.New("no thumbnail")

	// ErrNoGpsTags means that no GPS info was found.
	ErrNoGpsTags = errors.New("no gps tags")

	// ErrTagTypeNotValid means that the tag-type is not valid.
	ErrTagTypeNotValid = errors.New("tag type invalid")

	// ErrOffsetInvalid means that the file offset is not valid.
	ErrOffsetInvalid = errors.New("file offset invalid")
)

var (
	ValidGpsVersions = [][4]byte{
		// 2.0.0.0 appears to have a very similar format to 2.2.0.0, so enabling
		// it under that assumption.
		//
		// IFD-PATH=[IFD] ID=(0x8825) NAME=[GPSTag] COUNT=(1) TYPE=[LONG] VALUE=[114]
		// IFD-PATH=[IFD/GPSInfo] ID=(0x0000) NAME=[GPSVersionID] COUNT=(4) TYPE=[BYTE] VALUE=[02 00 00 00]
		// IFD-PATH=[IFD/GPSInfo] ID=(0x0001) NAME=[GPSLatitudeRef] COUNT=(2) TYPE=[ASCII] VALUE=[S]
		// IFD-PATH=[IFD/GPSInfo] ID=(0x0002) NAME=[GPSLatitude] COUNT=(3) TYPE=[RATIONAL] VALUE=[38/1...]
		// IFD-PATH=[IFD/GPSInfo] ID=(0x0003) NAME=[GPSLongitudeRef] COUNT=(2) TYPE=[ASCII] VALUE=[E]
		// IFD-PATH=[IFD/GPSInfo] ID=(0x0004) NAME=[GPSLongitude] COUNT=(3) TYPE=[RATIONAL] VALUE=[144/1...]
		// IFD-PATH=[IFD/GPSInfo] ID=(0x0012) NAME=[GPSMapDatum] COUNT=(7) TYPE=[ASCII] VALUE=[WGS-84]
		//
		{2, 0, 0, 0},

		{2, 2, 0, 0},

		// Suddenly appeared at the default in 2.31: https://home.jeita.or.jp/tsc/std-pdf/CP-3451D.pdf
		//
		// Note that the presence of 2.3.0.0 doesn't seem to guarantee
		// coordinates. In some cases, we seen just the following:
		//
		// GPS Tag Version     |2.3.0.0
		// GPS Receiver Status |V
		// Geodetic Survey Data|WGS-84
		// GPS Differential Cor|0
		//
		{2, 3, 0, 0},
	}
)

// IfdTagEnumerator knows how to decode an IFD and all of the tags it
// describes.
//
// The IFDs and the actual values can float throughout the EXIF block, but the
// IFD itself is just a minor header followed by a set of repeating,
// statically-sized records. So, the tags (though notnecessarily their values)
// are fairly simple to enumerate.
type IfdTagEnumerator struct {
	byteOrder       binary.ByteOrder
	addressableData []byte
	ifdOffset       uint32
	buffer          *bytes.Buffer
}

func NewIfdTagEnumerator(addressableData []byte, byteOrder binary.ByteOrder, ifdOffset uint32) (enumerator *IfdTagEnumerator, err error) {
	if ifdOffset >= uint32(len(addressableData)) {
		return nil, ErrOffsetInvalid
	}

	enumerator = &IfdTagEnumerator{
		addressableData: addressableData,
		byteOrder:       byteOrder,
		buffer:          bytes.NewBuffer(addressableData[ifdOffset:]),
	}

	return enumerator, nil
}

// getUint16 reads a uint16 and advances both our current and our current
// accumulator (which allows us to know how far to seek to the beginning of the
// next IFD when it's time to jump).
func (ife *IfdTagEnumerator) getUint16() (value uint16, raw []byte, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	needBytes := 2
	offset := 0
	raw = make([]byte, needBytes)

	for offset < needBytes {
		n, err := ife.buffer.Read(raw[offset:])
		log.PanicIf(err)

		offset += n
	}

	value = ife.byteOrder.Uint16(raw)

	return value, raw, nil
}

// getUint32 reads a uint32 and advances both our current and our current
// accumulator (which allows us to know how far to seek to the beginning of the
// next IFD when it's time to jump).
func (ife *IfdTagEnumerator) getUint32() (value uint32, raw []byte, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	needBytes := 4
	offset := 0
	raw = make([]byte, needBytes)

	for offset < needBytes {
		n, err := ife.buffer.Read(raw[offset:])
		log.PanicIf(err)

		offset += n
	}

	value = ife.byteOrder.Uint32(raw)

	return value, raw, nil
}

type IfdEnumerate struct {
	exifData      []byte
	buffer        *bytes.Buffer
	byteOrder     binary.ByteOrder
	currentOffset uint32
	tagIndex      *TagIndex
	ifdMapping    *IfdMapping
}

func NewIfdEnumerate(ifdMapping *IfdMapping, tagIndex *TagIndex, exifData []byte, byteOrder binary.ByteOrder) *IfdEnumerate {
	return &IfdEnumerate{
		exifData:   exifData,
		buffer:     bytes.NewBuffer(exifData),
		byteOrder:  byteOrder,
		ifdMapping: ifdMapping,
		tagIndex:   tagIndex,
	}
}

func (ie *IfdEnumerate) getTagEnumerator(ifdOffset uint32) (enumerator *IfdTagEnumerator, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	enumerator, err =
		NewIfdTagEnumerator(
			ie.exifData[ExifAddressableAreaStart:],
			ie.byteOrder,
			ifdOffset)

	if err != nil {
		if err == ErrOffsetInvalid {
			return nil, err
		}

		log.Panic(err)
	}

	return enumerator, nil
}

func (ie *IfdEnumerate) parseTag(fqIfdPath string, tagPosition int, enumerator *IfdTagEnumerator) (ite *IfdTagEntry, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	tagId, _, err := enumerator.getUint16()
	log.PanicIf(err)

	tagTypeRaw, _, err := enumerator.getUint16()
	log.PanicIf(err)

	tagType := exifcommon.TagTypePrimitive(tagTypeRaw)

	unitCount, _, err := enumerator.getUint32()
	log.PanicIf(err)

	valueOffset, rawValueOffset, err := enumerator.getUint32()
	log.PanicIf(err)

	if tagType.IsValid() == false {
		log.Panic(ErrTagTypeNotValid)
	}

	ifdPath, err := ie.ifdMapping.StripPathPhraseIndices(fqIfdPath)
	log.PanicIf(err)

	ite = newIfdTagEntry(
		ifdPath,
		tagId,
		tagPosition,
		tagType,
		unitCount,
		valueOffset,
		rawValueOffset,
		ie.exifData[ExifAddressableAreaStart:],
		ie.byteOrder)

	// If it's an IFD but not a standard one, it'll just be seen as a LONG
	// (the standard IFD tag type), later, unless we skip it because it's
	// [likely] not even in the standard list of known tags.
	mi, err := ie.ifdMapping.GetChild(ifdPath, tagId)
	if err == nil {
		ite.SetChildIfd(
			fmt.Sprintf("%s/%s", fqIfdPath, mi.Name),
			mi.PathPhrase(),
			mi.Name)

		// We also need to set `tag.ChildFqIfdPath` but can't do it here
		// because we don't have the IFD index.
	} else if log.Is(err, ErrChildIfdNotMapped) == false {
		log.Panic(err)
	}

	return ite, nil
}

// TagVisitorFn is called for each tag when enumerating through the EXIF.
type TagVisitorFn func(fqIfdPath string, ifdIndex int, ite *IfdTagEntry) (err error)

// ParseIfd decodes the IFD block that we're currently sitting on the first
// byte of.
func (ie *IfdEnumerate) ParseIfd(fqIfdPath string, ifdIndex int, enumerator *IfdTagEnumerator, visitor TagVisitorFn, doDescend bool) (nextIfdOffset uint32, entries []*IfdTagEntry, thumbnailData []byte, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	tagCount, _, err := enumerator.getUint16()
	log.PanicIf(err)

	ifdEnumerateLogger.Debugf(nil, "Current IFD tag-count: (%d)", tagCount)

	entries = make([]*IfdTagEntry, 0)

	var enumeratorThumbnailOffset *IfdTagEntry
	var enumeratorThumbnailSize *IfdTagEntry

	for i := 0; i < int(tagCount); i++ {
		ite, err := ie.parseTag(fqIfdPath, i, enumerator)
		if err != nil {
			if log.Is(err, ErrTagTypeNotValid) == true {
				ifdEnumerateLogger.Warningf(nil, "Tag in IFD [%s] at position (%d) has invalid type and will be skipped.", fqIfdPath, i)
				continue
			}

			log.Panic(err)
		}

		tagId := ite.TagId()
		if tagId == ThumbnailOffsetTagId {
			enumeratorThumbnailOffset = ite

			continue
		} else if tagId == ThumbnailSizeTagId {
			enumeratorThumbnailSize = ite
			continue
		}

		if visitor != nil {
			err := visitor(fqIfdPath, ifdIndex, ite)
			log.PanicIf(err)
		}

		// If it's an IFD but not a standard one, it'll just be seen as a LONG
		// (the standard IFD tag type), later, unless we skip it because it's
		// [likely] not even in the standard list of known tags.
		if ite.ChildIfdPath() != "" {
			if doDescend == true {
				ifdEnumerateLogger.Debugf(nil, "Descending to IFD [%s].", ite.ChildIfdPath())

				err := ie.scan(ite.ChildFqIfdPath(), ite.getValueOffset(), visitor)
				log.PanicIf(err)
			}
		}

		entries = append(entries, ite)
	}

	if enumeratorThumbnailOffset != nil && enumeratorThumbnailSize != nil {
		thumbnailData, err = ie.parseThumbnail(enumeratorThumbnailOffset, enumeratorThumbnailSize)
		log.PanicIf(err)
	}

	nextIfdOffset, _, err = enumerator.getUint32()
	log.PanicIf(err)

	ifdEnumerateLogger.Debugf(nil, "Next IFD at offset: (%08x)", nextIfdOffset)

	return nextIfdOffset, entries, thumbnailData, nil
}

func (ie *IfdEnumerate) parseThumbnail(offsetIte, lengthIte *IfdTagEntry) (thumbnailData []byte, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	vRaw, err := lengthIte.Value()
	log.PanicIf(err)

	vList := vRaw.([]uint32)
	if len(vList) != 1 {
		log.Panicf("not exactly one long: (%d)", len(vList))
	}

	length := vList[0]

	// The tag is official a LONG type, but it's actually an offset to a blob of bytes.
	offsetIte.updateTagType(exifcommon.TypeByte)
	offsetIte.updateUnitCount(length)

	thumbnailData, err = offsetIte.GetRawBytes()
	log.PanicIf(err)

	return thumbnailData, nil
}

// Scan enumerates the different EXIF's IFD blocks.
func (ie *IfdEnumerate) scan(fqIfdName string, ifdOffset uint32, visitor TagVisitorFn) (err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	for ifdIndex := 0; ; ifdIndex++ {
		ifdEnumerateLogger.Debugf(nil, "Parsing IFD [%s] (%d) at offset (%04x) (scan).", fqIfdName, ifdIndex, ifdOffset)

		enumerator, err := ie.getTagEnumerator(ifdOffset)
		if err != nil {
			if err == ErrOffsetInvalid {
				ifdEnumerateLogger.Errorf(nil, nil, "IFD [%s] (%d) at offset (%04x) is unreachable. Terminating scan.", fqIfdName, ifdIndex, ifdOffset)
				break
			}

			log.Panic(err)
		}

		nextIfdOffset, _, _, err := ie.ParseIfd(fqIfdName, ifdIndex, enumerator, visitor, true)
		log.PanicIf(err)

		if nextIfdOffset == 0 {
			break
		}

		ifdOffset = nextIfdOffset
	}

	return nil
}

// Scan enumerates the different EXIF blocks (called IFDs). `rootIfdName` will
// be "IFD" in the TIFF standard.
func (ie *IfdEnumerate) Scan(rootIfdName string, ifdOffset uint32, visitor TagVisitorFn) (err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	err = ie.scan(rootIfdName, ifdOffset, visitor)
	log.PanicIf(err)

	return nil
}

// Ifd represents a single parsed IFD.
type Ifd struct {

	// TODO(dustin): !! Why are all of these exported? Stop doing this in the next release.
	// TODO(dustin): Add NextIfd().

	ByteOrder binary.ByteOrder

	// Name is the name of the IFD (the rightmost name in the path, sans any
	// indices).
	Name string

	// IfdPath is a simple IFD path (e.g. IFD/GPSInfo). No indices.
	IfdPath string

	// FqIfdPath is a fully-qualified IFD path (e.g. IFD0/GPSInfo0). With
	// indices.
	FqIfdPath string

	TagId uint16

	Id int

	ParentIfd *Ifd

	// ParentTagIndex is our tag position in the parent IFD, if we had a parent
	// (if `ParentIfd` is not nil and we weren't an IFD referenced as a sibling
	// instead of as a child).
	ParentTagIndex int

	// Name   string
	Index  int
	Offset uint32

	Entries        []*IfdTagEntry
	EntriesByTagId map[uint16][]*IfdTagEntry

	Children []*Ifd

	ChildIfdIndex map[string]*Ifd

	NextIfdOffset uint32
	NextIfd       *Ifd

	thumbnailData []byte

	ifdMapping *IfdMapping
	tagIndex   *TagIndex
}

func (ifd *Ifd) ChildWithIfdPath(ifdPath string) (childIfd *Ifd, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	for _, childIfd := range ifd.Children {
		if childIfd.IfdPath == ifdPath {
			return childIfd, nil
		}
	}

	log.Panic(ErrTagNotFound)
	return nil, nil
}

// FindTagWithId returns a list of tags (usually just zero or one) that match
// the given tag ID. This is efficient.
func (ifd *Ifd) FindTagWithId(tagId uint16) (results []*IfdTagEntry, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	results, found := ifd.EntriesByTagId[tagId]
	if found != true {
		log.Panic(ErrTagNotFound)
	}

	return results, nil
}

// FindTagWithName returns a list of tags (usually just zero or one) that match
// the given tag name. This is not efficient (though the labor is trivial).
func (ifd *Ifd) FindTagWithName(tagName string) (results []*IfdTagEntry, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	it, err := ifd.tagIndex.GetWithName(ifd.IfdPath, tagName)
	if log.Is(err, ErrTagNotFound) == true {
		log.Panic(ErrTagNotStandard)
	} else if err != nil {
		log.Panic(err)
	}

	results = make([]*IfdTagEntry, 0)
	for _, ite := range ifd.Entries {
		if ite.TagId() == it.Id {
			results = append(results, ite)
		}
	}

	if len(results) == 0 {
		log.Panic(ErrTagNotFound)
	}

	return results, nil
}

func (ifd *Ifd) String() string {
	parentOffset := uint32(0)
	if ifd.ParentIfd != nil {
		parentOffset = ifd.ParentIfd.Offset
	}

	return fmt.Sprintf("Ifd<ID=(%d) IFD-PATH=[%s] INDEX=(%d) COUNT=(%d) OFF=(0x%04x) CHILDREN=(%d) PARENT=(0x%04x) NEXT-IFD=(0x%04x)>", ifd.Id, ifd.IfdPath, ifd.Index, len(ifd.Entries), ifd.Offset, len(ifd.Children), parentOffset, ifd.NextIfdOffset)
}

func (ifd *Ifd) Thumbnail() (data []byte, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	if ifd.thumbnailData == nil {
		log.Panic(ErrNoThumbnail)
	}

	return ifd.thumbnailData, nil
}

// dumpTags recursively builds a list of tags from an IFD.
func (ifd *Ifd) dumpTags(tags []*IfdTagEntry) []*IfdTagEntry {
	if tags == nil {
		tags = make([]*IfdTagEntry, 0)
	}

	// Now, print the tags while also descending to child-IFDS as we encounter them.

	ifdsFoundCount := 0

	for _, ite := range ifd.Entries {
		tags = append(tags, ite)

		childIfdPath := ite.ChildIfdPath()
		if childIfdPath != "" {
			ifdsFoundCount++

			childIfd, found := ifd.ChildIfdIndex[childIfdPath]
			if found != true {
				log.Panicf("alien child IFD referenced by a tag: [%s]", childIfdPath)
			}

			tags = childIfd.dumpTags(tags)
		}
	}

	if len(ifd.Children) != ifdsFoundCount {
		log.Panicf("have one or more dangling child IFDs: (%d) != (%d)", len(ifd.Children), ifdsFoundCount)
	}

	if ifd.NextIfd != nil {
		tags = ifd.NextIfd.dumpTags(tags)
	}

	return tags
}

// DumpTags prints the IFD hierarchy.
func (ifd *Ifd) DumpTags() []*IfdTagEntry {
	return ifd.dumpTags(nil)
}

func (ifd *Ifd) printTagTree(populateValues bool, index, level int, nextLink bool) {
	indent := strings.Repeat(" ", level*2)

	prefix := " "
	if nextLink {
		prefix = ">"
	}

	fmt.Printf("%s%sIFD: %s\n", indent, prefix, ifd)

	// Now, print the tags while also descending to child-IFDS as we encounter them.

	ifdsFoundCount := 0

	for _, ite := range ifd.Entries {
		if ite.ChildIfdPath() != "" {
			fmt.Printf("%s - TAG: %s\n", indent, ite)
		} else {
			it, err := ifd.tagIndex.Get(ifd.IfdPath, ite.TagId())

			tagName := ""
			if err == nil {
				tagName = it.Name
			}

			var valuePhrase string
			if populateValues == true {
				var err error

				valuePhrase, err = ite.Format()
				if err != nil {
					if log.Is(err, exifcommon.ErrUnhandledUndefinedTypedTag) == true {
						ifdEnumerateLogger.Warningf(nil, "Skipping non-standard undefined tag: [%s] (%04x)", ifd.IfdPath, ite.TagId())
						continue
					} else if err == exifundefined.ErrUnparseableValue {
						ifdEnumerateLogger.Warningf(nil, "Skipping unparseable undefined tag: [%s] (%04x) [%s]", ifd.IfdPath, ite.TagId(), it.Name)
						continue
					}

					log.Panic(err)
				}
			} else {
				valuePhrase = "!UNRESOLVED"
			}

			fmt.Printf("%s - TAG: %s NAME=[%s] VALUE=[%v]\n", indent, ite, tagName, valuePhrase)
		}

		childIfdPath := ite.ChildIfdPath()
		if childIfdPath != "" {
			ifdsFoundCount++

			childIfd, found := ifd.ChildIfdIndex[childIfdPath]
			if found != true {
				log.Panicf("alien child IFD referenced by a tag: [%s]", childIfdPath)
			}

			childIfd.printTagTree(populateValues, 0, level+1, false)
		}
	}

	if len(ifd.Children) != ifdsFoundCount {
		log.Panicf("have one or more dangling child IFDs: (%d) != (%d)", len(ifd.Children), ifdsFoundCount)
	}

	if ifd.NextIfd != nil {
		ifd.NextIfd.printTagTree(populateValues, index+1, level, true)
	}
}

// PrintTagTree prints the IFD hierarchy.
func (ifd *Ifd) PrintTagTree(populateValues bool) {
	ifd.printTagTree(populateValues, 0, 0, false)
}

func (ifd *Ifd) printIfdTree(level int, nextLink bool) {
	indent := strings.Repeat(" ", level*2)

	prefix := " "
	if nextLink {
		prefix = ">"
	}

	fmt.Printf("%s%s%s\n", indent, prefix, ifd)

	// Now, print the tags while also descending to child-IFDS as we encounter them.

	ifdsFoundCount := 0

	for _, ite := range ifd.Entries {
		childIfdPath := ite.ChildIfdPath()
		if childIfdPath != "" {
			ifdsFoundCount++

			childIfd, found := ifd.ChildIfdIndex[childIfdPath]
			if found != true {
				log.Panicf("alien child IFD referenced by a tag: [%s]", childIfdPath)
			}

			childIfd.printIfdTree(level+1, false)
		}
	}

	if len(ifd.Children) != ifdsFoundCount {
		log.Panicf("have one or more dangling child IFDs: (%d) != (%d)", len(ifd.Children), ifdsFoundCount)
	}

	if ifd.NextIfd != nil {
		ifd.NextIfd.printIfdTree(level, true)
	}
}

// PrintIfdTree prints the IFD hierarchy.
func (ifd *Ifd) PrintIfdTree() {
	ifd.printIfdTree(0, false)
}

func (ifd *Ifd) dumpTree(tagsDump []string, level int) []string {
	if tagsDump == nil {
		tagsDump = make([]string, 0)
	}

	indent := strings.Repeat(" ", level*2)

	var ifdPhrase string
	if ifd.ParentIfd != nil {
		ifdPhrase = fmt.Sprintf("[%s]->[%s]:(%d)", ifd.ParentIfd.IfdPath, ifd.IfdPath, ifd.Index)
	} else {
		ifdPhrase = fmt.Sprintf("[ROOT]->[%s]:(%d)", ifd.IfdPath, ifd.Index)
	}

	startBlurb := fmt.Sprintf("%s> IFD %s TOP", indent, ifdPhrase)
	tagsDump = append(tagsDump, startBlurb)

	ifdsFoundCount := 0
	for _, ite := range ifd.Entries {
		tagsDump = append(tagsDump, fmt.Sprintf("%s  - (0x%04x)", indent, ite.TagId()))

		childIfdPath := ite.ChildIfdPath()
		if childIfdPath != "" {
			ifdsFoundCount++

			childIfd, found := ifd.ChildIfdIndex[childIfdPath]
			if found != true {
				log.Panicf("alien child IFD referenced by a tag: [%s]", childIfdPath)
			}

			tagsDump = childIfd.dumpTree(tagsDump, level+1)
		}
	}

	if len(ifd.Children) != ifdsFoundCount {
		log.Panicf("have one or more dangling child IFDs: (%d) != (%d)", len(ifd.Children), ifdsFoundCount)
	}

	finishBlurb := fmt.Sprintf("%s< IFD %s BOTTOM", indent, ifdPhrase)
	tagsDump = append(tagsDump, finishBlurb)

	if ifd.NextIfd != nil {
		siblingBlurb := fmt.Sprintf("%s* LINKING TO SIBLING IFD [%s]:(%d)", indent, ifd.NextIfd.IfdPath, ifd.NextIfd.Index)
		tagsDump = append(tagsDump, siblingBlurb)

		tagsDump = ifd.NextIfd.dumpTree(tagsDump, level)
	}

	return tagsDump
}

// DumpTree returns a list of strings describing the IFD hierarchy.
func (ifd *Ifd) DumpTree() []string {
	return ifd.dumpTree(nil, 0)
}

// GpsInfo parses and consolidates the GPS info. This can only be called on the
// GPS IFD.
func (ifd *Ifd) GpsInfo() (gi *GpsInfo, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	gi = new(GpsInfo)

	if ifd.IfdPath != exifcommon.IfdPathStandardGps {
		log.Panicf("GPS can only be read on GPS IFD: [%s] != [%s]", ifd.IfdPath, exifcommon.IfdPathStandardGps)
	}

	if tags, found := ifd.EntriesByTagId[TagGpsVersionId]; found == false {
		// We've seen this. We'll just have to default to assuming we're in a
		// 2.2.0.0 format.
		ifdEnumerateLogger.Warningf(nil, "No GPS version tag (0x%04x) found.", TagGpsVersionId)
	} else {
		versionBytes, err := tags[0].GetRawBytes()
		log.PanicIf(err)

		hit := false
		for _, acceptedGpsVersion := range ValidGpsVersions {
			if bytes.Compare(versionBytes, acceptedGpsVersion[:]) == 0 {
				hit = true
				break
			}
		}

		if hit != true {
			ifdEnumerateLogger.Warningf(nil, "GPS version not supported: %v", versionBytes)
			log.Panic(ErrNoGpsTags)
		}
	}

	tags, found := ifd.EntriesByTagId[TagLatitudeId]
	if found == false {
		ifdEnumerateLogger.Warningf(nil, "latitude not found")
		log.Panic(ErrNoGpsTags)
	}

	latitudeValue, err := tags[0].Value()
	log.PanicIf(err)

	// Look for whether North or South.
	tags, found = ifd.EntriesByTagId[TagLatitudeRefId]
	if found == false {
		ifdEnumerateLogger.Warningf(nil, "latitude-ref not found")
		log.Panic(ErrNoGpsTags)
	}

	latitudeRefValue, err := tags[0].Value()
	log.PanicIf(err)

	tags, found = ifd.EntriesByTagId[TagLongitudeId]
	if found == false {
		ifdEnumerateLogger.Warningf(nil, "longitude not found")
		log.Panic(ErrNoGpsTags)
	}

	longitudeValue, err := tags[0].Value()
	log.PanicIf(err)

	// Look for whether West or East.
	tags, found = ifd.EntriesByTagId[TagLongitudeRefId]
	if found == false {
		ifdEnumerateLogger.Warningf(nil, "longitude-ref not found")
		log.Panic(ErrNoGpsTags)
	}

	longitudeRefValue, err := tags[0].Value()
	log.PanicIf(err)

	// Parse location.

	latitudeRaw := latitudeValue.([]exifcommon.Rational)

	gi.Latitude, err = NewGpsDegreesFromRationals(latitudeRefValue.(string), latitudeRaw)
	log.PanicIf(err)

	longitudeRaw := longitudeValue.([]exifcommon.Rational)

	gi.Longitude, err = NewGpsDegreesFromRationals(longitudeRefValue.(string), longitudeRaw)
	log.PanicIf(err)

	// Parse altitude.

	altitudeTags, foundAltitude := ifd.EntriesByTagId[TagAltitudeId]
	altitudeRefTags, foundAltitudeRef := ifd.EntriesByTagId[TagAltitudeRefId]

	if foundAltitude == true && foundAltitudeRef == true {
		altitudeValue, err := altitudeTags[0].Value()
		log.PanicIf(err)

		altitudeRefValue, err := altitudeRefTags[0].Value()
		log.PanicIf(err)

		altitudeRaw := altitudeValue.([]exifcommon.Rational)
		altitude := int(altitudeRaw[0].Numerator / altitudeRaw[0].Denominator)
		if altitudeRefValue.([]byte)[0] == 1 {
			altitude *= -1
		}

		gi.Altitude = altitude
	}

	// Parse time.

	timestampTags, foundTimestamp := ifd.EntriesByTagId[TagTimestampId]
	datestampTags, foundDatestamp := ifd.EntriesByTagId[TagDatestampId]

	if foundTimestamp == true && foundDatestamp == true {
		datestampValue, err := datestampTags[0].Value()
		log.PanicIf(err)

		dateParts := strings.Split(datestampValue.(string), ":")

		year, err1 := strconv.ParseUint(dateParts[0], 10, 16)
		month, err2 := strconv.ParseUint(dateParts[1], 10, 8)
		day, err3 := strconv.ParseUint(dateParts[2], 10, 8)

		if err1 == nil && err2 == nil && err3 == nil {
			timestampValue, err := timestampTags[0].Value()
			log.PanicIf(err)

			timestampRaw := timestampValue.([]exifcommon.Rational)

			hour := int(timestampRaw[0].Numerator / timestampRaw[0].Denominator)
			minute := int(timestampRaw[1].Numerator / timestampRaw[1].Denominator)
			second := int(timestampRaw[2].Numerator / timestampRaw[2].Denominator)

			gi.Timestamp = time.Date(int(year), time.Month(month), int(day), hour, minute, second, 0, time.UTC)
		}
	}

	return gi, nil
}

type ParsedTagVisitor func(*Ifd, *IfdTagEntry) error

func (ifd *Ifd) EnumerateTagsRecursively(visitor ParsedTagVisitor) (err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	for ptr := ifd; ptr != nil; ptr = ptr.NextIfd {
		for _, ite := range ifd.Entries {
			childIfdPath := ite.ChildIfdPath()
			if childIfdPath != "" {
				childIfd := ifd.ChildIfdIndex[childIfdPath]

				err := childIfd.EnumerateTagsRecursively(visitor)
				log.PanicIf(err)
			} else {
				err := visitor(ifd, ite)
				log.PanicIf(err)
			}
		}
	}

	return nil
}

type QueuedIfd struct {
	Name      string
	IfdPath   string
	FqIfdPath string

	TagId uint16

	Index  int
	Offset uint32
	Parent *Ifd

	// ParentTagIndex is our tag position in the parent IFD, if we had a parent
	// (if `ParentIfd` is not nil and we weren't an IFD referenced as a sibling
	// instead of as a child).
	ParentTagIndex int
}

type IfdIndex struct {
	RootIfd *Ifd
	Ifds    []*Ifd
	Tree    map[int]*Ifd
	Lookup  map[string][]*Ifd
}

// Scan enumerates the different EXIF blocks (called IFDs).
func (ie *IfdEnumerate) Collect(rootIfdOffset uint32) (index IfdIndex, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	tree := make(map[int]*Ifd)
	ifds := make([]*Ifd, 0)
	lookup := make(map[string][]*Ifd)

	queue := []QueuedIfd{
		{
			Name:      exifcommon.IfdStandard,
			IfdPath:   exifcommon.IfdStandard,
			FqIfdPath: exifcommon.IfdStandard,

			TagId: 0xffff,

			Index:  0,
			Offset: rootIfdOffset,
		},
	}

	edges := make(map[uint32]*Ifd)

	for {
		if len(queue) == 0 {
			break
		}

		qi := queue[0]

		name := qi.Name
		ifdPath := qi.IfdPath
		fqIfdPath := qi.FqIfdPath

		currentIndex := qi.Index
		offset := qi.Offset
		parentIfd := qi.Parent

		queue = queue[1:]

		ifdEnumerateLogger.Debugf(nil, "Parsing IFD [%s] (%d) at offset (%04x) (Collect).", ifdPath, currentIndex, offset)

		enumerator, err := ie.getTagEnumerator(offset)
		if err != nil {
			if err == ErrOffsetInvalid {
				return index, err
			}

			log.Panic(err)
		}

		nextIfdOffset, entries, thumbnailData, err := ie.ParseIfd(fqIfdPath, currentIndex, enumerator, nil, false)
		log.PanicIf(err)

		id := len(ifds)

		entriesByTagId := make(map[uint16][]*IfdTagEntry)
		for _, ite := range entries {
			tagId := ite.TagId()

			tags, found := entriesByTagId[tagId]
			if found == false {
				tags = make([]*IfdTagEntry, 0)
			}

			entriesByTagId[tagId] = append(tags, ite)
		}

		ifd := &Ifd{
			ByteOrder: ie.byteOrder,

			Name:      name,
			IfdPath:   ifdPath,
			FqIfdPath: fqIfdPath,

			TagId: qi.TagId,

			Id: id,

			ParentIfd:      parentIfd,
			ParentTagIndex: qi.ParentTagIndex,

			Index:          currentIndex,
			Offset:         offset,
			Entries:        entries,
			EntriesByTagId: entriesByTagId,

			// This is populated as each child is processed.
			Children: make([]*Ifd, 0),

			NextIfdOffset: nextIfdOffset,
			thumbnailData: thumbnailData,

			ifdMapping: ie.ifdMapping,
			tagIndex:   ie.tagIndex,
		}

		// Add ourselves to a big list of IFDs.
		ifds = append(ifds, ifd)

		// Install ourselves into a by-id lookup table (keys are unique).
		tree[id] = ifd

		// Install into by-name buckets.

		if list_, found := lookup[ifdPath]; found == true {
			lookup[ifdPath] = append(list_, ifd)
		} else {
			list_ = make([]*Ifd, 1)
			list_[0] = ifd

			lookup[ifdPath] = list_
		}

		// Add a link from the previous IFD in the chain to us.
		if previousIfd, found := edges[offset]; found == true {
			previousIfd.NextIfd = ifd
		}

		// Attach as a child to our parent (where we appeared as a tag in
		// that IFD).
		if parentIfd != nil {
			parentIfd.Children = append(parentIfd.Children, ifd)
		}

		// Determine if any of our entries is a child IFD and queue it.
		for i, ite := range entries {
			if ite.ChildIfdPath() == "" {
				continue
			}

			qi := QueuedIfd{
				Name:      ite.ChildIfdName(),
				IfdPath:   ite.ChildIfdPath(),
				FqIfdPath: ite.ChildFqIfdPath(),
				TagId:     ite.TagId(),

				Index:          0,
				Offset:         ite.getValueOffset(),
				Parent:         ifd,
				ParentTagIndex: i,
			}

			queue = append(queue, qi)
		}

		// If there's another IFD in the chain.
		if nextIfdOffset != 0 {
			// Allow the next link to know what the previous link was.
			edges[nextIfdOffset] = ifd

			siblingIndex := currentIndex + 1

			var fqIfdPath string
			if parentIfd != nil {
				fqIfdPath = fmt.Sprintf("%s/%s%d", parentIfd.FqIfdPath, name, siblingIndex)
			} else {
				fqIfdPath = fmt.Sprintf("%s%d", name, siblingIndex)
			}

			qi := QueuedIfd{
				Name:      name,
				IfdPath:   ifdPath,
				FqIfdPath: fqIfdPath,
				TagId:     0xffff,
				Index:     siblingIndex,
				Offset:    nextIfdOffset,
			}

			queue = append(queue, qi)
		}
	}

	index.RootIfd = tree[0]
	index.Ifds = ifds
	index.Tree = tree
	index.Lookup = lookup

	err = ie.setChildrenIndex(index.RootIfd)
	log.PanicIf(err)

	return index, nil
}

func (ie *IfdEnumerate) setChildrenIndex(ifd *Ifd) (err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	childIfdIndex := make(map[string]*Ifd)
	for _, childIfd := range ifd.Children {
		childIfdIndex[childIfd.IfdPath] = childIfd
	}

	ifd.ChildIfdIndex = childIfdIndex

	for _, childIfd := range ifd.Children {
		err := ie.setChildrenIndex(childIfd)
		log.PanicIf(err)
	}

	return nil
}

// ParseOneIfd is a hack to use an IE to parse a raw IFD block. Can be used for
// testing.
func ParseOneIfd(ifdMapping *IfdMapping, tagIndex *TagIndex, fqIfdPath, ifdPath string, byteOrder binary.ByteOrder, ifdBlock []byte, visitor TagVisitorFn) (nextIfdOffset uint32, entries []*IfdTagEntry, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	ie := NewIfdEnumerate(ifdMapping, tagIndex, make([]byte, 0), byteOrder)

	enumerator, err := NewIfdTagEnumerator(ifdBlock, byteOrder, 0)
	if err != nil {
		if err == ErrOffsetInvalid {
			return 0, nil, err
		}

		log.Panic(err)
	}

	nextIfdOffset, entries, _, err = ie.ParseIfd(fqIfdPath, 0, enumerator, visitor, true)
	log.PanicIf(err)

	return nextIfdOffset, entries, nil
}

// ParseOneTag is a hack to use an IE to parse a raw tag block.
func ParseOneTag(ifdMapping *IfdMapping, tagIndex *TagIndex, fqIfdPath, ifdPath string, byteOrder binary.ByteOrder, tagBlock []byte) (tag *IfdTagEntry, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	ie := NewIfdEnumerate(ifdMapping, tagIndex, make([]byte, 0), byteOrder)

	enumerator, err := NewIfdTagEnumerator(tagBlock, byteOrder, 0)
	if err != nil {
		if err == ErrOffsetInvalid {
			return nil, err
		}

		log.Panic(err)
	}

	tag, err = ie.parseTag(fqIfdPath, 0, enumerator)
	log.PanicIf(err)

	return tag, nil
}

func FindIfdFromRootIfd(rootIfd *Ifd, ifdPath string) (ifd *Ifd, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	// TODO(dustin): !! Add test.

	lineage, err := rootIfd.ifdMapping.ResolvePath(ifdPath)
	log.PanicIf(err)

	// Confirm the first IFD is our root IFD type, and then prune it because
	// from then on we'll be searching down through our children.

	if len(lineage) == 0 {
		log.Panicf("IFD path must be non-empty.")
	} else if lineage[0].Name != exifcommon.IfdStandard {
		log.Panicf("First IFD path item must be [%s].", exifcommon.IfdStandard)
	}

	desiredRootIndex := lineage[0].Index
	lineage = lineage[1:]

	// TODO(dustin): !! This is a poorly conceived fix that just doubles the work we already have to do below, which then interacts badly with the indices not being properly represented in the IFD-phrase.
	// TODO(dustin): !! <-- However, we're not sure whether we shouldn't store a secondary IFD-path with the indices. Some IFDs may not necessarily restrict which IFD indices they can be a child of (only the IFD itself matters). Validation should be delegated to the caller.
	thisIfd := rootIfd
	for currentRootIndex := 0; currentRootIndex < desiredRootIndex; currentRootIndex++ {
		if thisIfd.NextIfd == nil {
			log.Panicf("Root-IFD index (%d) does not exist in the data.", currentRootIndex)
		}

		thisIfd = thisIfd.NextIfd
	}

	for i, itii := range lineage {
		var hit *Ifd
		for _, childIfd := range thisIfd.Children {
			if childIfd.TagId == itii.TagId {
				hit = childIfd
				break
			}
		}

		// If we didn't find the child, add it.
		if hit == nil {
			log.Panicf("IFD [%s] in [%s] not found: %s", itii.Name, ifdPath, thisIfd.Children)
		}

		thisIfd = hit

		// If we didn't find the sibling, add it.
		for i = 0; i < itii.Index; i++ {
			if thisIfd.NextIfd == nil {
				log.Panicf("IFD [%s] does not have (%d) occurrences/siblings\n", thisIfd.IfdPath, itii.Index)
			}

			thisIfd = thisIfd.NextIfd
		}
	}

	return thisIfd, nil
}
