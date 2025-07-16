package main

import (
	"log"
	"os"

	"github.com/hanwen/go-fuse/v2/fs"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v5/common/errors"

	fs2 "github.com/pydio/cells-fuse/fs"
)

var (
	generateData bool
)

var MountCmd = &cobra.Command{
	Use:   "mount",
	Short: "Mount whole datasource as a local filesystem using FUSE",
	Long: `
DESCRIPTION

  Mount datasource as a virtual folder on a local mount point.

EXAMPLES 

  $ ` + os.Args[0] + ` mount --target /tmp/datasource --snapshot file:///var/cells/data/pydiods1/snapshot.db

`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if storageURL == "" {
			return errors.New("please provide a snapshot URL")
		}
		if mountPoint == "" {
			return errors.New("please provide a mount directory")
		}
		if mountPoint == "." {
			log.Fatalf("warning you are trying to mount on current folder")
		}

		fileProvider, snap, total, er := fs2.StorageUrlAsProvider(storageURL)
		if er != nil {
			log.Fatalf("cannot parse storage URL %v", er)
		}
		opts := &fs.Options{}
		opts.Debug = debug
		mountFs := fs2.NewSnapFS(snap.BoltSnapshot, fileProvider, total, generateData)

		server, err := fs.Mount(mountPoint, mountFs, opts)
		if err != nil {
			log.Fatalf("Mount fail: %v\n", err)
		}
		server.Wait()

		log.Println("Cleaning resources before quitting...")
		log.Println(" - Closing snapshot")
		_ = snap.CloseAndClear()
		log.Println(" - Unmounting server")
		_ = server.Unmount()
		log.Println(" - Clearing cache")
		mountFs.ClearCache()
		log.Println("... done")
		return nil
	},
}

func init() {
	MountCmd.Flags().BoolVar(&debug, "debug", false, "Set FS mount in debug mode")
	MountCmd.Flags().StringVarP(&storageURL, "snapshot", "s", "", "Snapshot URL, starting with file:// or s3://")
	MountCmd.Flags().StringVarP(&mountPoint, "target", "t", "", "Absolute path to mount directory. Must be created and empty.")
	MountCmd.Flags().BoolVarP(&generateData, "generate", "", false, "Special flag to generate random data on the fly if original fs is not available.")
	FuseCmd.AddCommand(MountCmd)
}
