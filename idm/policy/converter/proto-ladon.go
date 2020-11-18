package converter

import (
	"context"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/golang/protobuf/jsonpb"
	"github.com/ory/ladon"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"go.uber.org/zap"
)

func ProtoToLadonPolicy(policy *idm.Policy) ladon.Policy {

	var output ladon.DefaultPolicy
	marshaler := &jsonpb.Marshaler{
		EnumsAsInts: false,
	}
	body, _ := marshaler.MarshalToString(policy)
	err := json.Unmarshal([]byte(body), &output)
	if err != nil {
		log.Logger(context.Background()).Error("cannot translate proto.Policy to ladon.Policy", zap.Error(err))
		//log.Print(err.Error())
	}
	return &output
}

func LadonToProtoPolicy(policy ladon.Policy) *idm.Policy {

	body, _ := json.Marshal(policy)
	var output idm.Policy
	jsonpb.UnmarshalString(string(body), &output)

	return &output
}
