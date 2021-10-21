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

package auth

import (
	"strings"
	"testing"

	"github.com/ghodss/yaml"
	"github.com/kylelemons/godebug/pretty"
)

var _ = yaml.YAMLToJSON

func TestUnmarshalMappingRuleConfig(t *testing.T) {
	rawConfig := []byte(`
RuleName: first
RightAttribute : displayName
RuleString:

`)
	want := &MappingRule{
		RuleName:       "first",
		RightAttribute: "displayName",
		RuleString:     "",
	}

	var m MappingRule
	if err := yaml.Unmarshal(rawConfig, &m); err != nil {
		t.Fatalf("failed to decode config: %v", err)
	}
	if diff := pretty.Compare(m, want); diff != "" {
		t.Errorf("got!=want: %s", diff)
	}
}

func getMappingRuleConfig() *MappingRule {
	m := new(MappingRule)
	m.RuleName = "first"
	m.RightAttribute = "displayName"
	m.LeftAttribute = ""
	m.RuleString = ""
	return m
}

func TestMappingRule_SanitizeValues(t *testing.T) {
	m := getMappingRuleConfig()
	rightValues := []string{"teacher ", " student", " researcher"}
	leftValues := m.SanitizeValues(rightValues)
	correctLeftValues := []string{"teacher", "student", "researcher"}
	if !testEq(correctLeftValues, leftValues) {
		t.Errorf("Error")
	}
}

func TestMappingRule_AddPrefix(t *testing.T) {
	m := getMappingRuleConfig()
	rightValues := []string{"teacher ", " student", " researcher"}
	leftValues := m.SanitizeValues(rightValues)
	leftValues = m.AddPrefix("ldap_", leftValues)
	correctLeftValues := []string{"ldap_teacher", "ldap_student", "ldap_researcher"}
	if !testEq(correctLeftValues, leftValues) {
		t.Errorf("Error")
	}
}

func TestMappingRule_FilterList(t *testing.T) {
	m := getMappingRuleConfig()
	m.RuleString = "teacher,abc, def"

	rightValues := []string{"teacher ", " student", " researcher", "abcd", "def"}
	leftValues := m.SanitizeValues(rightValues)
	list := strings.Split(m.RuleString, ",")
	list = m.SanitizeValues(list)
	leftValues = m.FilterList(list, leftValues)
	correctLeftValues := []string{"teacher", "def"}
	if !testEq(correctLeftValues, leftValues) {
		t.Errorf("Error")
	}
}

func TestMappingRule_ConvertDNtoName(t *testing.T) {
	m := getMappingRuleConfig()
	dns := []string{"cn=testName,dc=vpydio,dc=fr", "cn=testName2,dc=vpydio,dc=fr", "cn=testName3,dc=vpydio,dc=fr", "cn=testName4,dc=vpydio,dc=fr"}
	name := m.ConvertDNtoName(dns)
	correctLeftValues := []string{"testName", "testName2", "testName3", "testName4"}
	if !testEq(correctLeftValues, name) {
		t.Errorf("Error")
	}
}

func TestMappingRule_FilterPreg(t *testing.T) {
	m := getMappingRuleConfig()
	m.RuleString = "preg:^teac*"
	rightValues := []string{"teacher ", " student", " researcher", "abcd", "def", " teachiiing"}
	rightValues = m.SanitizeValues(rightValues)
	rightValues = m.FilterPreg(m.RuleString, rightValues)
	correctLeftValues := []string{"teacher", "teachiiing"}
	if !testEq(correctLeftValues, rightValues) {
		t.Errorf("Error")
	}
}

func TestMappingRule_IsDnFormat(t *testing.T) {
	m := getMappingRuleConfig()
	DN := "cn=test,cn=abc,dc=com,dc=test"
	wrongDN := "cn=test,cn=abc,dc=com,dc=test,abc"

	if m.IsDnFormat(wrongDN) {
		t.Errorf("")
	}
	if !m.IsDnFormat(DN) {
		t.Errorf("")
	}
}

// Test equelity of two []string
func testEq(a, b []string) bool {
	if a == nil && b == nil {
		return true
	}
	if a == nil || b == nil {
		return false
	}
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}
