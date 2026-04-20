/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package docs

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"text/template"
	"time"

	json "github.com/pydio/cells/v5/common/utils/jsonx"
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

var multiMain = `
[:summary]

`
var multiService = `
{{.Long}}

[:summary]
`

var multiOperation = `{{template "operation" .}}

`

var navYaml = `title: {{.Title}}
weight: {{.Weight}}
language: en
`

type TplData struct {
	Services []Service

	GeneratedBy string
	GeneratedOn string
}

type TplNav struct {
	Title  string
	Weight int
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

	GeneratedBy string
	GeneratedOn string
}

type Service struct {
	Name       string
	Title      string
	Short      string
	Long       string
	Operations []Op

	GeneratedBy string
	GeneratedOn string
}

var fMap = template.FuncMap{
	"toJsonPre": func(data interface{}) string {
		d, _ := json.MarshalIndent(data, "", "  ")
		return "```\n" + string(d) + "\n```\n"
	},
}

var ApiDocsOutputRootTitle = "Rest API"
var ApiDocsOutputRootId = "2_cells_api"
var ApiDocsOutputRootWeight = 1
var ApiDocsMenuName = ""
var ApiDocsGeneratedBy = ""
var ApiDocsGeneratedOn = time.Now().Format("2-Jan-2006")

// GenOpenAPIDocs generates docs for OpenAPI in markdown format,
// ready to be pushed to pydio docs git repositories
func GenOpenAPIDocs(output string) error {
	// Load Json Spec into a readable format
	services := loadJsonSpec()
	// Convert to TplData
	tplData := &TplData{}
	for name, ops := range services {
		s := Service{Name: name}
		if ks, ok := KnownServices[name]; ok {
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
	return writeMultiPageMd(output, tplData)
}

func writeMultiPageMd(folder string, data *TplData) error {
	// if e := toMd(folder, ApiDocsOutputRootTitle, ApiDocsOutputRootId, multiMain, map[string]string{
	// 	"GeneratedBy": ApiDocsGeneratedBy,
	// 	"GeneratedOn": ApiDocsGeneratedOn,
	// }); e != nil {
	// 	return e
	// }
	srvF := filepath.Join(folder, ApiDocsOutputRootId)
	for _, s := range data.Services {
		s.GeneratedBy = ApiDocsGeneratedBy
		s.GeneratedOn = ApiDocsGeneratedOn
		// write index.md
		// if e := toMd(srvF, s.Title, "index", multiService, s); e != nil {
		// 	return e
		// }

		// write .nav.yaml
		// if e := writeNavYaml(srvF, &TplNav{Title: s.Title, Weight: 2}); e != nil {
		// 	return e
		// }

		opF := filepath.Join(srvF, s.Name)
		for _, o := range s.Operations {
			id := o.Type + "-" + strings.Replace(o.Path, "/", "_", -1)
			o.GeneratedBy = ApiDocsGeneratedBy
			o.GeneratedOn = ApiDocsGeneratedOn
			if e := toMd(opF, o.Type+" "+o.Path, id, multiOperation, o); e != nil {
				return e
			}
			// write .nav.yaml
			if e := writeNavYaml(opF, &TplNav{Title: s.Title, Weight: 1}); e != nil {
				return e
			}
			// write index.md
			if e := toMd(opF, s.Title, "index", multiOperation, o); e != nil {
				return e
			}
		}
	}
	return nil
}

func writeNavYaml(folder string, data interface{}) error {
	os.MkdirAll(folder, 0777)
	nav := filepath.Join(folder, ".nav.yaml")
	wr, e := os.OpenFile(nav, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0666)
	if e != nil {
		return e
	}
	defer wr.Close()

	// Add body
	tpl := template.New("navYaml")
	t, e := tpl.Parse(navYaml)
	if e != nil {
		return e
	}
	return t.Execute(wr, data)
}

func toMd(folder, title, id, page string, data interface{}) error {
	os.MkdirAll(folder, 0777)
	md := filepath.Join(folder, id+".md")
	wr, e := os.OpenFile(md, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0666)
	if e != nil {
		return e
	}
	defer wr.Close()

	// Add yaml frontmatter
	weight := 0
	if id == ApiDocsOutputRootId {
		weight = ApiDocsOutputRootWeight
	}
	e = writeYaml(title, ApiDocsMenuName, weight, wr)
	if e != nil {
		return e
	}

	// Add body
	tpl := template.New("services").Funcs(fMap)
	t, e := tpl.Parse(opTemplate + tocTemplate + paramTemplate + page)
	if e != nil {
		return e
	}
	return t.Execute(wr, data)
}

func writeYaml(title, menu string, position int, w io.Writer) error {
	buf := new(bytes.Buffer)
	buf.WriteString("---\n")
	buf.WriteString("title: \"" + title + "\"\n")
	buf.WriteString("language: en\n")
	if position > 0 {
		buf.WriteString(fmt.Sprintf("weight: %d\n", position))
	}
	buf.WriteString("---\n")
	_, err := buf.WriteTo(w)
	return err
}
