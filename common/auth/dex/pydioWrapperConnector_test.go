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

package dex

import (
	"encoding/json"
	"testing"

	"github.com/ghodss/yaml"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/auth"
)

var _ = yaml.YAMLToJSON

func TestUnMarshalConfig(t *testing.T) {

	Convey("Test Unmarshall Config", t, func() {

		rawData := []byte(`
	{"pydioconnectors":[{"config":{"BindDN":"","BindPW":"","Connection":"normal","DomainName":"pydio.com","Group":{"DisplayAttribute":"cn","Dns":["ou=groups,dc=vpydio,dc=fr"],"Filter":"(objectClass=groupOfNames)","IDAttribute":"uid","Scope":"sub"},"GroupAttributeMeaningMember":"member","GroupAttributeMemberValueFormat":"dn","GroupValueFormatInMemberOf":"dn","Host":"192.168.0.8:389","MappingRules":{"Rules":[{"LeftAttribute":"DisplayName","RightAttribute":"displayName","RuleName":"rule01","RuleString":""},{"LeftAttribute":"Roles","RightAttribute":"eduPersonAffiliation","RolePrefix":"ldap_","RuleName":"rule02","RuleString":""},{"LeftAttribute":"Roles","RightAttribute":"memberOf","RolePrefix":"ldap_","RuleName":"rule03","RuleString":""}]},"PageSize":500,"SkipVerifyCertificate":true,"SupportNestedGroup":false,"User":{"Dns":["ou=people,dc=vpydio,dc=fr","ou=visitor,dc=vpydio,dc=fr"],"Filter":"(objectClass=eduPerson)","IDAttribute":"uid","Scope":"sub"},"UserAttributeMeaningMemberOf":"memberOf","activepydiomemberof":true},"id":1,"name":"pydio-ldap","type":"ldap"},{"config":null,"id":0,"name":"externalDB","type":"pydio-sql"},{"config":null,"id":0,"name":"pydio-mysql-base","type":"pydio-sql"}]}
	`)

		var c auth.LdapServerConfig
		err := json.Unmarshal(rawData, &c)
		So(err, ShouldBeNil)

	})

}
