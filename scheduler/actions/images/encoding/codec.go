/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package encoding

import (
	"image"
	"image/color"
	"io"

	"github.com/disintegration/imageorient"
	"github.com/disintegration/imaging"
	_ "golang.org/x/image/tiff"
	_ "golang.org/x/image/webp"
)

// ImageFormat represents the supported image formats
type ImageFormat int

const (
	JPEG ImageFormat = iota
	PNG
	BMP
	WEBP
	TIFF
	GIF
)

// ResizeFilter represents the resizing algorithm
type ResizeFilter int

const (
	Lanczos ResizeFilter = iota
	Linear
	NearestNeighbor
)

// ImageCodec defines the interface for image encoding and decoding operations
type ImageCodec interface {
	// Decode reads an image from the provided reader
	Decode(reader io.Reader) (image.Image, error)

	// Encode writes an image to the provided writer in the specified format
	Encode(writer io.Writer, img image.Image, format ImageFormat) error

	// Resize resizes an image to the specified dimensions using the given filter
	// If width or height is 0, the aspect ratio is preserved
	Resize(img image.Image, width, height int, filter ResizeFilter) image.Image

	// New creates a new image with the specified dimensions and background color
	New(width, height int, color color.Color) image.Image

	// Overlay overlays the source image onto the destination image at the specified position
	Overlay(dst, src image.Image, pos image.Point, opacity float64) image.Image
}

// defaultCodec implements ImageCodec using the github.com/disintegration/imaging package
type defaultCodec struct {
	format ImageFormat
}

func NewImageCodec(fileExt string) ImageCodec {
	return defaultCodec{
		format: extensionToFormat(fileExt),
	}
}

// Decode reads an image from the provided reader
func (c defaultCodec) Decode(reader io.Reader) (image.Image, error) {
	// Formats that don't support EXIF, so we avoid the extra processing
	if c.format == GIF || c.format == BMP {
		return imaging.Decode(reader)
	}

	img, _, err := imageorient.Decode(reader)
	return img, err
}

// Encode writes an image to the provided writer in the specified format
func (c defaultCodec) Encode(writer io.Writer, img image.Image, format ImageFormat) error {
	var formatToUse imaging.Format
	switch format {
	case PNG:
		formatToUse = imaging.PNG
	case BMP:
		formatToUse = imaging.BMP
	default:
		formatToUse = imaging.JPEG
	}

	return imaging.Encode(writer, img, formatToUse)
}

// Resize resizes an image to the specified dimensions using the given filter
func (c defaultCodec) Resize(img image.Image, width, height int, filter ResizeFilter) image.Image {
	var imagingFilter imaging.ResampleFilter
	switch filter {
	case Lanczos:
		imagingFilter = imaging.Lanczos
	case Linear:
		imagingFilter = imaging.Linear
	case NearestNeighbor:
		imagingFilter = imaging.NearestNeighbor
	default:
		imagingFilter = imaging.Lanczos
	}

	return imaging.Resize(img, width, height, imagingFilter)
}

// New creates a new image with the specified dimensions and background color
func (c defaultCodec) New(width, height int, color color.Color) image.Image {
	return imaging.New(width, height, color)
}

// Overlay overlays the source image onto the destination image at the specified position
func (c defaultCodec) Overlay(dst, src image.Image, pos image.Point, opacity float64) image.Image {
	return imaging.Overlay(dst, src, pos, opacity)
}

func extensionToFormat(ext string) ImageFormat {
	switch ext {
	case ".jpg", ".jpeg":
		return JPEG
	case ".png":
		return PNG
	case ".bmp":
		return BMP
	case ".webp":
		return WEBP
	case ".tiff", ".tif":
		return TIFF
	case ".gif":
		return GIF
	default:
		return JPEG
	}
}
