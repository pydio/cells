package frontend

import (
	"regexp"
	"strings"
)

type I18nMessages struct {
	Messages     map[string]string
	ConfMessages map[string]string
}

func i18nConfMessages(i string, messages map[string]string) string {

	r := regexp.MustCompile(`CONF_MESSAGE\[([^\]]+)\]`)
	matches := r.FindAllStringSubmatch(i, -1)
	for _, match := range matches {
		orig := match[0]
		key := match[1]
		if translation, ok := messages[key]; ok {
			i = strings.Replace(i, orig, translation, -1)
		} else {
			i = strings.Replace(i, orig, key, -1)
		}
	}
	return i
}
