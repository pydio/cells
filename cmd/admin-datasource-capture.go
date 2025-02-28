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
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/endpoints/snapshot"
	model2 "github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/data/source/sync/clients"
)

var (
	captureDsName        string
	captureTarget        string
	captureFormat        string
	captureSides         string
	capturePydioContents bool
)

var dsCaptureCmd = &cobra.Command{
	Use:   "capture",
	Short: "Capture index and objects into JSON or BoltDB format for sync debugging purposes",
	Long: `
DESCRIPTION

  Sometimes a subtle glitch may break structured datasources resynchronization, and for debugging purpose
  it can be handy to capture both the "left" and "right" endpoints, namely the sql index and the s3 storage listing.

EXAMPLES

  1. Capture datasource pydiods1 into a given location
  $ ` + os.Args[0] + ` admin datasource capture --datasource=pydiods1 --target=/path/to/folder --format=bolt

`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if captureDsName == "" {
			cmd.Println("Please provide a datasource name (--datasource)")
			return cmd.Help()
		}
		if captureTarget == "" {
			cmd.Println("Please provide a folder for storing snapshots (--target)")
			return cmd.Help()
		}
		if captureFormat != "bolt" && captureFormat != "json" {
			cmd.Println("Please provide the format as one of 'bolt' or 'json'.")
			return cmd.Help()
		}
		if captureSides != "both" && captureSides != "s3" && captureSides != "index" {
			cmd.Println("Use one of both, s3 or index for the sides parameter")
			return cmd.Help()
		}

		var syncConfig *object.DataSource
		// TODO
		if err := config.Get(cmd.Context(), "services", common.ServiceDataSyncGRPC_+captureDsName).Scan(&syncConfig); err != nil {
			return err
		}
		if sec := config.GetSecret(ctx, syncConfig.ApiSecret).String(); sec != "" {
			syncConfig.ApiSecret = sec
		}
		conn := grpc.ResolveConn(ctx, common.ServiceDataIndexGRPC_+captureDsName)
		cRead := tree.NewNodeProviderClient(conn)
		cWrite := tree.NewNodeReceiverClient(conn)
		cSess := tree.NewSessionIndexerClient(conn)
		source, target, _, err := clients.InitEndpoints(ctx, syncConfig, cRead, cWrite, cSess)
		if err != nil {
			return err
		}
		cmd.Println("[Endpoints] Source:", source.GetEndpointInfo().URI, ", Target:", target.GetEndpointInfo().URI)
		cmd.Println("**** Starting captures ****")
		cmd.Println("")

		sourceAsSource, _ := model2.AsPathSyncSource(source)
		sourceAsSource = &sourceProgressWrapper{PathSyncSource: sourceAsSource, sName: "s3"}

		targetAsSource, _ := model2.AsPathSyncSource(target)
		targetAsSource = &sourceProgressWrapper{PathSyncSource: targetAsSource, sName: "index"}

		if captureFormat == "json" {

			if captureSides == "both" || captureSides == "s3" {
				cmd.Println("[s3] Capturing s3 to JSON")
				dss, _ := model2.AsDataSyncSource(source)
				db := memory.NewMemDB()
				if e := walkSourceToDB(ctx, sourceAsSource, db, dss); e != nil {
					return e
				}
				if er := db.ToJSON(filepath.Join(captureTarget, captureDsName+"-source.json")); er != nil {
					return er
				}
				cmd.Printf("[s3] Captured %d items to JSON\n\n", (sourceAsSource.(*sourceProgressWrapper)).i)
			}

			if captureSides == "both" || captureSides == "index" {
				cmd.Println("[index] Capturing index to JSON")
				db := memory.NewMemDB()
				if e := walkSourceToDB(ctx, targetAsSource, db, nil); e != nil {
					return e
				}
				if er := db.ToJSON(filepath.Join(captureTarget, captureDsName+"-target.json")); er != nil {
					return er
				}
				cmd.Printf("[index] Captured %d items to JSON\n\n", (targetAsSource.(*sourceProgressWrapper)).i)
			}

		} else {

			if captureSides == "both" || captureSides == "s3" {
				cmd.Println("[s3] Capturing s3 to Bolt")
				sb, e := snapshot.NewBoltSnapshot(cmd.Context(), captureTarget, captureDsName+"-source.db")
				if e != nil {
					return e
				}
				defer sb.Close()
				sb.SetManualCollector()
				if capturePydioContents {
					// Cannot use standard Capture
					dss, _ := model2.AsDataSyncSource(source)
					sessid, _ := sb.StartSession(ctx, nil, false)
					if e := walkSourceToDB(ctx, sourceAsSource, sb, dss); e != nil {
						return e
					}
					if e := sb.FinishSession(ctx, sessid); e != nil {
						return e
					}
				} else if e := sb.Capture(ctx, sourceAsSource); e != nil {
					return e
				}
				cmd.Printf("[s3] Captured %d items to BoltDB\n\n", (sourceAsSource.(*sourceProgressWrapper)).i)
			}

			if captureSides == "both" || captureSides == "index" {
				cmd.Println("[index] Capturing index to Bolt")
				tb, e := snapshot.NewBoltSnapshot(cmd.Context(), captureTarget, captureDsName+"-target.db")
				if e != nil {
					return e
				}
				if e := tb.Capture(ctx, targetAsSource); e != nil {
					tb.Close()
					return e
				}
				tb.Close()
				cmd.Printf("[index] Captured %d items to BoltDB\n\n", (sourceAsSource.(*sourceProgressWrapper)).i)
			}

		}

		return nil
	},
}

