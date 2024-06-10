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

package templates

import (
	"context"

	"github.com/pydio/cells/v4/common/service/serviceerrors"
)

var (
	registeredDAOs []DAO
	provider       *TemplateProvider
)

func RegisterProvider(provider DAO) {
	registeredDAOs = append(registeredDAOs, provider)
}

func GetProvider() DAO {
	if provider == nil {
		provider = new(TemplateProvider)
	}
	return provider
}

type TemplateProvider struct {
}

func (t *TemplateProvider) List(ctx context.Context) ([]Node, error) {
	var nodes []Node
	for _, dao := range registeredDAOs {
		nn, e := dao.List(ctx)
		if e != nil {
			return nil, e
		}
		nodes = append(nodes, nn...)
	}
	return nodes, nil
}

func (t *TemplateProvider) ByUUID(ctx context.Context, uuid string) (Node, error) {
	var node Node
	for _, dao := range registeredDAOs {
		if n, e := dao.ByUUID(ctx, uuid); e == nil {
			node = n
			break
		}
	}
	if node == nil {
		return nil, serviceerrors.NotFound("template.not.found", "Cannot find template with this identifier")
	} else {
		return node, nil
	}
}
