/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package grpc

import (
	"github.com/pydio/cells/v5/common/forms"
	"github.com/pydio/cells/v5/data/search/lang"
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
				Label:            "Search.Config.BasenameAnalyze.Label",
				Description:      "Search.Config.BasenameAnalyze.Description",
				Default:          "standard",
				Mandatory:        true,
				ChoicePresetList: bleveAnalyzers,
			},
			&forms.FormField{
				Name:        "indexContent",
				Type:        forms.ParamBool,
				Label:       "Search.Config.IndexContent.Label",
				Description: "Search.Config.IndexContent.Description",
				Default:     false,
			},
			&forms.FormField{
				Name:             "contentAnalyzer",
				Type:             forms.ParamSelect,
				Label:            "Search.Config.ContentAnalyzer.Label",
				Description:      "Search.Config.ContentAnalyzer.Description",
				Default:          "en",
				Mandatory:        true,
				ChoicePresetList: bleveAnalyzers,
			},
			&forms.FormField{
				Name:        "contentRef",
				Type:        forms.ParamString,
				Label:       "Search.Config.ContentRef.Label",
				Description: "Search.Config.ContentRef.Description",
				Default:     "pydio:ContentRef",
				Mandatory:   false,
			},
			&forms.FormField{
				Name:        "plainTextExtensions",
				Type:        forms.ParamString,
				Label:       "Search.Config.PlainTextExtensions.Label",
				Description: "Search.Config.PlainTextExtensions.Description",
				Default:     "txt",
				Mandatory:   false,
			},
		},
	}},
}
