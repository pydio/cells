package cmd

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/pydio/minio-srv/cmd/logger"
)

// GetBucketTaggingHandler response to /?tagging request
func (api objectAPIHandlers) GetBucketTaggingHandler(w http.ResponseWriter, r *http.Request) {
	ctx := newContext(r, w, "GetBucketTagging")

	defer logger.AuditLog(ctx, w, r)

	objAPI := api.ObjectAPI()
	if objAPI == nil {
		writeErrorResponse(w, ErrServerNotInitialized, r.URL)
		return
	}

	vars := mux.Vars(r)
	bucket := vars["bucket"]
	tags, err := objAPI.GetBucketTagging(ctx, bucket)
	if err != nil {
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}
	response := &BucketTaggingResponse{
		TagSet:TagSet{
			Tag: []Tag{},
		},
	}
	if tags != nil && len(tags) > 0 {
		for k, v := range tags {
			response.TagSet.Tag = append(response.TagSet.Tag, Tag{Key:k, Value:v})
		}
	}
	writeSuccessResponseXML(w, encodeResponse(response))

}