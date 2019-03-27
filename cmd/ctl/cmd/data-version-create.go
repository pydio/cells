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
	"context"
	"fmt"

	uuid2 "github.com/pborman/uuid"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/tree"
)

var versionCreateUUID string

// versionCreateCmd represents the create command
var versionCreateCmd = &cobra.Command{
	Use:   "create",
	Short: "Trigger a version create",
	Long: `Trigger a version create for a given file.

Version creation will consist of duplicating the file content and registering a version by uuid
in the versions store.
`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if versionCreateUUID == "" {
			return fmt.Errorf("Missing arguments")
		}

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		client := tree.NewNodeVersionerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_VERSIONS, defaults.NewClient())

		randomEtag := uuid2.NewUUID().String()
		client.CreateVersion(context.Background(), &tree.CreateVersionRequest{Node: &tree.Node{Uuid: versionCreateUUID, Etag: randomEtag}})
	},
}

func init() {
	versionCreateCmd.Flags().StringVarP(&versionCreateUUID, "uuid", "u", "", "Node Uuid, use pydioctl data list or pydioctl data read to find a node by path.")

	dataVersionCmd.AddCommand(versionCreateCmd)
}
