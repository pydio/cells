package main

import (
	"errors"
	"fmt"
	"os"
	"path"
	"strings"
	"time"

	humanize "github.com/dustin/go-humanize"
	"github.com/gobwas/glob"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v5/common/proto/tree"

	fs2 "github.com/pydio/cells-fuse/fs"
)

var (
	lookupBase string
	lookupGlob string
	lookupI    bool
	lookupType string
	lookupUuid string
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
  $ ` + os.Args[0] + ` lookup --snapshot file:///var/cells/data/pydiods1/snapshot.db --name *test* -i

  2. List all files inside snapshot
  $ ` + os.Args[0] + ` lookup --snapshot file:///var/cells/data/pydiods1/snapshot.db --name "*" --type file

  3. List all files under an existing folder /folder/path
  $ ` + os.Args[0] + ` lookup --snapshot file:///var/cells/data/pydiods1/snapshot.db --name "*" --type file --base "/folder/path"

  4. Search file by uuid
  $ ` + os.Args[0] + ` lookup --snapshot file:///var/cells/data/pydiods1/snapshot.db --uuid "146afdbb-0056-4862-91fe-d996a2d05555"
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if storageURL == "" {
			return fmt.Errorf("please provide a snapshot URL")
		}
		if lookupGlob == "" && lookupUuid == "" {
			return fmt.Errorf("please provide a filename or a glob matcher like * or an uuid")
		}
		if lookupI {
			lookupGlob = strings.ToLower(lookupGlob)
		}
		_, snap, _, er := fs2.StorageUrlAsProvider(storageURL)
		if er != nil {
			return fmt.Errorf("cannot parse snapshot URL %v", er)
		}
		defer snap.CloseAndClear()

		breakErr := errors.New("uuid found")

		gw, er := glob.Compile(lookupGlob)
		header := false
		err := snap.Walk(cmd.Context(), func(pa string, node tree.N, err error) error {
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

			uuidFound := lookupUuid != "" && lookupUuid == node.GetUuid()

			if (er == nil && gw != nil && gw.Match(base)) || uuidFound {
				if !header {
					fmt.Println(promptui.IconGood + " Found Matches!")
					fmt.Println("")
					fmt.Println("Type \t | Uuid \t\t\t\t | MTime \t | Size \t | Path ")
					fmt.Println("----- \t |------------------------------------ \t | ----- \t | ----- \t | -----")
					header = true
				}
				typeName := "Folder"
				if node.IsLeaf() {
					typeName = "File"
				}
				mTime := time.Unix(node.GetMTime(), 0).Format("06-01-02")
				fmt.Println(typeName + "\t | " + node.GetUuid() + "\t | " + mTime + "\t | " + humanize.IBytes(uint64(node.GetSize())) + "\t | " + node.GetPath())
			}
			if uuidFound {
				return breakErr
			}
			return nil
		}, lookupBase, true)

		if err != nil && err != breakErr {
			fmt.Println(promptui.IconWarn + err.Error())
		}

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
	LookupCmd.Flags().StringVarP(&lookupUuid, "uuid", "u", "", "Search by uuid")
	FuseCmd.AddCommand(LookupCmd)
}
