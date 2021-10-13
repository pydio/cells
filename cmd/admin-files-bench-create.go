package cmd

import (
	"bytes"
	"context"
	"fmt"
	"path"
	"time"

	"github.com/pborman/uuid"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/common/views/models"
)

var (
	benchNumber int
	benchUser   string
	benchPath   string
)

var benchCmd = &cobra.Command{
	Use:   "create-bench",
	Short: "Create an arbitrary number of random files in a directory",
	Long: `
DESCRIPTION

  Create an arbitrary number of random files in a directory.
  Provide --number, --path and --user parameters to perform this action.
`,
	PreRun: func(cmd *cobra.Command, args []string) {
		initServices()
		<-time.After(2 * time.Second)
	},
	Run: func(cmd *cobra.Command, args []string) {
		if !(benchNumber > 0 && benchPath != "" && benchUser != "") {
			cmd.Help()
			return
		}
		router := views.NewStandardRouter(views.RouterOptions{AdminView: true})
		c := auth.WithImpersonate(context.Background(), &idm.User{Login: benchUser})
		for i := 0; i < benchNumber; i++ {
			u := uuid.New()
			s := benchRandomContent(u)
			_, e := router.PutObject(c, &tree.Node{
				Uuid:  u,
				Path:  path.Join(benchPath, fmt.Sprintf("bench-%d.txt", i)),
				Type:  tree.NodeType_LEAF,
				Size:  int64(len(s)),
				MTime: time.Now().Unix(),
			}, bytes.NewBufferString(s), &models.PutRequestData{Size: int64(len(s))})
			if e != nil {
				fmt.Println("[ERROR] Cannot write file", e)
			}
		}
	},
}

func benchRandomContent(u string) string {
	return fmt.Sprintf(
		"Test File %s created on %d.\n\n With some dummy manually generated random content...",
		u,
		time.Now().UnixNano(),
	)
}

func init() {
	FilesCmd.AddCommand(benchCmd)
	benchCmd.Flags().IntVarP(&benchNumber, "number", "n", 0, "Number of files to create")
	benchCmd.Flags().StringVarP(&benchPath, "path", "p", "pydiods1", "Path where to create the files")
	benchCmd.Flags().StringVarP(&benchUser, "user", "u", "admin", "Username used to impersonate creation")
}
