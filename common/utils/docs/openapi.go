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
	"strings"

	"github.com/go-openapi/loads"
	"github.com/go-openapi/spec"

	"github.com/pydio/cells/common/service"
)

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
			parameter.TypeDescription, parameter.FirstLevel, parameter.TypeExample = parseSchema(document, param.Schema, "in")
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
			respParam.TypeDescription, respParam.FirstLevel, respParam.TypeExample = parseSchema(document, message.Schema, "out")
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

func parseSchema(document *loads.Document, schema *spec.Schema, dir string) (description string, structure map[string]*Parameter, example interface{}) {
	def, _, ok := getDefinition(document, schema.Ref)
	if !ok {
		return
	}
	description = schema.Ref.Ref.GetPointer().String()
	example = createSample(document, schema, dir)
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

func createSample(document *loads.Document, data *spec.Schema, dir string, chain ...string) interface{} {
	if refScheme, refName, ok := getDefinition(document, data.Ref); ok {
		for _, c := range chain {
			if c == refName {
				return "[Recursive structure]"
			}
		}
		chain = append(chain, refName)
		s := createSample(document, &refScheme, dir, chain...)
		// Special case for treeNode, only keep Path field in sample
		if m, o := s.(map[string]interface{}); o && refName == "treeNode" && dir == "in" {
			return map[string]interface{}{"Path": m["Path"]}
		}
		return s
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
		itemSample := createSample(document, arSchema, dir, chain...)
		return []interface{}{itemSample}
	case "object":
		example := make(map[string]interface{})
		for name, p := range data.SchemaProps.Properties {
			example[name] = createSample(document, &p, dir, chain...)
		}
		return example
	default:
		return "[Unknown Type " + data.Type[0] + "]"
	}
}
