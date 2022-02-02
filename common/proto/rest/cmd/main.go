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
)

var (
	base = filepath.Join(os.Getenv("GOPATH"), "src", "github.com", "pydio", "cells", "v4", "common", "proto", "rest")
	/*
		template = `package rest
	var SwaggerJson = ` + "`%s`"
	*/
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
)

func main() {
	if content, err := ioutil.ReadFile(filepath.Join(base, "cellsapi-rest.swagger.json")); err == nil {
		fmt.Println("** Monkey Patching json file with error responses")
		c1 := string(content)
		for k, v := range replaces {
			c1 = strings.ReplaceAll(c1, k, v)
		}
		content = []byte(c1)
		ioutil.WriteFile(filepath.Join(base, "cellsapi-rest.swagger.json"), []byte(c1), 0777)

		/*
			fmt.Println("** Transforming json file to go file")
			clean := strings.Replace(string(content), "`", "", -1)
			toStore := fmt.Sprintf(template, clean)
			err2 := ioutil.WriteFile(filepath.Join(base, "swagger.go"), []byte(toStore), 0777)
			if err2 == nil {
				fmt.Println("File swagger.go was written")
			} else {
				fmt.Println("Cannot write target file" + err2.Error())
			}
		*/
	} else {
		fmt.Println("Cannot read original file" + err.Error())
	}
}
