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

	"github.com/hanwen/go-fuse/v2/fs"
	fs2 "github.com/pydio/cells-fuse/fs"
	"github.com/spf13/cobra"

	// Required to register client
	_ "github.com/pydio/cells/v4/common/nodes/objects/mc"
)

var (
	debug bool
)

var FuseCmd = &cobra.Command{
	Use:   os.Args[0],
	Short: "Offline FUSE Mounter for Pydio Cells Flat Datasource",
	Long: `
DESCRIPTION

  This tool allows the local mounting of a flat datasource, given a "snapshot" has been created in the storage. 
  It does NOT require a running Cells/Cells Enterprise instance nor MySQL connection.
  It currently supports local filesystem and S3-based datasources.

  Using cells-fuse can be useful in case of emergency to recover files from a flat datasource.

EXAMPLES 

  1. Local datasource
  $ ` + os.Args[0] + ` /tmp/datasource file:///var/cells/data/pydiods1/snapshot.db

  2. S3 datasource (note the s3s scheme)
  $ ` + os.Args[0] + ` /tmp/datasource s3s://API_KEY:API_SECRET@s3.amazonaws.com/MyBucketName/snapshot.db

`,
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) < 2 {
			_ = cmd.Help()
			return
		}
		mountPath := args[0]
		if mountPath == "." {
			log.Fatalf("warning you are trying to mount on current folder!")
		}
		storeURL := args[1]

		fileProvider, snap, er := fs2.ParseStorageURL(storeURL)
		if er != nil {
			log.Fatalf("cannot parse storage URL %v", er)
		}
		opts := &fs.Options{}
		opts.Debug = debug
		mountFs := fs2.NewSnapFS(snap, fileProvider)

		server, err := fs.Mount(mountPath, mountFs, opts)
		if err != nil {
			log.Fatalf("Mount fail: %v\n", err)
		}
		server.Wait()

		log.Println("Cleaning resources before quitting...")
		log.Println(" - Closing snapshot")
		snap.Close(true)
		log.Println(" - Unmounting server")
		_ = server.Unmount()
		log.Println(" - Clearing cache")
		mountFs.ClearCache()
		log.Println("... done")

	},
}

func init() {
	FuseCmd.PersistentFlags().BoolVar(&debug, "debug", false, "Set FS mount in debug mode")
}

func main() {
	if er := FuseCmd.Execute(); er != nil {
		log.Fatal(er)
	}
}
