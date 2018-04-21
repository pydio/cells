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

package crypto

import (
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"testing"

	"github.com/pydio/cells/common/config"
	"github.com/smartystreets/goconvey/convey"
)

func TestMaterials(t *testing.T) {

	var (
		password             = "password"
		keySize              = 32
		key                  []byte
		testFolder, filename string
		materials            *AESGCMMaterials
		inFile, outFile      *os.File
	)
	testFolder = filepath.Join(config.ApplicationDataDir(), "tests")
	os.MkdirAll(testFolder, os.ModePerm)

	filename = filepath.Join(testFolder, "data.txt")
	encryptedFilename := filepath.Join(testFolder, "encdata.txt")
	decryptedFilename := filepath.Join(testFolder, "decdata.txt")

	//defer os.Remove(filename)
	//defer os.Remove(encryptedFilename)
	//defer os.Remove(decryptedFilename)

	initialSize := 500 * 1000
	buffer := make([]byte, initialSize)
	rand.Read(buffer)
	ioutil.WriteFile(filename, buffer, os.ModePerm)

	convey.Convey("Create and configure encryption materials", t, func() {
		key = KeyFromPassword([]byte(password), keySize)
		convey.So(key, convey.ShouldNotBeNil)
		convey.So(len(key), convey.ShouldEqual, keySize)
		materials = NewAESGCMMaterials(key, nil)
	})

	convey.Convey("Encrypt", t, func() {
		inFile, _ = os.Open(filename)
		outFile, _ = os.OpenFile(encryptedFilename, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, os.ModePerm)
		materials.SetupEncryptMode(inFile)

		buffer = make([]byte, 1024)
		end := false
		for !end {
			n, err := materials.Read(buffer)
			if err != nil {
				convey.So(err, convey.ShouldEqual, io.EOF)
			}
			end = err == io.EOF
			outFile.Write(buffer[0:n])
		}
		inFile.Close()
		outFile.Close()
	})

	convey.Convey("Decrypt", t, func() {

		inFile, _ = os.Open(encryptedFilename)
		outFile, _ = os.OpenFile(decryptedFilename, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, os.ModePerm)
		materials.SetupDecryptMode(inFile, "", "")

		buffer := make([]byte, 38768)
		end := false
		for !end {
			n, err := materials.Read(buffer)
			if err != nil {
				convey.So(err, convey.ShouldEqual, io.EOF)
			}
			end = err == io.EOF
			outFile.Write(buffer[0:n])
		}
		inFile.Close()
		outFile.Close()
	})

	convey.Convey("Decrypt 2", t, func() {

		inFile, _ = os.Open(encryptedFilename)
		outFile, _ = os.OpenFile(decryptedFilename, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, os.ModePerm)
		materials.SetupDecryptMode(inFile, "", "")

		buffer := make([]byte, 1045)
		end := false
		for !end {
			n, err := materials.Read(buffer)
			if err != nil {
				convey.So(err, convey.ShouldEqual, io.EOF)
			}
			end = err == io.EOF
			outFile.Write(buffer[0:n])
		}
		inFile.Close()
		outFile.Close()
	})

	convey.Convey("Compare", t, func() {
		origHash, err := hash_file_md5(filename)
		convey.So(err, convey.ShouldBeNil)

		decrHash, err := hash_file_md5(decryptedFilename)
		convey.So(err, convey.ShouldBeNil)
		convey.So(origHash, convey.ShouldEqual, decrHash)

	})
}

func hash_file_md5(filePath string) (string, error) {
	//Initialize variable returnMD5String now in case an error has to be returned
	var returnMD5String string

	//Open the passed argument and check for any error
	file, err := os.Open(filePath)
	if err != nil {
		return returnMD5String, err
	}

	//Tell the program to call the following function when the current function returns
	defer file.Close()

	//Open a new hash interface to write to
	hash := md5.New()

	//Copy the file in the hash interface and check for any error
	if _, err := io.Copy(hash, file); err != nil {
		return returnMD5String, err
	}

	//Get the 16 bytes hash
	hashInBytes := hash.Sum(nil)[:16]

	//Convert the bytes to a string
	returnMD5String = hex.EncodeToString(hashInBytes)

	return returnMD5String, nil

}
