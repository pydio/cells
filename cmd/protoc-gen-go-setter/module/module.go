/*
 * Copyright (c) 2024 Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package module

import (
	"fmt"
	"strings"
	"text/template"

	pgs "github.com/lyft/protoc-gen-star/v2"
	pgsgo "github.com/lyft/protoc-gen-star/v2/lang/go"
	"github.com/pydio/cells/v4/common/proto/options/setter"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"google.golang.org/protobuf/types/descriptorpb"
)

// SetterModule adds setter methods on PB messages.
type SetterModule struct {
	*pgs.ModuleBase
	ctx pgsgo.Context
	tpl *template.Template

	typeNameToObject map[string]Object
	usedImports      map[string]string
}

// Object is an interface abstracting the abilities shared by enums, messages, extensions and imported objects.
type Object interface {
	Name() pgs.Name
}

type Message interface {
	IsMapEntry() bool
	Fields() []pgs.Field
}

// New returns an initialized SetterPlugin
func New() *SetterModule {
	return &SetterModule{
		ModuleBase:       &pgs.ModuleBase{},
		typeNameToObject: make(map[string]Object),
		usedImports:      make(map[string]string),
	}
}

func (p *SetterModule) InitContext(c pgs.BuildContext) {
	p.ModuleBase.InitContext(c)
	p.ctx = pgsgo.InitContext(c.Parameters())

	tpl := template.New("setter").Funcs(map[string]interface{}{
		"package":      p.ctx.PackageName,
		"name":         p.ctx.Name,
		"goType":       p.GoType,
		"hasExtension": p.hasExtension,
		"imports":      p.listUsedImports,
		"fieldName": func(name pgs.Name) string {
			return strings.ReplaceAll(cases.Title(language.AmericanEnglish, cases.NoLower).String(name.String()), "-", "_")
		},
	})

	p.tpl = template.Must(tpl.Parse(setterTpl))
}

// Name satisfies the generator.Plugin interface.
func (p *SetterModule) Name() string { return "setter" }

// listUsedImports lists required imports
func (p *SetterModule) listUsedImports() (ii []string) {
	for k := range p.usedImports {
		ii = append(ii, k)
	}
	return
}

// Execute walks the messages and register their types for template generation, then generates template.
func (p *SetterModule) Execute(targets map[string]pgs.File, pkgs map[string]pgs.Package) []pgs.Artifact {

	v := initVisitor(p)

	for _, t := range targets {
		pgs.Walk(v, t)
	}

	for _, t := range targets {
		p.generate(t)
	}

	return p.Artifacts()
}

func (p *SetterModule) generate(f pgs.File) {
	if len(f.Messages()) == 0 {
		return
	}
	//p.Log(p.usedImports)
	name := p.ctx.OutputPath(f).SetExt(".setter.go")
	p.AddGeneratorTemplateFile(name.String(), p.tpl, f)
	f.AllMessages()
}

type Visitor struct {
	pgs.Visitor
	*SetterModule
}

func initVisitor(m *SetterModule) pgs.Visitor {
	v := Visitor{}
	v.Visitor = pgs.PassThroughVisitor(&v)
	v.SetterModule = m
	return v
}

func (v Visitor) VisitEnum(e pgs.Enum) (pgs.Visitor, error) {
	v.Log(e.FullyQualifiedName())
	v.typeNameToObject[e.FullyQualifiedName()] = e

	return nil, nil
}

func (v Visitor) VisitMessage(m pgs.Message) (pgs.Visitor, error) {

	v.typeNameToObject[m.FullyQualifiedName()] = m

	for _, me := range m.MapEntries() {
		v.typeNameToObject[me.FullyQualifiedName()] = me
	}

	for _, me := range m.Enums() {
		v.typeNameToObject[me.FullyQualifiedName()] = includedEnumMessage{me}
	}

	for _, i := range m.Imports() {
		goPackage := *i.File().Descriptor().GetOptions().GoPackage
		v.usedImports[goPackage] = goPackage
		parts := strings.Split(goPackage, "/")
		prefix := parts[len(parts)-1]
		for _, msg := range i.Messages() {
			v.typeNameToObject[msg.FullyQualifiedName()] = &importedMessage{
				Object: msg,
				Prefix: prefix,
			}
		}
	}

	return nil, nil
}

type includedEnumMessage struct {
	pgs.Enum
}

func (i includedEnumMessage) Name() pgs.Name {
	return pgs.Name(i.Parent().Name() + "_" + i.Enum.Name())
}

type importedMessage struct {
	Object
	Prefix string
}

func (i importedMessage) Name() pgs.Name {
	return pgs.Name(i.Prefix + "." + i.Object.Name().String())
}

// ObjectNamed given a fully-qualified input type name as it appears in the input data,
// returns the descriptor for the message or enum with that name.
func (p *SetterModule) ObjectNamed(typeName string) (Object, bool) {
	o, ok := p.typeNameToObject[typeName]
	if !ok {
		return nil, false
	}
	return o, true
}

func (p *SetterModule) GoType(field *descriptorpb.FieldDescriptorProto) (typ string) {
	typ, _ = p.GoTypeAndWire(field)
	return
}

// GoTypeAndWire returns a string representing the type name, and the wire type
func (p *SetterModule) GoTypeAndWire(field *descriptorpb.FieldDescriptorProto) (typ string, wire string) {
	// TODO: Options.
	switch *field.Type {
	case descriptorpb.FieldDescriptorProto_TYPE_DOUBLE:
		typ, wire = "float64", "fixed64"
	case descriptorpb.FieldDescriptorProto_TYPE_FLOAT:
		typ, wire = "float32", "fixed32"
	case descriptorpb.FieldDescriptorProto_TYPE_INT64:
		typ, wire = "int64", "varint"
	case descriptorpb.FieldDescriptorProto_TYPE_UINT64:
		typ, wire = "uint64", "varint"
	case descriptorpb.FieldDescriptorProto_TYPE_INT32:
		typ, wire = "int32", "varint"
	case descriptorpb.FieldDescriptorProto_TYPE_UINT32:
		typ, wire = "uint32", "varint"
	case descriptorpb.FieldDescriptorProto_TYPE_FIXED64:
		typ, wire = "uint64", "fixed64"
	case descriptorpb.FieldDescriptorProto_TYPE_FIXED32:
		typ, wire = "uint32", "fixed32"
	case descriptorpb.FieldDescriptorProto_TYPE_BOOL:
		typ, wire = "bool", "varint"
	case descriptorpb.FieldDescriptorProto_TYPE_STRING:
		typ, wire = "string", "bytes"
	case descriptorpb.FieldDescriptorProto_TYPE_GROUP:
		desc, ok := p.ObjectNamed(field.GetTypeName())
		if ok {
			typ, wire = "*"+string(desc.Name()), "group"
		}
	case descriptorpb.FieldDescriptorProto_TYPE_MESSAGE:
		desc, ok := p.ObjectNamed(field.GetTypeName())
		if ok {
			if m, ok := desc.(Message); ok && m.IsMapEntry() {
				//p.Log(desc.Name(), field.GetTypeName())
				mef := m.Fields()
				if len(mef) != 2 {
					return
				}

				typ, wire = fmt.Sprintf("map[%s]%s", p.GoType(mef[0].Descriptor()), p.GoType(mef[1].Descriptor())), "map"
				return
			} else {
				typ, wire = "*"+string(desc.Name()), "bytes"
			}
		} else {
			p.Fail("unknown message type: " + field.GetName())
		}
	case descriptorpb.FieldDescriptorProto_TYPE_BYTES:
		typ, wire = "[]byte", "bytes"
	case descriptorpb.FieldDescriptorProto_TYPE_ENUM:
		desc, ok := p.ObjectNamed(field.GetTypeName())
		if ok {
			typ, wire = string(desc.Name()), "varint"
		} else {
			p.Fail("unknown bytes type: " + field.GetName())
			//p.Log(field.GetTypeName())
		}
	case descriptorpb.FieldDescriptorProto_TYPE_SFIXED32:
		typ, wire = "int32", "fixed32"
	case descriptorpb.FieldDescriptorProto_TYPE_SFIXED64:
		typ, wire = "int64", "fixed64"
	case descriptorpb.FieldDescriptorProto_TYPE_SINT32:
		typ, wire = "int32", "zigzag32"
	case descriptorpb.FieldDescriptorProto_TYPE_SINT64:
		typ, wire = "int64", "zigzag64"
	default:
		p.Fail("unknown type for", field.GetName())
	}

	field.GetTypeName()
	if isRepeated(field) {
		typ = "[]" + typ
	}
	return
}

func (p *SetterModule) hasExtension(m pgs.Message) bool {
	var enabled bool
	ok, err := m.Extension(setter.E_AllFields, &enabled)
	if err != nil {
		return false
	}

	if !ok {
		return false
	}

	return enabled
}

// Is this field repeated?
func isRepeated(field *descriptorpb.FieldDescriptorProto) bool {
	return field.Label != nil && *field.Label == descriptorpb.FieldDescriptorProto_LABEL_REPEATED
}

const setterTpl = `
/*
 * Copyright (c) 2024 Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

// This file is generated by protoc-gen-go-setter, do not edit manually

package {{ package . }}

import (
	"errors"
	"reflect"
	"google.golang.org/protobuf/proto"


{{- range $ := imports}}
"{{.}}"
{{- end}}
)

{{- range $ := .AllMessages }}
{{- if hasExtension . }}
type I{{ .Name }} interface {
	proto.Message
	{{ .Name }}Getter
	{{ .Name }}Setter
}

func NewI{{ .Name }}(x any) error {
	v := reflect.ValueOf(x)
	for v.Kind() == reflect.Ptr {
		if v.IsNil() && v.CanAddr() {
			v.Set(reflect.New(v.Type().Elem()))
		}

		v = v.Elem()
	}
	if !v.IsValid() {
		return errors.New("not initialized")
	}
	return nil
}

type {{ .Name }}Getter interface {
{{- range .Fields }}
Get{{ .Name | fieldName }}() {{ goType .Descriptor }}
{{- end }}
}

type {{ .Name }}Setter interface {
{{- range .Fields }}
Set{{ .Name | fieldName }}({{ goType .Descriptor }})
{{- end }}
}

{{- range .Fields }}
func (x *{{ $.Name }}) Set{{ .Name | fieldName }}(v {{ goType .Descriptor }}) {
	if x == nil {
		x = new({{ $.Name }})
	}

	x.{{ .Name | fieldName }} = v
}
{{- end }}
{{- end }}
{{- end }}
`
