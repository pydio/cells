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
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"

	"github.com/manifoldco/promptui"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
	"github.com/yudai/gojsondiff"
	"github.com/yudai/gojsondiff/formatter"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/config/file"
)

var (
	configVersionShow    string
	configVersionDiff    string
	configVersionRestore string
	configVersionDb      string
)

// listCmd represents the list command
var versionsListCmd = &cobra.Command{
	Use:   "versions",
	Short: "List all configurations versions",
	Long: `
This command allows to manage configurations changes history and revert to a given version if necessary.

A version is created at each call to config.Save() inside the application, along with a log message
and the user originating this call.
`,
	Run: func(cmd *cobra.Command, args []string) {

		var store file.VersionsStore
		if configVersionDb != "" {
			store = &file.BoltStore{FileName: configVersionDb}
		} else {
			config.Default()
			store = config.VersionsStore
		}

		if configVersionShow != "" {
			if id, e := strconv.ParseUint(configVersionShow, 10, 64); e == nil {
				version, e := store.Retrieve(id)
				if e != nil {
					log.Fatal("Cannot retrieve this version")
				}
				b, _ := json.MarshalIndent(version.Data, "", "  ")
				cmd.Println(string(b))
			} else {
				log.Fatal("Cannot parse version Id")
			}
			return
		}

		if configVersionDiff != "" {
			var targetVersionDiff string
			if strings.Contains(configVersionDiff, ":") {
				parts := strings.Split(configVersionDiff, ":")
				configVersionDiff = parts[0]
				targetVersionDiff = parts[1]
			}
			if id, e := strconv.ParseUint(configVersionDiff, 10, 64); e == nil {
				if id <= 1 {
					log.Fatal("Please select a version Id higher than 1 for diffing with previous version")
				}
				version, e := store.Retrieve(id)
				if e != nil {
					log.Fatal("Cannot retrieve this version")
				}
				var previousVersion *file.Version
				if targetVersionDiff != "" {
					targetId, e := strconv.ParseUint(targetVersionDiff, 10, 64)
					if e != nil {
						log.Fatal("Cannot parse target version")
					}
					previousVersion = version
					version, e = store.Retrieve(targetId)
					if e != nil {
						log.Fatal("Cannot parse retrieve target version")
					}
				} else {
					previousVersion, e = store.Retrieve(id - 1)
				}
				if e != nil {
					log.Fatal("Cannot retrieve previous version")
				}

				differ := gojsondiff.New()
				bytesPrev, _ := json.Marshal(previousVersion.Data)
				bytesLast, _ := json.Marshal(version.Data)
				d, e := differ.Compare(bytesPrev, bytesLast)
				if e != nil {
					log.Fatal("Cannot diff versions", e)
				}
				if !d.Modified() {
					cmd.Println("No differences found between two versions")
					return
				}

				config := formatter.AsciiFormatterConfig{
					ShowArrayIndex: true,
					Coloring:       true,
				}

				formatter := formatter.NewAsciiFormatter(previousVersion.Data, config)
				diffString, e := formatter.Format(d)
				if e != nil {
					log.Fatal("Cannot format diffs", e)
				}
				cmd.Print(diffString)

			} else {
				log.Fatal("Cannot parse version Id")
			}
			return
		}

		if configVersionRestore != "" {
			if id, e := strconv.ParseUint(configVersionRestore, 10, 64); e == nil {
				version, e := store.Retrieve(id)
				if e != nil {
					log.Fatal("Cannot retrieve this version")
				}
				prompt := promptui.Select{
					Label: "This will override configuration with a previous version, are you sure you want to do that?",
					Items: []string{"Yes", "No"},
				}
				index, _, _ := prompt.Run()
				if index == 0 {
					config.Set(version.Data)
					config.Save("cli", "Config Restoration to version "+configVersionRestore)
				}
			} else {
				log.Fatal("Cannot parse version Id")
			}
			return
		}

		versions, e := store.List(0, 20)
		if e != nil {
			log.Fatal(e)
		}

		table := tablewriter.NewWriter(cmd.OutOrStdout())
		table.SetHeader([]string{"Id", "Date", "Context", "Log Message"})
		table.SetAutoWrapText(false)

		for _, version := range versions {
			table.Append([]string{
				fmt.Sprintf("%d", version.Id),
				version.Date.Format("2006 Jan _2 15:04:05"), //fmt.Sprintf("%s", version.Date),
				version.User,
				version.Log,
			})
		}

		table.SetAlignment(tablewriter.ALIGN_LEFT)
		table.Render()
	},
}

func init() {
	versionsListCmd.Flags().StringVar(&configVersionDiff, "diff", "", "Display a Diff between two versions, either by providing VERSION1:VERSION2 or just VERSION1 (will be compared to previous one)")
	versionsListCmd.Flags().StringVar(&configVersionShow, "cat", "", "Print the JSON content of the config for this version")
	versionsListCmd.Flags().StringVar(&configVersionRestore, "restore", "", "Restore configuration to this specific version")
	versionsListCmd.Flags().StringVar(&configVersionDb, "file", "", "Point to a specific DB file instead of default")
	ConfigCmd.AddCommand(versionsListCmd)
}
