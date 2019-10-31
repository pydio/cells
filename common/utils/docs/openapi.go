package docs

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"text/template"

	"github.com/go-openapi/loads"
	"github.com/go-openapi/spec"

	"github.com/pydio/cells/common/service"
)

var tocTemplate = `
{{define "toc"}}
Table of Contents

{{range .Services}}
 - **{{if .Title}}{{.Title}}{{else}}{{.Name}}{{end}}** {{.Short}}
{{end}}

{{end}}
`

var paramTemplate = `
{{define "parameter"}}
Name | Description | Type | Required
---|---|---|---
{{range .FirstLevel}}**{{.Name}}** | {{.Description}} | _{{.TypeName}}_ | {{if .Required}}Yes{{end}}  
{{end}}
{{if .TypeExample}}
### Body Example
{{toJsonPre .TypeExample}}
{{end}}
{{end}}
`

var mdTemplate = `
# Cells API
{{template "toc" .}}

{{range .Services}}
## {{if .Title}}{{.Title}}{{else}}{{.Name}}{{end}}
{{.Long}}

{{range .Operations}}
### [{{.Type}}] {{.Path}}  
{{.Description}}  

{{if .BodyParameter}}
### Body Parameters
{{template "parameter" .BodyParameter}}
{{else if .Parameters}}
### Path Parameters
{{range .Parameters}}
 - **{{.Name}}** (_{{.TypeName}}{{if .Required}}, required{{end}}_) {{.Description}}
{{end}}
{{else}}
No Parameters
{{end}}

{{if .Response200}}
### Response Example (200)
Response Type {{.Response200.TypeDescription}}

{{toJsonPre .Response200.TypeExample}}
{{end}}

{{end}}
{{end}}
`

type TplData struct {
	Services []Service
}

type Parameter struct {
	Name            string
	Description     string
	Required        bool
	Position        string
	TypeName        string
	TypeDescription string
	FirstLevel      map[string]*Parameter
	TypeExample     interface{}
}

type Op struct {
	Type          string
	Path          string
	Description   string
	Parameters    []*Parameter
	BodyParameter *Parameter
	Response200   *Parameter
}

type Service struct {
	Name       string
	Title      string
	Short      string
	Long       string
	Operations []Op
}

func GenOpenAPIDocs(output string) error {
	// Load Json Spec into a readable format
	services := loadJsonSpec()
	// Convert to TplData
	tplData := &TplData{}
	for name, ops := range services {
		s := Service{Name: name}
		if ks, ok := knownServices[name]; ok {
			s = *ks
			s.Name = name
		}
		s.Operations = ops
		tplData.Services = append(tplData.Services, s)
	}
	// Feed Json Data
	return writeToMd(output, tplData)
}

func writeToMd(outputFolder string, tplData *TplData) error {
	wr, e := os.OpenFile(filepath.Join(outputFolder, "api.md"), os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0666)
	if e != nil {
		return e
	}
	defer wr.Close()
	tpl := template.New("services").Funcs(template.FuncMap{
		"toJsonPre": func(data interface{}) string {
			d, _ := json.MarshalIndent(data, "", "  ")
			return "```\n" + string(d) + "\n```\n"
		},
	})
	t, e := tpl.Parse(tocTemplate + paramTemplate + mdTemplate)
	if e != nil {
		return e
	}
	e = t.Execute(wr, tplData)
	if e != nil {
		return e
	}
	return nil
}

func loadJsonSpec() map[string][]Op {
	jsonSpec := service.SwaggerSpec()
	services := map[string][]Op{}
	for uri, p := range jsonSpec.Spec().Paths.Paths {
		parseOperation(jsonSpec, uri, "GET", p.Get, services)
		parseOperation(jsonSpec, uri, "PUT", p.Put, services)
		parseOperation(jsonSpec, uri, "OPTIONS", p.Options, services)
		parseOperation(jsonSpec, uri, "DELETE", p.Delete, services)
		parseOperation(jsonSpec, uri, "POST", p.Post, services)
		parseOperation(jsonSpec, uri, "PATCH", p.Patch, services)
	}
	return services
}

func parseOperation(document *loads.Document, uri, opType string, o *spec.Operation, services map[string][]Op) {
	if o == nil {
		return
	}
	tags := strings.Join(o.Tags, ",")

	var parameters []*Parameter
	op := Op{
		Type:        opType,
		Path:        "/a" + uri,
		Description: o.Summary,
	}
	for _, param := range o.Parameters {
		paramPosition := param.In
		if opType == "GET" && paramPosition == "query" {
			continue // Ignore
		}
		parameter := &Parameter{
			Position:    paramPosition,
			Name:        param.Name,
			Description: param.Description,
			Required:    param.Required,
		}
		if param.Schema != nil {
			parameter.TypeName = "object"
			parameter.TypeDescription, parameter.FirstLevel, parameter.TypeExample = parseSchema(document, param.Schema)
		} else {
			parameter.TypeName = param.SimpleSchema.Type
		}
		if paramPosition == "body" {
			op.BodyParameter = parameter
		}
		parameters = append(parameters, parameter)
	}

	for code, message := range o.Responses.StatusCodeResponses {
		if code == 200 {
			respParam := &Parameter{}
			respParam.TypeDescription, respParam.FirstLevel, respParam.TypeExample = parseSchema(document, message.Schema)
			op.Response200 = respParam
		}
	}

	op.Parameters = parameters
	services[tags] = append(services[tags], op)

}

func getDefinition(document *loads.Document, ref spec.Ref) (spec.Schema, string, bool) {
	tokens := ref.GetPointer().DecodedTokens()
	if len(tokens) != 2 {
		return spec.Schema{}, "", false
	}
	defName := tokens[1]
	def, ok := document.Spec().Definitions[defName]
	return def, defName, ok
}

func parseSchema(document *loads.Document, schema *spec.Schema) (description string, structure map[string]*Parameter, example interface{}) {
	def, _, ok := getDefinition(document, schema.Ref)
	if !ok {
		return
	}
	description = schema.Ref.Ref.GetPointer().String()
	example = createSample(document, schema)
	structure = make(map[string]*Parameter, len(def.SchemaProps.Properties))
	for name, p := range def.SchemaProps.Properties {
		par := &Parameter{
			Name:        name,
			Description: p.Title,
		}
		if len(p.Type) > 0 {
			par.TypeName = p.Type[0]
		} else {
			par.TypeName = p.Ref.String()
		}
		structure[name] = par
	}
	return
}

func createSample(document *loads.Document, data *spec.Schema, chain ...string) interface{} {
	if refScheme, refName, ok := getDefinition(document, data.Ref); ok {
		for _, c := range chain {
			if c == refName {
				return "[Recursive structure]"
			}
		}
		chain = append(chain, refName)
		return createSample(document, &refScheme, chain...)
	}
	switch data.Type[0] {
	case "boolean":
		return true
	case "string":
		return "string"
	case "integer":
		return 10
	case "array":
		arSchema := data.Items.Schema
		if len(data.Items.Schemas) > 0 {
			arSchema = &data.Items.Schemas[0]
		}
		itemSample := createSample(document, arSchema, chain...)
		return []interface{}{itemSample}
	case "object":
		example := make(map[string]interface{})
		for name, p := range data.SchemaProps.Properties {
			example[name] = createSample(document, &p, chain...)
		}
		return example
	default:
		return "[Unknown Type " + data.Type[0] + "]"
	}
}
