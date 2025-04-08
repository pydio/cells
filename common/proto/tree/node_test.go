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

package tree

import (
	"database/sql"
	"fmt"
	"regexp"
	"strings"
	"testing"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common"

	_ "github.com/mattn/go-sqlite3"

	. "github.com/smartystreets/goconvey/convey"
)

func TestNodeMeta(t *testing.T) {

	Convey("Test Get Empty Meta String", t, func() {

		node := &Node{}
		meta := node.getMetaString("anynamespace")
		So(meta, ShouldNotBeNil)
		So(meta, ShouldBeEmpty)

	})

	Convey("Test Get Empty Meta JSON", t, func() {

		node := &Node{}
		meta := &struct{}{}
		err := node.GetMeta("anynamespace", meta)
		So(err, ShouldBeNil)
		So(meta, ShouldResemble, &struct{}{})

	})

	Convey("Test Set Meta String", t, func() {

		node := &Node{}
		node.setMetaString("namespace", "stringdata")
		node.setMetaString("namespace2", "stringdata2")
		meta := node.getMetaString("namespace")
		So(meta, ShouldEqual, "stringdata")

		meta2 := node.getMetaString("namespace2")
		So(meta2, ShouldEqual, "stringdata2")

	})

	Convey("Test Reset Meta by passing empty string", t, func() {

		node := &Node{}
		node.setMetaString("namespace", "stringdata")
		node.setMetaString("namespace2", "stringdata2")

		node.setMetaString("namespace", "")

		meta := node.getMetaString("namespace")
		So(meta, ShouldBeEmpty)

		meta2 := node.getMetaString("namespace2")
		So(meta2, ShouldEqual, "stringdata2")

	})

	Convey("Test Json Marshalling/Unmarshaling", t, func() {

		node := &Node{}
		inputStruct := &struct {
			TestString string  `json:"testString"`
			TestInt    float64 `json:"testInt"`
		}{
			TestString: "mystring",
			TestInt:    256,
		}
		node.MustSetMeta("jsondata", inputStruct)

		outputStuct := &struct {
			TestString string  `json:"testString"`
			TestInt    float64 `json:"testInt"`
		}{}

		e2 := node.GetMeta("jsondata", outputStuct)

		So(e2, ShouldBeNil)
		So(outputStuct, ShouldResemble, inputStruct)

		jsonString := node.getMetaString("jsondata")
		So(jsonString, ShouldEqual, `{"testString":"mystring","testInt":256}`)
	})

	Convey("Test node HasSource function", t, func() {

		node := &Node{}
		node.setMetaString(common.MetaNamespaceDatasourceName, "ds1")
		So(node.HasSource(), ShouldBeTrue)

	})

}

func TestMPathEquals_Build(t *testing.T) {
	Convey("Test Build", t, func() {
		db, mock, err := sqlmock.New()
		So(err, ShouldBeNil)
		defer db.Close()

		// Open a GORM DB connection using the sqlmock database.
		gormDB, err := gorm.Open(postgres.New(postgres.Config{
			Conn:                 db,
			PreferSimpleProtocol: true, // Use simple protocol to avoid transaction issues.
		}), &gorm.Config{})
		if err != nil {
			t.Fatalf("failed to open gorm DB: %v", err)
		}

		mpathEquals := &MPathEquals{
			Value: &MPath{
				MPath1: "53719.624153.93104.48270.175984.80342.256879.397521.81935.74216.56093.918274.63458.782901.46520.13769.92468.351728.86745.190283.45682.30817.752190.63908.482965.12739.83547.92046.314687.75092.289134.67429.531728.86075.19403.827346.953182.74620.512984.678945",
			},
		}

		queryRegex := regexp.QuoteMeta(`SELECT * FROM "nodes" WHERE ("mpath1" = $1 AND "level" = $2)`)

		mock.
			ExpectQuery(queryRegex).
			WithArgs(mpathEquals.Value.GetMPath1(), mpathEquals.Value.Length()).
			WillReturnRows(sqlmock.NewRows([]string{""}))

		tx := gormDB.Where(mpathEquals).Find(&Node{})
		So(tx.Error, ShouldBeNil)

		if err := mock.ExpectationsWereMet(); err != nil {
			So(err, ShouldBeNil)
		}

	})
}

