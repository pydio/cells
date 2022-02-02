package nodes

import (
	"context"
	"io"

	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
)

type FilterFunc func(ctx context.Context, inputNode *tree.Node, identifier string) (context.Context, *tree.Node, error)
type CallbackFunc func(inputFilter FilterFunc, outputFilter FilterFunc) error

type WalkFunc func(ctx context.Context, node *tree.Node, err error) error
type WalkFilterFunc func(ctx context.Context, node *tree.Node) bool

// Handler is a composed interface providing abilities to CRUD nodes to datasources
type Handler interface {
	tree.NodeProviderClient
	tree.NodeReceiverClient
	tree.NodeChangesStreamerClient
	GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error)
	PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (int64, error)
	CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (int64, error)

	MultipartCreate(ctx context.Context, target *tree.Node, requestData *models.MultipartRequestData) (string, error)
	MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (models.MultipartObjectPart, error)
	MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error
	MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []models.MultipartObjectPart) (models.ObjectInfo, error)

	MultipartList(ctx context.Context, prefix string, requestData *models.MultipartRequestData) (models.ListMultipartUploadsResult, error)
	MultipartListObjectParts(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, maxParts int) (models.ListObjectPartsResult, error)

	ExecuteWrapped(inputFilter FilterFunc, outputFilter FilterFunc, provider CallbackFunc) error
	WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error
	ListNodesWithCallback(ctx context.Context, request *tree.ListNodesRequest, callback WalkFunc, ignoreCbError bool, filters ...WalkFilterFunc) error

	SetClientsPool(p SourcesPool)
}