type sourceProgressWrapper struct {
	model2.PathSyncSource
	i     uint32
	sName string
}

func (s *sourceProgressWrapper) Walk(ctx context.Context, walknFc model2.WalkNodesFunc, root string, recursive bool) (err error) {
	wrapper := func(path string, node tree.N, err error) error {
		s.i++
		if s.i%1000 == 0 {
			fmt.Printf("[%s] Analyzed %d items\n", s.sName, s.i)
		}
		return walknFc(path, node, err)
	}
	return s.PathSyncSource.Walk(ctx, wrapper, root, recursive)
}

func walkSourceToDB(ctx context.Context, source model2.Endpoint, db model2.PathSyncTarget, dataSyncSource model2.DataSyncSource) error {

	//db := memory.NewMemDB()
	ds := dataSyncSource != nil
	if er := source.(model2.PathSyncSource).Walk(ctx, func(path string, node tree.N, err error) error {
		if ds && capturePydioContents && node.IsLeaf() && strings.HasSuffix(path, "/"+common.PydioSyncHiddenFile) {
			if r, e := dataSyncSource.GetReaderOn(ctx, path); e == nil {
				if bb, er := io.ReadAll(r); er == nil {
					node.SetRawMetadata(map[string]string{"captured_content": "\"" + string(bb) + "\""})
				}
				_ = r.Close()
			} else {
				fmt.Println("[WARN]  Cannot read content of "+path, e)
			}
		}
		return db.CreateNode(ctx, node, false)
	}, "/", true); er != nil {
		return er
	}

	return nil
	//return db.ToJSON(jsonFile)

}

func init() {
	dsCaptureCmd.PersistentFlags().StringVarP(&captureDsName, "datasource", "d", "", "Name of datasource to capture")
	dsCaptureCmd.PersistentFlags().StringVarP(&captureTarget, "target", "t", "", "Target folder where to store the snapshots")
	dsCaptureCmd.PersistentFlags().StringVarP(&captureFormat, "format", "f", "bolt", "One of bolt|json storage, bolt by default")
	dsCaptureCmd.PersistentFlags().StringVarP(&captureSides, "sides", "s", "both", "Capture both sides, can be restricted by specifying s3 or index.")
	dsCaptureCmd.PersistentFlags().BoolVarP(&capturePydioContents, "load-pydio-uuids", "", false, "If side is providing content, load content as metadata when reading a '.pydio' node")
	DataSourceCmd.AddCommand(dsCaptureCmd)
}
