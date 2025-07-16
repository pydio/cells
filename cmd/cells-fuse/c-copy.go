package main

import (
	"fmt"
	"io"
	"os"
	"path/filepath"

	humanize "github.com/dustin/go-humanize"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes/models"

	fs2 "github.com/pydio/cells-fuse/fs"
)

var (
	copyFrom string
	copyTo   string
)

var CopyCmd = &cobra.Command{
	Use:   "copy",
	Short: "Copy the content of a specific file from storage to a local file",
	Long: `
DESCRIPTION

  Without mounting the whole snapshot, once you have found a specific file using the lookup command, copy the 
  file contents to a local location.

EXAMPLES 

  1. Copy file from storage to local
  $ ` + os.Args[0] + ` copy --snapshot file:///var/cells/data/pydiods1/snapshot.db --from /path/to/file/in/snapshot/file.ext ./file.ext


`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if storageURL == "" {
			return errors.New("please provide a snapshot URL")
		}
		if copyFrom == "" || copyTo == "" {
			return errors.New("please provide 'from' and 'to' parameters")
		}
		target, er := filepath.Abs(copyTo)
		if er != nil {
			return errors.New("cannot resolve target path")
		}
		if _, er := os.Stat(target); er == nil {
			return errors.New("a file exists at target location, please use a different one")
		}

		sc, folderOrBucket, snap, _, er := fs2.ParseStorageURL(storageURL)
		if er != nil {
			return fmt.Errorf("cannot parse snapshot URL %v", er)
		}
		defer snap.Close(true)

		node, er := snap.LoadNode(cmd.Context(), copyFrom)
		if er != nil {
			return fmt.Errorf("cannot find source in target %v", er)
		}

		targetFile, er := os.OpenFile(target, os.O_CREATE|os.O_WRONLY, 0644)
		if er != nil {
			return fmt.Errorf("cannot open target location %v", er)
		}
		defer targetFile.Close()

		if sc == nil {
			// this is a file, simply copy it
			source, er := os.Open(filepath.Join(folderOrBucket, node.GetUuid()))
			if er != nil {
				return fmt.Errorf("cannot open target location %v", er)
			}
			io.Copy(targetFile, source)
			source.Close()
		} else {
			// this is a remote, use storage client
			reader, _, er := sc.GetObject(cmd.Context(), folderOrBucket, node.GetUuid(), models.ReadMeta{})
			if er != nil {
				return fmt.Errorf("cannot open target location %v", er)
			}
			io.Copy(targetFile, reader)
			reader.Close()
		}

		fmt.Println(promptui.IconGood + " Successfully created file with size " + humanize.IBytes(uint64(node.GetSize())))

		return nil
	},
}

func init() {
	CopyCmd.Flags().StringVarP(&storageURL, "snapshot", "s", "", "Snapshot URL, starting with file:// or s3://")
	CopyCmd.Flags().StringVarP(&copyFrom, "from", "f", "", "Full path to file inside snapshot")
	CopyCmd.Flags().StringVarP(&copyTo, "to", "t", "", "Local path to copy into")
	FuseCmd.AddCommand(CopyCmd)
}
