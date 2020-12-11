package grpc

import (
	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/data/search/lang"
)

var bleveAnalyzers = []map[string]string{
	{"standard": "Standard"},
	{"keyword": "Keyword"},
	{"en": "English"},
	{"ar": "Arabic"},
	{"bg": "Bulgarian"},
	{"ca": "Catalan"},
	{"cjk": "Chinese, Japanese, Korean"},
	{"ckb": "Sorani Kurdish"},
	{"cs": "Czech"},
	{"da": "Danish"},
	{"de": "Deutsch"},
	{"el": "Greek"},
	{"es": "Spanish"},
	{"eu": "Basque"},
	{"fa": "Persian"},
	{"fi": "Finnish"},
	{"fr": "French"},
	{"ga": "Irish"},
	{"gl": "Galician"},
	{"hi": "Hindi"},
	{"hu": "Hungarian"},
	{"hy": "Armenian"},
	{"id": "Indonesian"},
	{"in": "Indic"},
	{"it": "Italian"},
	{"nl": "Dutch"},
	{"no": "Norwegian"},
	{"pt": "Portuguese"},
	{"ro": "Romanian"},
	{"ru": "Russian"},
	{"sv": "Swedish"},
	{"tr": "Turkish"},
}

var ExposedConfigs = &forms.Form{
	I18NBundle: lang.Bundle(),
	Groups: []*forms.Group{{
		Fields: []forms.Field{
			&forms.FormField{
				Name:             "basenameAnalyzer",
				Type:             forms.ParamSelect,
				Label:            "File Name Analyzer",
				Description:      "Analyzer used on file name.",
				Default:          "standard",
				Mandatory:        true,
				ChoicePresetList: bleveAnalyzers,
			},
			&forms.FormField{
				Name:        "indexContent",
				Type:        forms.ParamBool,
				Label:       "Index Contents",
				Description: "If set to true, indexer will look for the ContentRef metadata, read contents from this reference and index it for search. Must be paired with contents extractors.",
				Default:     false,
			},
			&forms.FormField{
				Name:             "contentAnalyzer",
				Type:             forms.ParamSelect,
				Label:            "Content Analyzer",
				Description:      "Analyzer used on contents (if indexed).",
				Default:          "en",
				Mandatory:        true,
				ChoicePresetList: bleveAnalyzers,
			},
		},
	}},
}
