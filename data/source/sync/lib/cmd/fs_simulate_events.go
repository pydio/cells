/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"
)

func fillExternal(externalPath string) {
	var f *os.File
	var e error

	f, e = os.Create(filepath.Join(externalPath, "extfile"))
	f.Close()
	os.Mkdir(filepath.Join(externalPath, "extfolder"), 0777)
	os.MkdirAll(filepath.Join(externalPath, "extfolder", "extsubfolder"), 0777)
	f, e = os.Create(filepath.Join(externalPath, "extfolder", "extfile"))
	if e != nil {
		log.Printf("Cannot create file %v", filepath.Join(externalPath, "extfolder", "extfile"))
		log.Print(e)
	}
	f.Close()
	f, _ = os.Create(filepath.Join(externalPath, "extfolder", "extsubfolder", "extsubfile"))
	f.Close()
}

func cleanExternal(externalPath string) {
	os.RemoveAll(filepath.Join(externalPath, "extfolder"))
	os.Remove(filepath.Join(externalPath, "extfile"))
}

func PerformTests(basePath string, externalPath string, testInfo chan string, testHeader chan string) {

	var e error
	var f *os.File

	testHeader <- "Empty File"
	testInfo <- "Create Empty File"
	f, e = os.Create(filepath.Join(basePath, "create"))
	f.Close()
	time.Sleep(2 * time.Second)

	testInfo <- "Delete File"
	e = os.RemoveAll(filepath.Join(basePath, "create"))
	if e != nil {
		log.Print(e)
	}
	time.Sleep(2 * time.Second)

	/*******************************/
	testHeader <- "Empty Dir"
	testInfo <- "Create Empty Dir"
	os.Mkdir(filepath.Join(basePath, "folder"), 0777)
	time.Sleep(2 * time.Second)

	testInfo <- "Delete Empty Dir"
	os.RemoveAll(filepath.Join(basePath, "folder"))
	time.Sleep(2 * time.Second)

	/*******************************/
	testHeader <- "Move File"
	testInfo <- "Create File(s) to move"
	for i := 0; i < 10; i++ {
		f, e = os.Create(filepath.Join(basePath, fmt.Sprintf("create-%v", i)))
		f.Close()
	}
	time.Sleep(2 * time.Second)

	testInfo <- "Move Files"
	for i := 0; i < 10; i++ {
		e = os.Rename(filepath.Join(basePath, fmt.Sprintf("create-%v", i)), filepath.Join(basePath, fmt.Sprintf("renamed-%v", i)))
		if e != nil {
			log.Print(e)
		}
	}
	time.Sleep(2 * time.Second)

	testInfo <- "Delete moved file"
	for i := 0; i < 10; i++ {
		os.Remove(filepath.Join(basePath, fmt.Sprintf("renamed-%v", i)))
	}
	time.Sleep(2 * time.Second)

	/*******************************/
	testHeader <- "Move Folder with stuff in it"
	testInfo <- "Create Folder"
	fillExternal(basePath)
	os.Remove(filepath.Join(basePath, "extfile"))
	time.Sleep(2 * time.Second)

	testInfo <- "Move Folder"
	e = os.Rename(filepath.Join(basePath, "extfolder"), filepath.Join(basePath, "extfolder-moved"))
	if e != nil {
		log.Print(e)
	}
	time.Sleep(2 * time.Second)

	testInfo <- "Now Delete folder"
	os.RemoveAll(filepath.Join(basePath, "extfolder-moved"))
	time.Sleep(2 * time.Second)

	/*******************************/
	testHeader <- "Move file from external path - not working on windows"
	fillExternal(externalPath)
	os.Rename(filepath.Join(externalPath, "extfile"), filepath.Join(basePath, "extfile"))
	time.Sleep(2 * time.Second)

	/*******************************/
	testHeader <- "Move filled folder from external path"
	os.Rename(filepath.Join(externalPath, "extfolder"), filepath.Join(basePath, "extfolder"))
	cleanExternal(externalPath)
	time.Sleep(2 * time.Second)

	/*******************************/
	testHeader <- "Move file to external path"
	os.Rename(filepath.Join(basePath, "extfile"), filepath.Join(externalPath, "extfile"))
	time.Sleep(2 * time.Second)

	/*******************************/
	testHeader <- "Move filled folder to external path => will probably need rescan"
	os.Rename(filepath.Join(basePath, "extfolder"), filepath.Join(externalPath, "extfolder"))
	cleanExternal(externalPath)
	time.Sleep(2 * time.Second)

	/*******************************/
	testHeader <- "Create files tree at once"
	fillExternal(basePath)
	time.Sleep(2 * time.Second)

	/*******************************/
	testHeader <- "Remove files tree at once"
	cleanExternal(basePath)
	time.Sleep(2 * time.Second)

}
