package jpegstructure

import (
	"bufio"
	"bytes"
	"fmt"
	"io"

	"crypto/sha1"
	"encoding/binary"
	"encoding/hex"

	"github.com/dsoprea/go-exif/v2"
	"github.com/dsoprea/go-logging"
)

const (
	MARKER_SOI   = 0xd8
	MARKER_EOI   = 0xd9
	MARKER_SOS   = 0xda
	MARKER_SOD   = 0x93
	MARKER_DQT   = 0xdb
	MARKER_APP0  = 0xe0
	MARKER_APP1  = 0xe1
	MARKER_APP2  = 0xe2
	MARKER_APP3  = 0xe3
	MARKER_APP4  = 0xe4
	MARKER_APP5  = 0xe5
	MARKER_APP6  = 0xe6
	MARKER_APP7  = 0xe7
	MARKER_APP8  = 0xe8
	MARKER_APP10 = 0xea
	MARKER_APP12 = 0xec
	MARKER_APP13 = 0xed
	MARKER_APP14 = 0xee
	MARKER_APP15 = 0xef
	MARKER_COM   = 0xfe
	MARKER_CME   = 0x64
	MARKER_SIZ   = 0x51

	MARKER_DHT = 0xc4
	MARKER_JPG = 0xc8
	MARKER_DAC = 0xcc

	MARKER_SOF0  = 0xc0
	MARKER_SOF1  = 0xc1
	MARKER_SOF2  = 0xc2
	MARKER_SOF3  = 0xc3
	MARKER_SOF5  = 0xc5
	MARKER_SOF6  = 0xc6
	MARKER_SOF7  = 0xc7
	MARKER_SOF9  = 0xc9
	MARKER_SOF10 = 0xca
	MARKER_SOF11 = 0xcb
	MARKER_SOF13 = 0xcd
	MARKER_SOF14 = 0xce
	MARKER_SOF15 = 0xcf
)

var (
	jpegLogger        = log.NewLogger("exifjpeg.jpeg")
	jpegMagicStandard = []byte{0xff, MARKER_SOI, 0xff}
	jpegMagic2000     = []byte{0xff, 0x4f, 0xff}

	markerLen = map[byte]int{
		0x00: 0,
		0x01: 0,
		0xd0: 0,
		0xd1: 0,
		0xd2: 0,
		0xd3: 0,
		0xd4: 0,
		0xd5: 0,
		0xd6: 0,
		0xd7: 0,
		0xd8: 0,
		0xd9: 0,
		0xda: 0,

		// J2C
		0x30: 0,
		0x31: 0,
		0x32: 0,
		0x33: 0,
		0x34: 0,
		0x35: 0,
		0x36: 0,
		0x37: 0,
		0x38: 0,
		0x39: 0,
		0x3a: 0,
		0x3b: 0,
		0x3c: 0,
		0x3d: 0,
		0x3e: 0,
		0x3f: 0,
		0x4f: 0,
		0x92: 0,
		0x93: 0,

		// J2C extensions
		0x74: 4,
		0x75: 4,
		0x77: 4,
	}

	markerNames = map[byte]string{
		MARKER_SOI:   "SOI",
		MARKER_EOI:   "EOI",
		MARKER_SOS:   "SOS",
		MARKER_SOD:   "SOD",
		MARKER_DQT:   "DQT",
		MARKER_APP0:  "APP0",
		MARKER_APP1:  "APP1",
		MARKER_APP2:  "APP2",
		MARKER_APP3:  "APP3",
		MARKER_APP4:  "APP4",
		MARKER_APP5:  "APP5",
		MARKER_APP6:  "APP6",
		MARKER_APP7:  "APP7",
		MARKER_APP8:  "APP8",
		MARKER_APP10: "APP10",
		MARKER_APP12: "APP12",
		MARKER_APP13: "APP13",
		MARKER_APP14: "APP14",
		MARKER_APP15: "APP15",
		MARKER_COM:   "COM",
		MARKER_CME:   "CME",
		MARKER_SIZ:   "SIZ",

		MARKER_DHT: "DHT",
		MARKER_JPG: "JPG",
		MARKER_DAC: "DAC",

		MARKER_SOF0:  "SOF0",
		MARKER_SOF1:  "SOF1",
		MARKER_SOF2:  "SOF2",
		MARKER_SOF3:  "SOF3",
		MARKER_SOF5:  "SOF5",
		MARKER_SOF6:  "SOF6",
		MARKER_SOF7:  "SOF7",
		MARKER_SOF9:  "SOF9",
		MARKER_SOF10: "SOF10",
		MARKER_SOF11: "SOF11",
		MARKER_SOF13: "SOF13",
		MARKER_SOF14: "SOF14",
		MARKER_SOF15: "SOF15",
	}

	ExifPrefix = []byte{'E', 'x', 'i', 'f', 0, 0}
)

