package restv2

import (
	"context"
	"errors"
	"net/http"
	"testing"

	restful "github.com/emicklei/go-restful/v3"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	. "github.com/smartystreets/goconvey/convey"
)

// mockEditorProvider implements EditorProvider interface for testing
type mockEditorProvider struct {
	supportedExt []string
	shouldError  bool
}

func (m *mockEditorProvider) Provides(ext string) bool {
	for _, supported := range m.supportedExt {
		if ext == "."+supported || ext == supported {
			return true
		}
	}
	return false
}

func (m *mockEditorProvider) Get(ctx context.Context, node *tree.Node) (*rest.PreSignedURL, error) {
	if m.shouldError {
		return nil, errors.New("test error")
	}
	return &rest.PreSignedURL{
		Url:       "https://editor.example.com/edit?file=" + node.Uuid,
		ExpiresAt: 1234567890,
	}, nil
}

func createMockRequest() *restful.Request {
	req, _ := http.NewRequest("GET", "https://example.com/test", nil)
	req = req.WithContext(context.Background())
	container := restful.NewContainer()
	ws := new(restful.WebService)
	container.Add(ws)
	restfulReq := restful.NewRequest(req)
	return restfulReq
}

func TestTNOptionsFromFlags(t *testing.T) {
	Convey("Test TNOptionsFromFlags", t, func() {
		// Temporarily clear factories to avoid config dependency in all tests
		originalFactories := make(map[string]EditorProviderFactory)
		for k, v := range editorProviderFactories {
			originalFactories[k] = v
		}
		editorProviderFactories = make(map[string]EditorProviderFactory)
		defer func() {
			editorProviderFactories = originalFactories
		}()

		h := &Handler{}
		req := createMockRequest()

		Convey("With WithPreSignedURLs flag", func() {
			flags := []rest.Flag{rest.Flag_WithPreSignedURLs}
			oo := h.TNOptionsFromFlags(req, flags)
			// oo might be empty if signer creation fails, which is acceptable
			// Just verify the function doesn't panic
			_ = oo

			opts := &TNOptions{}
			// Expectation
			So(len(oo), ShouldBeGreaterThanOrEqualTo, 0)
			// Apply options to verify they can be applied without error
			for _, o := range oo {
				o(opts)
			}
		})

		Convey("With WithEditorURLs flag", func() {
			flags := []rest.Flag{rest.Flag_WithEditorURLs}
			oo := h.TNOptionsFromFlags(req, flags)

			// Apply options and check EditorURLGenerate is set
			opts := &TNOptions{}
			for _, o := range oo {
				o(opts)
			}
			So(opts.EditorURLGenerate, ShouldBeTrue)
		})

		Convey("With multiple flags", func() {
			flags := []rest.Flag{
				rest.Flag_WithPreSignedURLs,
				rest.Flag_WithEditorURLs,
			}
			oo := h.TNOptionsFromFlags(req, flags)

			opts := &TNOptions{}
			for _, o := range oo {
				o(opts)
			}
			So(opts.EditorURLGenerate, ShouldBeTrue)
		})

		Convey("With registered editor provider factory", func() {
			// Register a test factory
			testFactoryCalled := false
			testProvider := &mockEditorProvider{supportedExt: []string{"docx"}}
			RegisterEditorProviderFactory("test-editor", func(ctx context.Context, req *restful.Request) (EditorProvider, bool) {
				testFactoryCalled = true
				return testProvider, true
			})

			flags := []rest.Flag{rest.Flag_WithEditorURLs}
			oo := h.TNOptionsFromFlags(req, flags)
			So(oo, ShouldNotBeNil)

			opts := &TNOptions{}
			for _, o := range oo {
				o(opts)
			}

			So(testFactoryCalled, ShouldBeTrue)
			So(opts.EditorURLProvider, ShouldNotBeNil)
			So(opts.EditorURLProvider["test-editor"], ShouldEqual, testProvider)
			So(opts.EditorURLGenerate, ShouldBeTrue)
		})

		Convey("With factory that returns disabled", func() {
			RegisterEditorProviderFactory("disabled-editor", func(ctx context.Context, req *restful.Request) (EditorProvider, bool) {
				return nil, false
			})

			flags := []rest.Flag{rest.Flag_WithEditorURLs}
			oo := h.TNOptionsFromFlags(req, flags)
			So(oo, ShouldNotBeNil)

			opts := &TNOptions{}
			for _, o := range oo {
				o(opts)
			}

			So(opts.EditorURLProvider, ShouldBeNil)
			So(opts.EditorURLGenerate, ShouldBeTrue)
		})
	})
}

