package actions

import (
	"context"

	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/telemetry/log"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

// TaskParameter encapsulates a form parameter and its value at runtime.
// There are three modes :
//   - Basic types (FormField) always pass values as string (to be evaluated)
//   - Replicable Fields may find 0 or N occurrences of a map[string]*TaskParameter
//   - SwitchField has a switch value and corresponding set of subvalues as map[string]*TaskParameter
type TaskParameter struct {
	*forms.FormField
	raw string
	// Replicable Case
	multiple    bool
	occurrences []map[string]*TaskParameter
	// Switch Case
	isSwitch    bool
	switchValue string
	subValues   map[string]*TaskParameter

	containerRef *TaskParameters
}

// Raw returns the raw value as string
func (f *TaskParameter) Raw() string {
	return f.raw
}

func (f *TaskParameter) IsMultiple() bool {
	return f.multiple
}

func (f *TaskParameter) IsSwitch() bool {
	return f.isSwitch
}

// Occurrences returns a slice of TaskParameters, each one containing the map of TaskParameter
func (f *TaskParameter) Occurrences() (oo []*TaskParameters) {
	for _, m := range f.occurrences {
		oo = append(oo, &TaskParameters{
			pp:    m,
			ctx:   f.containerRef.ctx,
			input: f.containerRef.input,
		})
	}
	return
}

// SwitchValues returns both the selected value and the sub form data as a TaskParameters container
func (f *TaskParameter) SwitchValues() (string, *TaskParameters) {
	tp := &TaskParameters{
		pp:    f.subValues,
		ctx:   f.containerRef.ctx,
		input: f.containerRef.input,
	}
	return f.switchValue, tp
}

func (f *TaskParameter) String(ctx context.Context, input *jobs.ActionMessage) string {
	return jobs.EvaluateFieldStr(ctx, input, f.raw)
}

func (f *TaskParameter) Int(ctx context.Context, input *jobs.ActionMessage) (int, error) {
	return jobs.EvaluateFieldInt(ctx, input, f.raw)
}

func (f *TaskParameter) MustInt(ctx context.Context, input *jobs.ActionMessage) int {
	i, _ := jobs.EvaluateFieldInt(ctx, input, f.raw)
	return i
}

func (f *TaskParameter) Int64(ctx context.Context, input *jobs.ActionMessage) (int64, error) {
	return jobs.EvaluateFieldInt64(ctx, input, f.raw)
}

func (f *TaskParameter) MustInt64(ctx context.Context, input *jobs.ActionMessage) int64 {
	i, _ := jobs.EvaluateFieldInt64(ctx, input, f.raw)
	return i
}

func (f *TaskParameter) Bool(ctx context.Context, input *jobs.ActionMessage) (bool, error) {
	return jobs.EvaluateFieldBool(ctx, input, f.raw)
}

func (f *TaskParameter) MustBool(ctx context.Context, input *jobs.ActionMessage) bool {
	b, _ := jobs.EvaluateFieldBool(ctx, input, f.raw)
	return b
}

// TaskParameters encapsulates action.Parameters at runtime.
// Use it as a composable struct in ConcreteAction implementations
// Do not forget to call InitParameters at runtime.
type TaskParameters struct {
	pp    map[string]*TaskParameter
	ctx   context.Context
	input *jobs.ActionMessage
}

// InitParameters MUST be called at action.Init
func (p *TaskParameters) InitParameters(f *forms.Form, a *jobs.Action) {
	p.pp = map[string]*TaskParameter{}
	for _, group := range f.Groups {
		p.flattenGroup(group.Fields, a.Parameters, p.pp)
	}
}

// WithParametersRuntime sets context and input message for further evaluations
func (p *TaskParameters) WithParametersRuntime(ctx context.Context, input *jobs.ActionMessage) {
	p.ctx = ctx
	p.input = input
}

// Get returns a *TaskParameter for a specific key
func (p *TaskParameters) Get(s string) *TaskParameter {
	if tp, ok := p.pp[s]; ok {
		return tp
	} else {
		return &TaskParameter{
			containerRef: p,
		}
	}
}

// String evaluates underlying value to string
func (p *TaskParameters) String(name string) string {
	if p.input == nil {
		panic("missing TaskParameters.SetRuntime call")
	}
	return p.Get(name).String(p.ctx, p.input)
}

// Int evaluates underlying value to int
func (p *TaskParameters) Int(name string) (int, error) {
	if p.input == nil {
		panic("missing TaskParameters.SetRuntime call")
	}
	return p.Get(name).Int(p.ctx, p.input)
}

// MustInt evaluates underlying value to int without error checking
func (p *TaskParameters) MustInt(name string) int {
	if p.input == nil {
		panic("missing TaskParameters.SetRuntime call")
	}
	return p.Get(name).MustInt(p.ctx, p.input)
}

// Int64 evaluates underlying value to int64
func (p *TaskParameters) Int64(name string) (int64, error) {
	if p.input == nil {
		panic("missing TaskParameters.SetRuntime call")
	}
	return p.Get(name).Int64(p.ctx, p.input)
}

// MustInt64 evaluates underlying value to int64 without error checking
func (p *TaskParameters) MustInt64(name string) int64 {
	if p.input == nil {
		panic("missing TaskParameters.SetRuntime call")
	}
	return p.Get(name).MustInt64(p.ctx, p.input)
}

// Bool evaluates underlying value to bool
func (p *TaskParameters) Bool(name string) (bool, error) {
	if p.input == nil {
		panic("missing TaskParameters.SetRuntime call")
	}
	return p.Get(name).Bool(p.ctx, p.input)
}

// MustBool evaluates underlying value to bool without error checking
func (p *TaskParameters) MustBool(name string) bool {
	if p.input == nil {
		panic("missing TaskParameters.SetRuntime call")
	}
	return p.Get(name).MustBool(p.ctx, p.input)
}

func (p *TaskParameters) flattenGroup(fields []forms.Field, parameters map[string]string, out map[string]*TaskParameter) {
	for _, field := range fields {
		if ff, ok := field.(*forms.FormField); ok && ff.Name != "" {
			v := ff.StringDefault()
			if av, ok := parameters[ff.Name]; ok {
				v = av
			}
			out[ff.Name] = &TaskParameter{FormField: ff, raw: v, containerRef: p}
		} else if sw, ok3 := field.(*forms.SwitchField); ok3 {
			name := sw.Name
			sf := &TaskParameter{
				isSwitch:     true,
				subValues:    map[string]*TaskParameter{},
				containerRef: p,
			}
			jsonEncoded := parameters[name]
			if jsonEncoded == "" {
				jsonEncoded = "{}"
			}
			var jsonValues map[string]string
			if er := json.Unmarshal([]byte(jsonEncoded), &jsonValues); er != nil {
				if jsonEncoded != "-1" {
					log.Logger(context.Background()).Warn("Cannot parse switch values " + jsonEncoded + ", skipping " + name + ", error: " + er.Error())
				}
				continue
			}
			sf.switchValue = jsonValues["@value"]
			if sf.switchValue == "" {
				sf.switchValue = sw.Default
			}
			if sf.switchValue != "" {
				for _, vv := range sw.Values {
					if vv.Value == sf.switchValue {
						p.flattenGroup(vv.Fields, jsonValues, sf.subValues)
					}
				}
			}
			out[name] = sf
		} else if rf, ok2 := field.(*forms.ReplicableFields); ok2 {
			mf := &TaskParameter{multiple: true, containerRef: p}
			var tuples []forms.Tuple
			kvs := map[string]*TaskParameter{}
			p.flattenGroup(rf.Fields, parameters, kvs)
			for _, formField := range kvs {
				tuples = append(tuples, forms.Tuple{Name: formField.Name, Optional: !formField.Mandatory})
			}
			for _, line := range forms.ParseReplicableTuples(parameters, tuples...) {
				value := map[string]*TaskParameter{}
				for k, v := range kvs {
					value[k] = &TaskParameter{FormField: v.FormField, raw: line[k], containerRef: p}
				}
				mf.occurrences = append(mf.occurrences, value)
			}
			out[rf.Id] = mf
		}
	}
}