type SofSegment struct {
	BitsPerSample  byte
	Width, Height  uint16
	ComponentCount byte
}

func (ss SofSegment) String() string {
	return fmt.Sprintf("SOF<BitsPerSample=(%d) Width=(%d) Height=(%d) ComponentCount=(%d)>", ss.BitsPerSample, ss.Width, ss.Height, ss.ComponentCount)
}

type SegmentVisitor interface {
	HandleSegment(markerId byte, markerName string, counter int, lastIsScanData bool) error
}

type SofSegmentVisitor interface {
	HandleSof(sof *SofSegment) error
}

type Segment struct {
	MarkerId   byte
	MarkerName string
	Offset     int
	Data       []byte
}

// SetExif encodes and sets EXIF data into this segment.
func (s *Segment) SetExif(ib *exif.IfdBuilder) (err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	ibe := exif.NewIfdByteEncoder()

	exifData, err := ibe.EncodeToExif(ib)
	log.PanicIf(err)

	s.Data = make([]byte, len(ExifPrefix)+len(exifData))
	copy(s.Data[0:], ExifPrefix)
	copy(s.Data[len(ExifPrefix):], exifData)

	return nil
}

// Exif returns an `exif.Ifd` instance for the EXIF data we currently have.
func (s *Segment) Exif() (rootIfd *exif.Ifd, data []byte, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	rawExif := s.Data[len(ExifPrefix):]

	im := exif.NewIfdMappingWithStandard()
	ti := exif.NewTagIndex()

	_, index, err := exif.Collect(im, ti, rawExif)
	log.PanicIf(err)

	return index.RootIfd, rawExif, nil
}

// FlatExif parses the EXIF data and just returns a list of tags.
func (s *Segment) FlatExif() (exifTags []exif.ExifTag, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	exifTags, err = exif.GetFlatExifData(s.Data[len(ExifPrefix):])
	log.PanicIf(err)

	return exifTags, nil
}

func (s *Segment) EmbeddedString() string {
	h := sha1.New()
	h.Write(s.Data)

	digestString := hex.EncodeToString(h.Sum(nil))

	return fmt.Sprintf("OFFSET=(0x%08x %10d) ID=(0x%02x) NAME=[%-5s] SIZE=(%10d) SHA1=[%s]", s.Offset, s.Offset, s.MarkerId, markerNames[s.MarkerId], len(s.Data), digestString)
}

func (s *Segment) String() string {
	return fmt.Sprintf("Segment<%s>", s.EmbeddedString())
}

type SegmentList struct {
	segments []*Segment
}

func NewSegmentList(segments []*Segment) (sl *SegmentList) {
	if segments == nil {
		segments = make([]*Segment, 0)
	}

	return &SegmentList{
		segments: segments,
	}
}

func (sl *SegmentList) OffsetsEqual(o *SegmentList) bool {
	if len(o.segments) != len(sl.segments) {
		return false
	}

	for i, s := range o.segments {
		if s.MarkerId != sl.segments[i].MarkerId || s.Offset != sl.segments[i].Offset {
			return false
		}
	}

	return true
}

func (sl *SegmentList) Segments() []*Segment {
	return sl.segments
}

func (sl *SegmentList) Add(s *Segment) {
	sl.segments = append(sl.segments, s)
}

func (sl *SegmentList) Print() {
	if len(sl.segments) == 0 {
		fmt.Printf("No segments.\n")
	} else {
		for i, s := range sl.segments {
			fmt.Printf("%2d: %s\n", i, s.EmbeddedString())
		}
	}
}