func TestMPathLike_Build(t *testing.T) {
	Convey("Test Build", t, func() {
		db, mock, err := sqlmock.New()
		So(err, ShouldBeNil)
		defer db.Close()

		// Open a GORM DB connection using the sqlmock database.
		gormDB, err := gorm.Open(postgres.New(postgres.Config{
			Conn:                 db,
			PreferSimpleProtocol: true, // Use simple protocol to avoid transaction issues.
		}), &gorm.Config{})
		if err != nil {
			t.Fatalf("failed to open gorm DB: %v", err)
		}

		type test struct {
			Mpath       string
			ExpectQuery string
			ExpectArgs  []any
		}

		testcases := []test{
			{
				Mpath: "53719.624153.93104.48270.175984.80342.256879.397521.81935.74216.56093.918274.63458.782901.46520.13769.92468.351728.86745.190283.45682.30817.752190.63908.482965.12739.83547.92046.314687.75092.289134.67429.531728.86075.19403.827346.953182.74620.512984.678945",
			},
		}

		for _, testcase := range testcases {

			mpath := (&MPath{}).FromString(testcase.Mpath)
			mpathEquals := &MPathLike{
				Value: mpath,
			}

			queryRegex := regexp.QuoteMeta(`SELECT * FROM "nodes" WHERE ("mpath4" LIKE $1 AND "mpath3" LIKE $2 AND "mpath2" LIKE $3 AND "mpath1" LIKE $4 AND "level" > $5)`)

			mock.
				ExpectQuery(queryRegex).
				WithArgs(mpathEquals.Value.GetMPath1()+"%", mpathEquals.Value.Length()).
				WillReturnRows(sqlmock.NewRows([]string{""}))

			tx := gormDB.Where(mpathEquals).Find(&Node{})
			So(tx.Error, ShouldBeNil)

			if err := mock.ExpectationsWereMet(); err != nil {
				So(err, ShouldBeNil)
			}
		}

	})
}

func TestMPathEquals_Valid(t *testing.T) {
	Convey("Test Build", t, func() {
		db, err := sql.Open("sqlite3", ":memory:")
		So(err, ShouldBeNil)
		defer db.Close()

		// Open a GORM DB connection using the sqlmock database.
		gormDB, err := gorm.Open(sqlite.Dialector{Conn: db}, &gorm.Config{})
		if err != nil {
			t.Fatalf("failed to open gorm DB: %v", err)
		}

		gormDB.AutoMigrate(&TreeNode{})
		initialData := []*TreeNode{
			{Name: "test1", MPath: (&MPath{}).FromString("53719.624153.93104.48270.175984.80342.256879.397521.81935.74216.56093.918274.63458.782901.46520.13769.92468.351728.86745.190283.45682.30817.752190.63908.482965.12739.83547.92046.314687.75092.289134.67429.531728.86075.19403.827346.953182.74620.512984.678945")},
			{Name: "test2", MPath: (&MPath{}).FromString("53719.624153.93104.48270.175984.80342.256879.397521.81935.74216.56093.918274.63458.782901.46520.13769.92468.351728.86745.190283.45682.30817.752190.63908.482965.12739.83547.92046.314687.75092.289134.67429.531728.86075.19403.827346.953182.74620.512984.678945.1")},
			{Name: "test3", MPath: (&MPath{}).FromString("53719.624153.93104.48270.175984.80342.256879.397521.81935.74216.56093.918274.63458.782901.46520.13769.92468.351728.86745.190283.45682.30817.752190.63908.482965.12739.83547.92046.314687.75092.289134.67429.531728.86075.19403.827346.953182.74620.512984.6789456")},
			{Name: "test4", MPath: (&MPath{}).FromString("53719.624153.93104.48270.175984.80342.256879.397521.81935.74216.56093.918274.63458.782901.46520.13769.92468.351728.86745.190283.45682.30817.752190.63908.482965.12739.83547.92046.314687.75092.289134.67429.531728.86075.19403.827346.953182.74620.512984.6789456.1")},
		}

		if tx := gormDB.Create(initialData); tx.Error != nil {
			t.Fatalf("failed to create initial data: %v", tx.Error)
		}

		type test struct {
			Mpath string
		}

		testcases := []test{
			{
				Mpath: "53719.624153.93104.48270.175984.80342.256879.397521.81935.74216.56093.918274.63458.782901.46520.13769.92468.351728.86745.190283.45682.30817.752190.63908.482965.12739.83547.92046.314687.75092.289134.67429.531728.86075.19403.827346.953182.74620.512984.678945",
			},
		}

		for _, testcase := range testcases {

			mpath := (&MPath{}).FromString(testcase.Mpath)
			mpathEquals := &MPathEquals{
				Value: mpath,
			}

			var nodes []*TreeNode

			tx := gormDB.Debug().Where(mpathEquals).Find(&nodes)
			So(tx.Error, ShouldBeNil)

			fmt.Println(nodes)
			So(tx.RowsAffected, ShouldEqual, 1)
		}
	})
}

