/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	base     = filepath.Join(os.Getenv("GOPATH"), "src", "github.com", "pydio", "services", "common", "proto", "rest")
	template = `package rest
var SwaggerJson = ` + "`%s`"
)

func main() {
	fmt.Println("** Transforming json file to go file")
	if content, err := ioutil.ReadFile(filepath.Join(base, "rest.swagger.json")); err == nil {
		clean := strings.Replace(string(content), "`", "", -1)
		toStore := fmt.Sprintf(template, clean)
		err2 := ioutil.WriteFile(filepath.Join(base, "swagger.go"), []byte(toStore), 0777)
		if err2 == nil {
			fmt.Println("File swagger.go was written")
		} else {
			fmt.Println("Cannot write target file" + err2.Error())
		}
	} else {
		fmt.Println("Cannot read original file" + err.Error())
	}
}
