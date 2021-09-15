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

// Package i18n wraps go-i18n lib for manipulating bundles
package i18n

import (
	"context"
	"os"
	"strings"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/emicklei/go-restful"

	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/x/configx"
)

var (
	// AvailableLanguages stores a manually maintained maps with all languages
	// that are currently supported by Cells front-end and can be chosen via the interface.
	AvailableLanguages = map[string]string{
		"de":    "Deutsch",
		"en-us": "English",
		"es-es": "Español",
		"fr":    "Français",
		"it":    "Italiano",
		"lv":    "Latv",
		"ru":    "русский",    // Russian
		"vi-vn": "Tiếng Việt", // Vietnamese
		"zh-cn": "简体中文",       // Chinese simplified		
	}

	// LoadingStrings have to be hard-coded to be loaded first. When not defined, we fall back to "loading..." message (in English).
	LoadingStrings = map[string]string{
		"ar":    "نحميل...",
		"de":    "Wird geladen...",
		"en-us": "Loading...",
		"es-en": "Cargando...",
		"fr":    "Chargement...",
		"fr-ca": "Chargement...",
		"it":    "Caricamento...",
		"ja":    "読み込んでいます...",
		"ko":    "로드 중 ...",
		"lv":    "Ielādē...",
		"nl":    "Bezig met laden...",
		"pt-br": "Carregando...",
		"pt-pt": "Carregando...",
		"ru":    "Загружается ...",
		"sv-se": "Läser in...",
		"vi-vn": "Đang tải...",
		"zh-cn": "载入中...",
		"zh-tw": "載入中...",
	}

	// WipLanguages lists languages that are only partially translated and only exposed
	// in the end-user web UI when CELLS_ENABLE_WIP_LANGUAGES env variable is set to true.
	WipLanguages = map[string]string{
		"ar":    "عربى", // Arabic
		"fr-ca": "Canadien",
		"ja":    "日本人", //Japanese
		"ko":    "한국어",
		"nl":    "Nederlands",
		"pt-br": "Brasileiro",
		"pt-pt": "Português",
		"sv-se": "Svenska",    // Swedish
		"zh-tw": "中國傳統的",      // Chinese traditional
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

func init() {
	if os.Getenv("CELLS_ENABLE_WIP_LANGUAGES") == "true" {
		for k, v := range WipLanguages {
			AvailableLanguages[k] = v
		}
	}
}

// GetDefaultLanguage reads default language from config
func GetDefaultLanguage(conf configx.Values) string {
	if l := conf.Val("frontend", "plugin", "core.pydio", "DEFAULT_LANGUAGE").Default("").String(); l != "" {
		return l
	} else {
		return conf.Val("defaults", "lang").Default("en").String()
	}
}

// UserLanguagesFromRestRequest tries to find user language from various sources:
// X-Pydio-Language header, user language inside the system (set via roles), or Accept-Language
// standard header.
func UserLanguagesFromRestRequest(req *restful.Request, conf configx.Values) []string {
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
func UserLanguageFromContext(ctx context.Context, conf configx.Values, returnDefault bool) string {
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
func UserLanguage(ctx context.Context, user *idm.User, conf configx.Values) string {

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
