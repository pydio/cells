/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package routing

import (
	"net/http"

	"github.com/rs/cors"

	"github.com/pydio/cells/v5/common/proto/install"
)

// DefaultCORS returns a preset cors.Options with open defaults, except for AllowedOrigins
func DefaultCORS() *cors.Options {
	return &cors.Options{
		// AllowedOrigin must be always set
		AllowedMethods:       []string{http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodPut, http.MethodDelete},
		AllowedHeaders:       []string{"Authorization", "Content-Type"},
		ExposedHeaders:       []string{"Content-Type"},
		MaxAge:               30,
		AllowCredentials:     true,
		AllowPrivateNetwork:  false,
		OptionsPassthrough:   false,
		OptionsSuccessStatus: http.StatusNoContent,
		Debug:                false,
	}
}

// asCORSOptions transforms an install.CorsOptions to *cors.Options
func asCORSOptions(co *install.CorsOptions) *cors.Options {
	return &cors.Options{
		AllowedOrigins:       co.AllowedOrigins,
		AllowedMethods:       co.AllowedMethods,
		AllowedHeaders:       co.AllowedHeaders,
		ExposedHeaders:       co.ExposedHeaders,
		AllowCredentials:     co.AllowCredentials,
		AllowPrivateNetwork:  co.AllowPrivateNetwork,
		MaxAge:               int(co.MaxAge),
		OptionsPassthrough:   co.OptionsPassthrough,
		OptionsSuccessStatus: int(co.OptionsSuccessStatus),
	}
}
