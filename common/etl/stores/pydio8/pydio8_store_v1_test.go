package pydio8

import (
	"testing"

	json "github.com/pydio/cells/x/jsonx"

	"context"

	"github.com/pydio/cells/common/log"
	. "github.com/smartystreets/goconvey/convey"
	"go.uber.org/zap"
)

const globalMeta = `{"1":{"admin":{"/POE 3.2.pdf":{"WATCH":{"admin":"META_WATCH_CHANGE"},"BOOKMARK":{"admin":true}},"/Shared Folder":{"WATCH":{"admin":"META_WATCH_READ"},"BOOKMARK":{"admin":true}},"/Folder Only":{"BOOKMARK":{"admin":true}}},"user01":{"/logo.jpeg":{"BOOKMARK":{"admin":true}},"/logo.png":{"WATCH":{"user01":"META_WATCH_BOTH"}},"/Level1.tar.gz":{"WATCH":{"user01":"META_WATCH_READ"}}}},"66af766301b7f12199319d9555613657":{"AJXP_METADATA_SHAREDUSER":{"/SampleDOCFile_100kb.doc":{"WATCH":{"user01":"META_WATCH_CHANGE"},"BOOKMARK":{"admin":true}},"/SampleDOCFile_5000kb.doc":{"WATCH":{"user01":"META_WATCH_READ"},"BOOKMARK":{"admin":true}},"/SampleDOCFile_500kb.doc":{"WATCH":{"admin":"META_WATCH_BOTH"},"BOOKMARK":{"user01":true}},"/SamplePDFFile_5mb (1).pdf":{"WATCH":{"admin":"META_WATCH_CHANGE"}}}},"d0b6c9e4c7d42bb029a11f2020081410":{"AJXP_METADATA_SHAREDUSER":{"/":{"WATCH":{"links":"META_WATCH_BOTH"}}}}}`

func TestParseGlobalMeta(t *testing.T) {

	Convey("Test Parse Global Meta", t, func() {

		var data P8GlobalMeta
		e := json.Unmarshal([]byte(globalMeta), &data)
		So(e, ShouldBeNil)
		log.Logger(context.Background()).Info("data", zap.Any("data", data))
		So(data, ShouldHaveLength, 3)
		So(data["1"], ShouldNotBeNil)
		So(data["1"], ShouldHaveLength, 2)
		So(data["1"]["admin"], ShouldHaveLength, 3)
		So(data["1"]["admin"]["/POE 3.2.pdf"].Watches, ShouldHaveLength, 1)
		So(data["1"]["admin"]["/POE 3.2.pdf"].Bookmark, ShouldHaveLength, 1)
		So(data["1"]["admin"]["/POE 3.2.pdf"].Bookmark["admin"], ShouldBeTrue)

		So(data["1"]["admin"]["/Folder Only"].Watches, ShouldBeNil)
	})

}