// Validate checks that all of the markers are actually located at all of the
// recorded offsets.
func (sl *SegmentList) Validate(data []byte) (err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	if len(sl.segments) < 2 {
		log.Panicf("minimum segments not found")
	}

	if sl.segments[0].MarkerId != MARKER_SOI {
		log.Panicf("first segment not SOI")
	} else if sl.segments[len(sl.segments)-1].MarkerId != MARKER_EOI {
		log.Panicf("last segment not EOI")
	}

	lastOffset := 0
	for i, s := range sl.segments {
		if lastOffset != 0 && s.Offset <= lastOffset {
			log.Panicf("segment offset not greater than the last: SEGMENT=(%d) (0x%08x) <= (0x%08x)", i, s.Offset, lastOffset)
		}

		// The scan-data doesn't start with a marker.
		if s.MarkerId == 0x0 {
			continue
		}

		o := s.Offset
		if bytes.Compare(data[o:o+2], []byte{0xff, s.MarkerId}) != 0 {
			log.Panicf("segment offset does not point to the start of a segment: SEGMENT=(%d) (0x%08x)", i, s.Offset)
		}

		lastOffset = o
	}

	return nil
}

// FindExif returns the the segment that hosts the EXIF data.
func (sl *SegmentList) FindExif() (index int, segment *Segment, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	for i, s := range sl.segments {
		if s.MarkerId < MARKER_APP0 || s.MarkerId > MARKER_APP15 {
			continue
		}

		if bytes.Compare(s.Data[:len(ExifPrefix)], ExifPrefix) == 0 {
			return i, s, nil
		}
	}

	return -1, nil, exif.ErrNoExif
}

// Exif returns an `exif.Ifd` instance for the EXIF data we currently have.
func (sl *SegmentList) Exif() (rootIfd *exif.Ifd, rawExif []byte, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	_, s, err := sl.FindExif()
	log.PanicIf(err)

	rootIfd, rawExif, err = s.Exif()
	log.PanicIf(err)

	return rootIfd, rawExif, nil
}

// ConstructExifBuilder returns an `exif.IfdBuilder` instance (needed for
// modifying) preloaded with all existing tags.
func (sl *SegmentList) ConstructExifBuilder() (rootIb *exif.IfdBuilder, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	rootIfd, _, err := sl.Exif()
	log.PanicIf(err)

	ib := exif.NewIfdBuilderFromExistingChain(rootIfd)

	return ib, nil
}

// DumpExif returns an unstructured list of tags (useful when just reviewing).
func (sl *SegmentList) DumpExif() (segmentIndex int, segment *Segment, exifTags []exif.ExifTag, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	segmentIndex, s, err := sl.FindExif()
	if err != nil {
		if err == exif.ErrNoExif {
			return 0, nil, nil, err
		}

		log.Panic(err)
	}

	exifTags, err = s.FlatExif()
	log.PanicIf(err)

	return segmentIndex, s, exifTags, nil
}

func makeEmptyExifSegment() (s *Segment) {
	return &Segment{
		MarkerId: MARKER_APP1,
	}
}

// SetExif encodes and sets EXIF data into the given segment. If `index` is -1,
// append a new segment.
func (sl *SegmentList) SetExif(ib *exif.IfdBuilder) (err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	_, s, err := sl.FindExif()
	if err != nil {
		if log.Is(err, exif.ErrNoExif) == false {
			log.Panic(err)
		}

		s = makeEmptyExifSegment()

		prefix := sl.segments[:1]

		// Install it near the beginning where we know it's safe. We can't
		// insert it after the EOI segment, and there might be more than one
		// depending on implementation and/or lax adherence to the standard.
		tail := append([]*Segment{s}, sl.segments[1:]...)

		sl.segments = append(prefix, tail...)
	}

	err = s.SetExif(ib)
	log.PanicIf(err)

	return nil
}

// DropExif will drop the EXIF data if present.
func (sl *SegmentList) DropExif() (wasDropped bool, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	i, _, err := sl.FindExif()
	if err == nil {
		// Found.
		sl.segments = append(sl.segments[:i], sl.segments[i+1:]...)

		return true, nil
	} else if log.Is(err, exif.ErrNoExif) == false {
		log.Panic(err)
	}

	// Not found.
	return false, nil
}

