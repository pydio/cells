package sql

import (
	"context"
	"database/sql"
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
	dbresolver "github.com/pydio/cells/v4/common/storage/sql/dbresolver"

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

func NewDAO(db *gorm.DB) DAO {
	return DAO{DB: db}
}

func TestController(t *testing.T) {
	v := viper.New()
	v.Set("name", "discovery")
	v.Set("tags", "storages")
	v.Set("yaml", storageTestTemplate)
	v.Set("config", "mem://")
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
	MyData string `gorm:"column:data"`
}

func TestDBPool(t *testing.T) {
	c := controller.NewController[storage.Storage]()
	c.Register("sqlite3-extended", controller.WithCustomOpener(OpenPool))

	st, err := c.Open(context.Background(), `sqlite3-extended:///tmp/{{ .Value "name" }}.db`)
	if err != nil {
		panic(err)
	}

	d, err := st.Get(context.Background())
	if err != nil {
		panic(err)
	}

	db := d.(*gorm.DB)

	// First db :
	db1 := db.Session(&gorm.Session{Context: context.WithValue(context.Background(), "name", "test1")})
	db1.AutoMigrate(&Data{})

	db2 := db.Session(&gorm.Session{Context: context.WithValue(context.Background(), "name", "test2")})
	db2.AutoMigrate(&Data{})

	fmt.Println("Automigrate is over")

	db1.Create(&Data{"whatever"})
	db2.Create(&Data{"whatever2"})
	db2.Create(&Data{"whatever3"})
	db2.Create(&Data{"whatever4"})

	var res []*Data
	db2.Where(&Data{"whatever3"}).Find(&res)

	fmt.Println(res)
}

func TestNormalResolver(t *testing.T) {
	//dsn_master := "sqlite3-extended:///tmp/test1.db"
	//dsn_shard1 := "sqlite3-extended:///tmp/test2.db"

	conn_master, _ := sql.Open("sqlite3-extended", "/tmp/master.db")
	dialect_master := &sqlite.Dialector{
		Conn: conn_master,
	}

	conn_shard1, _ := sql.Open("sqlite3-extended", "/tmp/shard1.db")
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

func MustAs[T any](in any) T {
	return in.(T)
}
