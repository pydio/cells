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

package file

import (
	"fmt"
	"io/ioutil"
	"log"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/pydio/cells/x/filex"
	"github.com/pydio/go-os/config"
	"github.com/pydio/go-os/config/source/file"
)

type fileSource struct {
	path string
	config.Source
}

func NewSource(opts ...config.SourceOption) config.Source {
	options := config.SourceOptions{
		Name: file.DefaultFileName,
	}
	for _, o := range opts {
		o(&options)
	}

	fName := options.Name

	// If file exists and is not empty, check it has valid JSON content
	if data, err := ioutil.ReadFile(fName); err == nil && len(data) > 0 {
		var whatever map[string]interface{}
		if e := json.Unmarshal(data, &whatever); e != nil {
			errColor := "\033[1;31m%s\033[0m"
			fmt.Println("**************************************************************************************")
			fmt.Println("It seems that your configuration file contains invalid JSON. Did you edit it manually?")
			fmt.Println("File is located at " + fName)
			fmt.Println("Error was: ", fmt.Sprintf(errColor, e.Error()))
			fmt.Println("")
			fmt.Printf(errColor, "FATAL ERROR : Aborting now\n")
			fmt.Println("**************************************************************************************")
			log.Fatal(e)
		}
	}

	return &fileSource{
		fName,
		file.NewSource(opts...),
	}
}

func (s *fileSource) Write(cs *config.ChangeSet) error {

	var m map[string]interface{}
	err := json.Unmarshal(cs.Data, &m)
	if err != nil {
		return err
	}

	if err := filex.Save(s.path, m); err != nil {
		return err
	}

	return nil
}
