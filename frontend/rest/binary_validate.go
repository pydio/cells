package rest

import (
	"fmt"
	"io"
	"mime"
	"net/http"
	"strings"
)

const (
	// globalBinaryMaxSize is the max upload size for GLOBAL binaries (5MB, same as avatars).
	globalBinaryMaxSize = 5 * 1024 * 1024
)

// allowedBinaryTypes defines the narrow allowlist for files uploaded via
// FrontPutBinary and later served by FrontServeBinary/readBinary on the
// /frontend/binaries/{BinaryType}/{Uuid} route.
//
// This route is used for browser-facing frontend binaries, notably:
//   - USER binaries for avatars/profile pictures
//   - GLOBAL binaries for frontend assets such as progressive backgrounds
//     (see frontend/assets/gui.ajax/res/js/ui/ReactUI/withProgressiveBg.js)
//
// Keep this list restricted to browser-safe raster image formats. Do not broaden
// it to match generic image processing support (for example the thumbnail job in
// scheduler/jobs/grpc/defaults.go), because this path stores and serves content
// directly to clients.
var allowedBinaryTypes = map[string]string{
	"image/png":    "png",
	"image/jpeg":   "jpg",
	"image/gif":    "gif",
	"image/webp":   "webp",
	"image/x-icon": "ico",
}

var binaryContentTypesByExtension = map[string]string{
	"png":  "image/png",
	"jpg":  "image/jpeg",
	"jpeg": "image/jpeg",
	"gif":  "image/gif",
	"webp": "image/webp",
	"ico":  "image/x-icon",
}

// detectBinaryExtension reads the first bytes of content to detect the real MIME type
// and returns the corresponding safe extension. It rejects any file whose actual content
// does not match the image allowlist, regardless of what Content-Type the client sent.
func detectBinaryExtension(content io.Reader) (string, error) {
	buf := make([]byte, 512)
	n, err := io.ReadAtLeast(content, buf, 1)
	if err != nil {
		return "", fmt.Errorf("cannot read file content: %w", err)
	}
	buf = buf[:n]

	detected := http.DetectContentType(buf)
	// http.DetectContentType may append parameters (e.g. "type; charset=...").
	// Parse the media type to compare the clean, lowercased MIME type.
	mediatype, _, err := mime.ParseMediaType(detected)
	if err != nil {
		return "", fmt.Errorf("cannot parse detected content type %q: %w", detected, err)
	}

	if ext, ok := allowedBinaryTypes[mediatype]; ok {
		return ext, nil
	}

	// WEBP special case: DetectContentType does not recognize WEBP; check RIFF+WEBP header
	if isWEBP(buf) {
		return "webp", nil
	}

	return "", fmt.Errorf("file type %q is not allowed; only image uploads are permitted", detected)
}

// isAllowedExtension checks if the given extension is in the allowlist.
func isAllowedExtension(ext string) bool {
	for _, allowed := range allowedBinaryTypes {
		if strings.EqualFold(ext, allowed) {
			return true
		}
	}
	// Also accept "jpeg" explicitly (allowlist has "jpg")
	return strings.EqualFold(ext, "jpeg")
}

// isWEBP checks for RIFF....WEBP magic bytes.
func isWEBP(buf []byte) bool {
	return len(buf) >= 12 &&
		string(buf[0:4]) == "RIFF" &&
		string(buf[8:12]) == "WEBP"
}

func binaryContentType(extension string) (string, bool) {
	contentType, ok := binaryContentTypesByExtension[strings.ToLower(strings.TrimSpace(extension))]
	return contentType, ok
}
