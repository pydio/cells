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

package cmd

import (
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"math/rand"
	"os"
	pathpkg "path"
	"time"

	"github.com/spf13/cobra"
)

var (
	width, depth   int
	rootPath       string
	dataTreeGenCMD = &cobra.Command{
		Use:   "tree-gen",
		Short: "Generates file tree",
		Long:  "For testing the indexation process, generate a deep tree of files inside a folder (generally a data source folder).",
		Run:   genTree,
	}
)

func count(w int, d int) int {
	if d == 0 {
		return 0
	}

	total := 0
	for i := 0; i < d; i++ {
		total += int(math.Pow(float64(w), float64(d+1)))
	}
	return total
}

func genTree(c *cobra.Command, args []string) {
	if rootPath == "" {
		c.Help()
		return
	}

	err := os.MkdirAll(rootPath, 0777)
	if err != nil {
		log.Fatalln(err.Error())
	}

	queue := []string{
		rootPath,
	}
	count := count(width, depth)
	log.Println(fmt.Sprintf("will generate %d folders and %d files...", count, count*width+width))
	var response string
	fmt.Print("Continue(y)?: ")
	_, err = fmt.Scanln(&response)
	if err != nil {
		log.Fatalln(err.Error())
	}

	if response != "y" {
		return
	}

	for len(queue) > 0 {
		folder := queue[0]
		queue = queue[1:]

		for i := 0; i < width; i++ {
			rand.Seed(time.Now().Unix())
			size := rand.Intn(4096) + 1024
			buf := make([]byte, size)
			ioutil.WriteFile(pathpkg.Join(folder, fmt.Sprintf("file%d", i+1)), buf, 0777)
		}

		for i := 0; i < width && count > 0; i++ {
			count--
			name := pathpkg.Join(folder, fmt.Sprintf("folder%d", i+1))
			err := os.MkdirAll(name, 0777)
			if err == nil {
				queue = append(queue, name)
			} else {
				log.Println(err.Error())
			}
		}
	}
}

func init() {
	dataTreeGenCMD.PersistentFlags().IntVar(&depth, "td", 2, "Tree depth.")
	dataTreeGenCMD.PersistentFlags().IntVar(&width, "fc", 2, "Folder children count for each node of the tree.")
	dataTreeGenCMD.PersistentFlags().StringVar(&rootPath, "path", "", "Tree root path.")

	dataCmd.AddCommand(dataTreeGenCMD)
}
