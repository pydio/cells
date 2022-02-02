/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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
	"bytes"
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"path"
	"time"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/tree"
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
		//initServices()
		<-time.After(2 * time.Second)
	},
	Run: func(cmd *cobra.Command, args []string) {
		if !(benchNumber > 0 && benchPath != "" && benchUser != "") {
			cmd.Help()
			return
		}
		router := compose.PathClientAdmin()
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