func TestMPathLike_Valid(t *testing.T) {
	Convey("Test Build", t, func() {
		db, err := sql.Open("sqlite3", ":memory:")
		So(err, ShouldBeNil)
		defer db.Close()

		// Open a GORM DB connection using the sqlmock database.
		gormDB, err := gorm.Open(sqlite.Dialector{Conn: db}, &gorm.Config{})
		if err != nil {
			t.Fatalf("failed to open gorm DB: %v", err)
		}

		gormDB.AutoMigrate(&TreeNode{})
		initialData := []*TreeNode{
			{Name: "test1", MPath: (&MPath{}).FromString("53719.624153.93104.48270.175984.80342.256879.397521.81935.74216.56093.918274.63458.782901.46520.13769.92468.351728.86745.190283.45682.30817.752190.63908.482965.12739.83547.92046.314687.75092.289134.67429.531728.86075.19403.827346.953182.74620.512984.678945")},
			{Name: "test2", MPath: (&MPath{}).FromString("53719.624153.93104.48270.175984.80342.256879.397521.81935.74216.56093.918274.63458.782901.46520.13769.92468.351728.86745.190283.45682.30817.752190.63908.482965.12739.83547.92046.314687.75092.289134.67429.531728.86075.19403.827346.953182.74620.512984.678945.1")},
			{Name: "test3", MPath: (&MPath{}).FromString("53719.624153.93104.48270.175984.80342.256879.397521.81935.74216.56093.918274.63458.782901.46520.13769.92468.351728.86745.190283.45682.30817.752190.63908.482965.12739.83547.92046.314687.75092.289134.67429.531728.86075.19403.827346.953182.74620.512984.6789456")},
			{Name: "test4", MPath: (&MPath{}).FromString("53719.624153.93104.48270.175984.80342.256879.397521.81935.74216.56093.918274.63458.782901.46520.13769.92468.351728.86745.190283.45682.30817.752190.63908.482965.12739.83547.92046.314687.75092.289134.67429.531728.86075.19403.827346.953182.74620.512984.6789456.1")},
		}

		if tx := gormDB.Create(initialData); tx.Error != nil {
			t.Fatalf("failed to create initial data: %v", tx.Error)
		}

		type test struct {
			Mpath string
		}

		testcases := []test{
			{
				Mpath: "53719.624153.93104.48270.175984.80342.256879.397521.81935.74216.56093.918274.63458.782901.46520.13769.92468.351728.86745.190283.45682.30817.752190.63908.482965.12739.83547.92046.314687.75092.289134.67429.531728.86075.19403.827346.953182.74620.512984.678945",
			},
		}

		gormDB.Callback().Query().After("*").Register("explain_analyze", explainAnalyzeCallback)

		for _, testcase := range testcases {

			mpath := (&MPath{}).FromString(testcase.Mpath)
			mpathEquals := &MPathLike{
				Value: mpath,
			}

			var nodes []*TreeNode

			tx := gormDB.Where(mpathEquals).Find(&nodes)
			So(tx.Error, ShouldBeNil)

			fmt.Println(nodes)
			So(tx.RowsAffected, ShouldEqual, 1)
		}
	})
}

// Custom Logger to Run EXPLAIN ANALYZE
func explainAnalyzeCallback(db *gorm.DB) {

	fmt.Println("explain analyze callback", db.DryRun, db.Statement.SQL)
	if db.DryRun {
		return
	}

	// Prepend "EXPLAIN ANALYZE" to the query
	query := db.Statement.SQL.String()
	if !strings.HasPrefix(strings.ToUpper(query), "EXPLAIN") {
		query = "EXPLAIN QUERY PLAN " + query
	}

	fmt.Println(query)

	// Execute the EXPLAIN ANALYZE query
	var result []map[string]interface{}
	db.Raw(query, db.Statement.Vars...).Scan(&result)

	// Print the results
	fmt.Println("=== SQLite Query Analysis ===")
	for _, row := range result {
		fmt.Println(row)
	}
	fmt.Println("=============================")
}
