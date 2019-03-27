package frontend

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestI18NReplace(t *testing.T) {

	Convey("Test conf message extractions", t, func() {

		messages := map[string]string{
			"Hello World":           "Bonjour le monde",
			"This is weird, really": "C'est vraiment bizarre",
			"Test Value 2":          "Valeur 2",
		}

		t := "CONF_MESSAGE[Hello World]"
		t2 := i18nConfMessages(t, messages)

		t3 := "CONF_MESSAGE[This is weird, really]|CONF_MESSAGE[Test Value 2]"
		t4 := i18nConfMessages(t3, messages)

		t5 := "CONF_MESSAGE[No Replacement Found]"
		t6 := i18nConfMessages(t5, messages)

		So(t2, ShouldEqual, "Bonjour le monde")
		So(t4, ShouldEqual, "C'est vraiment bizarre|Valeur 2")
		So(t6, ShouldEqual, "No Replacement Found")

	})

}
