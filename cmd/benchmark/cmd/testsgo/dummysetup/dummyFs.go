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

// Package dummysetup provides utilitary methods to set up a dummy environment for benchmarks.
//
// It allows to perform tests and benchmarks with some real (but useless and meaningless) data.
package dummysetup

import (
	"bytes"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"os"
	"path/filepath"

	"github.com/pydio/cells/common/utils"
)

var (
	rootPath  string
	maxFileNb int
	maxSize   int64
	maxDepth  int

	dummyContent     [100]string
	dummyNames       [100]string
	dummyExtenstions = []string{".txt", ".odt", ".html", ".xml", ".go"}

	slash = string(filepath.Separator)
)

// Simply generates a file system with a certain number of dummy files to test file system synchronisation
func init() {
	flag.StringVar(&rootPath, "basePath", "/tmp/pydio/pydioDummyFS", "a path to the directory that we want to fill with dummy data")
	flag.IntVar(&maxFileNb, "fileNb", 10000, "number of file to generate")
	var tmpMaxSize int
	flag.IntVar(&tmpMaxSize, "maxSize", 4, "the maximum size of generated data in Giga bytes")
	maxSize = 1024 * 1024 * 1024 * int64(tmpMaxSize)
	flag.IntVar(&maxDepth, "maxDepth", 10, "the maximum depth of the tree")

	prepare()
}

func setFlags(basePath string, fileNb, maxSizeInMega, maxTreeDepth int) {
	rootPath = basePath
	maxFileNb = fileNb
	maxSize = 1024 * 1024 * int64(maxSizeInMega)
	maxDepth = maxTreeDepth
}

func prepare() {
	for i := 0; i < 100; i++ {
		var b bytes.Buffer
		for j := 0; j < 10; j++ {
			fmt.Fprintf(&b, "%s\n", utils.Randkey(64))
		}
		dummyContent[i] = b.String()
	}

	for i := 0; i < 100; i++ {
		dummyNames[i] = utils.Randkey(16)
	}

	os.Mkdir(rootPath, 0777)
}

// Generate launch the creation of dummy file under the configured base directory
func Generate() error {

	currRemaining := maxSize
	currFileNb := maxFileNb
	pass := 0

	for currRemaining > 0 && currFileNb > 0 {
		var err error
		currFileNb, currRemaining, err = populateFolder(rootPath, 1, currFileNb, currRemaining)
		if err != nil {
			log.Fatalf("cannot populate dummy file system at %s, error: %s", rootPath, err.Error())
			return err
		}
		pass++
	}

	fmt.Printf("Dummy file system generated at %s in %d passes", rootPath, pass)
	return nil
}

func populateFolder(pathAt string, depth, remainingNb int, remainingSize int64) (int, int64, error) {
	if depth >= maxDepth || remainingNb <= 0 || remainingSize <= 0 {
		return remainingNb, remainingSize, nil
	}

	fileNb := rand.Intn(20)
	subFolderSize := rand.Intn(10)

	startIndex := rand.Intn(100)
	offset := rand.Intn(100)

	// Create files
	for i := 0; i < fileNb; i++ {
		written, err := createOneFile(pathAt)
		remainingSize -= written
		remainingNb--

		// fmt.Printf("File #%s at %s, size: %s, total generated size: %s, Remaining size: %s\n",
		// 	strconv.Itoa(maxFileNb-remainingNb),
		// 	pathAt,
		// 	strconv.FormatInt(written, 10),
		// 	strconv.FormatInt(maxSize-remainingSize, 10),
		// 	strconv.FormatInt(remainingSize, 10))

		if err != nil {
			return remainingNb, remainingSize, err
		}
		if remainingNb <= 0 || remainingSize <= 0 {
			return remainingNb, remainingSize, nil
		}
	}

	// Create subfolders
	for i := 0; i < subFolderSize; i++ {
		name := dummyNames[(startIndex+i+offset)%len(dummyNames)]
		path := pathAt + slash + name
		os.Mkdir(path, 0777)
		var err error
		remainingNb, remainingSize, err = populateFolder(path, depth+1, remainingNb, remainingSize)
		if err != nil {
			return remainingNb, remainingSize, err
		}
		if remainingNb <= 0 || remainingSize <= 0 {
			return remainingNb, remainingSize, nil
		}
	}
	return remainingNb, remainingSize, nil
}

func createOneFile(pathAt string) (int64, error) {

	startIndex := rand.Intn(100)
	size := rand.Intn(100)
	offset := rand.Intn(100)

	name := dummyNames[startIndex] + dummyExtenstions[startIndex%len(dummyExtenstions)]

	f, err := os.OpenFile(pathAt+"/"+name, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return 0, err
	}
	defer f.Close()

	currIndex := startIndex
	totalWritten := int64(0)
	for i := 0; i < size+1; i++ {
		written, err := f.Write([]byte(dummyContent[currIndex]))
		if err != nil {
			return totalWritten, err
		}
		totalWritten += int64(written)
		currIndex = (currIndex + offset) % len(dummyContent)
	}
	if err := f.Close(); err != nil {
		log.Fatal(err)
	}

	return totalWritten, nil
}