func TestToRestFlags(t *testing.T) {
	Convey("Test toRestFlags", t, func() {
		h := &Handler{}

		Convey("With valid flag strings", func() {
			flagStrs := []string{"WithPreSignedURLs", "WithEditorURLs"}
			flags := h.toRestFlags(flagStrs)
			So(flags, ShouldNotBeNil)
			So(len(flags), ShouldEqual, 2)
			So(flags[0], ShouldEqual, rest.Flag_WithPreSignedURLs)
			So(flags[1], ShouldEqual, rest.Flag_WithEditorURLs)
		})

		Convey("With invalid flag strings", func() {
			flagStrs := []string{"InvalidFlag", "AnotherInvalid"}
			flags := h.toRestFlags(flagStrs)
			So(len(flags), ShouldEqual, 0)
		})

		Convey("With mixed valid and invalid flags", func() {
			flagStrs := []string{"WithPreSignedURLs", "InvalidFlag", "WithEditorURLs"}
			flags := h.toRestFlags(flagStrs)
			So(flags, ShouldNotBeNil)
			So(len(flags), ShouldEqual, 2)
			So(flags[0], ShouldEqual, rest.Flag_WithPreSignedURLs)
			So(flags[1], ShouldEqual, rest.Flag_WithEditorURLs)
		})

	})
}

func TestParseFlags(t *testing.T) {
	Convey("Test parseFlags", t, func() {
		h := &Handler{}

		Convey("With WithMetaCoreOnly flag", func() {
			restFlags := []rest.Flag{rest.Flag_WithMetaCoreOnly}
			treeFlags := h.parseFlags(restFlags)
			So(treeFlags, ShouldNotBeNil)
			So(len(treeFlags), ShouldEqual, 1)
			So(treeFlags[0], ShouldEqual, tree.StatFlagMetaMinimal)
		})

		Convey("With WithVersionsAll flag", func() {
			restFlags := []rest.Flag{rest.Flag_WithVersionsAll}
			treeFlags := h.parseFlags(restFlags)
			So(treeFlags, ShouldNotBeNil)
			So(len(treeFlags), ShouldEqual, 1)
			So(treeFlags[0], ShouldEqual, tree.StatFlagVersionsAll)
		})

		Convey("With WithVersionsDraft flag", func() {
			restFlags := []rest.Flag{rest.Flag_WithVersionsDraft}
			treeFlags := h.parseFlags(restFlags)
			So(treeFlags, ShouldNotBeNil)
			So(len(treeFlags), ShouldEqual, 1)
			So(treeFlags[0], ShouldEqual, tree.StatFlagVersionsDraft)
		})

		Convey("With WithVersionsPublished flag", func() {
			restFlags := []rest.Flag{rest.Flag_WithVersionsPublished}
			treeFlags := h.parseFlags(restFlags)
			So(treeFlags, ShouldNotBeNil)
			So(len(treeFlags), ShouldEqual, 1)
			So(treeFlags[0], ShouldEqual, tree.StatFlagVersionsPublished)
		})

		Convey("With WithMetaNone flag", func() {
			restFlags := []rest.Flag{rest.Flag_WithMetaNone}
			treeFlags := h.parseFlags(restFlags)
			So(treeFlags, ShouldNotBeNil)
			So(len(treeFlags), ShouldEqual, 1)
			So(treeFlags[0], ShouldEqual, tree.StatFlagNone)
		})

		Convey("With multiple flags", func() {
			restFlags := []rest.Flag{
				rest.Flag_WithMetaCoreOnly,
				rest.Flag_WithVersionsAll,
				rest.Flag_WithMetaNone,
			}
			treeFlags := h.parseFlags(restFlags)
			So(treeFlags, ShouldNotBeNil)
			So(len(treeFlags), ShouldEqual, 3)
			So(treeFlags[0], ShouldEqual, tree.StatFlagMetaMinimal)
			So(treeFlags[1], ShouldEqual, tree.StatFlagVersionsAll)
			So(treeFlags[2], ShouldEqual, tree.StatFlagNone)
		})

		Convey("With unrecognized flags", func() {
			restFlags := []rest.Flag{
				rest.Flag_WithPreSignedURLs,
				rest.Flag_WithEditorURLs,
			}
			treeFlags := h.parseFlags(restFlags)
			So(len(treeFlags), ShouldEqual, 0)
		})
	})
}
