/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package std

import (
	"testing"
)

func TestHasImageExtension(t *testing.T) {
	tests := []struct {
		name string
		s    string
		want bool
	}{
		// Plain filenames
		{name: "png", s: "logo.png", want: true},
		{name: "jpg", s: "photo.jpg", want: true},
		{name: "jpeg", s: "photo.jpeg", want: true},
		{name: "gif", s: "anim.gif", want: true},
		{name: "svg", s: "icon.svg", want: true},
		{name: "webp", s: "image.webp", want: true},
		{name: "uppercase extension", s: "logo.PNG", want: true},
		{name: "mixed case extension", s: "logo.Png", want: true},
		// Full URLs
		{name: "https url", s: "https://cdn.example.com/logo.png", want: true},
		{name: "http url", s: "http://cdn.example.com/logo.png", want: true},
		// Query strings and fragments stripped via url.Parse
		{name: "cache-busting query", s: "https://cdn.example.com/footer.png?v=2026-07", want: true},
		{name: "presigned s3 query", s: "https://bucket.example.com/footer.png?X-Amz-Signature=abc123", want: true},
		{name: "svg with fragment", s: "https://cdn.example.com/footer.svg#logo", want: true},
		// Non-images
		{name: "plain text copyright", s: "© 2024 Pydio", want: false},
		{name: "empty string", s: "", want: false},
		{name: "pdf", s: "document.pdf", want: false},
		{name: "html page url", s: "https://example.com/page.html", want: false},
		{name: "url without extension", s: "https://example.com/image", want: false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := HasImageExtension(tt.s); got != tt.want {
				t.Errorf("HasImageExtension(%q) = %v, want %v", tt.s, got, tt.want)
			}
		})
	}
}
