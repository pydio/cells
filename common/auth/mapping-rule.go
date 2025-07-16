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
	"regexp"
	"strings"
)

type MappingRule struct {
	RuleName string `yaml:"RuleName"`

	// Left Attribute is attribute of external user (ldap, sql, api ...)
	// For example: displayName, mail, memberOf
	LeftAttribute string `yaml:"LeftAttribute"`

	// Right Attribute is attribute of standard user
	// For example: displayName, email
	// Two reserved attributes: Roles, GroupPath
	RightAttribute string `yaml:"RightAttribute"`

	// Attribute value type: single value or multiple values
	// MultipleValueRightAttr bool `json:"MultipleValueRightAttr"`

	// Rule string define an acceptable list of right value
	// It can be:
	// * Empty
	// * A list of accepted values separated by comma , . For example: teacher,researcher,employee
	// * preg string
	RuleString string `yaml:"RuleString"`

	// RolePrefix
	// AuthSourceName_Prefix_RoleID
	RolePrefix string `yaml:"RolePrefix"`
}

// IsDnFormat simply checks if the passed string is valid. See: https://www.ietf.org/rfc/rfc2253.txt
func (m MappingRule) IsDnFormat(str string) bool {
	RegExp := `^(?:[A-Za-z][\w-]*|\d+(?:\.\d+)*)=(?:#(?:[\dA-Fa-f]{2})+|(?:[^,=\+<>#;\\"]|\\[,=\+<>#;\\"]|\\[\dA-Fa-f]{2})*|"(?:[^\\"]|\\[,=\+<>#;\\"]|\\[\dA-Fa-f]{2})*")(?:\+(?:[A-Za-z][\w-]*|\d+(?:\.\d+)*)=(?:#(?:[\dA-Fa-f]{2})+|(?:[^,=\+<>#;\\"]|\\[,=\+<>#;\\"]|\\[\dA-Fa-f]{2})*|"(?:[^\\"]|\\[,=\+<>#;\\"]|\\[\dA-Fa-f]{2})*"))*(?:,(?:[A-Za-z][\w-]*|\d+(?:\.\d+)*)=(?:#(?:[\dA-Fa-f]{2})+|(?:[^,=\+<>#;\\"]|\\[,=\+<>#;\\"]|\\[\dA-Fa-f]{2})*|"(?:[^\\"]|\\[,=\+<>#;\\"]|\\[\dA-Fa-f]{2})*")(?:\+(?:[A-Za-z][\w-]*|\d+(?:\.\d+)*)=(?:#(?:[\dA-Fa-f]{2})+|(?:[^,=\+<>#;\\"]|\\[,=\+<>#;\\"]|\\[\dA-Fa-f]{2})*|"(?:[^\\"]|\\[,=\+<>#;\\"]|\\[\dA-Fa-f]{2})*"))*)*$`

	ok, err := regexp.MatchString(RegExp, str)
	if err != nil {
		return false
	}
	return ok
}

func (m MappingRule) SanitizeValues(strs []string) []string {
	if len(strs) > 0 {
		str := []string{}
		for _, s := range strs {
			str = append(str, strings.TrimSpace(s))
		}
		return str
	}
	return strs
}

// RemoveLdapEscape remove LDAP escape characters but except '\,'.
func (m MappingRule) RemoveLdapEscape(strs []string) []string {
	if len(strs) > 0 {
		str := []string{}
		for _, s := range strs {
			replacer := strings.NewReplacer(`\=`, "=", `\+`, "=", `\<`, "<", `\>`, ">", `\#`, "#", `\;`, ";")
			str = append(str, replacer.Replace(s))
		}
		return str
	}
	return strs
}

// ConvertDNtoName tries to extract value from distinguishedName
// For example:
// member: uid=user01,dc=com,dc=fr
// member: uid=user02,dc=com,dc=fr
// member: uid=user03,dc=com,dc=fr
// return an array like:
//
//	user01
//	user02
//	user03
func (m MappingRule) ConvertDNtoName(strs []string) []string {
	if len(strs) > 0 {
		str := []string{}
		for _, s := range strs {
			// https://www.ietf.org/rfc/rfc2253.txt defines '#' as a special character
			// However, openldap use # as normal character.
			// So the IsDnFormat does not work properly.
			newS := strings.NewReplacer("#", "[UOO01]").Replace(s)
			if m.IsDnFormat(newS) {
				replacer := strings.NewReplacer(`\,`, "[U0000]")
				reverseReplacer := strings.NewReplacer("[U0000]", `\,`)
				rl := replacer.Replace(newS)
				rlarr := strings.Split(rl, ",")
				if len(rlarr) > 0 {
					firstRDN := rlarr[0]
					firstRDNright := strings.Split(firstRDN, "=")[1]
					str = append(str, strings.NewReplacer("[UOO01]", "#").Replace(reverseReplacer.Replace(firstRDNright)))
				}
			} else {
				str = append(str, strings.NewReplacer("[UOO01]", "#").Replace(newS))
			}
		}
		return str
	}
	return strs
}

func (m MappingRule) AddPrefix(prefix string, strs []string) []string {
	if len(strs) > 0 && prefix != "" {
		str := []string{}
		for _, s := range strs {
			str = append(str, prefix+s)
		}
		return str
	}
	return strs
}

func (m MappingRule) FilterPreg(preg string, strs []string) []string {
	if len(strs) > 0 && preg != "" {
		str := []string{}
		defaultPrefix := "^preg:*"
		// Test format of preg. Should be preg:xxxx
		matched, err := regexp.MatchString(defaultPrefix, preg)
		if matched && err == nil {
			r := strings.NewReplacer("preg:", "")
			ruleString := r.Replace(preg)
			for _, s := range strs {
				matched, _ := regexp.MatchString(ruleString, s)
				if matched {
					str = append(str, s)
				}
			}
			return str
		}
	}
	return strs
}

func (m MappingRule) FilterList(list []string, strs []string) []string {
	if len(list) > 0 && len(strs) > 0 {
		intersectionList := []string{}
		for _, l := range list {
			for _, s := range strs {
				if l == s {
					intersectionList = append(intersectionList, s)
				}
			}
		}
		return intersectionList
	}
	return strs
}
