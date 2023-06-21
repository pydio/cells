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
	"crypto/md5"
	"fmt"
	"io"
	"os"
	"path"
	"strings"
	"time"

	registry2 "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/uuid"

	"github.com/dustin/go-humanize"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	migrateForce  bool
	migrateDry    bool
	migrateMove   bool
	authCtx       = context.WithValue(context.Background(), common.PydioContextUserKey, common.PydioSystemUsername)
	migrateLogger = func(s string, print bool) {
		fmt.Println(s)
	}
)

var dataSourceMigrateCmd = &cobra.Command{
	Use:   "migrate",
	Short: "Migrate a datasource format (flat or structured)",
	Long: `
DESCRIPTION

  Migrate the content of a bucket between structured and flat. It can be used in both directions. It must be run with in 
  a specific context: datasource services must be running **expect** for the sync services. You can start Cells in this 
  specific mode by using the following command: ` + os.Args[0] + ` start -x pydio.grpc.data.sync

  The command executes the following actions:
  - List datasources showing their current formats. When picking a datasource, it is assumed it will be migrated to the 
    opposite format
  - Detect datasource bucket name and expect to find an second bucket named "bucket-flat" or "bucket-structured" 
    (depending on the target format).
  - Copy all files inside the new bucket, with their new name
  - If everything is ok, patch index database to add or remove .pydio hidden files (depending on target format)
  - Finally, update the datasource configuration in the configs.

  Use --dry-run parameter to display only the list of rename operations that will be performed, without touching DB or 
  configuration.

  By default, files are copied inside the new bucket and are left untouched inside the original one in case something 
  goes wrong. That means that your storage must have enough room for duplicating all data. If it's not the case, you can 
  pass the --move-files flag to delete original file after copy. You can also force the copy to be performed in-place by 
  manually editing target bucket name to its original value.

`,
	RunE: func(cmd *cobra.Command, args []string) error {

		if !migrateForce {
			fmt.Println("")
			fmt.Println(" **************************************************************************************")
			fmt.Println(" * To run this command, please first make sure to **NOT** run Cells in a normal mode. *")
			fmt.Println(" * You must exclude sync services, by running `./cells start -x pydio.grpc.data.sync` *")
			fmt.Println(" **************************************************************************************")
			fmt.Println("")
			p := &promptui.Prompt{Label: "Are you sure that sync services are NOT running", IsConfirm: true, Default: "N"}
			if _, e := p.Run(); e != nil {
				return fmt.Errorf("user aborted")
			}
		}

		if !migrateDry {
			log, e := os.OpenFile("./ds-migration.log", os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
			if e != nil {
				return fmt.Errorf("cannot open log file %+v", e)
			}
			defer log.Close()
			migrateLogger = func(s string, print bool) {
				_, _ = log.WriteString(s + "\n")
				if print {
					fmt.Println(s)
				}
			}
		}

		// Pick datasource to migrate
		source, _, tgtFmt, srcBucket, tgtBucket, e := migratePickDS()
		if e != nil {
			migrateLogger("[ERROR] "+e.Error(), true)
			return e
		}

		reg, err := registry.OpenRegistry(ctx, runtime.RegistryURL())
		if err != nil {
			return err
		}

		if item, err := reg.Get(common.ServiceGrpcNamespace_ + common.ServiceDataSync_ + source.Name); err == nil {
			if len(reg.ListAdjacentItems(item, registry.WithType(registry2.ItemType_SERVER))) > 0 {
				migrateLogger("[ERROR] Datasource "+source.Name+" sync appears to be running. Can you please restart cells without an active sync ? `./cells start -x pydio.grpc.data.sync`", true)
				return fmt.Errorf("sync is running")
			}
		}

		// Prepare Clients
		rootNode, idxClient, mc, e := migratePrepareClients(source)
		if e != nil {
			migrateLogger("[ERROR] "+e.Error(), true)
			return e
		}

		// Check source and target buckets
		bb, e := mc.ListBuckets(authCtx)
		if e != nil {
			return fmt.Errorf("cannot list bucket %+v", e)
		}
		var srcFound, tgtFound bool
		for _, b := range bb {
			if b.Name == srcBucket {
				srcFound = true
			}
			if b.Name == tgtBucket {
				tgtFound = true
			}
		}
		if !srcFound {
			e := fmt.Errorf("cannot find source bucket %s", srcBucket)
			migrateLogger("[ERROR] "+e.Error(), true)
			return e
		}
		if !tgtFound {
			e := fmt.Errorf("cannot find target bucket %s, please create it manually", tgtBucket)
			migrateLogger("[ERROR] "+e.Error(), true)
			return e
		}

		rootSize := humanize.Bytes(uint64(rootNode.GetSize()))
		if migrateDry {
			fmt.Println("Showing Dry-Run migration (nothing will be changed) - Data Size is " + rootSize)
		} else {
			fmt.Println("Data migration is ready to start, there are " + rootSize + " to move.")
			if migrateMove {
				fmt.Println(" -> All files will be moved (copy/delete) to new bucket")
			} else {
				fmt.Println(" -> Files will be copied to new bucket, but the original bucket will be left unchanged.")
			}
			p := promptui.Prompt{Label: "Are you sure you want to continue", IsConfirm: true, Default: "N"}
			if _, e := p.Run(); e != nil {
				return fmt.Errorf("operation aborted")
			}
		}

		// Apply migration
		hiddenNodes, e := migratePerformMigration(authCtx, source, mc, idxClient, srcBucket, tgtBucket, tgtFmt)
		if e != nil {
			return fmt.Errorf("error while moving files: %+v", e)
		}

		// Clean Index table
		if len(hiddenNodes) > 0 && !migrateDry {
			p := promptui.Prompt{Label: "All objects were successfully copied, do you wish to clean the index table now", IsConfirm: true, Default: "y"}
			if _, e := p.Run(); e == nil {
				if tgtFmt == "flat" {
					resyncClient := sync.NewSyncEndpointClient(grpc.GetClientConnFromCtx(ctx, common.ServiceDataIndex_+source.Name, longGrpcCallTimeout()))
					resp, e := resyncClient.TriggerResync(authCtx, &sync.ResyncRequest{Path: "flatten"})
					if e != nil {
						migrateLogger(fmt.Sprintf("[ERROR] while cleaning index from '.pydio' entries: %+v", e), true)
						return e
					} else {
						migrateLogger("Cleaned index with result: "+resp.GetJsonDiff(), true)
					}
				} else {
					streamClient := tree.NewNodeReceiverStreamClient(grpc.GetClientConnFromCtx(ctx, common.ServiceDataIndex_+source.Name, longGrpcCallTimeout()))
					streamer, e := streamClient.CreateNodeStream(authCtx)
					if e != nil {
						migrateLogger(fmt.Sprintf("[ERROR] Cannot open stream to index service %s", e.Error()), true)
						return e
					}
					for _, n := range hiddenNodes {
						er := streamer.Send(&tree.CreateNodeRequest{Node: n, UpdateIfExists: true})
						if er != nil {
							e := fmt.Errorf("error while sending %s to index: %+v", n.GetPath(), er)
							migrateLogger("[ERROR] "+e.Error(), true)
							return e
						} else if _, re := streamer.Recv(); re != nil {
							e := fmt.Errorf("error while creating %s inside index: %+v", n.GetPath(), re)
							migrateLogger("[ERROR] "+e.Error(), true)
							return e
						} else {
							migrateLogger("Inserted "+n.GetPath()+" inside index table", true)
						}
					}
				}
			}
		}

		// Now update datasource config
		if !migrateDry {
			p := promptui.Prompt{Label: "Objects format is fully re-structured, do you wish to update configuration", IsConfirm: true, Default: "y"}
			if _, e := p.Run(); e == nil {

				_ = config.Set(tgtBucket, "services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+source.Name, "ObjectsBucket")
				if fKey, o := source.StorageConfiguration[object.StorageKeyFolder]; o {
					fKey = path.Join(path.Dir(fKey), tgtBucket)
					_ = config.Set(fKey, "services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+source.Name, "StorageConfiguration", object.StorageKeyFolder)
				}
				_ = config.Set(tgtFmt == "flat", "services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+source.Name, "FlatStorage")
				_ = config.Save(common.PydioSystemUsername, "Migrating datasource format")
				migrateLogger("Updated DataSource configuration after migration", true)
			}
		} else {
			fmt.Println("Dry-run migration is done. Nothing was modified.")
		}

		return nil
	},
	PostRun: func(cmd *cobra.Command, args []string) {
		cmd.Println("Delaying exit to make sure write operations are committed.")
		<-time.After(1 * time.Second)
	},
}

func migratePickDS() (source *object.DataSource, srcFmt, tgtFmt, srcBucket, tgtBucket string, e error) {
	dss := config.ListSourcesFromConfig()
	var dsName string
	var opts []string
	for _, ds := range dss {
		// Skip internal datasources
		if _, o := ds.StorageConfiguration[object.StorageKeyCellsInternal]; !o {
			format := "structured"
			if ds.FlatStorage {
				format = "flat"
			}
			opts = append(opts, ds.Name+" ("+format+")")
		}
	}
	p2 := &promptui.Select{Label: "Select datasource you wish to migrate", Items: opts}
	var val string
	if _, val, e = p2.Run(); e != nil {
		return
	} else {
		// Selected key contains (type) string
		val = strings.ReplaceAll(val, " (structured)", "")
		val = strings.ReplaceAll(val, " (flat)", "")
		dsName = val
	}

	source = dss[dsName]
	srcFmt = "structured"
	tgtFmt = "flat"
	srcBucket = source.ObjectsBucket
	if source.FlatStorage {
		srcFmt = "flat"
		tgtFmt = "structured"
	}
	migrateLogger("Migrating "+srcFmt+" datasource "+source.Name+" to "+tgtFmt+" - Original bucket is "+srcBucket, true)
	p3 := &promptui.Prompt{Label: "The following bucket will be used for migrating data, change the name if you want", Default: srcBucket + "-" + tgtFmt}
	tgtBucket, e = p3.Run()

	return
}

func migratePrepareClients(source *object.DataSource) (rootNode *tree.Node, idx tree.NodeProviderClient, mc nodes.StorageClient, e error) {

	idx = tree.NewNodeProviderClient(grpc.GetClientConnFromCtx(ctx, common.ServiceDataIndex_+source.Name, longGrpcCallTimeout()))
	r, er := idx.ReadNode(authCtx, &tree.ReadNodeRequest{Node: &tree.Node{Path: "/"}})
	if er != nil {
		e = er
		return
	}
	rootNode = r.GetNode()
	objCli := object.NewObjectsEndpointClient(grpc.GetClientConnFromCtx(ctx, common.ServiceDataObjects_+source.ObjectsServiceName))
	or, er := objCli.GetMinioConfig(authCtx, &object.GetMinioConfigRequest{})
	if er != nil {
		e = er
		return
	}
	conf := or.GetMinioConfig()
	apiSecret := conf.ApiSecret
	if s := config.GetSecret(conf.ApiSecret).String(); s != "" {
		apiSecret = s
	}
	cfData := configx.New()
	_ = cfData.Val("endpoint").Set(fmt.Sprintf("%s:%d", conf.RunningHost, conf.RunningPort))
	_ = cfData.Val("key").Set(conf.ApiKey)
	_ = cfData.Val("secret").Set(apiSecret)
	_ = cfData.Val("secure").Set(conf.RunningSecure)
	_ = cfData.Val("type").Set("mc")
	if conf.StorageType == object.StorageType_AZURE {
		_ = cfData.Val("type").Set("azure")
	}
	mc, e = nodes.NewStorageClient(cfData)
	if e != nil {
		return
	}

	return
}

func migratePerformMigration(ctx context.Context, ds *object.DataSource, mc nodes.StorageClient, idx tree.NodeProviderClient, src, tgt, tgtFmt string) (out []*tree.Node, ee error) {

	str, e := idx.ListNodes(ctx, &tree.ListNodesRequest{Node: &tree.Node{Path: "/"}, Recursive: true})
	if e != nil {
		return out, e
	}
	mm := map[string]string{}
	if meta, ok := metadata.MinioMetaFromContext(ctx); ok {
		for k, v := range meta {
			mm[k] = v
		}
	}
	var nn []*tree.Node
	for {
		r, e := str.Recv()
		if e != nil {
			if e != io.EOF {
				migrateLogger(fmt.Sprintf("[ERROR] in receiving data from grpc: %s", e.Error()), true)
			}
			break
		}
		nn = append(nn, r.GetNode())
	}

	migrateLogger(fmt.Sprintf("Received %d objects to be migrated", len(nn)), true)

	for _, n := range nn {
		srcPath := n.GetPath()
		tgtPath := ds.FlatShardedPath(n.GetUuid())
		isPydio := path.Base(n.GetPath()) == common.PydioSyncHiddenFile
		if tgtFmt != "flat" {
			srcPath = ds.FlatShardedPath(n.GetUuid())
			tgtPath = strings.TrimLeft(n.GetPath(), "/")
		}
		if !isPydio && n.IsLeaf() {
			srcObject, e := mc.StatObject(ctx, src, srcPath, mm)
			if e != nil {
				if migrateMove {
					if tgtObject, tE := mc.StatObject(ctx, tgt, tgtPath, mm); tE == nil && tgtObject.Size == n.Size {
						migrateLogger("[RESUME] Object "+tgtPath+" already exists, skipping ", true)
						continue
					}
				}
				migrateLogger("[ERROR] Cannot stat object "+srcPath+": "+e.Error(), true)
				return out, e
			}
			if migrateDry {
				fmt.Println("[DRY-RUN] Should copy " + path.Join(src, srcPath) + " to " + path.Join(tgt, tgtPath))
				continue
			}
			if tgtObject, tE := mc.StatObject(ctx, tgt, tgtPath, mm); tE == nil && tgtObject.Size == srcObject.Size {
				migrateLogger("[RESUME] Object "+tgtPath+" already exists, skipping ", true)
				continue
			}

			_, e = mc.CopyObject(ctx, src, srcPath, tgt, tgtPath, mm, nil, nil)
			if e != nil {
				migrateLogger("[ERROR] While copying "+path.Join(src, srcPath)+" to "+path.Join(tgt, tgtPath)+":"+e.Error(), true)
				return out, e
			}
			migrateLogger(" - Copied "+path.Join(src, srcPath)+" to "+path.Join(tgt, tgtPath), true)
			if migrateMove {
				if er := mc.RemoveObject(ctx, src, srcPath); er != nil {
					return out, fmt.Errorf("cannot remove original file %+v", er)
				} else {
					migrateLogger("Removed original file "+srcPath, false)
				}
			}
		} else if tgtFmt == "flat" && isPydio {
			// Struct to flat => remove .pydio inside index
			out = append(out, &tree.Node{Path: n.GetPath()})
		} else if tgtFmt != "flat" && !n.IsLeaf() {
			// Flat to struct => recreate .pydio files for folders
			hiddenPath := strings.TrimLeft(path.Join(tgtPath, common.PydioSyncHiddenFile), "/")
			if migrateDry {
				fmt.Println("[DRY-RUN] Should create " + hiddenPath)
				continue
			}
			_, e := mc.PutObject(ctx, tgt, hiddenPath, strings.NewReader(n.GetUuid()), int64(len(n.GetUuid())), models.PutMeta{})
			if e != nil {
				return out, fmt.Errorf("cannot re-create hidden %s (%s)", hiddenPath, e.Error())
			} else {
				migrateLogger("Created "+hiddenPath+" with folder UUID "+n.GetUuid(), false)
			}
			out = append(out, &tree.Node{
				Path:  hiddenPath,
				Uuid:  uuid.New(),
				Size:  36,
				MTime: time.Now().Unix(),
				Type:  tree.NodeType_LEAF,
				Etag:  fmt.Sprintf("%x", md5.Sum([]byte(n.GetUuid()))),
			})
		}
	}

	return out, nil
}

func init() {
	dataSourceMigrateCmd.Flags().BoolVarP(&migrateForce, "force", "f", false, "Skip initial warning")
	dataSourceMigrateCmd.Flags().BoolVarP(&migrateDry, "dry-run", "d", false, "Do not apply any changes")
	dataSourceMigrateCmd.Flags().BoolVarP(&migrateMove, "move-files", "m", false, "Delete original files after copying to new bucket")
	DataSourceCmd.AddCommand(dataSourceMigrateCmd)
}
