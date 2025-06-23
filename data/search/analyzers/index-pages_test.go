package analyzers

import (
	"context"
	"testing"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/tree"

	. "github.com/smartystreets/goconvey/convey"
)

const jsonPage = "[{\"id\":\"4d515360-e5f7-48f7-91d9-d15521e86595\",\"type\":\"header\",\"props\":{\"textColor\":\"default\"},\"children\":[]},{\"id\":\"61ed2cfe-ed88-48aa-91de-cbec931a1824\",\"type\":\"paragraph\",\"props\":{\"textColor\":\"default\",\"backgroundColor\":\"default\",\"textAlignment\":\"left\"},\"content\":[{\"type\":\"text\",\"text\":\"This is a paragraph\",\"styles\":{}}],\"children\":[]},{\"id\":\"f35c478b-93e8-4e33-8715-08e5c9bd6c0e\",\"type\":\"paragraph\",\"props\":{\"textColor\":\"default\",\"backgroundColor\":\"default\",\"textAlignment\":\"left\"},\"content\":[],\"children\":[]},{\"id\":\"10fb3503-39a6-498f-83e8-9ba825d2151a\",\"type\":\"table\",\"props\":{\"textColor\":\"default\"},\"content\":{\"type\":\"tableContent\",\"columnWidths\":[null,null,null],\"rows\":[{\"cells\":[{\"type\":\"tableCell\",\"content\":[],\"props\":{\"colspan\":1,\"rowspan\":1,\"backgroundColor\":\"default\",\"textColor\":\"default\",\"textAlignment\":\"left\"}},{\"type\":\"tableCell\",\"content\":[],\"props\":{\"colspan\":1,\"rowspan\":1,\"backgroundColor\":\"default\",\"textColor\":\"default\",\"textAlignment\":\"left\"}},{\"type\":\"tableCell\",\"content\":[],\"props\":{\"colspan\":1,\"rowspan\":1,\"backgroundColor\":\"default\",\"textColor\":\"default\",\"textAlignment\":\"left\"}}]},{\"cells\":[{\"type\":\"tableCell\",\"content\":[],\"props\":{\"colspan\":1,\"rowspan\":1,\"backgroundColor\":\"default\",\"textColor\":\"default\",\"textAlignment\":\"left\"}},{\"type\":\"tableCell\",\"content\":[],\"props\":{\"colspan\":1,\"rowspan\":1,\"backgroundColor\":\"default\",\"textColor\":\"default\",\"textAlignment\":\"left\"}},{\"type\":\"tableCell\",\"content\":[{\"type\":\"text\",\"text\":\"This is a table cell\",\"styles\":{}}],\"props\":{\"colspan\":1,\"rowspan\":1,\"backgroundColor\":\"default\",\"textColor\":\"default\",\"textAlignment\":\"left\"}}]}]},\"children\":[]},{\"id\":\"f39e74f8-727e-4bc5-a655-31d397488a44\",\"type\":\"paragraph\",\"props\":{\"textColor\":\"default\",\"backgroundColor\":\"default\",\"textAlignment\":\"left\"},\"content\":[],\"children\":[]}]"

func TestIndexPages(t *testing.T) {
	Convey("Ensure Json Page parsing", t, func() {
		n := &tree.IndexableNode{
			Node: &tree.Node{
				MetaStore: map[string]string{
					"usermeta-pad": jsonPage,
				},
			},
		}
		ctx := config.WithStubStore(context.Background())
		_ = config.Set(ctx, "usermeta-pad", config.FrontendPluginPath("editor.bnote", "BNOTE_PAGES_META")...)
		e := IndexPages(ctx, n, nil)
		So(e, ShouldBeNil)
		So(n.TextContent, ShouldNotBeEmpty)
		So(n.TextContent, ShouldEqual, "This is a paragraph\nThis is a table cell")
	})
}
