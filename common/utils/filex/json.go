/*
 * Copyright (c) 2019-2022 Abstrium SAS <team (at) pydio.com>
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

package filex

import (
	"io"
	"os"
	"path/filepath"
)

// Read reads the content of a file
func Read(filename string, readOnly ...bool) ([]byte, error) {
	if len(readOnly) > 0 && readOnly[0] {
		// Make sure to not create an empty file if it does not exists
		if _, e := os.Stat(filename); e != nil && os.IsNotExist(e) {
			return nil, e
		}
	}
	fh, err := os.OpenFile(filename, os.O_RDONLY|os.O_CREATE, 0644)
	if err != nil {
		if os.IsNotExist(err) {
			return []byte{}, nil
			//if err := os.MkdirAll(filepath.Dir(filename), 0755); err != nil {
			//	return nil, err
			//}
			//fh, err = os.Create(filename)
			//if err != nil {
			//	return nil, err
			//}
		} else {
			return nil, err
		}
	}
	defer fh.Close()

	b, err := io.ReadAll(fh)
	if err != nil {
		return nil, err
	}

	return b, nil
}

// Save writes configs to json file
func Save(filename string, b []byte) error {
	if err := os.MkdirAll(filepath.Dir(filename), 0755); err != nil {
		return err
	}
	f, err := os.OpenFile(filename, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0755)
	if err != nil {
		return err
	}
	defer f.Close()

	if _, err := f.WriteString(string(b)); err != nil {
		return err
	}

	return nil
}

// Exists check if a file is present or not
func Exists(filename string) bool {
	if _, err := os.Stat(filename); err != nil {
		return false
	}

	return true
}

// WriteIfNotExists writes data directly inside file
func WriteIfNotExists(filename string, data string) (bool, error) {

	if Exists(filename) {
		return false, nil
	}

	dst, err := os.Create(filename)
	if err != nil {
		return false, err
	}

	defer dst.Close()

	_, err = dst.WriteString(data)

	if err != nil {
		return false, err
	}

	err = dst.Sync()
	if err != nil {
		return false, err
	}

	return true, nil

}
