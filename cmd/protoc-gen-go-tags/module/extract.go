package module

import (
	"fmt"
	"github.com/fatih/structtag"
	pgs "github.com/lyft/protoc-gen-star/v2"
	pgsgo "github.com/lyft/protoc-gen-star/v2/lang/go"
	"google.golang.org/protobuf/reflect/protopath"
	"google.golang.org/protobuf/reflect/protorange"
	"strings"

	orm "github.com/pydio/cells/v5/common/proto/options/orm"
)

type tagExtractor struct {
	pgs.Visitor
	pgs.DebuggerCommon
	pgsgo.Context

	tags map[string]map[string]*structtag.Tags
}

func newTagExtractor(d pgs.DebuggerCommon, ctx pgsgo.Context) *tagExtractor {
	v := &tagExtractor{DebuggerCommon: d, Context: ctx}
	v.Visitor = pgs.PassThroughVisitor(v)
	return v
}

//func (v *tagExtractor) VisitOneOf(o pgs.OneOf) (pgs.Visitor, error) {
//	var tval string
//	ok, err := o.Extension(tagger.E_OneofTags, &tval)
//	if err != nil {
//		return nil, err
//	}
//
//	msgName := v.Context.Name(o.Message()).String()
//
//	if v.tags[msgName] == nil {
//		v.tags[msgName] = map[string]*structtag.Tags{}
//	}
//
//	if !ok {
//		return v, nil
//	}
//
//	tags, err := structtag.Parse(tval)
//	if err != nil {
//		return nil, err
//	}
//
//	v.tags[msgName][v.Context.Name(o).String()] = tags
//
//	return v, nil
//}

func (v *tagExtractor) VisitField(f pgs.Field) (pgs.Visitor, error) {
	var tval *orm.ORMMessagePolicy
	ok, err := f.Message().Extension(orm.E_OrmPolicy, &tval)
	if err != nil || !ok {
		return nil, nil
	}

	msgName := v.Context.Name(f.Message()).String()
	if f.InOneOf() && !f.Descriptor().GetProto3Optional() {
		msgName = f.Message().Name().UpperCamelCase().String() + "_" + f.Name().UpperCamelCase().String()
	}

	if v.tags[msgName] == nil {
		v.tags[msgName] = map[string]*structtag.Tags{}
	}

	tags := structtag.Tags{}

	if err := tags.Set(&structtag.Tag{
		Key:     "gorm",
		Name:    fieldGORMTagValue(f, v),
		Options: []string{},
	}); err != nil {
		v.DebuggerCommon.Fail("Error with tag: ", err)
	}

	v.tags[msgName][v.Context.Name(f).String()] = &tags

	return v, nil
}

func (v *tagExtractor) Extract(f pgs.File) StructTags {
	v.tags = map[string]map[string]*structtag.Tags{}

	v.CheckErr(pgs.Walk(v, f))

	return v.tags
}

func fieldGORMTagValue(f pgs.Field, logger pgs.DebuggerCommon) string {
	var tval *orm.ORMFieldOptions
	ok, err := f.Extension(orm.E_Orm, &tval)
	if err != nil || !ok {
		return "-:all"
	}

	gorm := tval.GetGorm()
	if gorm == nil {
		return "-:all"
	}

	str := ""
	protorange.Range(gorm.ProtoReflect(), func(p protopath.Values) error {

		logger.Log(fmt.Sprintf("going in there %v", p))

		last := p.Index(-1)
		switch last.Value.Interface().(type) {
		case int, int8, int16, int32, int64:
			str += fmt.Sprintf("%s:%d;", last.Step.FieldDescriptor().Name(), last.Value.Int())
		case uint, uint8, uint16, uint32, uint64:
			str += fmt.Sprintf("%s:%d;", last.Step.FieldDescriptor().Name(), last.Value.Uint())
		case string:
			str += fmt.Sprintf("%s:%s;", last.Step.FieldDescriptor().Name(), last.Value.String())
		case bool:
			if last.Value.Bool() {
				str += fmt.Sprintf("%s;", last.Step.FieldDescriptor().Name())
			}
		}

		return nil
	})

	return strings.TrimLeft(str, " ")
}
