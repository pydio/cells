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
	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/data/versions/lang"
)

var ExposedConfigs = &forms.Form{
	I18NBundle: lang.Bundle(),
	Groups: []*forms.Group{
		{
			Label: "Config.GroupPolicy.Title",
			Fields: []forms.Field{
				&forms.FormField{
					Name: "Uuid",
					Type: forms.ParamHidden,
				},
				&forms.FormField{
					Name:        "Name",
					Label:       "Config.GroupPolicy.Name.Label",
					Type:        forms.ParamString,
					Mandatory:   true,
					Description: "Config.GroupPolicy.Name.Description",
				},
				&forms.FormField{
					Name:        "Description",
					Label:       "Config.GroupPolicy.Description.Label",
					Type:        forms.ParamString,
					Mandatory:   true,
					Description: "Config.GroupPolicy.Description.Description",
				},
				&forms.FormField{
					Name:        "VersionsDataSourceName",
					Label:       "Config.GroupPolicy.VersionsDataSourceName.Label",
					Description: "Config.GroupPolicy.VersionsDataSourceName.Description",
					Type:        forms.ParamSelect,
					Mandatory:   true,
					Default:     "default",
					ChoicePresetList: []map[string]string{
						{"default": "Default (see pydio.json pydio.versions-store configuration)"},
					},
				},
			},
		},
		{
			Label: "Config.GroupSizes.Title",
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "MaxTotalSize",
					Label:       "Config.GroupSizes.MaxTotalSize.Label",
					Description: "Config.GroupSizes.MaxTotalSize.Description",
					Type:        forms.ParamIntegerBytes,
					Mandatory:   false,
					Default:     -1,
				},
				&forms.FormField{
					Name:        "MaxSizePerFile",
					Label:       "Config.GroupSizes.MaxSizePerFile.Label",
					Description: "Config.GroupSizes.MaxSizePerFile.Description",
					Type:        forms.ParamIntegerBytes,
					Mandatory:   false,
					Default:     -1,
				},
				&forms.FormField{
					Name:        "IgnoreFilesGreaterThan",
					Label:       "Config.GroupSizes.IgnoreFilesGreaterThan.Label",
					Description: "Config.GroupSizes.IgnoreFilesGreaterThan.Description",
					Type:        forms.ParamIntegerBytes,
					Mandatory:   false,
					Default:     -1,
				},
			},
		},
		{
			Label: "Config.GroupRetention.Title",
			Fields: []forms.Field{
				&forms.ReplicableFields{
					Id:          "periods",
					Mandatory:   true,
					Title:       "Config.GroupRetention.Title",
					Description: "Config.GroupRetention.Description",
					Fields: []forms.Field{
						&forms.FormField{
							Name:        "IntervalStart",
							Label:       "Config.GroupRetention.IntervalStart.Name",
							Description: "Config.GroupRetention.IntervalStart.Description",
							Type:        forms.ParamString,
							Mandatory:   true,
						},
						&forms.FormField{
							Name:        "MaxNumber",
							Label:       "Config.GroupRetention.MaxNumber.Name",
							Description: "Config.GroupRetention.MaxNumber.Description",
							Type:        forms.ParamInteger,
							Mandatory:   true,
						},
					},
				},
				&forms.FormField{
					Name:        "NodeDeletedStrategy",
					Type:        forms.ParamSelect,
					Label:       "Config.GroupRetention.NodeDeletedStrategy.Name",
					Description: "Config.GroupRetention.NodeDeletedStrategy.Description",
					Default:     "KeepAll",
					Mandatory:   true,
					Editable:    true,
					ChoicePresetList: []map[string]string{
						{tree.VersioningNodeDeletedStrategy_KeepAll.String(): "Config.GroupRetention.NodeDeletedStrategy.KeepAll"},
						{tree.VersioningNodeDeletedStrategy_KeepLast.String(): "Config.GroupRetention.NodeDeletedStrategy.KeepLast"},
						{tree.VersioningNodeDeletedStrategy_KeepNone.String(): "Config.GroupRetention.NodeDeletedStrategy.KeepNone"},
					},
				},
			},
		},
	},
}
