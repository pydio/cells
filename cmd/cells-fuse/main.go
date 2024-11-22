/*
 * Copyright (c) 2023. Abstrium SAS <team (at) pydio.com>
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
	"log"
	"os"

	"github.com/spf13/cobra"

	// Required to register client
	_ "github.com/pydio/cells/v5/common/nodes/objects/mc"
)

var (
	debug      bool
	storageURL string
	mountPoint string
)

var FuseCmd = &cobra.Command{
	Use:   os.Args[0],
	Short: "Offline FUSE Mounter for Pydio Cells Flat Datasource",
	CompletionOptions: cobra.CompletionOptions{
		DisableDefaultCmd: true,
	},
	Long: `
DESCRIPTION

  This tool allows the local mounting of a flat datasource, given a "snapshot" has been created in the storage. 
  It does NOT require a running Cells/Cells Enterprise instance nor MySQL connection.
  It currently supports local filesystem and S3-based datasources.

  Using cells-fuse can be useful in case of emergency to recover files from a flat datasource.

EXAMPLES 

  1. Mount Local datasource
  $ ` + os.Args[0] + ` mount -t /tmp/datasource -s file:///var/cells/data/pydiods1/snapshot.db

  2. Mount Remote S3 datasource (note the s3s scheme)
  $ ` + os.Args[0] + ` mount -t /tmp/datasource -s s3s://API_KEY:API_SECRET@s3.amazonaws.com/MyBucketName/snapshot.db

  3. Lookup for a file (without mounting the datasource)
  $ ` + os.Args[0] + ` lookup --storage file:///var/cells/data/pydiods1/snapshot.db --name "*" --type file --base "/folder/path"

  4. Copy a specific file (without mounting the datasource) to a local location
  $ ` + os.Args[0] + ` copy --storage file:///var/cells/data/pydiods1/snapshot.db --from "/folder/path/file.ext" --to "./file.ext"

  5. Display tool version
  $ ` + os.Args[0] + ` version

`,
	Run: func(cmd *cobra.Command, args []string) {
		_ = cmd.Help()
		return

	},
}

func main() {
	if er := FuseCmd.Execute(); er != nil {
		log.Fatal(er)
	}
}
