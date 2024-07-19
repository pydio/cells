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
	pathBuilder := &strings.Builder{}
	for _, dd := range data {
		for k, v := range dd {
			ctx = context.WithValue(ctx, k, v)
		}
	}
	// data = dataFromContext(ctx, data...)
	er := g.tpl.Execute(pathBuilder, ctx)
	return pathBuilder.String(), er
}
