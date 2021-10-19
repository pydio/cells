package cmd

import (
	"context"
	"crypto/md5"
	"fmt"
	"os"
	"path"
	"strings"
	"time"

	"github.com/dustin/go-humanize"
	"github.com/manifoldco/promptui"
	"github.com/pborman/uuid"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	context2 "github.com/pydio/cells/common/utils/context"
	"github.com/pydio/minio-go"
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
	Short: "Migrate a structured datasource into flat format",
	Long:  "This command migrates the content of a bucket from legacy to flat storage format.",
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
				log.WriteString(s + "\n")
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

		running, _ := registry.GetRunningService(common.ServiceGrpcNamespace_ + common.ServiceDataSync_ + source.Name)
		if len(running) > 0 {
			migrateLogger("[ERROR] Datasource "+source.Name+" sync appears to be running. Can you please restart cells without an active sync ? `./cells start -x pydio.grpc.data.sync`", true)
			return e
		}

		// Prepare Clients
		rootNode, idxClient, idxWrite, mc, e := migratePrepareClients(authCtx, source)
		if e != nil {
			migrateLogger("[ERROR] "+e.Error(), true)
			return e
		}

		// Check source and target buckets
		bb, e := mc.ListBucketsWithContext(authCtx)
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
		hiddenNodes, e := migratePerformMigration(authCtx, mc, idxClient, srcBucket, tgtBucket, tgtFmt)
		if e != nil {
			return fmt.Errorf("error while moving files: %+v", e)
		}

		// Clean Index table
		if len(hiddenNodes) > 0 && !migrateDry {
			p := promptui.Prompt{Label: "All objects were successfully copied, do you wish to clean the index table now", IsConfirm: true, Default: "y"}
			if _, e := p.Run(); e == nil {
				if tgtFmt == "flat" {
					for _, n := range hiddenNodes {
						_, er := idxWrite.DeleteNode(authCtx, &tree.DeleteNodeRequest{Node: n})
						if er != nil {
							migrateLogger(fmt.Sprintf("[ERROR] while removing %s from index: %+v", n.GetPath(), er), true)
							return er
						} else {
							migrateLogger("Removed "+n.GetPath()+" from index table", true)
						}
					}
				} else {
					for _, n := range hiddenNodes {
						_, er := idxWrite.CreateNode(authCtx, &tree.CreateNodeRequest{Node: n, UpdateIfExists: true})
						if er != nil {
							e := fmt.Errorf("error while creating %s inside index: %+v", n.GetPath(), er)
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

				config.Set(tgtBucket, "services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+source.Name, "ObjectsBucket")
				if fKey, o := source.StorageConfiguration[object.StorageKeyFolder]; o {
					fKey = path.Join(path.Dir(fKey), tgtBucket)
					config.Set(fKey, "services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+source.Name, "StorageConfiguration", object.StorageKeyFolder)
				}
				config.Set(tgtFmt == "flat", "services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+source.Name, "FlatStorage")
				config.Save(common.PydioSystemUsername, "Migrating datasource format")
				migrateLogger("Updated DataSource configuration after migration", true)
			}
		} else {
			fmt.Println("Dry-run migration is done. Nothing was modified.")
		}

		return nil
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

func migratePrepareClients(ctx context.Context, source *object.DataSource) (rootNode *tree.Node, idx tree.NodeProviderClient, idxW tree.NodeReceiverClient, mc *minio.Core, e error) {

	idx = tree.NewNodeProviderClient(registry.GetClient(common.ServiceDataIndex_ + source.Name))
	idxW = tree.NewNodeReceiverClient(registry.GetClient(common.ServiceDataIndex_ + source.Name))
	r, er := idx.ReadNode(authCtx, &tree.ReadNodeRequest{Node: &tree.Node{Path: "/"}})
	if er != nil {
		e = er
		return
	}
	rootNode = r.GetNode()
	objCli := object.NewObjectsEndpointClient(registry.GetClient(common.ServiceDataObjects_ + source.ObjectsServiceName))
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
	mc, e = minio.NewCore(fmt.Sprintf("%s:%d", conf.RunningHost, conf.RunningPort), conf.ApiKey, apiSecret, conf.RunningSecure)
	if e != nil {
		return
	}

	return
}

func migratePerformMigration(ctx context.Context, mc *minio.Core, idx tree.NodeProviderClient, src, tgt, tgtFmt string) (out []*tree.Node, ee error) {

	str, e := idx.ListNodes(ctx, &tree.ListNodesRequest{Node: &tree.Node{Path: "/"}, Recursive: true})
	if e != nil {
		return out, e
	}
	opts := minio.StatObjectOptions{}
	mm := map[string]string{}
	if meta, ok := context2.MinioMetaFromContext(ctx); ok {
		for k, v := range meta {
			mm[k] = v
			opts.Set(k, v)
		}
	}
	defer str.Close()
	for {
		r, e := str.Recv()
		if e != nil {
			break
		}
		n := r.GetNode()

		srcPath := n.GetPath()
		tgtPath := n.GetUuid()
		isPydio := path.Base(n.GetPath()) == common.PydioSyncHiddenFile
		if tgtFmt != "flat" {
			srcPath = n.GetUuid()
			tgtPath = strings.TrimLeft(n.GetPath(), "/")
		}
		if !isPydio && n.IsLeaf() {
			_, e := mc.StatObject(src, srcPath, opts)
			if e != nil {
				migrateLogger("[ERROR] Cannot stat object "+srcPath+": "+e.Error(), true)
				return out, e
			}
			if migrateDry {
				fmt.Println("[DRY-RUN] Should copy " + path.Join(src, srcPath) + " to " + path.Join(tgt, tgtPath))
				continue
			}
			_, e = mc.CopyObject(src, srcPath, tgt, tgtPath, mm)
			if e != nil {
				migrateLogger("[ERROR] While copying "+path.Join(src, srcPath)+" to "+path.Join(tgt, tgtPath)+":"+e.Error(), true)
				return out, e
			}
			migrateLogger(" - Copied "+path.Join(src, srcPath)+" to "+path.Join(tgt, tgtPath), true)
			if migrateMove {
				if er := mc.RemoveObjectWithContext(ctx, src, srcPath); er != nil {
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
			_, e := mc.PutObjectWithContext(ctx, tgt, hiddenPath, strings.NewReader(n.GetUuid()), int64(len(n.GetUuid())), minio.PutObjectOptions{})
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
