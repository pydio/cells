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

package i18n

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/pydio/cells/common/utils/permissions"

	"github.com/emicklei/go-restful"
	"github.com/pydio/go-os/config"

	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/proto/idm"
)

var (
	AvailableLanguages = map[string]string{
		"en-us": "English",
		"fr":    "Français",
		"de":    "Deutsch",
		"es-es": "Español",
		"it":    "Italiano",
		"pt-br": "Portuguese",
	}

	LanguagesLegacyNames = map[string]string{
		"en":    "en-us",
		"fr":    "fr",
		"es":    "es-es",
		"it":    "it",
		"pt":    "pt-pt",
		"pt-br": "pt-br",
		"de":    "de",
		// Archived languages, partially supported
		"ru":    "ru",
		"ca":    "ca",
		"cs":    "cs",
		"da":    "da",
		"et":    "et",
		"fi":    "fi",
		"he":    "he",
		"hu":    "hu",
		"ja":    "ja",
		"ko":    "ko",
		"nl":    "nl",
		"nn":    "nn-no",
		"pl":    "pl",
		"si":    "sl",
		"sv":    "sv-se",
		"tr":    "tr",
		"zh-cn": "zh-cn",
		"zh-tw": "zh-tw",
	}
)

// GetDefaultLanguage reads default language from config
func GetDefaultLanguage(conf config.Config) string {
	if l := conf.Get("frontend", "plugin", "core.pydio", "DEFAULT_LANGUAGE").String(""); l != "" {
		return l
	} else {
		return conf.Get("defaults", "lang").String("en")
	}
}

// UserLanguagesFromRestRequest tries to find user language from various sources:
// X-Pydio-Language header, user language inside the system (set via roles), or Accept-Language
// standard header.
func UserLanguagesFromRestRequest(req *restful.Request, conf config.Config) []string {
	pydioLang := req.HeaderParameter("X-Pydio-Language")
	if pydioLang != "" {
		return []string{pydioLang}
	}
	claimsLang := UserLanguageFromContext(req.Request.Context(), conf, false)
	if claimsLang != "" {
		return []string{claimsLang}
	}
	browserLangs := strings.Split(req.HeaderParameter("Accept-Language"), ",")
	if len(browserLangs) > 0 {
		return browserLangs
	}
	return []string{GetDefaultLanguage(conf)}
}

// UserLanguageFromContext tries to find Claims in context and get the language for the corresponding user.
// If nothing is found, if returnDefault is true it returns the global default language, otherwise it returns an empty string.
func UserLanguageFromContext(ctx context.Context, conf config.Config, returnDefault bool) string {
	if claimVal := ctx.Value(claim.ContextKey); claimVal != nil {
		claims := claimVal.(claim.Claims)
		u := &idm.User{Login: claims.Name}
		for _, role := range strings.Split(claims.Roles, ",") {
			u.Roles = append(u.Roles, &idm.Role{Uuid: role})
		}
		return UserLanguage(ctx, u, conf)
	}
	if returnDefault {
		return GetDefaultLanguage(conf)
	} else {
		return ""
	}
}

// UserLanguage looks for the user roles and check if a language
// parameter is set (starting from the last). Otherwise returns the
// default language from config
func UserLanguage(ctx context.Context, user *idm.User, conf config.Config) string {

	var defaultLanguage = GetDefaultLanguage(conf)

	if len(user.Roles) == 0 {
		return defaultLanguage
	}
	// from last to first, try to find the "parameter:core.conf:lang" action
	langActions := permissions.GetACLsForRoles(ctx, user.Roles, &idm.ACLAction{Name: "parameter:core.conf:lang"})
	if len(langActions) == 0 {
		return defaultLanguage
	}
	var lang string
	for i := len(user.Roles) - 1; i >= 0; i-- {
		for _, a := range langActions {
			if a.RoleID == user.Roles[i].Uuid && a.Action.Value != "-1" {
				if e := json.Unmarshal([]byte(a.Action.Value), &lang); e == nil {
					return lang
				}
			}
		}
	}

	return defaultLanguage
}
