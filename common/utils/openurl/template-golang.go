package openurl

import (
	"context"
	"strings"
	"text/template"

	"github.com/pydio/cells/v4/common/utils/uuid"
)

type goTpl struct {
	tpl *template.Template
}

func openGoTemplate(s string) (Template, error) {
	gt := &goTpl{}
	var er error
	gt.tpl, er = template.New(uuid.New()).Parse(s)
	if er != nil {
		return nil, er
	}
	return &urlParseWrapper{
		t: gt,
	}, nil
}

func (g *goTpl) Resolve(ctx context.Context, data ...map[string]interface{}) (string, error) {
	tplData, er := dataFromContext(ctx, data...)
	if er != nil {
		return "", er
	}
	pathBuilder := &strings.Builder{}
	er = g.tpl.Execute(pathBuilder, tplData)
	return pathBuilder.String(), er
}
