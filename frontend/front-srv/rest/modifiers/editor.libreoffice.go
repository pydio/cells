package modifiers

import (
	"bytes"
	"fmt"
	"html/template"
	"net/url"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"
)

var (
	editorLibreOfficeTemplate    *template.Template
	editorLibreOfficeTemplateStr = `
        proxy /wopi/ {{.WOPI.Host}} {
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
	WOPI      *url.URL
	Collabora *url.URL
}

func init() {
	config.RegisterPluginTemplate(common.SERVICE_GATEWAY_PROXY,
		config.TemplateFunc(play),
		"/wopi/",
		"/loleaflet/",
		"/hosting/discovery",
		"/lool/",
	)

	tmpl, err := template.New("caddyfile").Parse(editorLibreOfficeTemplateStr)
	if err != nil {
		log.Fatal("Could not read template")
	}

	editorLibreOfficeTemplate = tmpl
}

func play() *bytes.Buffer {

	e := new(EditorLibreOffice)

	log.Info(fmt.Sprintf("PYDIO PLUGIN %v", config.Get("frontend", "plugin", "editor.libreoffice", "PYDIO_PLUGIN_ENABLED").Bool(false)))

	if err := getWOPIConfig(&e.WOPI); err != nil {
		log.Error("could not retrieve wopi config", zap.Any("error ", err))
		return nil
	}

	if err := getCollaboraConfig(&e.Collabora); err != nil {
		log.Error("could not retrieve collabora config", zap.Any("error ", err))
		return nil
	}

	buf := bytes.NewBuffer([]byte{})
	if err := editorLibreOfficeTemplate.Execute(buf, e); err != nil {
		log.Error("could not play template", zap.Any("error ", err))
		return nil
	}

	return buf
}

func getWOPIConfig(wopi **url.URL) error {

	tls := config.Get("cert", "proxy", "ssl").Bool(false)
	host := "localhost"
	port := config.Get("services", common.SERVICE_GATEWAY_WOPI, "port").String("")

	scheme := "http"
	if tls {
		scheme = "https"
	}

	u, err := url.Parse(fmt.Sprintf("%s://%s:%s", scheme, host, port))
	if err != nil {
		return err
	}

	*wopi = u

	return nil
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
