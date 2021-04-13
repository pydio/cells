package migrations

import (
	"fmt"
	"path"

	"github.com/golang/protobuf/proto"
	"github.com/hashicorp/go-version"
	"github.com/pborman/uuid"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/x/configx"
)

func init() {
	v, _ := version.NewVersion("2.2.99")
	add(v, getMigration(updateVersionsStore))
}

func updateVersionsStore(conf configx.Values) error {

	c := conf.Val("services", "pydio.versions-store")
	dsName := c.Val("datasource").Default(configx.Reference("#/defaults/datasource")).String()
	bucket := c.Val("bucket").Default("versions").String()

	// Create a new "internal" datasource
	crtSources := config.ListSourcesFromConfig()
	dsObject, ok := crtSources[dsName]
	if !ok {
		return fmt.Errorf("cannot find versions-store datasource")
	}
	var newDsName = "versions"
	if _, exists := config.ListSourcesFromConfig()[newDsName]; exists {
		newDsName = "versions-" + uuid.New()[0:6]
	}
	dsCopy := proto.Clone(dsObject).(*object.DataSource)
	dsCopy.Name = newDsName
	dsCopy.ObjectsBucket = bucket
	dsCopy.FlatStorage = true
	dsCopy.StorageConfiguration["cellsInternal"] = "true"
	dsCopy.StorageConfiguration["initFromBucket"] = "true"
	dsCopy.StorageConfiguration["normalize"] = "false"
	dsCopy.VersioningPolicyName = ""
	dsCopy.EncryptionKey = ""
	if f, o := dsObject.StorageConfiguration["folder"]; o {
		dsCopy.StorageConfiguration["folder"] = path.Join(path.Dir(f), bucket)
	}
	conf.Val("services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+newDsName).Set(dsCopy)
	conf.Val("services", common.ServiceGrpcNamespace_+common.ServiceDataIndex_+newDsName).Set(map[string]interface{}{
		"dsn":    "default",
		"tables": config.IndexServiceTableNames(newDsName),
	})
	// Reset sync > sources
	syncSrcVal := conf.Val("services", common.ServiceGrpcNamespace_+common.ServiceDataSync, "sources")
	indexSrcVal := conf.Val("services", common.ServiceGrpcNamespace_+common.ServiceDataIndex, "sources")
	indexSlice := indexSrcVal.StringArray()
	syncSlice := syncSrcVal.StringArray()
	syncSlice = append(syncSlice, newDsName)
	indexSlice = append(indexSlice, newDsName)
	syncSrcVal.Set(syncSlice)
	indexSrcVal.Set(indexSlice)

	// Finally update pydio.versions-store/datasource value
	c.Val("datasource").Set(newDsName)

	return nil
}
