// Package lang provides i18n strings for mailer-related data.
package lang

import (
	"sync"

	"github.com/pydio/packr"

	"github.com/pydio/cells/common/utils/i18n"
)

var (
	bundle *i18n.I18nBundle
	o      = sync.Once{}
)

func Bundle() *i18n.I18nBundle {
	o.Do(func() {
		bundle = i18n.NewI18nBundle(packr.NewBox("../../../data/search/lang/box"))
	})
	return bundle
}
