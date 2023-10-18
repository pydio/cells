package jobs

import (
	"context"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/proto/service"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

type JsonChunk []byte

type JSONPathSelectorFunc func(ctx context.Context, data interface{}, jsonPath string) ([]interface{}, error)

var (
	JSONPathSelector JSONPathSelectorFunc
)

/*
func (x *DataSelector) Filter(ctx context.Context, input *ActionMessage) (*ActionMessage, *ActionMessage, bool) {
	//TODO implement me
	panic("implement me")
}

func (x *DataSelector) FilterID() string {
	//TODO implement me
	panic("implement me")
}

*/

func (x *DataSelector) Select(ctx context.Context, input *ActionMessage, objects chan interface{}, done chan bool) error {
	defer func() {
		done <- true
	}()

	for _, q := range x.toDataSelectorQueries(ctx, input, x.GetQuery()) {

		if q.GetJsonPath() != "" && JSONPathSelector != nil && input.GetLastOutput() != nil {
			root := map[string]interface{}{}
			var data interface{}
			if er := json.Unmarshal(input.GetLastOutput().JsonBody, &data); er == nil {
				root["JsonBody"] = data
			}
			root["Vars"] = input.StackedVars()
			output, err := JSONPathSelector(ctx, root, q.GetJsonPath())
			if err != nil {
				return err
			} else {
				for _, o := range output {
					jc, _ := json.Marshal(o)
					objects <- JsonChunk(jc)
				}
			}
		}
	}

	return nil
}

func (x *DataSelector) MultipleSelection() bool {
	return x.Collect
}

func (x *DataSelector) SelectorID() string {
	return "DataSelector"
}

func (x *DataSelector) SelectorLabel() string {
	if x.Label != "" {
		return x.Label
	}
	return x.SelectorID()
}

func (x *DataSelector) ApplyClearInput(msg *ActionMessage) *ActionMessage {
	return msg
}

func (x *DataSelector) toDataSelectorQueries(ctx context.Context, input *ActionMessage, query *service.Query) (out []*DataSelectorSingleQuery) {
	dq := &DataSelectorSingleQuery{}
	for _, sub := range query.SubQueries {
		if er := anypb.UnmarshalTo(sub, dq, proto.UnmarshalOptions{}); er == nil {
			dq.JsonPath = EvaluateFieldStr(ctx, input, dq.JsonPath)
			out = append(out, dq)
		}
	}
	return
}
