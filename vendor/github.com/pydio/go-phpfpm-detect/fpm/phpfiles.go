package fpm

import (
	"io/ioutil"
	"os"
	"path/filepath"
)

var (
	files = map[string]string{
		"version":    `echo phpversion();`,
		"extensions": `print(json_encode(get_loaded_extensions()));`,
		"info":       `phpinfo();`,
	}
)

func prepareFiles(outputFolder string) error {

	for file, content := range files {

		fName := filepath.Join(outputFolder, file+".php")
		if _, e := os.Stat(fName); os.IsNotExist(e) {
			if e := ioutil.WriteFile(fName, []byte("<?php "+content), 0644); e != nil {
				return e
			}
		}

	}

	return nil

}

func cleanFiles(outputFolder string) {
	for file, _ := range files {
		fName := filepath.Join(outputFolder, file+".php")
		os.Remove(fName)
	}
}
