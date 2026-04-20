package rest

import (
	"bytes"
	"encoding/binary"
	"strings"
	"testing"
)

// --- Magic byte helpers for test fixtures ---

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

func svgBytes() []byte {
	return []byte(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>`)
}

func svgWithXMLDecl() []byte {
	return []byte(`<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>`)
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

// --- Tests ---

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
		{"SVG bare", svgBytes(), "svg"},
		{"SVG with XML declaration", svgWithXMLDecl(), "svg"},
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

func TestIsSVG(t *testing.T) {
	tests := []struct {
		name string
		buf  []byte
		want bool
	}{
		{"bare SVG tag", []byte(`<svg xmlns="..."`), true},
		{"XML + SVG", []byte(`<?xml version="1.0"?><svg`), true},
		{"HTML is not SVG", []byte(`<html><body>`), false},
		{"random text", []byte(`hello world`), false},
		{"XML without SVG", []byte(`<?xml version="1.0"?><root>`), false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := isSVG(tt.buf)
			if got != tt.want {
				t.Errorf("isSVG(%q) = %v, want %v", tt.buf, got, tt.want)
			}
		})
	}
}

func TestIsAllowedExtension(t *testing.T) {
	allowed := []string{"png", "jpg", "jpeg", "gif", "webp", "ico", "svg"}
	for _, ext := range allowed {
		if !isAllowedExtension(ext) {
			t.Errorf("expected %q to be allowed", ext)
		}
	}
	rejected := []string{"exe", "html", "pdf", "js", "sh", "bat", ""}
	for _, ext := range rejected {
		if isAllowedExtension(ext) {
			t.Errorf("expected %q to be rejected", ext)
		}
	}
}

func TestGlobalBinaryMaxSize(t *testing.T) {
	// Verify the constant is set to 5MB
	if globalBinaryMaxSize != 5*1024*1024 {
		t.Errorf("expected globalBinaryMaxSize = 5MB, got %d", globalBinaryMaxSize)
	}
}
