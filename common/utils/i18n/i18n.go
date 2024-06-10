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

// Package i18n wraps go-i18n lib for manipulating bundles
package i18n

import (
	"context"
	"os"
	"strings"

	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/proto/idm"
	runtime2 "github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/configx"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/permissions"
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
		"pt-br": "Português do Brasil",
		"ru":    "русский",    // Russian
		"vi-vn": "Tiếng Việt", // Vietnamese
		"zh-cn": "简体中文",       // Chinese simplified
	}

	// LoadingStrings have to be hard-coded to be loaded first. When not defined, we fall back to "loading..." message (in English).
	LoadingStrings = map[string]string{
		"ar":    "نحميل...",
		"cs":    "Načítání...",
		"de":    "Wird geladen...",
		"en-us": "Loading...",
		"es-en": "Cargando...",
		"fr":    "Chargement...",
		"fr-ca": "Chargement...",
		"hu":    "Betöltés...",
		"it":    "Caricamento...",
		"ja":    "読み込んでいます...",
		"ko":    "로드 중 ...",
		"lv":    "Ielādē...",
		"nl":    "Bezig met laden...",
		"pl":    "Ładowanie...",
		"pt-br": "Carregando...",
		"pt-pt": "Carregando...",
		"ru":    "Загружается ...",
		"sk":    "Načítavanie...",
		"sv-se": "Läser in...",
		"vi-vn": "Đang tải...",
		"zh-cn": "载入中...",
		"zh-tw": "載入中...",
	}

	// WipLanguages lists languages that are only partially translated and only exposed
	// in the end-user web UI when CELLS_ENABLE_WIP_LANGUAGES env variable is set to true.
	WipLanguages = map[string]string{
		"ar":    "عربى",  // Arabic
		"cs":    "Česky", // Czech
		"fr-ca": "Canadien",
		"hu":    "Magyar", // Hungarian
		"ja":    "日本人",    // Japanese
		"ko":    "한국어",    // Korean
		"nl":    "Nederlands",
		"pl":    "Polski",
		"pt-pt": "Português",
		"sk":    "Slovensky",
		"sv-se": "Svenska", // Swedish
		"zh-tw": "中國傳統的",   // Chinese traditional
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
	runtime2.RegisterEnvVariable("CELLS_ENABLE_WIP_LANGUAGES", "def", "Display partially translated languages in the UX language picker.", true)
	if os.Getenv("CELLS_ENABLE_WIP_LANGUAGES") == "true" {
		for k, v := range WipLanguages {
			AvailableLanguages[k] = v
		}
	}
}

// GetDefaultLanguage reads default language from config
func GetDefaultLanguage(conf configx.Values) string {
	return conf.Val("frontend", "plugin", "core.pydio", "DEFAULT_LANGUAGE").Default("en-us").String()
}

// UserLanguagesFromRestRequest tries to find user language from various sources:
// X-Pydio-Language header, user language inside the system (set via roles), or Accept-Language
// standard header.
func UserLanguagesFromRestRequest(req *restful.Request, conf configx.Values) []string {
	// TODO - Read configs from context
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
	langActions, _ := permissions.GetACLsForRoles(ctx, user.Roles, &idm.ACLAction{Name: "parameter:core.conf:lang"})
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
