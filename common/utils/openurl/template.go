package openurl

import (
	"context"
	"fmt"
	"net/url"
	"sync"
)

type StringTemplate interface {
	Resolve(ctx context.Context, optionalData ...map[string]interface{}) (string, error)
}

type Template interface {
	StringTemplate
	ResolveURL(ctx context.Context, optionalData ...map[string]interface{}) (*url.URL, error)
}

type TemplateOpener func(tplString string) (Template, error)

var (
	tplRegister map[string]TemplateOpener
	tplRegLock  *sync.RWMutex
)

func init() {
	tplRegister = make(map[string]TemplateOpener)
	tplRegLock = &sync.RWMutex{}

	RegisterURLTemplate("gotpl", openGoTemplate, true)
}

// RegisterURLTemplate registers a template type by scheme. Default go-template is supported by default
func RegisterURLTemplate(scheme string, opener TemplateOpener, asDefault ...bool) {
	tplRegLock.Lock()
	tplRegister[scheme] = opener
	if len(asDefault) > 0 && asDefault[0] {
		tplRegister[""] = opener
	}
	tplRegLock.Unlock()
}

// URLTemplate initialize a Template based on rawURL for later resolution
func URLTemplate(rawURL string) (Template, error) {
	_, e := url.Parse(rawURL)
	if e != nil {
		return nil, e
	}
	// TODO - EXTRACT TEMPLATE TYPE FROM THE SCHEME?
	scheme := ""

	tplRegLock.RLock()
	defer tplRegLock.RUnlock()
	if o, ok := tplRegister[scheme]; !ok {
		return o(rawURL)
	} else {
		return nil, fmt.Errorf("cannot find corresponding URL Template")
	}
}

type urlParseWrapper struct {
	t StringTemplate
}

func (u *urlParseWrapper) Resolve(ctx context.Context, optionalData ...map[string]interface{}) (string, error) {
	return u.t.Resolve(ctx, optionalData...)
}

func (u *urlParseWrapper) ResolveURL(ctx context.Context, optionalData ...map[string]interface{}) (*url.URL, error) {
	s, er := u.t.Resolve(ctx, optionalData...)
	if er != nil {
		return nil, er
	}
	return url.Parse(s)
}

// dataFromContext converts context data and optional list of maps into template variables
func dataFromContext(ctx context.Context, data ...map[string]interface{}) map[string]interface{} {
	tplData := map[string]interface{}{}

	// TODO INJECTORS / EXTRACTORS HERE
	ctData := map[string]interface{}{}
	for k, v := range ctData {
		tplData[k] = v
	}

	// APPEND OPTIONAL DATA
	for _, opt := range data {
		for k, v := range opt {
			tplData[k] = v
		}
	}

	return tplData
}
