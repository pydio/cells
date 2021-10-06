package filex

import (
	"fmt"
	"os"
	"path/filepath"

	json "github.com/pydio/cells/x/jsonx"
)

// Save writes configs to json file
func Save(filename string, data interface{}) error {

	b, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}

	if err := os.MkdirAll(filepath.Dir(filename), 0755); err != nil {
		return err
	}
	f, err := os.OpenFile(filename, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0755)
	if err != nil {
		return err
	}
	defer f.Close()

	if _, err := f.WriteString(fmt.Sprintf("%s", b)); err != nil {
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
