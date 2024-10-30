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

package openurl

import (
	"context"
	"fmt"
	"net/url"
	"path"
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

type TemplateInjector func(context.Context, map[string]interface{}) error

var (
	tplRegister map[string]TemplateOpener
	tplRegLock  *sync.RWMutex
	injectors   []TemplateInjector
	tplFuncs    map[string]any
)

func init() {
	tplRegister = make(map[string]TemplateOpener)
	tplRegLock = &sync.RWMutex{}
	tplFuncs = make(map[string]any)
	tplFuncs["joinPath"] = path.Join

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

// RegisterTemplateInjector appends a TemplateInjector to extract info from context before passing to templates
func RegisterTemplateInjector(injector TemplateInjector) {
	injectors = append(injectors, injector)
}

// RegisterTplFunc appends an arbitrary executable func
func RegisterTplFunc(name string, fn any) {
	tplRegLock.Lock()
	tplFuncs[name] = fn
	tplRegLock.Unlock()
}

// URLTemplate initialize a Template based on rawURL for later resolution
func URLTemplate(rawURL string) (Template, error) {
	scheme := ""

	// TODO - EXTRACT TEMPLATE TYPE FROM THE SCHEME, e.g. mysql+js;//?
	/*
		scheme, _, e := getScheme(rawURL)
		if e != nil {
			return nil, e
		}
	*/

	tplRegLock.RLock()
	defer tplRegLock.RUnlock()
	if o, ok := tplRegister[scheme]; ok {
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
func dataFromContext(ctx context.Context, data ...map[string]interface{}) (map[string]interface{}, error) {
	tplData := map[string]interface{}{}

	// ContextInjectors
	for _, i := range injectors {
		if err := i(ctx, tplData); err != nil {
			return nil, err
		}
	}

	// Additional Data
	for _, opt := range data {
		for k, v := range opt {
			tplData[k] = v
		}
	}

	return tplData, nil
}

// getScheme is taken from std lib url.URL to just extract the scheme
// (Scheme must be [a-zA-Z][a-zA-Z0-9+.-]*)
// If so, return scheme, path; else return "", rawURL.
func getScheme(rawURL string) (scheme, path string, err error) {
	for i := 0; i < len(rawURL); i++ {
		c := rawURL[i]
		switch {
		case 'a' <= c && c <= 'z' || 'A' <= c && c <= 'Z':
		// do nothing
		case '0' <= c && c <= '9' || c == '+' || c == '-' || c == '.':
			if i == 0 {
				return "", rawURL, nil
			}
		case c == ':':
			if i == 0 {
				return "", "", fmt.Errorf("missing protocol scheme")
			}
			return rawURL[:i], rawURL[i+1:], nil
		default:
			// we have encountered an invalid character,
			// so there is no valid scheme
			return "", rawURL, nil
		}
	}
	return "", rawURL, nil
}