func (sl *SegmentList) Write(w io.Writer) (err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	offset := 0

	for i, s := range sl.segments {
		h := sha1.New()
		h.Write(s.Data)

		// The scan-data will have a marker-ID of (0) because it doesn't have a
		// marker-ID or length.
		if s.MarkerId != 0 {
			_, err := w.Write([]byte{0xff})
			log.PanicIf(err)

			offset++

			_, err = w.Write([]byte{s.MarkerId})
			log.PanicIf(err)

			offset++

			sizeLen, found := markerLen[s.MarkerId]
			if found == false || sizeLen == 2 {
				sizeLen = 2
				len_ := uint16(len(s.Data) + sizeLen)

				err = binary.Write(w, binary.BigEndian, &len_)
				log.PanicIf(err)

				offset += 2
			} else if sizeLen == 4 {
				len_ := uint32(len(s.Data) + sizeLen)

				err = binary.Write(w, binary.BigEndian, &len_)
				log.PanicIf(err)

				offset += 4
			} else if sizeLen != 0 {
				log.Panicf("not a supported marker-size: SEGMENT-INDEX=(%d) MARKER-ID=(0x%02x) MARKER-SIZE-LEN=(%d)", i, s.MarkerId, sizeLen)
			}
		}

		_, err := w.Write(s.Data)
		log.PanicIf(err)

		offset += len(s.Data)
	}

	return nil
}

type JpegSplitter struct {
	lastMarkerId   byte
	lastMarkerName string
	counter        int
	lastIsScanData bool
	visitor        interface{}

	currentOffset int
	segments      *SegmentList

	scandataOffset int
}

func NewJpegSplitter(visitor interface{}) *JpegSplitter {
	return &JpegSplitter{
		segments: NewSegmentList(nil),
		visitor:  visitor,
	}
}

func (js *JpegSplitter) Segments() *SegmentList {
	return js.segments
}

func (js *JpegSplitter) MarkerId() byte {
	return js.lastMarkerId
}

func (js *JpegSplitter) MarkerName() string {
	return js.lastMarkerName
}

func (js *JpegSplitter) Counter() int {
	return js.counter
}

func (js *JpegSplitter) IsScanData() bool {
	return js.lastIsScanData
}

func (js *JpegSplitter) processScanData(data []byte) (advanceBytes int, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	// Search through the segment, past all 0xff's therein, until we encounter
	// the EOI segment.

	dataLength := -1
	for i := js.scandataOffset; i < len(data); i++ {
		thisByte := data[i]

		if i == 0 {
			continue
		}

		lastByte := data[i-1]
		if lastByte != 0xff {
			continue
		}

		if thisByte == 0x00 || thisByte >= 0xd0 && thisByte <= 0xd8 {
			continue
		}

		// After all of the other checks, this means that we're on the EOF
		// segment.
		if thisByte != MARKER_EOI {
			continue
		}

		dataLength = i - 1
		break
	}

	if dataLength == -1 {
		// On the next pass, start on the last byte of this pass, just in case
		// the first byte of the two-byte sequence is here.
		js.scandataOffset = len(data) - 1

		jpegLogger.Debugf(nil, "Scan-data not fully available (%d).", len(data))
		return 0, nil
	}

	js.lastIsScanData = true
	js.lastMarkerId = 0
	js.lastMarkerName = ""

	// Note that we don't increment the counter since this isn't an actual
	// segment.

	jpegLogger.Debugf(nil, "End of scan-data.")

	err = js.handleSegment(0x0, "!SCANDATA", 0x0, data[:dataLength])
	log.PanicIf(err)

	return dataLength, nil
}

