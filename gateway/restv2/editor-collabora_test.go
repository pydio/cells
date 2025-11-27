package restv2

import (
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
