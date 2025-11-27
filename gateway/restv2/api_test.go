package restv2

import (
	"context"
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
	. "github.com/smartystreets/goconvey/convey"
)

func TestTreeNodeToNode_WithEditorURLs(t *testing.T) {
	Convey("Test TreeNodeToNode with EditorURL options", t, func() {
		ctx := context.Background()
		h := &Handler{}

		testNode := &tree.Node{
			Uuid: "test-uuid-123",
			Path: "test/document.docx",
			Type: tree.NodeType_LEAF,
			Size: 1024,
		}

		mockProvider := &mockEditorProvider{
			supportedExt: []string{"docx"},
			shouldError:  false,
		}

		Convey("Without EditorURLGenerate flag", func() {
			opts := []TNOption{
				WithEditorProvider("test-editor", mockProvider),
			}

			rn := h.TreeNodeToNode(ctx, testNode, opts...)
			So(rn, ShouldNotBeNil)
			So(rn.Uuid, ShouldEqual, "test-uuid-123")
			So(rn.EditorURLsKeys, ShouldNotBeNil)
			So(len(rn.EditorURLsKeys), ShouldEqual, 1)
			So(rn.EditorURLsKeys[0], ShouldEqual, "test-editor")
			// URLs should not be generated
			So(rn.EditorURLs, ShouldNotBeNil)
			So(len(rn.EditorURLs), ShouldEqual, 0)
		})

		Convey("With EditorURLGenerate flag", func() {
			opts := []TNOption{
				WithEditorProvider("test-editor", mockProvider),
				WithEditorURLGenerate(),
			}

			rn := h.TreeNodeToNode(ctx, testNode, opts...)
			So(rn, ShouldNotBeNil)
			So(rn.Uuid, ShouldEqual, "test-uuid-123")
			So(rn.EditorURLsKeys, ShouldNotBeNil)
			So(len(rn.EditorURLsKeys), ShouldEqual, 1)
			So(rn.EditorURLsKeys[0], ShouldEqual, "test-editor")
			// URLs should be generated
			So(rn.EditorURLs, ShouldNotBeNil)
			So(len(rn.EditorURLs), ShouldEqual, 1)
			So(rn.EditorURLs["test-editor"], ShouldNotBeNil)
			So(rn.EditorURLs["test-editor"].Url, ShouldContainSubstring, "test-uuid-123")
		})

		Convey("With unsupported file extension", func() {
			pdfNode := &tree.Node{
				Uuid: "test-uuid-456",
				Path: "test/document.pdf",
				Type: tree.NodeType_LEAF,
			}

			opts := []TNOption{
				WithEditorProvider("test-editor", mockProvider),
				WithEditorURLGenerate(),
			}

			rn := h.TreeNodeToNode(ctx, pdfNode, opts...)
			So(rn, ShouldNotBeNil)
			So(len(rn.EditorURLsKeys), ShouldEqual, 0)
			So(len(rn.EditorURLs), ShouldEqual, 0)
		})

		Convey("With multiple editor providers", func() {
			mockProvider2 := &mockEditorProvider{
				supportedExt: []string{"xlsx"},
				shouldError:  false,
			}

			xlsxNode := &tree.Node{
				Uuid: "test-uuid-789",
				Path: "test/spreadsheet.xlsx",
				Type: tree.NodeType_LEAF,
			}

			opts := []TNOption{
				WithEditorProvider("editor1", mockProvider),
				WithEditorProvider("editor2", mockProvider2),
				WithEditorURLGenerate(),
			}

			rn := h.TreeNodeToNode(ctx, xlsxNode, opts...)
			So(rn, ShouldNotBeNil)
			So(len(rn.EditorURLsKeys), ShouldEqual, 1)
			So(rn.EditorURLsKeys[0], ShouldEqual, "editor2")
			So(len(rn.EditorURLs), ShouldEqual, 1)
			So(rn.EditorURLs["editor2"], ShouldNotBeNil)
		})

		Convey("With provider that errors on Get", func() {
			errorProvider := &mockEditorProvider{
				supportedExt: []string{"docx"},
				shouldError:  true,
			}

			opts := []TNOption{
				WithEditorProvider("error-editor", errorProvider),
				WithEditorURLGenerate(),
			}

			rn := h.TreeNodeToNode(ctx, testNode, opts...)
			So(rn, ShouldNotBeNil)
			So(len(rn.EditorURLsKeys), ShouldEqual, 1)
			So(rn.EditorURLsKeys[0], ShouldEqual, "error-editor")
			// URL should not be added due to error
			So(len(rn.EditorURLs), ShouldEqual, 0)
		})

		Convey("With case-insensitive extension matching", func() {
			upperCaseNode := &tree.Node{
				Uuid: "test-uuid-case",
				Path: "test/document.DOCX",
				Type: tree.NodeType_LEAF,
			}

			opts := []TNOption{
				WithEditorProvider("test-editor", mockProvider),
				WithEditorURLGenerate(),
			}

			rn := h.TreeNodeToNode(ctx, upperCaseNode, opts...)
			So(rn, ShouldNotBeNil)
			// TreeNodeToNode uses strings.ToLower(path.Ext(n.Path)) so .DOCX should match
			So(len(rn.EditorURLsKeys), ShouldEqual, 1)
		})

		Convey("With both PreSigner and EditorURL options", func() {
			mockSigner := &mockPreSigner{}
			opts := []TNOption{
				WithPreSigner(mockSigner),
				WithEditorProvider("test-editor", mockProvider),
				WithEditorURLGenerate(),
			}

			rn := h.TreeNodeToNode(ctx, testNode, opts...)
			So(rn, ShouldNotBeNil)
			So(rn.PreSignedGET, ShouldNotBeNil)
			So(len(rn.EditorURLsKeys), ShouldEqual, 1)
			So(len(rn.EditorURLs), ShouldEqual, 1)
		})
	})
}
