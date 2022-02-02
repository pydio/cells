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

package policy

import (
	"github.com/ory/ladon"

	"github.com/pydio/cells/v4/idm/policy/conditions"
)

func init() {

	// Registers custom Pydio conditions
	ladon.ConditionFactories[new(conditions.StringNotMatchCondition).GetName()] = func() ladon.Condition {
		return new(conditions.StringNotMatchCondition)
	}

	ladon.ConditionFactories[new(conditions.OfficeHoursCondition).GetName()] = func() ladon.Condition {
		return new(conditions.OfficeHoursCondition)
	}

	ladon.ConditionFactories[new(conditions.
		WithinPeriodCondition).GetName()] = func() ladon.Condition {
		return new(conditions.WithinPeriodCondition)
	}

	// ladon.ConditionFactories[new(conditions.DateWithinPeriodCondition).GetName()] = func() ladon.Condition {
	// 	return new(conditions.DateWithinPeriodCondition)
	// }

	ladon.ConditionFactories[new(conditions.DateAfterCondition).GetName()] = func() ladon.Condition {
		return new(conditions.DateAfterCondition)
	}

}
