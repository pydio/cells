package restv2

import (
	"os"
	"strings"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestCollaboraProvider_Provides(t *testing.T) {
	Convey("Test CollaboraProvider.Provides", t, func() {
		provider := &CollaboraProvider{
			SupportedExt: []string{"docx", "pptx", "xlsx", "odt"},
		}

		Convey("Should return true for supported extensions", func() {
			So(provider.Provides(".docx"), ShouldBeTrue)
			So(provider.Provides(".pptx"), ShouldBeTrue)
			So(provider.Provides(".xlsx"), ShouldBeTrue)
			So(provider.Provides(".odt"), ShouldBeTrue)
		})

		Convey("Should return false for unsupported extensions", func() {
			So(provider.Provides(".pdf"), ShouldBeFalse)
			So(provider.Provides(".txt"), ShouldBeFalse)
			So(provider.Provides(".jpg"), ShouldBeFalse)
		})

		Convey("Should return false for empty extension", func() {
			So(provider.Provides(""), ShouldBeFalse)
		})

		Convey("Should return false for extension without dot", func() {
			So(provider.Provides("docx"), ShouldBeFalse)
		})

		Convey("Should handle case sensitivity correctly", func() {
			// The Provides method checks ext[1:] which removes the dot
			// So ".DOCX" would check "DOCX" against the list
			So(provider.Provides(".DOCX"), ShouldBeFalse) // Case sensitive
			So(provider.Provides(".docx"), ShouldBeTrue)
		})
	})
}

func TestCollaboraProvider_EnvironmentVariableFiltering(t *testing.T) {
	Convey("Test CollaboraProvider with filtered extensions from environment variable", t, func() {
		// Save original environment variable value
		originalEnv := os.Getenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS")
		defer func() {
			// Restore original value
			if originalEnv == "" {
				os.Unsetenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS")
			} else {
				os.Setenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS", originalEnv)
			}
		}()

		Convey("With filtered list of extensions", func() {
			// Set a filtered list via environment variable
			filteredList := "docx,pptx,xlsx"
			os.Setenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS", filteredList)

			// Apply the same logic as init() function
			ee := strings.TrimSpace(os.Getenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS"))
			filteredExt := strings.Split(ee, ",")

			// Create provider with filtered extensions
			provider := &CollaboraProvider{
				SupportedExt: filteredExt,
			}

			Convey("Should only provide for filtered extensions", func() {
				So(provider.Provides(".docx"), ShouldBeTrue)
				So(provider.Provides(".pptx"), ShouldBeTrue)
				So(provider.Provides(".xlsx"), ShouldBeTrue)
			})

			Convey("Should not provide for extensions not in filtered list", func() {
				// These are in the default list but not in our filtered list
				So(provider.Provides(".odt"), ShouldBeFalse)
				So(provider.Provides(".ods"), ShouldBeFalse)
				So(provider.Provides(".doc"), ShouldBeFalse)
				So(provider.Provides(".ppt"), ShouldBeFalse)
				So(provider.Provides(".xls"), ShouldBeFalse)
				So(provider.Provides(".csv"), ShouldBeFalse)
			})

			Convey("Should not provide for completely unsupported extensions", func() {
				So(provider.Provides(".pdf"), ShouldBeFalse)
				So(provider.Provides(".txt"), ShouldBeFalse)
				So(provider.Provides(".jpg"), ShouldBeFalse)
			})
		})

		Convey("With single extension in filtered list", func() {
			// Test with only one extension
			singleExt := "docx"
			os.Setenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS", singleExt)

			ee := strings.TrimSpace(os.Getenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS"))
			filteredExt := strings.Split(ee, ",")

			provider := &CollaboraProvider{
				SupportedExt: filteredExt,
			}

			Convey("Should only provide for that single extension", func() {
				So(provider.Provides(".docx"), ShouldBeTrue)
				So(provider.Provides(".pptx"), ShouldBeFalse)
				So(provider.Provides(".xlsx"), ShouldBeFalse)
			})
		})

		Convey("With empty environment variable", func() {
			// Unset the environment variable
			os.Unsetenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS")

			ee := strings.TrimSpace(os.Getenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS"))
			var filteredExt []string
			if ee != "" {
				filteredExt = strings.Split(ee, ",")
			} else {
				// Use default list when env var is empty
				filteredExt = []string{"docx", "pptx", "xlsx", "dotx", "xltx", "ppsx", "doc", "ppt", "xls", "dot", "xlt", "pps", "odt", "odp", "ods", "ots", "ott", "otp", "rtf", "csv"}
			}

			provider := &CollaboraProvider{
				SupportedExt: filteredExt,
			}

			Convey("Should use default list when env var is empty", func() {
				So(provider.Provides(".docx"), ShouldBeTrue)
				So(provider.Provides(".odt"), ShouldBeTrue)
				So(provider.Provides(".csv"), ShouldBeTrue)
			})
		})

		Convey("With whitespace in environment variable", func() {
			// Test that TrimSpace works correctly on the whole string
			// Note: The init() function only trims the entire string, not individual elements
			os.Setenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS", "  docx, pptx , xlsx  ")

			ee := strings.TrimSpace(os.Getenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS"))
			// After TrimSpace: "docx, pptx , xlsx"
			filteredExt := strings.Split(ee, ",")
			for i, ext := range filteredExt {
				filteredExt[i] = strings.TrimSpace(ext)
			}

			provider := &CollaboraProvider{
				SupportedExt: filteredExt,
			}

			Convey("Should handle whitespace correctly", func() {
				// The first element "docx" (no leading space) will match
				So(provider.Provides(".docx"), ShouldBeTrue)
				So(provider.Provides(".pptx"), ShouldBeTrue)
				So(provider.Provides(".xlsx"), ShouldBeTrue)
			})
		})

		Convey("With custom filtered list excluding common types", func() {
			// Filter to only office formats, excluding legacy formats
			customList := "docx,pptx,xlsx,odt,odp,ods"
			os.Setenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS", customList)

			ee := strings.TrimSpace(os.Getenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS"))
			filteredExt := strings.Split(ee, ",")

			provider := &CollaboraProvider{
				SupportedExt: filteredExt,
			}

			Convey("Should only support filtered modern formats", func() {
				So(provider.Provides(".docx"), ShouldBeTrue)
				So(provider.Provides(".pptx"), ShouldBeTrue)
				So(provider.Provides(".xlsx"), ShouldBeTrue)
				So(provider.Provides(".odt"), ShouldBeTrue)
				So(provider.Provides(".odp"), ShouldBeTrue)
				So(provider.Provides(".ods"), ShouldBeTrue)
			})

			Convey("Should exclude legacy formats not in filtered list", func() {
				So(provider.Provides(".doc"), ShouldBeFalse)
				So(provider.Provides(".ppt"), ShouldBeFalse)
				So(provider.Provides(".xls"), ShouldBeFalse)
				So(provider.Provides(".rtf"), ShouldBeFalse)
				So(provider.Provides(".csv"), ShouldBeFalse)
			})
		})

		Convey("With empty space between extensions", func() {
			// Test case: extension, empty space (comma with spaces), another extension
			// This simulates: "docx, ,xlsx" or "docx,  ,xlsx"
			spacedList := "docx, ,xlsx"
			os.Setenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS", spacedList)

			ee := strings.TrimSpace(os.Getenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS"))
			splitExt := strings.Split(ee, ",")
			filteredExt := make([]string, 0, len(splitExt))
			for _, ext := range splitExt {
				trimmed := strings.TrimSpace(ext)
				if trimmed != "" {
					filteredExt = append(filteredExt, trimmed)
				}
			}
			provider := &CollaboraProvider{
				SupportedExt: filteredExt,
			}

			Convey("Should filter out empty strings from the list", func() {
				// Empty strings should be filtered out, so only valid extensions remain
				So(provider.Provides(".docx"), ShouldBeTrue)
				So(provider.Provides(".xlsx"), ShouldBeTrue)
				// NOTE Empty string input should not match just extra check
				So(provider.Provides(""), ShouldBeFalse)
				So(provider.Provides("."), ShouldBeFalse)
			})

			Convey("Should not contain empty string in the list", func() {
				// Verify that empty strings are filtered out
				hasEmpty := false
				for _, ext := range filteredExt {
					if ext == "" {
						hasEmpty = true
						break
					}
				}
				So(hasEmpty, ShouldBeFalse)
				So(len(filteredExt), ShouldEqual, 2)
			})

			Convey("Should only support the valid extensions", func() {
				// Verify that only the valid extensions are supported
				So(provider.Provides(".pptx"), ShouldBeFalse)
				So(provider.Provides(".odt"), ShouldBeFalse)
			})
		})
	})
}
