package file

import (
	"encoding/json"
	"fmt"
	"os"
)

// Save writes configs to json file
func Save(filename string, data interface{}) error {

	b, err := json.MarshalIndent(data, "", "  ")

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

// WriteIfNotExists writes data directly inside file
func WriteIfNotExists(filename string, data string) (bool, error) {

	if _, err := os.Stat(filename); err == nil {
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
