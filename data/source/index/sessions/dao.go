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

// Package sessions is used during indexation to start/stop a session an speed-up the process
package sessions

import (
	"context"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/data/source/index"
)

type SessionBatcher interface {
	Notify(topic string, msg proto.Message)
	Flush(ctx context.Context, dao index.DAO)
}

type DAO interface {
	PutSession(session *tree.IndexationSession) error
	ReadSession(sessionUuid string) (*tree.IndexationSession, SessionBatcher, error)
	DeleteSession(session *tree.IndexationSession) error
	CleanSessions() error
}
