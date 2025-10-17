package encoding

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/jpeg"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

const (
	sourceWidth  = 2
	sourceHeight = 4
)

func TestDecodeAppliesOrientation(t *testing.T) {
	Convey("Decode applies EXIF orientation", t, func() {
		orientedJPEG := buildJPEGWithOrientation(t, 6)

		codec := NewImageCodec(".jpg")
		img, err := codec.Decode(bytes.NewReader(orientedJPEG))

		So(err, ShouldBeNil)
		bounds := img.Bounds()
		So(bounds.Dx(), ShouldEqual, sourceHeight)
		So(bounds.Dy(), ShouldEqual, sourceWidth)
		So(approxColor(img.At(0, 0), color.RGBA{R: 255, G: 255, B: 255, A: 255}), ShouldBeTrue)
		So(approxColor(img.At(0, 1), color.RGBA{A: 255}), ShouldBeTrue)
	})
}

func buildJPEGWithOrientation(t *testing.T, orientation uint16) []byte {
	t.Helper()

	src := image.NewNRGBA(image.Rect(0, 0, sourceWidth, sourceHeight))
	for y := 0; y < sourceHeight; y++ {
		src.Set(0, y, color.RGBA{R: 255, G: 255, B: 255, A: 255})
		src.Set(1, y, color.RGBA{A: 255})
	}

	var base bytes.Buffer
	if err := jpeg.Encode(&base, src, &jpeg.Options{Quality: 100}); err != nil {
		t.Fatalf("encode base jpeg: %v", err)
	}

	withExif, err := insertExifOrientation(base.Bytes(), orientation)
	if err != nil {
		t.Fatalf("insert exif: %v", err)
	}

	return withExif
}

func insertExifOrientation(data []byte, orientation uint16) ([]byte, error) {
	if len(data) < 2 || data[0] != 0xFF || data[1] != 0xD8 {
		return nil, ErrInvalidJPEG
	}

	exifPayload := buildExifPayload(orientation)
	segment := make([]byte, 4+len(exifPayload))
	segment[0] = 0xFF
	segment[1] = 0xE1
	binary.BigEndian.PutUint16(segment[2:4], uint16(len(exifPayload)))
	copy(segment[4:], exifPayload)

	result := make([]byte, 0, len(data)+len(segment))
	result = append(result, data[:2]...)
	result = append(result, segment...)
	result = append(result, data[2:]...)

	return result, nil
}

func buildExifPayload(orientation uint16) []byte {
	payload := make([]byte, 0, 6+26)
	payload = append(payload, 'E', 'x', 'i', 'f', 0x00, 0x00)

	tiff := make([]byte, 26)
	tiff[0] = 'I'
	tiff[1] = 'I'
	binary.LittleEndian.PutUint16(tiff[2:], 0x002A)
	binary.LittleEndian.PutUint32(tiff[4:], 8)
	binary.LittleEndian.PutUint16(tiff[8:], 1)
	binary.LittleEndian.PutUint16(tiff[10:], 0x0112)
	binary.LittleEndian.PutUint16(tiff[12:], 3)
	binary.LittleEndian.PutUint32(tiff[14:], 1)
	binary.LittleEndian.PutUint16(tiff[18:], orientation)
	binary.LittleEndian.PutUint16(tiff[20:], 0)
	binary.LittleEndian.PutUint32(tiff[22:], 0)

	payload = append(payload, tiff...)

	return payload
}

var ErrInvalidJPEG = errors.New("invalid jpeg data")

func approxColor(actual color.Color, expected color.RGBA) bool {
	ar, ag, ab, aa := actual.RGBA()
	return closeChannel(ar, uint32(expected.R)) &&
		closeChannel(ag, uint32(expected.G)) &&
		closeChannel(ab, uint32(expected.B)) &&
		closeChannel(aa, uint32(expected.A))
}

func closeChannel(actual uint32, expected uint32) bool {
	// actual is 16-bit precision, expected is 8-bit value.
	av := actual >> 8
	if av > expected {
		return av-expected <= 1
	}
	return expected-av <= 1
}

func dumpColor(c color.Color) string {
	r, g, b, a := c.RGBA()
	return fmt.Sprintf("r=%d g=%d b=%d a=%d", r>>8, g>>8, b>>8, a>>8)
}
