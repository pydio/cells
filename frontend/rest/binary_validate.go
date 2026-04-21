package rest

import (
	"fmt"
	"io"
	"net/http"
	"strings"
)

const (
	// globalBinaryMaxSize is the max upload size for GLOBAL binaries (5MB, same as avatars).
	globalBinaryMaxSize = 5 * 1024 * 1024
)

// allowedBinaryTypes maps detected MIME types to file extensions for binary uploads.
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
	// DetectContentType returns "type; charset=..." sometimes — take only the MIME part
	detected = strings.SplitN(detected, ";", 2)[0]
	detected = strings.TrimSpace(detected)

	if ext, ok := allowedBinaryTypes[detected]; ok {
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
