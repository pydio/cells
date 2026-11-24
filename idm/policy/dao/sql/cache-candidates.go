/*
 * Copyright (c) 2026. Abstrium SAS <team (at) pydio.com>
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

package sql

import (
	"context"
	"fmt"

	"github.com/ory/ladon"
	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common/proto/idm"
	storagesql "github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/idm/policy/converter"
)

// These helpers serve the new group-cache discovery/hydration path only.
// The existing gormManager keeps its database-specific regex queries unchanged.
// policyCandidateQuery selects a superset. Patterns are interpreted only by Ladon,
// never by a SQL regex dialect or stale persisted compilation metadata.
func policyCandidateQuery(ctx context.Context, db *gorm.DB, r *ladon.Request) *gorm.DB {
	db = db.WithContext(ctx)
	table := func(model interface{}) string {
		return storagesql.QuoteTo(db, storagesql.TableNameFromModel(db, model))
	}
	pol := table(&idm.Policy{})
	q := db.Model(&idm.Policy{})
	dimensions := []struct {
		value, column string
		rel, model    interface{}
	}{
		{r.Subject, "subject", &idm.PolicySubjectRel{}, &idm.PolicySubject{}},
		{r.Resource, "resource", &idm.PolicyResourceRel{}, &idm.PolicyResource{}},
		{r.Action, "action", &idm.PolicyActionRel{}, &idm.PolicyAction{}},
	}
	for _, d := range dimensions {
		if d.value == "" {
			continue
		}
		q = q.Where(fmt.Sprintf("EXISTS (SELECT 1 FROM %s AS rel JOIN %s AS t ON t.id = rel.%s WHERE rel.policy = %s.id AND (t.template = ? OR t.template LIKE ? OR t.template IS NULL))", table(d.rel), table(d.model), d.column, pol), d.value, "%<%")
	}
	return q
}

func hydrateCandidates(q *gorm.DB) (ladon.Policies, error) {
	var policies []*idm.Policy
	if err := q.Preload("OrmActions").Preload("OrmResources").Preload("OrmSubjects").Find(&policies).Error; err != nil {
		return nil, err
	}
	result := make(ladon.Policies, 0, len(policies))
	for _, p := range policies {
		result = append(result, converter.ProtoToLadonPolicy(p))
	}
	return result, nil
}
