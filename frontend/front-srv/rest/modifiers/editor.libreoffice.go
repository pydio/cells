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
    `
)

type EditorLibreOffice struct {
	WOPI      string
	Collabora *url.URL
	Site      caddy.SiteConf
}

func init() {
	plugins.Register(func(ctx context.Context) {
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

	data := new(EditorLibreOffice)

	data.WOPI = common.ServiceGatewayWopi
	if len(site) > 0 {
		data.Site = site[0]
	}

	if err := getCollaboraConfig(&data.Collabora); err != nil {
		log.Error("could not retrieve collabora config", zap.Any("error ", err))
		return nil, err
	}

	buf := bytes.NewBuffer([]byte{})
	if err := editorLibreOfficeTemplate.Execute(buf, data); err != nil {
		return nil, err
	}

	return buf, nil
}

func getCollaboraConfig(collabora **url.URL) error {

	tls := config.Get("frontend", "plugin", "editor.libreoffice", "LIBREOFFICE_SSL").Default(true).Bool()
	host := config.Get("frontend", "plugin", "editor.libreoffice", "LIBREOFFICE_HOST").Default("localhost").String()
	port := config.Get("frontend", "plugin", "editor.libreoffice", "LIBREOFFICE_PORT").Default("9980").String()

	scheme := "http"
	if tls {
		scheme = "https"
	}

	u, err := url.Parse(fmt.Sprintf("%s://%s:%s", scheme, host, port))
	if err != nil {
		return err
	}

	*collabora = u

	return nil
}
