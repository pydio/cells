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

package filters

import (
	"context"
	"fmt"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common/proto/tree"
	sync "github.com/pydio/cells/data/source/sync/lib/common"
)

type BatchedEvent struct {
	EventInfo sync.EventInfo
	Node      *tree.Node
	Key       string
	Source    sync.PathSyncSource
	Target    sync.PathSyncTarget
}

type BatchProcessStatus struct {
	IsError      bool
	StatusString string
	Progress     float32
}

type Batch struct {
	CreateFiles            map[string]*BatchedEvent
	CreateFolders          map[string]*BatchedEvent
	Deletes                map[string]*BatchedEvent
	FileMoves              map[string]*BatchedEvent
	FolderMoves            map[string]*BatchedEvent
	RefreshFilesUuid       map[string]*BatchedEvent
	SessionProvider        sync.SessionProvider
	SessionProviderContext context.Context
	StatusChan             chan BatchProcessStatus
	DoneChan               chan bool
}

type BidirectionalBatch struct {
	Left  *Batch
	Right *Batch
}

func (b *Batch) String() string {
	output := ""
	output += "Create Files " + fmt.Sprintf("%v", b.CreateFiles) + "\n"
	output += "Create Folders " + fmt.Sprintf("%v", b.CreateFolders) + "\n"
	output += "Move folders " + fmt.Sprintf("%v", b.FolderMoves) + "\n"
	output += "Move Files " + fmt.Sprintf("%v", b.FileMoves) + "\n"
	output += "Deletes " + fmt.Sprintf("%v", b.Deletes) + "\n"
	return output
}

func (b *Batch) Zaps() []zapcore.Field {
	return []zapcore.Field{
		zap.Any("CreateFile", b.CreateFiles),
		zap.Any("CreateFolders", b.CreateFolders),
		zap.Any("Deletes", b.Deletes),
		zap.Any("FileMoves", b.FileMoves),
		zap.Any("FolderMoves", b.FolderMoves),
	}
}

func NewBatch() (batch *Batch) {
	batch = &Batch{
		CreateFiles:      make(map[string]*BatchedEvent),
		CreateFolders:    make(map[string]*BatchedEvent),
		Deletes:          make(map[string]*BatchedEvent),
		FileMoves:        make(map[string]*BatchedEvent),
		FolderMoves:      make(map[string]*BatchedEvent),
		RefreshFilesUuid: make(map[string]*BatchedEvent),
	}
	return batch
}
