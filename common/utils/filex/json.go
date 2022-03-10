package filex

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// Read reads the content of a file
func Read(filename string) ([]byte, error) {
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

	fmt.Println("The data read here is ? ", string(b))

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
