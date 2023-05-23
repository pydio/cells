package main

import (
	"fmt"
	"os"
	"path"
	"strings"
	"time"

	"github.com/dustin/go-humanize"
	"github.com/gobwas/glob"
	"github.com/manifoldco/promptui"
	fs2 "github.com/pydio/cells-fuse/fs"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/spf13/cobra"
)

var (
	lookupBase string
	lookupGlob string
	lookupI    bool
	lookupType string
)

var LookupCmd = &cobra.Command{
	Use:   "lookup",
	Short: "Look up for a file without mounting the whole storage, equivalent to shell 'find' command.",
	Long: `
DESCRIPTION

  Without mounting the whole snapshot, lookup for a file or folder by its name inside the snapshot database.
  Use wildcard '*' to expand search with glob patterns. Looking for '*' will display all snapshot contents.

EXAMPLES 

  1. List all files or folders with name containing "test", case insensitive
  $ ` + os.Args[0] + ` lookup --storage file:///var/cells/data/pydiods1/snapshot.db --name *test* -i

  2. List all files inside snapshot
  $ ` + os.Args[0] + ` lookup --storage file:///var/cells/data/pydiods1/snapshot.db --name "*" --type file

  3. List all files under an existing folder /folder/path
  $ ` + os.Args[0] + ` lookup --storage file:///var/cells/data/pydiods1/snapshot.db --name "*" --type file --base "/folder/path"

`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if storageURL == "" {
			return fmt.Errorf("please provide a snapshot URL")
		}
		if lookupGlob == "" {
			return fmt.Errorf("please provide a filename or a glob matcher like *")
		}
		if lookupI {
			lookupGlob = strings.ToLower(lookupGlob)
		}
		_, snap, er := fs2.StorageUrlAsProvider(storageURL)
		if er != nil {
			return fmt.Errorf("cannot parse snapshot URL %v", er)
		}
		defer snap.Close(true)

		gw, er := glob.Compile(lookupGlob)
		header := false
		_ = snap.Walk(cmd.Context(), func(pa string, node *tree.Node, err error) error {
			base := path.Base(node.GetPath())
			if lookupI {
				base = strings.ToLower(base)
			}
			if lookupType == "file" && !node.IsLeaf() {
				return nil
			}
			if lookupType == "folder" && node.IsLeaf() {
				return nil
			}
			if gw.Match(base) {
				if !header {
					fmt.Println(promptui.IconGood + " Found Matches!")
					fmt.Println("")
					fmt.Println("Type \t | MTime \t | Size \t | Path")
					fmt.Println("----- \t | ----- \t | ----- \t | -----")
					header = true
				}
				typeName := "Folder"
				if node.IsLeaf() {
					typeName = "File"
				}
				mTime := time.Unix(node.GetMTime(), 0).Format("06-01-02")
				fmt.Println(typeName + "\t | " + mTime + "\t | " + humanize.IBytes(uint64(node.GetSize())) + "\t | " + node.GetPath())
			}
			return nil
		}, lookupBase, true)

		if !header {
			fmt.Println(promptui.IconBad + " No Matches Found")
		} else {
			fmt.Println("")
		}

		return nil
	},
}

func init() {
	LookupCmd.Flags().StringVarP(&lookupBase, "base", "b", "/", "Restrict search to a specific subfolder")
	LookupCmd.Flags().StringVarP(&storageURL, "snapshot", "s", "", "Snapshot URL, starting with file:// or s3://")
	LookupCmd.Flags().StringVarP(&lookupGlob, "name", "n", "", "Filename to search (using wildcards for glob). Searching for \"*\" will list all files.")
	LookupCmd.Flags().BoolVarP(&lookupI, "insensitive", "i", false, "Search with insensitive case.")
	LookupCmd.Flags().StringVarP(&lookupType, "type", "t", "", "Restrict to files ('file') or folders ('folder')")
	FuseCmd.AddCommand(LookupCmd)
}
