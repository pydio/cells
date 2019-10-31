package docs

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"text/template"
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

var opTemplate = `
{{define "operation"}}
 
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
`

var oneTemplate = `
# Cells API
{{template "toc" .}}

{{range .Services}}
## {{if .Title}}{{.Title}}{{else}}{{.Name}}{{end}}
{{.Long}}

{{range .Operations}}
### [{{.Type}}] {{.Path}}  
{{template "operation" .}}
{{end}}
{{end}}
`

var multiMain = `[:summary]`
var multiService = `
{{.Long}}

[:summary]
`

var multiOperation = `{{template "operation" .}}`

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

var fMap = template.FuncMap{
	"toJsonPre": func(data interface{}) string {
		d, _ := json.MarshalIndent(data, "", "  ")
		return "```\n" + string(d) + "\n```\n"
	},
}

var ApiDocsOutputRootTitle = "REST API"
var ApiDocsOutputRootId = "1_all_api"
var ApiDocsOutputRootWeight = 1
var ApiDocsMenuName = ""

// GenOpenAPIDocs generates docs for OpenAPI in markdown format,
// ready to be pushed to pydio docs git repositories
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
		sort.Slice(s.Operations, func(i, j int) bool {
			return s.Operations[i].Path < s.Operations[j].Path
		})
		tplData.Services = append(tplData.Services, s)
	}
	sort.Slice(tplData.Services, func(i, j int) bool {
		return tplData.Services[i].Title < tplData.Services[j].Title
	})
	// Feed Json Data
	//return writeOnePagerMd(output, tplData)
	return writeMultiPageMd(output, tplData)
}

func writeOnePagerMd(folder string, tplData *TplData) error {
	return toMd(folder, "API", "api", oneTemplate, tplData)
}

func writeMultiPageMd(folder string, data *TplData) error {
	if e := toMd(folder, ApiDocsOutputRootTitle, ApiDocsOutputRootId, multiMain, nil); e != nil {
		return e
	}
	srvF := filepath.Join(folder, ApiDocsOutputRootId)
	for _, s := range data.Services {
		if e := toMd(srvF, s.Title, s.Name, multiService, s); e != nil {
			return e
		}
		opF := filepath.Join(srvF, s.Name)
		for _, o := range s.Operations {
			id := o.Type + "-" + strings.Replace(o.Path, "/", "_", -1)
			if e := toMd(opF, o.Type+" "+o.Path, id, multiOperation, o); e != nil {
				return e
			}
		}
	}
	return nil
}

func toMd(folder, title, id, page string, data interface{}) error {
	os.MkdirAll(folder, 0777)
	md := filepath.Join(folder, id+".md")
	wr, e := os.OpenFile(md, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0666)
	if e != nil {
		return e
	}
	defer wr.Close()
	tpl := template.New("services").Funcs(fMap)
	t, e := tpl.Parse(opTemplate + tocTemplate + paramTemplate + page)
	if e != nil {
		return e
	}
	e = t.Execute(wr, data)
	if e != nil {
		return e
	}
	yml := filepath.Join(folder, id+".yaml")
	w, e := os.OpenFile(yml, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0666)
	if e != nil {
		return e
	}
	defer w.Close()
	weight := 0
	if id == ApiDocsOutputRootId {
		weight = ApiDocsOutputRootWeight
	}
	return writeYaml(title, ApiDocsMenuName, weight, w)
}

func writeYaml(title, menu string, position int, w io.Writer) error {
	buf := new(bytes.Buffer)
	buf.WriteString("title: \"" + title + "\"\n")
	buf.WriteString("menu: \"" + title + "\"\n")
	buf.WriteString("language: und\n")
	buf.WriteString("menu_name: " + menu + "\n")
	if position > 0 {
		buf.WriteString(fmt.Sprintf("weight: %d\n", position))
	}
	_, err := buf.WriteTo(w)
	return err
}