func (js *JpegSplitter) readSegment(data []byte) (count int, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	if js.counter == 0 {
		// Verify magic bytes.

		if len(data) < 3 {
			jpegLogger.Debugf(nil, "Not enough (1)")
			return 0, nil
		}

		if data[0] == jpegMagic2000[0] && data[1] == jpegMagic2000[1] && data[2] == jpegMagic2000[2] {
			// TODO(dustin): Revisit JPEG2000 support.
			log.Panicf("JPEG2000 not supported")
		}

		if data[0] != jpegMagicStandard[0] || data[1] != jpegMagicStandard[1] || data[2] != jpegMagicStandard[2] {
			log.Panicf("file does not look like a JPEG: (%X) (%X) (%X)", data[0], data[1], data[2])
		}
	}

	chunkLength := len(data)

	jpegLogger.Debugf(nil, "SPLIT: LEN=(%d) COUNTER=(%d)", chunkLength, js.counter)

	if js.scanDataIsNext() == true {
		// If the last segment was the SOS, we're currently sitting on scan data.
		// Search for the EOI marker afterward in order to know how much data
		// there is. Return this as its own token.
		//
		// REF: https://stackoverflow.com/questions/26715684/parsing-jpeg-sos-marker

		advanceBytes, err := js.processScanData(data)
		log.PanicIf(err)

		// This will either return 0 and implicitly request that we need more
		// data and then need to run again or will return an actual byte count
		// to progress by.

		return advanceBytes, nil
	} else if js.lastMarkerId == MARKER_EOI {
		// We have more data following the EOI, which is unexpected. There
		// might be non-standard cruft at the end of the file. Terminate the
		// parse because the file-structure is, technically, complete at this
		// point.

		return 0, io.EOF
	} else {
		js.lastIsScanData = false
	}

	// If we're here, we're supposed to be sitting on the 0xff bytes at the
	// beginning of a segment (just before the marker).

	if data[0] != 0xff {
		log.Panicf("not on new segment marker @ (%d): (%02X)", js.currentOffset, data[0])
	}

	i := 0
	found := false
	for ; i < chunkLength; i++ {
		jpegLogger.Debugf(nil, "Prefix check: (%d) %02X", i, data[i])

		if data[i] != 0xff {
			found = true
			break
		}
	}

	jpegLogger.Debugf(nil, "Skipped over leading 0xFF bytes: (%d)", i)

	if found == false || i >= chunkLength {
		jpegLogger.Debugf(nil, "Not enough (3)")
		return 0, nil
	}

	markerId := data[i]

	js.lastMarkerName = markerNames[markerId]

	sizeLen, found := markerLen[markerId]
	jpegLogger.Debugf(nil, "MARKER-ID=%x SIZELEN=%v FOUND=%v", markerId, sizeLen, found)

	i++

	b := bytes.NewBuffer(data[i:])
	payloadLength := 0

	// marker-ID + size => 2 + <dynamic>
	headerSize := 2 + sizeLen

	if found == false {

		// It's not one of the static-length markers. Read the length.
		//
		// The length is an unsigned 16-bit network/big-endian.

		// marker-ID + size => 2 + 2
		headerSize = 2 + 2

		if i+2 >= chunkLength {
			jpegLogger.Debugf(nil, "Not enough (4)")
			return 0, nil
		}

		len_ := uint16(0)
		err = binary.Read(b, binary.BigEndian, &len_)
		log.PanicIf(err)

		if len_ <= 2 {
			log.Panicf("length of size read for non-special marker (%02x) is unexpectedly not more than two.", markerId)
		}

		// (len_ includes the bytes of the length itself.)
		payloadLength = int(len_) - 2
		jpegLogger.Debugf(nil, "DataLength (dynamically-sized segment): (%d)", payloadLength)

		i += 2
	} else if sizeLen > 0 {

		// Accomodates the non-zero markers in our marker index, which only
		// represent J2C extensions.
		//
		// The length is an unsigned 32-bit network/big-endian.

		// TODO(dustin): !! This needs to be tested, but we need an image.

		if sizeLen != 4 {
			log.Panicf("known non-zero marker is not four bytes, which is not currently handled: M=(%x)", markerId)
		}

		if i+4 >= chunkLength {
			jpegLogger.Debugf(nil, "Not enough (5)")
			return 0, nil
		}

		len_ := uint32(0)
		err = binary.Read(b, binary.BigEndian, &len_)
		log.PanicIf(err)

		payloadLength = int(len_) - 4
		jpegLogger.Debugf(nil, "DataLength (four-byte-length segment): (%u)", len_)

		i += 4
	}

	jpegLogger.Debugf(nil, "PAYLOAD-LENGTH: %d", payloadLength)

	payload := data[i:]

	if payloadLength < 0 {
		log.Panicf("payload length less than zero: (%d)", payloadLength)
	}

	i += int(payloadLength)

	if i > chunkLength {
		jpegLogger.Debugf(nil, "Not enough (6)")
		return 0, nil
	}

	jpegLogger.Debugf(nil, "Found whole segment.")

	js.lastMarkerId = markerId

	payloadWindow := payload[:payloadLength]
	err = js.handleSegment(markerId, js.lastMarkerName, headerSize, payloadWindow)
	log.PanicIf(err)

	js.counter++

	jpegLogger.Debugf(nil, "Returning advance of (%d)", i)

	return i, nil
}

