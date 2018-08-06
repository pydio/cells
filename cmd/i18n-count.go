/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package cmd

import (
	//	"fmt"
	// "log"
	// "sort"

	"github.com/spf13/cobra"
	// "github.com/pydio/cells/common/config"
)

// i18nCount evaluate the number of Strings that compose the label corpus of Pydio Cells.
var i18nCount = &cobra.Command{
	Use:   "count",
	Short: "Count all Strings that are internationalised in the Pydio Cells code.",
	Long: `Count all Strings that are internationalised in the Pydio Cells code.

Internationalised Strings are referenced in Pydio Cells code via Map[string]string in vanilla json files.
There are 3 types of Strings that are internationalised:

In Go code:
- Json files are nested in the various packages in lang/box subfolders and are used via github.com/nicksnyder/go-i18n library

In Javascript code (for the front):
- For the EndUser UI in ReactJS, json files are nested in the i18n subfolder and used via the MessageHash mechanism
- Strings that reside within the manifest.xml, are used on the back end side and are to be translated before being 
sent to the front end resides in the i18n/conf sub folder.

`,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func init() {
	i18n.AddCommand(i18nCount)
}
