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
	"image/png":     "png",
	"image/jpeg":    "jpg",
	"image/gif":     "gif",
	"image/webp":    "webp",
	"image/x-icon":  "ico",
	"image/svg+xml": "svg",
}

// detectBinaryExtension reads the first bytes of content to detect the real MIME type
// and returns the corresponding safe extension. It rejects any file whose actual content
// does not match the image allowlist, regardless of what Content-Type the client sent.
//
// For SVG files, http.DetectContentType returns "text/xml" or "text/plain", so we
// do a prefix check for known SVG markers.
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

	// SVG special case: DetectContentType returns text/xml or text/plain
	if isSVG(buf) {
		return "svg", nil
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

// isSVG checks if the content looks like an SVG by looking for <svg or <?xml markers
// followed by SVG namespace.
func isSVG(buf []byte) bool {
	s := strings.TrimSpace(string(buf))
	s = strings.ToLower(s)
	return strings.HasPrefix(s, "<svg") ||
		(strings.HasPrefix(s, "<?xml") && strings.Contains(s, "<svg"))
}
