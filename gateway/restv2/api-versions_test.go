package restv2

import (
	"context"
	"net/http"
	"net/url"
	"testing"
	"time"

	"github.com/pydio/cells/v5/common/proto/tree"
	. "github.com/smartystreets/goconvey/convey"
)

// mockPreSigner implements PreSigner interface for testing
type mockPreSigner struct {
	versionID string
}

func (m *mockPreSigner) PreSignV4(ctx context.Context, bucket, key string, params PresignParams) (*http.Request, time.Time, error) {
	u, _ := url.Parse("https://test.example.com/" + bucket + "/" + key)
	req, _ := http.NewRequest(http.MethodGet, u.String(), nil)
	if params.VersionID != "" {
		q := req.URL.Query()
		q.Set("VersionId", params.VersionID)
		req.URL.RawQuery = q.Encode()
	}
	return req, time.Now().Add(1 * time.Hour), nil
}

func TestTreeContentRevisionToVersion_WithPresignedURLs(t *testing.T) {
	Convey("Test TreeContentRevisionToVersion with presigned URLs", t, func() {
		ctx := context.Background()
		h := &Handler{}

		// Create a mock content revision
		revision := &tree.ContentRevision{
			VersionId:   "test-version-123",
			Description: "Test version",
			MTime:       time.Now().Unix(),
			Size:        1024,
			ETag:        "test-etag",
			ContentHash: "test-hash",
			OwnerName:   "testuser",
			OwnerUuid:   "test-user-uuid",
			Location: &tree.Node{
				Path: "common-files/test-file.docx",
			},
		}

		// Create a test node to pass to the function
		testNode := &tree.Node{
			Path: "common-files/test-file.docx",
		}

		Convey("Without presigner option", func() {
			version := h.TreeContentRevisionToVersion(ctx, revision, testNode)
			So(version, ShouldNotBeNil)
			So(version.VersionId, ShouldEqual, "test-version-123")
			So(version.PreSignedGET, ShouldBeNil)
		})

		Convey("With presigner option", func() {
			mockSigner := &mockPreSigner{versionID: "test-version-123"}
			opts := []TNOption{WithPreSigner(mockSigner)}

			version := h.TreeContentRevisionToVersion(ctx, revision, testNode, opts...)
			So(version, ShouldNotBeNil)
			So(version.VersionId, ShouldEqual, "test-version-123")
			So(version.PreSignedGET, ShouldNotBeNil)
			So(version.PreSignedGET.Url, ShouldContainSubstring, "VersionId=test-version-123")
			So(version.PreSignedGET.Url, ShouldContainSubstring, "common-files/test-file.docx")
			So(version.PreSignedGET.ExpiresAt, ShouldBeGreaterThan, 0)
		})

		Convey("With presigner but no node", func() {
			revisionNoLocation := &tree.ContentRevision{
				VersionId:   "test-version-456",
				Description: "Test version",
			}
			mockSigner := &mockPreSigner{versionID: "test-version-456"}
			opts := []TNOption{WithPreSigner(mockSigner)}

			version := h.TreeContentRevisionToVersion(ctx, revisionNoLocation, nil, opts...)
			So(version, ShouldNotBeNil)
			So(version.VersionId, ShouldEqual, "test-version-456")
			// Should not have presigned URL when node is nil
			So(version.PreSignedGET, ShouldBeNil)
		})

		Convey("Presigned URL expiration is set correctly", func() {
			mockSigner := &mockPreSigner{versionID: "test-version-789"}
			opts := []TNOption{WithPreSigner(mockSigner)}

			version := h.TreeContentRevisionToVersion(ctx, revision, testNode, opts...)
			So(version.PreSignedGET, ShouldNotBeNil)
			// ExpiresAt should be a future timestamp (Unix timestamp)
			So(version.PreSignedGET.ExpiresAt, ShouldBeGreaterThan, time.Now().Unix())
		})

		Convey("Presigned URL includes correct versionId parameter and uses node path", func() {
			testVersionId := "specific-version-id-123"
			testNodePath := "common-files/different-path.docx"
			nodeWithPath := &tree.Node{
				Path: testNodePath,
			}
			revisionWithId := &tree.ContentRevision{
				VersionId:   testVersionId,
				Description: "Test version",
			}
			mockSigner := &mockPreSigner{versionID: testVersionId}
			opts := []TNOption{WithPreSigner(mockSigner)}

			version := h.TreeContentRevisionToVersion(ctx, revisionWithId, nodeWithPath, opts...)
			So(version.PreSignedGET, ShouldNotBeNil)
			// URL should contain the VersionId as a query parameter
			So(version.PreSignedGET.Url, ShouldContainSubstring, "VersionId="+testVersionId)
			// URL should use the node's path, not the location path
			So(version.PreSignedGET.Url, ShouldContainSubstring, testNodePath)
		})
	})
}
