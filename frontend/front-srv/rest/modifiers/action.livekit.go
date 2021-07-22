package modifiers

import (
	"bytes"
	"context"
	"html/template"
	"net/url"
	"os"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/caddy"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/plugins"
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
	Site       caddy.SiteConf
}

func init() {
	if os.Getenv("CELLS_ENABLE_LIVEKIT") != "" {
		plugins.Register("main", func(ctx context.Context) {
			caddy.RegisterPluginTemplate(
				playLK,
				[]string{"frontend", "plugin", "action.livekit"},
				"/rtc",
			)

			tmpl, err := template.New("caddyfile").Funcs(caddy.FuncMap).Parse(actionLivekitTemplateStr)
			if err != nil {
				log.Fatal("Could not read template ", zap.Error(err))
			}

			actionLivekitTemplate = tmpl
		})
	}
}

func playLK(site ...caddy.SiteConf) (*bytes.Buffer, error) {

	data := new(actionLivekitData)

	if len(site) > 0 {
		data.Site = site[0]
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
