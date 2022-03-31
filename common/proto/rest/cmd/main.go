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

// Package cmd provides a specific tool for transforming json swagger file into a go file
package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/tomwright/dasel"
)

var (
	base     = filepath.Join(os.Getenv("GOPATH"), "src", "github.com", "pydio", "cells", "common", "proto", "rest")
	replaces = map[string]string{
		`          "default": {
            "description": "An unexpected error response.",
            "schema": {
              "$ref": "#/definitions/rpcStatus"
            }
          }
`: `		  "401":{
		    "description":"User is not authenticated",
		    "schema":{
			  "$ref": "#/definitions/restError"
		    }
		  },
		  "403":{
		    "description":"User has no permission to access this particular resource",
		    "schema":{
			  "$ref": "#/definitions/restError"
		    }
		  },
		  "404":{
		    "description":"Resource does not exist in the system",
		    "schema":{
			  "$ref": "#/definitions/restError"
		    }
		  },
		  "500":{
		    "description":"An internal error occurred in the backend",
		    "schema":{
			  "$ref": "#/definitions/restError"
		    }
		  }
`,
		`    "restDeleteResponse":`: `    "restError": {
      "type": "object",
      "properties": {
        "Code": {
          "type": "string",
          "title": "Unique ID of the error"
        },
        "Title": {
          "type": "string",
          "title": "Human-readable, short label"
        },
        "Detail": {
          "type": "string",
          "title": "Human-readable, longer description"
        },
        "Source": {
          "type": "string",
          "title": "Cells service name or other quickly useful info"
        },
        "Meta": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "title": "Additional Metadata"
        }
      },
      "title": "Generic error message"
    },
    "restDeleteResponse":`,
	}

	inlineTitles = map[string]string{
		"paths.\\/config\\/peers\\/{PeerAddress}.post.parameters.[1].schema.title": "RestListPeerFoldersRequest",
		"paths.\\/config\\/peers\\/{PeerAddress}.put.parameters.[1].schema.title":  "RestCreatePeerFolderRequest",
		"paths.\\/jobs\\/user\\/{JobName}.put.parameters.[1].schema.title":         "RestUserJobRequest",
		"paths.\\/meta\\/delete\\/{NodePath}.post.parameters.[1].schema.title":     "RestMetaNamespaceRequest",
		"paths.\\/meta\\/get\\/{NodePath}.post.parameters.[1].schema.title":        "RestMetaNamespaceRequest",
		"paths.\\/meta\\/set\\/{NodePath}.post.parameters.[1].schema.title":        "RestMetaCollection",
		"paths.\\/user-meta\\/tags\\/{Namespace}.post.parameters.[1].schema.title": "RestPutUserMetaTagRequest",
		"paths.\\/update\\/{TargetVersion}.patch.parameters.[1].schema.title":      "UpdateApplyUpdateRequest",
	}
)

func main() {
	if content, err := ioutil.ReadFile(filepath.Join(base, "cellsapi-rest.swagger.json")); err == nil {
		fmt.Println("** Monkey Patching json file with error responses")
		c1 := string(content)
		for k, v := range replaces {
			c1 = strings.ReplaceAll(c1, k, v)
		}
		content = []byte(c1)

		var data interface{}
		_ = json.Unmarshal(content, &data)
		rootNode := dasel.New(data)

		for k, v := range inlineTitles {
			e := rootNode.Put(k, v)
			if e != nil {
				fmt.Println("Got error")
			}
		}
		output, _ := json.MarshalIndent(rootNode.InterfaceValue(), "", "  ")
		_ = ioutil.WriteFile(filepath.Join(base, "cellsapi-rest.swagger.json"), output, 0777)

	} else {
		fmt.Println("Cannot read original file" + err.Error())
	}
}