func (js *JpegSplitter) scanDataIsNext() bool {
	return js.lastMarkerId == MARKER_SOS
}

func (js *JpegSplitter) Split(data []byte, atEOF bool) (advance int, token []byte, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	for len(data) > 0 {
		currentAdvance, err := js.readSegment(data)
		if err != nil {
			if err == io.EOF {
				// We've encountered an EOI marker.
				return 0, nil, err
			}

			log.Panic(err)
		}

		if currentAdvance == 0 {
			if len(data) > 0 && atEOF == true {
				// Provide a little context in the error message.

				if js.scanDataIsNext() == true {
					// Yes, we've ran into this.

					log.Panicf("scan-data is unbounded; EOI not encountered before EOF")
				} else {
					log.Panicf("partial segment data encountered before scan-data")
				}
			}

			// We don't have enough data for another segment.
			break
		}

		data = data[currentAdvance:]
		advance += currentAdvance
	}

	return advance, nil, nil
}

func (js *JpegSplitter) parseSof(data []byte) (sof *SofSegment, err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	stream := bytes.NewBuffer(data)
	buffer := bufio.NewReader(stream)

	bitsPerSample, err := buffer.ReadByte()
	log.PanicIf(err)

	height := uint16(0)
	err = binary.Read(buffer, binary.BigEndian, &height)
	log.PanicIf(err)

	width := uint16(0)
	err = binary.Read(buffer, binary.BigEndian, &width)
	log.PanicIf(err)

	componentCount, err := buffer.ReadByte()
	log.PanicIf(err)

	sof = &SofSegment{
		BitsPerSample:  bitsPerSample,
		Width:          width,
		Height:         height,
		ComponentCount: componentCount,
	}

	return sof, nil
}

func (js *JpegSplitter) parseAppData(markerId byte, data []byte) (err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	return nil
}

func (js *JpegSplitter) handleSegment(markerId byte, markerName string, headerSize int, payload []byte) (err error) {
	defer func() {
		if state := recover(); state != nil {
			err = log.Wrap(state.(error))
		}
	}()

	cloned := make([]byte, len(payload))
	copy(cloned, payload)

	s := &Segment{
		MarkerId:   markerId,
		MarkerName: markerName,
		Offset:     js.currentOffset,
		Data:       cloned,
	}

	jpegLogger.Debugf(nil, "Encountered marker (0x%02x) [%s] at offset (%d)", markerId, markerName, js.currentOffset)

	js.currentOffset += headerSize + len(payload)

	js.segments.Add(s)

	sv, ok := js.visitor.(SegmentVisitor)
	if ok == true {
		err = sv.HandleSegment(js.lastMarkerId, js.lastMarkerName, js.counter, js.lastIsScanData)
		log.PanicIf(err)
	}

	if markerId >= MARKER_SOF0 && markerId <= MARKER_SOF15 {
		ssv, ok := js.visitor.(SofSegmentVisitor)
		if ok == true {
			sof, err := js.parseSof(payload)
			log.PanicIf(err)

			err = ssv.HandleSof(sof)
			log.PanicIf(err)
		}
	} else if markerId >= MARKER_APP0 && markerId <= MARKER_APP15 {
		err := js.parseAppData(markerId, payload)
		log.PanicIf(err)
	}

	return nil
}
