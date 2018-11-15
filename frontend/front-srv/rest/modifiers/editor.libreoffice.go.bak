package modifiers

import (
	"bytes"
	"fmt"
	"html/template"
	"net/url"

	"github.com/spf13/cobra"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/caddy"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
)

var (
	editorLibreOfficeTemplate    *template.Template
	editorLibreOfficeTemplateStr = `
        proxy /wopi/ {{.WOPI | urls}} {
            transparent
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
}

func init() {
	cobra.OnInitialize(func() {
		caddy.RegisterPluginTemplate(
			caddy.TemplateFunc(play),
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

func play() (*bytes.Buffer, error) {

	e := new(EditorLibreOffice)

	log.Info(fmt.Sprintf("PYDIO PLUGIN %v", config.Get("frontend", "plugin", "editor.libreoffice", "PYDIO_PLUGIN_ENABLED").Bool(false)))

	e.WOPI = common.SERVICE_GATEWAY_WOPI

	if err := getCollaboraConfig(&e.Collabora); err != nil {
		log.Error("could not retrieve collabora config", zap.Any("error ", err))
		return nil, err
	}

	buf := bytes.NewBuffer([]byte{})
	if err := editorLibreOfficeTemplate.Execute(buf, e); err != nil {
		return nil, err
	}

	return buf, nil
}

func getCollaboraConfig(collabora **url.URL) error {

	tls := config.Get("frontend", "plugin", "editor.libreoffice", "LIBREOFFICE_SSL").Bool(true)
	host := config.Get("frontend", "plugin", "editor.libreoffice", "LIBREOFFICE_HOST").String("localhost")
	port := config.Get("frontend", "plugin", "editor.libreoffice", "LIBREOFFICE_PORT").String("9980")

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
