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

package lib

var (
	bootstrapTmpl = `
{
	"core.conf":{
		"UNIQUE_INSTANCE_CONFIG":{
			"instance_name":"conf.pydio",
			"group_switch_value":"conf.pydio"
		},
		"ENDPOINT_REST_API": "{{.URL}}/a",
		"ENDPOINT_FRONT_PLUGINS": "{{.URL}}/plug",
		"ENDPOINT_S3_GATEWAY": "{{.URL}}/io",
		"ENDPOINT_WEBSOCKET": "{{.WS_URL}}/ws/event",
		"ENDPOINT_DEX": "{{.URL}}/auth",
		"ENDPOINT_DEX_CLIENTID": "{{.DexID}}",
		"ENDPOINT_DEX_CLIENTSECRET": "{{.DexSecret}}",
		"FRONTEND_URL":"{{.URL}}",
		"PUBLIC_BASEURI":"/public"
	},
	"core.auth":{
		"MASTER_INSTANCE_CONFIG":{
			"instance_name":"auth.pydio",
			"group_switch_value":"auth.pydio"
		}
	},
	"core.cache":{
		"UNIQUE_INSTANCE_CONFIG":[]
	}
}`

	caddyFileTmpl = `
{{.InternalURL}} {
	proxy /a  {{.PROXY_HOST}}:{{.Micro}} {
		without /a
		transparent
	}
	proxy /auth {{.PROXY_HOST}}:{{.DexPort}} {
		without /auth
		transparent
	}
	proxy /io   {{.PROXY_HOST}}:{{.Gateway}} {
		transparent
	}
	proxy /ws   {{.PROXY_HOST}}:{{.Websocket}} {
		websocket
		without /ws
	}
	proxy /plug/   {{.PROXY_HOST}}:{{.FrontPlugins}} {
		transparent
		without /plug/
	}
	fastcgi / {{.FPM}} php {
		root  "{{.Root}}"
		index index.php
	}
	rewrite {
		if {path} not_starts_with "/a/"
		if {path} not_starts_with "/auth/"
		if {path} not_starts_with "/io"
		if {path} not_starts_with "/ws/"
		if {path} not_starts_with "/plug/"
		to {path} {path}/ /index.php
	}

	root "{{.Root}}"
	errors "{{.Logs}}/caddy_errors.log"
}
`
)
