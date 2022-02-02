/*
 * Copyright (c) 2021. Abstrium SAS <team (at) pydio.com>
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

package modifiers

import (
	"bytes"
	"context"
	"html/template"
	"net/url"
	"os"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/plugins"
)

var (
	actionLivekitTemplate    *template.Template
	actionLivekitTemplateStr = `
{{if .LivekitURL}}
        proxy /rtc {{.LivekitURL}} {
			websocket
            transparent
			header_upstream Host {{if .Site.ExternalHost}}{{.Site.ExternalHost}}{{else}}{host}{{end}}
			header_upstream X-Real-IP {remote}
			header_upstream X-Forwarded-Proto {scheme}
        }
{{end}}
    `
)

type actionLivekitData struct {
	LivekitURL string
	Site       interface{}
}

func init() {
	if os.Getenv("CELLS_ENABLE_LIVEKIT") != "" {
		plugins.Register("main", func(ctx context.Context) {
			/*
				// TODO V4
				hooks.RegisterPluginTemplate(
					playLK,
					[]string{"frontend", "plugin", "action.livekit"},
					"/rtc",
				)

				tmpl, err := template.New("caddyfile").Parse(actionLivekitTemplateStr)
				if err != nil {
					log.Fatal("Could not read template ", zap.Error(err))
				}

				actionLivekitTemplate = tmpl

			*/
		})
	}
}

func playLK(sites ...interface{}) (*bytes.Buffer, error) {

	data := new(actionLivekitData)

	if len(sites) > 0 {
		data.Site = sites[0]
	}

	enabled := config.Get("frontend", "plugin", "action.livekit", config.KeyFrontPluginEnabled).Bool()
	lkUrl := config.Get("frontend", "plugin", "action.livekit", "LK_WS_URL").String()
	if enabled && lkUrl != "" {
		u, e := url.Parse(lkUrl)
		if e != nil {
			return nil, e
		}
		data.LivekitURL = u.Host
	}
	buf := bytes.NewBuffer([]byte{})
	if err := actionLivekitTemplate.Execute(buf, data); err != nil {
		return nil, err
	}

	return buf, nil
}
