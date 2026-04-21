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

package rest

import (
	"bytes"
	"encoding/binary"
	"strings"
	"testing"
)

// Magic byte helpers for test fixtures.

func pngBytes() []byte {
	// Minimal PNG header (8-byte signature)
	return []byte{0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00}
}

func jpegBytes() []byte {
	return []byte{0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46}
}

func gifBytes() []byte {
	return []byte("GIF89a" + strings.Repeat("\x00", 10))
}

func webpBytes() []byte {
	// RIFF....WEBP
	buf := []byte("RIFF\x00\x00\x00\x00WEBP")
	return buf
}

func icoBytes() []byte {
	// ICO header: reserved=0, type=1, count=1
	buf := make([]byte, 22)
	binary.LittleEndian.PutUint16(buf[0:2], 0) // reserved
	binary.LittleEndian.PutUint16(buf[2:4], 1) // type = icon
	binary.LittleEndian.PutUint16(buf[4:6], 1) // count = 1
	return buf
}

func htmlBytes() []byte {
	return []byte(`<html><body><p>hehe</p></body></html>`)
}

func exeBytes() []byte {
	// MZ header (PE executable)
	return []byte{0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00}
}

func pdfBytes() []byte {
	return []byte("%PDF-1.4 fake pdf content here")
}

// Tests.

func TestDetectBinaryExtension_AcceptsValidImages(t *testing.T) {
	tests := []struct {
		name    string
		content []byte
		wantExt string
	}{
		{"PNG", pngBytes(), "png"},
		{"JPEG", jpegBytes(), "jpg"},
		{"GIF", gifBytes(), "gif"},
		{"WEBP", webpBytes(), "webp"},
		{"ICO", icoBytes(), "ico"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ext, err := detectBinaryExtension(bytes.NewReader(tt.content))
			if err != nil {
				t.Fatalf("expected no error, got: %v", err)
			}
			if ext != tt.wantExt {
				t.Errorf("expected extension %q, got %q", tt.wantExt, ext)
			}
		})
	}
}

func TestDetectBinaryExtension_RejectsSpoofedContentType(t *testing.T) {
	// HTML file with Content-Type: text/exe — content is what matters, not headers
	_, err := detectBinaryExtension(bytes.NewReader(htmlBytes()))
	if err == nil {
		t.Fatal("expected error for HTML content, got nil")
	}
	if !strings.Contains(err.Error(), "not allowed") {
		t.Errorf("expected 'not allowed' in error, got: %v", err)
	}
}

func TestDetectBinaryExtension_RejectsExecutable(t *testing.T) {
	_, err := detectBinaryExtension(bytes.NewReader(exeBytes()))
	if err == nil {
		t.Fatal("expected error for EXE content, got nil")
	}
}

func TestDetectBinaryExtension_RejectsPDF(t *testing.T) {
	_, err := detectBinaryExtension(bytes.NewReader(pdfBytes()))
	if err == nil {
		t.Fatal("expected error for PDF content, got nil")
	}
}

func TestDetectBinaryExtension_RejectsSVG(t *testing.T) {
	tests := []struct {
		name    string
		content []byte
	}{
		{"bare SVG", []byte(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>`)},
		{"SVG with XML declaration", []byte(`<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>`)},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := detectBinaryExtension(bytes.NewReader(tt.content))
			if err == nil {
				t.Fatal("expected error for SVG content, got nil")
			}
		})
	}
}

func TestDetectBinaryExtension_RejectsEmptyContent(t *testing.T) {
	_, err := detectBinaryExtension(bytes.NewReader([]byte{}))
	if err == nil {
		t.Fatal("expected error for empty content, got nil")
	}
}

func TestDetectBinaryExtension_RejectsPlainText(t *testing.T) {
	_, err := detectBinaryExtension(bytes.NewReader([]byte("just some random text content")))
	if err == nil {
		t.Fatal("expected error for plain text, got nil")
	}
}

func TestIsAllowedExtension(t *testing.T) {
	tests := []struct {
		name string
		ext  string
		want bool
	}{
		{name: "png", ext: "png", want: true},
		{name: "jpg", ext: "jpg", want: true},
		{name: "jpeg", ext: "jpeg", want: true},
		{name: "gif", ext: "gif", want: true},
		{name: "webp", ext: "webp", want: true},
		{name: "ico", ext: "ico", want: true},
		{name: "exe", ext: "exe", want: false},
		{name: "html", ext: "html", want: false},
		{name: "pdf", ext: "pdf", want: false},
		{name: "js", ext: "js", want: false},
		{name: "sh", ext: "sh", want: false},
		{name: "bat", ext: "bat", want: false},
		{name: "empty", ext: "", want: false},
		{name: "svg", ext: "svg", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := isAllowedExtension(tt.ext)
			if got != tt.want {
				t.Fatalf("isAllowedExtension(%q)=%v, want %v", tt.ext, got, tt.want)
			}
		})
	}
}

func TestBinaryContentType(t *testing.T) {
	tests := []struct {
		ext       string
		want      string
		wantFound bool
	}{
		{ext: "png", want: "image/png", wantFound: true},
		{ext: "jpg", want: "image/jpeg", wantFound: true},
		{ext: "jpeg", want: "image/jpeg", wantFound: true},
		{ext: "gif", want: "image/gif", wantFound: true},
		{ext: "webp", want: "image/webp", wantFound: true},
		{ext: "ico", want: "image/x-icon", wantFound: true},
		{ext: "svg", wantFound: false},
		{ext: "", wantFound: false},
	}

	for _, tt := range tests {
		t.Run(tt.ext, func(t *testing.T) {
			got, found := binaryContentType(tt.ext)
			if found != tt.wantFound {
				t.Fatalf("binaryContentType(%q) found=%v, want %v", tt.ext, found, tt.wantFound)
			}
			if got != tt.want {
				t.Fatalf("binaryContentType(%q)=%q, want %q", tt.ext, got, tt.want)
			}
		})
	}
}

func TestGlobalBinaryMaxSize(t *testing.T) {
	// Verify the constant is set to 5MB
	if globalBinaryMaxSize != 5*1024*1024 {
		t.Errorf("expected globalBinaryMaxSize = 5MB, got %d", globalBinaryMaxSize)
	}
}
