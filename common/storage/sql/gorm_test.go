package sql_test

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"testing"

	"github.com/spf13/viper"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
	gdb "gorm.io/plugin/dbresolver"

	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/controller"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/storage"
	ssql "github.com/pydio/cells/v4/common/storage/sql"
	dbresolver "github.com/pydio/cells/v4/common/storage/sql/dbresolver"
	"github.com/pydio/cells/v4/common/storage/test"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/uuid"

	_ "embed"
	_ "github.com/pydio/cells/v4/common/registry/config"
)

var (
	//go:embed gorm_test.yaml
	storageTestTemplate string
)

type DAO struct {
	DB *gorm.DB
}

var (
	testcases = test.TemplateSQL(NewDAO)
)

func NewDAO(db *gorm.DB) DAO {
	return DAO{DB: db}
}

func TestController(t *testing.T) {
	v := viper.New()
	v.Set(runtime.KeyName, "discovery")
	v.Set(runtime.KeyArgTags, "storages")
	v.Set(runtime.KeyBootstrapYAML, storageTestTemplate)
	v.Set(runtime.KeyConfig, "mem://")
	runtime.SetRuntime(v)

	var svc service.Service
	runtime.Register("test", func(ctx context.Context) {
		svc = service.NewService(
			service.Name("test"),
			service.Context(ctx),
			service.WithStorageDrivers(NewDAO),
		)
	})

	ctx := context.Background()

	mg, err := manager.NewManager(ctx, "test", nil)
	if err != nil {
		t.Error("cannot run test", err)
		t.Fail()
		return
	}

	ctx = context.WithValue(mg.Context(), service.ContextKey, svc)

	dao, err := manager.Resolve[DAO](ctx)
	fmt.Println(dao, err)
	//var db *gorm.DB
	//if err := mg.GetStorage(ctx, "sql", &db); err != nil {
	//	panic(err)
	//}
}

var _ gorm.Dialector = (*noopDialector)(nil)

type noopDialector struct {
}

func (n noopDialector) Name() string {
	return ""
}

func (n noopDialector) Initialize(db *gorm.DB) error {
	return nil
}

func (n noopDialector) Migrator(db *gorm.DB) gorm.Migrator {
	return nil
}

func (n noopDialector) DataTypeOf(field *schema.Field) string {
	return ""
}

func (n noopDialector) DefaultValueOf(field *schema.Field) clause.Expression {
	return nil
}

func (n noopDialector) BindVarTo(writer clause.Writer, stmt *gorm.Statement, v interface{}) {
}

func (n noopDialector) QuoteTo(writer clause.Writer, s string) {
}

func (n noopDialector) Explain(sql string, vars ...interface{}) string {
	return ""
}

type Data struct {
	MyData       string `gorm:"column:data"`
	Index        string `gorm:"column:index;index:index;"`
	UniqueIndex1 string `gorm:"column:unique_index1;index:,unique,composite:uniqueIndex;"`
	UniqueIndex2 string `gorm:"column:unique_index2;index:,unique,composite:uniqueIndex;"`
}

type DataWithPK struct {
	ID   string `gorm:"column:id; primaryKey;"`
	Data string `gorm:"column:data"`
}

func TestDBPool(t *testing.T) {
	c := controller.NewController[storage.Storage]()
	c.Register("sqlite", controller.WithCustomOpener(ssql.OpenPool))

	st, err := c.Open(context.Background(), `sqlite:///tmp/`+uuid.New()+`{{ .Name }}.db?prefix={{ .Name }}_`)
	if err != nil {
		panic(err)
	}

	openurl.RegisterTemplateInjector(func(ctx context.Context, m map[string]interface{}) error {
		name := ctx.Value("name").(string)
		m["Name"] = name
		return nil
	})

	ctx1 := context.WithValue(context.Background(), "name", "test1")
	ctx2 := context.WithValue(context.Background(), "name", "test2")

	d1, err := st.Get(ctx1)
	if err != nil {
		panic(err)
	}

	d2, err := st.Get(ctx2)
	if err != nil {
		panic(err)
	}

	db1 := d1.(*gorm.DB)
	db2 := d2.(*gorm.DB)

	// First db :
	if err := db1.AutoMigrate(&Data{}, &DataWithPK{}); err != nil {
		panic(err)
	}

	if err := db2.AutoMigrate(&Data{}); err != nil {
		panic(err)
	}

	fmt.Println("Automigrate is over")

	db1.Create(&Data{MyData: "whatever"})
	db2.Create(&Data{MyData: "whatever2"})
	db2.Create(&Data{MyData: "whatever3"})
	db2.Create(&Data{MyData: "whatever4"})

	var res []*Data
	db2.Where(&Data{MyData: "whatever3"}).Find(&res)

	fmt.Println(res)

	tx := db1.Create(&DataWithPK{ID: "unique", Data: "something"})
	if tx.Error != nil {
		panic(tx.Error)
	}
	tx = db1.Create(&DataWithPK{ID: "unique", Data: "something else but with same ID, should output duplicate"})
	if tx.Error != nil {
		if !errors.Is(tx.Error, gorm.ErrDuplicatedKey) {
			panic(tx.Error)
		}
	}
}

func TestNormalResolver(t *testing.T) {
	//dsn_master := "sqlite3-extended:///tmp/test1.db"
	//dsn_shard1 := "sqlite3-extended:///tmp/test2.db"

	conn_master, _ := sql.Open("sqlite", "/tmp/master.db")
	dialect_master := &sqlite.Dialector{
		Conn: conn_master,
	}

	conn_shard1, _ := sql.Open("sqlite", "/tmp/shard1.db")
	dialect_shard1 := &sqlite.Dialector{
		Conn: conn_shard1,
	}

	db, err := gorm.Open(dialect_master, &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info)})

	if err != nil {
		fmt.Println("Connection Failed to Open")
	} else {
		fmt.Println("Connection Established")
	}

	db.Use(gdb.Register(gdb.Config{
		Sources: []gorm.Dialector{dialect_shard1}},
		"shard1"))

	//db.AutoMigrate(&models.Workspace{}, &models.WorkspaceMember{}, &models.WorkspaceGroup{}, &models.GroupMember{})

	db.Clauses(dbresolver.Use("shard1")).AutoMigrate(&Data{})

}

func TestNaming(t *testing.T) {

	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		dao, err := manager.Resolve[DAO](ctx)
		if err != nil {
			panic(err)
		}

		if err := dao.DB.AutoMigrate(&Data{}); err != nil {
			fmt.Println(err)
		}
	})
}

func MustAs[T any](in any) T {
	return in.(T)
}
