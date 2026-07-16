package mongo

import "testing"

func TestAnchoredPathRegexEscapesPathCharacters(t *testing.T) {
	tests := []struct {
		name  string
		path  string
		exact bool
		want  string
	}{
		{name: "prefix with parentheses", path: "/path/Folder E (new)/", want: `^/path/Folder E \(new\)/`},
		{name: "prefix with brackets", path: "/path/Folder E [new]/", want: `^/path/Folder E \[new\]/`},
		{name: "exact path", path: "/path/Report[1].docx", exact: true, want: `^/path/Report\[1\]\.docx$`},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := anchoredPathRegex(tt.path, tt.exact); got != tt.want {
				t.Fatalf("anchoredPathRegex() = %q, want %q", got, tt.want)
			}
		})
	}
}
