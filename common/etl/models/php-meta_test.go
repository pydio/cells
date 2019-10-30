package models

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestUserMetasFromPhpData(t *testing.T) {

	Convey("Test simple unserialize", t, func() {
		localSerial := `a:1:{s:11:"teztzet.txt";a:1:{s:24:"AJXP_METADATA_SHAREDUSER";a:1:{s:10:"users_meta";a:1:{s:13:"comment-field";s:5:"ytfds";}}}}`

		outMeta, e := UserMetasFromPhpData([]byte(localSerial))
		So(e, ShouldBeNil)
		So(outMeta, ShouldHaveLength, 1)

	})

	Convey("Test other unserialize", t, func() {
		localSerial := `a:3:{s:30:"ChangingDefaultDatasources.pdf";a:1:{s:24:"AJXP_METADATA_SHAREDUSER";a:1:{s:10:"users_meta";a:8:{s:10:"updated-by";s:5:"user1";s:10:"created-by";s:5:"admin";s:10:"short-text";s:16:"Short Text Value";s:9:"long-text";s:15:"Long Text Value";s:12:"stars-rating";s:1:"5";s:13:"colors-labels";s:9:"important";s:14:"selector-field";s:7:"choice2";s:10:"cloud-tags";s:19:"pdf,docs,dataources";}}}s:9:"icons.pdf";a:1:{s:24:"AJXP_METADATA_SHAREDUSER";a:1:{s:10:"users_meta";a:5:{s:10:"updated-by";s:5:"user1";s:10:"created-by";s:5:"admin";s:10:"short-text";s:20:"3 stars rating, todo";s:12:"stars-rating";s:1:"3";s:13:"colors-labels";s:4:"todo";}}}s:29:"Yubico-U2F-and-OIDC-Final.pdf";a:1:{s:24:"AJXP_METADATA_SHAREDUSER";a:1:{s:10:"users_meta";a:5:{s:10:"updated-by";s:5:"user1";s:10:"created-by";s:5:"admin";s:10:"short-text";s:16:"pdf tag, choice3";s:14:"selector-field";s:7:"choice3";s:10:"cloud-tags";s:3:"pdf";}}}}`

		outMeta, e := UserMetasFromPhpData([]byte(localSerial))
		So(e, ShouldBeNil)
		So(outMeta, ShouldHaveLength, 3)
		var found bool
		for _, meta := range outMeta {
			if meta.NodeName == "ChangingDefaultDatasources.pdf" {
				found = true
				So(meta.Meta, ShouldHaveLength, 8)
				So(meta.Meta["cloud-tags"], ShouldEqual, "pdf,docs,dataources")
				break
			}
		}
		So(found, ShouldBeTrue)
	})

}
