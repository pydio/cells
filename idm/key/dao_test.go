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

package key

import (
	"encoding/base64"
	"fmt"
	"log"
	"testing"
	"time"

	"github.com/smartystreets/goconvey/convey"
	// Perform test against SQLite
	_ "github.com/mattn/go-sqlite3"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var mockDAO DAO

func GetDAO(t *testing.T) DAO {
	if mockDAO != nil {
		return mockDAO
	}

	err := crypto.DeleteKeyringPassword(common.ServiceGrpcNamespace_+common.ServiceUserKey, common.KeyringMasterKey)
	if err != nil {
		log.Println(err)
	}

	var options = configx.New()

	dao, _ := sql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "idm_key_test")

	d := NewDAO(dao)
	if err := d.Init(options); err != nil {
		fmt.Print("Could not start test ", err)
		return nil
	}

	mockDAO = d.(DAO)
	return mockDAO
}

func TestDAOPut(t *testing.T) {
	convey.Convey("Test PUT key", t, func() {
		dao := GetDAO(t).(*sqlimpl)

		err := dao.SaveKey(&encryption.Key{
			Owner:        "pydio",
			ID:           "test",
			Label:        "Test",
			Content:      base64.StdEncoding.EncodeToString([]byte("return to senderreturn to sender")),
			CreationDate: 0,
		})
		convey.So(err, convey.ShouldBeNil)
	})
}
func TestDAOUpdate(t *testing.T) {
	convey.Convey("Test UPDATE key", t, func() {
		dao := GetDAO(t).(*sqlimpl)

		err := dao.SaveKey(&encryption.Key{
			Owner:        "pydio",
			ID:           "test",
			Label:        "Test",
			Content:      base64.StdEncoding.EncodeToString([]byte("return to senderreturn to sender")),
			CreationDate: int32(time.Now().Unix()),
			Info: &encryption.KeyInfo{
				Imports: []*encryption.Import{
					&encryption.Import{
						By:   "test",
						Date: int32(time.Now().Unix()),
					},
				},
			},
		})
		convey.So(err, convey.ShouldBeNil)
	})
}

func TestDAOGet(t *testing.T) {
	convey.Convey("Test GET key", t, func() {
		dao := GetDAO(t).(*sqlimpl)
		k, err := dao.GetKey("pydio", "test")
		convey.So(err, convey.ShouldBeNil)
		convey.So(k, convey.ShouldNotBeNil)
	})
}

func TestDAOList(t *testing.T) {
	convey.Convey("Test LIST key", t, func() {
		dao := GetDAO(t).(*sqlimpl)
		k, err := dao.ListKeys("pydio")
		convey.So(err, convey.ShouldBeNil)
		convey.So(k, convey.ShouldNotBeNil)
		convey.So(len(k), convey.ShouldEqual, 1)
	})
}

func TestDAODelete(t *testing.T) {
	convey.Convey("Test DELETE key", t, func() {
		dao := GetDAO(t).(*sqlimpl)
		err := dao.DeleteKey("pydio", "test")
		convey.So(err, convey.ShouldBeNil)

		k, err := dao.ListKeys("jabar")
		convey.So(err, convey.ShouldBeNil)
		convey.So(k, convey.ShouldBeEmpty)
	})
}
