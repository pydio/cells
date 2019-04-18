package model

import (
	"context"
	"path"
	"sort"
	"strings"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/mtree"
)

type Move struct {
	deleteEvent *BatchEvent
	createEvent *BatchEvent
	dbNode      *tree.Node
}

func (m *Move) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	if m == nil {
		return nil
	}
	encoder.AddString("From", m.deleteEvent.Key)
	encoder.AddString("To", m.createEvent.Key)
	encoder.AddObject("DbNode", m.dbNode)
	return nil
}

func (m *Move) Distance() int {
	sep := "/"
	pref := mtree.CommonPrefix(sep[0], m.deleteEvent.Key, m.createEvent.Key)
	return len(strings.Split(pref, sep))
}

func (b *Batch) sortClosestMoves(logCtx context.Context, possibleMoves []*Move) (moves []*Move) {

	// Dedup by source
	greatestSource := make(map[string]*Move)
	for _, m := range possibleMoves {
		source := m.deleteEvent.Key
		byT, ok := greatestSource[source]
		for _, m2 := range possibleMoves {
			target2 := m2.deleteEvent.Key
			if target2 == source {
				if !ok || m2.Distance() > byT.Distance() {
					greatestSource[source] = m2
				}
			}
		}
	}

	// Dedup by target
	greatestTarget := make(map[string]*Move)
	for _, m := range greatestSource {
		byT, ok := greatestTarget[m.createEvent.Key]
		if !ok || m.Distance() > byT.Distance() {
			greatestTarget[m.createEvent.Key] = m
		}
	}

	for target, m := range greatestTarget {
		log.Logger(logCtx).Debug("Greatest Move", zap.Any("k", target), zap.Any("from", m.deleteEvent.Key), zap.Any("to", m.createEvent.Key))
		moves = append(moves, m)
	}

	return
}

func (b *Batch) detectFolderMoves(logCtx context.Context) {
	sorted := b.sortedKeys(b.Deletes)
	target, ok := AsPathSyncTarget(b.Target)

	for _, k := range sorted {
		deleteEvent, still := b.Deletes[k]
		if !still {
			// May have been deleted during the process
			continue
		}
		localPath := deleteEvent.EventInfo.Path
		var dbNode *tree.Node
		if deleteEvent.Node != nil {
			// If deleteEvent has node, it is already loaded from a snapshot,
			// no need to reload from target
			dbNode = deleteEvent.Node
		} else if ok {
			dbNode, _ = target.LoadNode(deleteEvent.EventInfo.CreateContext(logCtx), localPath)
			log.Logger(logCtx).Debug("Looking for node in index", zap.Any("path", localPath), zap.Any("dbNode", dbNode))
		}
		if dbNode == nil || dbNode.IsLeaf() {
			continue
		}

		for _, createEvent := range b.CreateFolders {
			log.Logger(logCtx).Debug("Checking if DeleteFolder is inside CreateFolder by comparing Uuids: ", createEvent.Node.Zap(), dbNode.Zap())
			if createEvent.Node.Uuid == dbNode.Uuid {
				log.Logger(logCtx).Debug("Existing folder with hash: this is a move", zap.String("etag", dbNode.Uuid), zap.String("path", dbNode.Path))
				createEvent.Node = dbNode
				b.FolderMoves[createEvent.Key] = createEvent
				b.pruneMovesByPath(deleteEvent.Key, createEvent.Key)
				break
			}
		}
	}
}

func (b *Batch) pruneMovesByPath(from, to string) {
	// First remove folder from Creates/Deletes

	delete(b.Deletes, from)
	delete(b.CreateFolders, to)
	fromPrefix := from + "/"
	// Now remove all children
	for p, _ := range b.Deletes {
		if !strings.HasPrefix(p, fromPrefix) {
			continue
		}
		targetPath := path.Join(to, strings.TrimPrefix(p, fromPrefix))
		if _, ok := b.CreateFiles[targetPath]; ok {
			delete(b.CreateFiles, targetPath)
			delete(b.Deletes, p)
		} else if _, ok2 := b.CreateFolders[targetPath]; ok2 {
			delete(b.CreateFolders, targetPath)
			delete(b.Deletes, p)
		} else if moveEvent, ok3 := b.FolderMoves[targetPath]; ok3 && strings.HasPrefix(moveEvent.Node.Path, fromPrefix) {
			// An inner-folder was already detected as moved
			delete(b.FolderMoves, targetPath)
		}
	}

}

func (b *Batch) sortedKeys(data map[string]*BatchEvent) []string {
	out := make([]string, len(data))
	for k, _ := range data {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}
