package jobs

import (
	"context"
	"strings"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/proto/service"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

type JsonChunk struct {
	d interface{}
	v string
}

type JSONPathSelectorFunc func(ctx context.Context, data interface{}, jsonPath string) ([]interface{}, error)

var (
	JSONPathSelector JSONPathSelectorFunc
)

func (x *DataSelector) Select(ctx context.Context, input *ActionMessage, objects chan interface{}, done chan bool) error {
	defer func() {
		done <- true
	}()

	for _, q := range x.toDataSelectorQueries(ctx, input, x.GetQuery()) {

		jsonPath := q.GetJsonPath()
		if jsonPath != "" && JSONPathSelector != nil {
			var targetVariable string
			if parts := strings.Split(jsonPath, "=>"); len(parts) > 1 {
				jsonPath = strings.TrimSpace(parts[0])
				targetVariable = strings.TrimSpace(parts[1])
			}
			root := map[string]interface{}{}
			needInput, needJson, needVars, expectedVars := x.PreParseJsonPath(jsonPath)
			// Feed with necessary data
			if needJson && input.GetLastOutput() != nil && len(input.GetLastOutput().JsonBody) > 0 {
				var data interface{}
				if er := json.Unmarshal(input.GetLastOutput().JsonBody, &data); er == nil {
					root["JsonBody"] = data
				}
			}
			if needVars {
				root["Vars"] = input.StackedVars(expectedVars...)
			}
			if needInput {
				jj, _ := json.Marshal(input)
				var jjD map[string]interface{}
				if er := json.Unmarshal(jj, &jjD); er == nil {
					root["Input"] = jjD
				}
			}
			output, err := JSONPathSelector(ctx, root, jsonPath)
			if err != nil {
				return err
			} else {
				for _, o := range output {
					objects <- JsonChunk{v: targetVariable, d: o}
				}
			}
		}
	}

	return nil
}

func (x *DataSelector) PreParseJsonPath(jp string) (input, jsonBody, vars bool, expectedVars []string) {
	jp = strings.TrimPrefix(jp, "$.")
	switch {

	case strings.HasPrefix(jp, "Input"):
		input = true

	case strings.HasPrefix(jp, "JsonBody"):
		jsonBody = true

	case strings.HasPrefix(jp, "Vars"):
		vars = true
		jp = strings.TrimPrefix(jp, "Vars")
		if strings.HasPrefix(jp, ".") {
			tokens := strings.SplitN(jp, ".", 3)
			if len(tokens) >= 2 && tokens[1] != "*" {
				expectedVars = append(expectedVars, tokens[1])
			}
		}

	default:
		// We are not sure, return now
		input, jsonBody, vars = true, true, true
	}
	return
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
