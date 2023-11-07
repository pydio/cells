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
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/spf13/cobra"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/protobuf/types/known/emptypb"
	"net/url"
	"time"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
)

// docDepsCmd shows dependencies between services.
var reloadAssetsCmd = &cobra.Command{
	Use:    "reload-assets",
	Hidden: true,
	Short:  "Trigger frontend assets reload",
	Long: `
DESCRIPTION

  [For development only] Clear in-memory assets and refresh all, including the i18n JSON files.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()
		u, err := url.Parse(runtime.DiscoveryURL())
		if err != nil {
			return err
		}
		discoveryConn, err := grpc.DialContext(ctx, u.Host, grpc.WithTransportCredentials(insecure.NewCredentials()))
		if err != nil {
			return err
		}
		ctx = clientcontext.WithClientConn(ctx, discoveryConn)
		br := broker.NewBroker(runtime.BrokerURL(), broker.WithContext(ctx))
		cmd.Println("Sending a reload command on ReloadAssets topic")
		err = br.Publish(ctx, common.TopicReloadAssets, &emptypb.Empty{})
		<-time.After(100 * time.Millisecond)
		return err
	},
}

func init() {

	AdminCmd.AddCommand(reloadAssetsCmd)
}
