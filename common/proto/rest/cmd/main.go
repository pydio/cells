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
	"os"
	"strings"

	"github.com/tomwright/dasel"

	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

var (
	defResponses     map[string]interface{}
	restError        map[string]interface{}
	defResponsesJSON = `{"401":{
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
		  }}`
	restErrorJSON = `{
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
    }`

	// Used for rest V1 - Body management creates xxxBody models
	inlineTitles = map[string]string{
		"paths.\\/config\\/peers\\/{PeerAddress}.post.parameters.[1].schema": "RestListPeerFoldersRequest",
		"paths.\\/config\\/peers\\/{PeerAddress}.put.parameters.[1].schema":  "RestCreatePeerFolderRequest",
		"paths.\\/config\\/buckets\\/{BucketName}.put.parameters.[1].schema": "RestCreateStorageBucketRequest",
		"paths.\\/jobs\\/user\\/{JobName}.put.parameters.[1].schema":         "RestUserJobRequest",
		"paths.\\/meta\\/delete\\/{NodePath}.post.parameters.[1].schema":     "RestMetaNamespaceRequest",
		"paths.\\/meta\\/get\\/{NodePath}.post.parameters.[1].schema":        "RestMetaNamespaceRequest",
		"paths.\\/meta\\/set\\/{NodePath}.post.parameters.[1].schema":        "RestMetaCollection",
		"paths.\\/user-meta\\/tags\\/{Namespace}.post.parameters.[1].schema": "RestPutUserMetaTagRequest",
		"paths.\\/update\\/{TargetVersion}.patch.parameters.[1].schema":      "UpdateApplyUpdateRequest",
	}
)

func init() {
	if er := json.Unmarshal([]byte(defResponsesJSON), &defResponses); er != nil {
		panic(er)
	}
	if er := json.Unmarshal([]byte(restErrorJSON), &restError); er != nil {
		panic(er)
	}
}

func main() {
	if content, err := os.ReadFile(os.Args[1]); err == nil {

		var data interface{}
		er := json.Unmarshal(content, &data)
		if er != nil {
			panic(er)
		}
		rootNode := dasel.New(data)

		fmt.Println("** Monkey Patching json file with error responses")
		_ = rootNode.Delete("definitions.rpcStatus")
		_ = rootNode.Put("definitions.restError", restError)
		pathsNode, e := rootNode.Query("paths")
		if e != nil {
			fmt.Println("Error while querying path")
			return
		}

		for k := range pathsNode.InterfaceValue().(map[string]interface{}) {
			pNode, _ := pathsNode.Query(k)
			for k2 := range pNode.InterfaceValue().(map[string]interface{}) {
				if _, e := pNode.Query(k2 + ".responses.default"); e == nil {
					fmt.Println("Patching", "paths."+k+"."+k2+".responses.default")
					_ = pNode.Delete(k2 + ".responses.default")
					for code, resp := range defResponses {
						_ = pNode.Put(k2+".responses."+code, resp)
					}
				}
			}
		}

		for k, v := range inlineTitles {
			n, e := rootNode.Query(k + ".$ref")
			if e != nil {
				// not found, ignore
				continue
			}
			bodyName := strings.TrimPrefix(n.String(), "#/definitions/")
			refNode, e := rootNode.Query("definitions." + bodyName)
			if e != nil {
				fmt.Println("No ref node")
			} else {
				fmt.Println("Replace ref node")
				_ = rootNode.Put("definitions."+v, refNode.InterfaceValue())
				_ = rootNode.Delete("definitions." + bodyName)
				_ = rootNode.Put(k+".$ref", "#/definitions/"+v)
			}

			//e := rootNode.Put(k, v)
			if e != nil {
				fmt.Println("Got error")
			}
		}

		output, _ := json.MarshalIndent(rootNode.InterfaceValue(), "", "  ")
		_ = os.WriteFile(os.Args[1], output, 0777)

	} else {
		fmt.Println("Cannot read original file" + err.Error())
	}
}
