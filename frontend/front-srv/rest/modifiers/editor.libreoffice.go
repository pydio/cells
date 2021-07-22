package modifiers

import (
	"bytes"
	"context"
	"fmt"
	"html/template"
	"net/url"

	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/caddy"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/plugins"
)

var (
	editorLibreOfficeTemplate    *template.Template
	editorLibreOfficeTemplateStr = `
{{if .Enabled}}
        pydioproxy /wopi/ {{.WOPI}} {
            transparent
			header_upstream Host {{if .Site.ExternalHost}}{{.Site.ExternalHost}}{{else}}{host}{{end}}
			header_upstream X-Real-IP {remote}
			header_upstream X-Forwarded-Proto {scheme}
        }

        proxy /loleaflet/ {{.Collabora.Scheme}}://{{.Collabora.Host}}/loleaflet {
            transparent
            insecure_skip_verify
            without /loleaflet/
        }

        proxy /hosting/discovery {{.Collabora.Scheme}}://{{.Collabora.Host}}/hosting/discovery {
            transparent
            insecure_skip_verify
            without /hosting/discovery
        }

        proxy /lool/ {{.Collabora.Scheme}}://{{.Collabora.Host}}/lool/ {
            transparent
            insecure_skip_verify
            websocket
            without /lool/
        }
{{end}}
    `
)

type EditorLibreOffice struct {
	Enabled   bool
	WOPI      string
	Collabora *url.URL
	Site      caddy.SiteConf
}

func init() {
	plugins.Register("main", func(ctx context.Context) {
		caddy.RegisterPluginTemplate(
			play,
			[]string{"frontend", "plugin", "editor.libreoffice"},
			"/wopi/",
			"/loleaflet/",
			"/hosting/discovery",
			"/lool/",
		)

		tmpl, err := template.New("caddyfile").Funcs(caddy.FuncMap).Parse(editorLibreOfficeTemplateStr)
		if err != nil {
			log.Fatal("Could not read template ", zap.Error(err))
		}

		editorLibreOfficeTemplate = tmpl
	})
}

func play(site ...caddy.SiteConf) (*bytes.Buffer, error) {

	data := &EditorLibreOffice{
		WOPI: common.ServiceGatewayWopi,
	}
	if len(site) > 0 {
		data.Site = site[0]
	}

	if enabled, u, err := getCollaboraConfig(); err != nil {
		log.Error("could not retrieve collabora config", zap.Any("error ", err))
		return nil, err
	} else {
		data.Enabled = enabled
		data.Collabora = u
	}

	buf := bytes.NewBuffer([]byte{})
	if err := editorLibreOfficeTemplate.Execute(buf, data); err != nil {
		return nil, err
	}

	return buf, nil
}

func getCollaboraConfig() (bool, *url.URL, error) {

	pconf := config.Get("frontend", "plugin", "editor.libreoffice")
	enabled := pconf.Val(config.KeyFrontPluginEnabled).Default(false).Bool()
	tls := pconf.Val("LIBREOFFICE_SSL").Default(true).Bool()
	host := pconf.Val("LIBREOFFICE_HOST").Default("localhost").String()
	port := pconf.Val("LIBREOFFICE_PORT").Default("9980").String()

	scheme := "http"
	if tls {
		scheme = "https"
	}

	u, err := url.Parse(fmt.Sprintf("%s://%s:%s", scheme, host, port))
	if err != nil {
		return false, nil, err
	}

	return enabled, u, nil
}
