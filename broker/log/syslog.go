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

package log

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/blevesearch/bleve/mapping"

	"go.uber.org/zap"

	"github.com/blevesearch/bleve"
	"github.com/blevesearch/bleve/index/scorch"
	"github.com/blevesearch/bleve/index/store/boltdb"
	"github.com/pborman/uuid"
	"github.com/rs/xid"

	"github.com/pydio/cells/common/proto/log"
)

const (
	MinRotationSize     = 68 * 1024
	DefaultRotationSize = int64(200 * 1024 * 1024)
)

// SyslogServer is the syslog specific implementation of the Log server
type SyslogServer struct {
	SearchIndex bleve.IndexAlias

	rotationSize int64
	indexes      []bleve.Index
	cursor       int
	indexPath    string
	mappingName  string

	opened      bool
	inserts     chan interface{}
	insertsDone chan bool
	crtBatch    *bleve.Batch
	flushLock   *sync.Mutex
}

// NewSyslogServer creates and configures a default Bleve instance to store technical logs
// Setting rotationSize to -1 fully disables rotation
func NewSyslogServer(indexPath string, mappingName string, rotationSize int64) (*SyslogServer, error) {
	if rotationSize > -1 && rotationSize < MinRotationSize {
		return nil, fmt.Errorf("use a rotation size bigger than %d", MinRotationSize)
	}
	server := &SyslogServer{
		rotationSize: rotationSize,
	}
	er := server.Open(indexPath, mappingName)
	return server, er
}

func (s *SyslogServer) Open(indexPath string, mappingName string) error {
	s.indexPath = indexPath
	s.mappingName = mappingName
	s.SearchIndex = bleve.NewIndexAlias()
	s.indexes = []bleve.Index{}
	s.flushLock = &sync.Mutex{}
	existing := s.listIndexes(true)
	if len(existing) == 0 {
		index, err := openOneIndex(indexPath, mappingName)
		if err != nil {
			return err
		}
		s.SearchIndex.Add(index)
		s.indexes = append(s.indexes, index)
		s.cursor = 0
	} else {
		for _, iName := range existing {
			iPath := filepath.Join(filepath.Dir(indexPath), iName)
			if index, err := openOneIndex(iPath, mappingName); err == nil {
				s.indexes = append(s.indexes, index)
			} else {
				fmt.Println("[pydio.grpc.log] Cannot open bleve index", iPath, err)
			}
		}
		s.SearchIndex.Add(s.indexes...)
		s.cursor = len(s.indexes) - 1
	}

	s.inserts = make(chan interface{}, 1000)
	s.insertsDone = make(chan bool)
	s.opened = true

	if indexPath != "" && s.rotationSize > -1 {
		s.rotateIfNeeded()
	}
	go s.watchInserts()
	return nil
}

func (s *SyslogServer) getWriteIndex() bleve.Index {
	return s.indexes[s.cursor]
}

func (s *SyslogServer) Close() {
	if !s.opened {
		return
	}
	s.opened = false
	close(s.insertsDone)

}

func (s *SyslogServer) listIndexes(renameIfNeeded ...bool) (paths []string) {
	dirPath, base := filepath.Split(s.indexPath)
	dir, err := os.Open(dirPath)
	if err != nil {
		return
	}
	defer dir.Close()

	files, err := dir.Readdir(-1)
	if err != nil {
		return
	}

	for _, file := range files {
		if !file.IsDir() {
			continue
		}
		curBase := filepath.Base(file.Name())
		if curBase == base {
			paths = append(paths, curBase)
		} else if strings.HasPrefix(curBase, base) {
			// Ensure suffix is a number ".0001", ".0002", etc.
			test := strings.TrimLeft(strings.TrimPrefix(curBase, base+"."), "0")
			if _, e := strconv.ParseInt(test, 10, 32); e == nil {
				paths = append(paths, curBase)
			}
		}
	}
	sort.Strings(paths)
	if len(renameIfNeeded) > 0 && renameIfNeeded[0] && len(paths) > 0 && paths[0] != base {
		// Old files were removed, renumber files
		for _, p := range paths {
			src := filepath.Join(dirPath, p)
			t1 := filepath.Join(dirPath, fmt.Sprintf("%s-rename", p))
			os.Rename(src, t1)
		}
		for i, p := range paths {
			src := filepath.Join(dirPath, fmt.Sprintf("%s-rename", p))
			t2 := filepath.Join(dirPath, fmt.Sprintf("%s.%04d", base, i))
			if i == 0 {
				t2 = s.indexPath
			}
			os.Rename(src, t2)
		}
		return s.listIndexes()
	}
	return
}

func (s *SyslogServer) watchInserts() {
	for {
		select {
		case in := <-s.inserts:
			var msg *IndexableLog
			if m, ok := in.(*IndexableLog); ok {
				msg = m
			} else if line, ok := in.(*log.Log); ok {
				var err error
				msg, err = MarshallLogMsg(line)
				if err != nil {
					break
				}
			} else {
				// Unsupported type
				break
			}
			s.flushLock.Lock()
			if s.crtBatch == nil {
				s.crtBatch = s.getWriteIndex().NewBatch()
			}
			s.crtBatch.Index(xid.New().String(), msg)
			if s.crtBatch.Size() > 5000 {
				s.flush()
			}
			s.flushLock.Unlock()
		case <-time.After(3 * time.Second):
			s.flushLock.Lock()
			s.flush()
			s.flushLock.Unlock()
		case <-s.insertsDone:
			s.flushLock.Lock()
			s.flush()
			s.flushLock.Unlock()
			s.SearchIndex.Close()
			for _, i := range s.indexes {
				i.Close()
			}
			return
		}
	}
}

func (s *SyslogServer) rotateIfNeeded() {
	if s.indexPath == "" || s.rotationSize == -1 {
		return
	}
	checkPath := s.indexPath
	if s.cursor > 0 {
		checkPath = fmt.Sprintf("%s.%04d", s.indexPath, s.cursor)
	}
	du, e := indexDiskUsage(checkPath)
	if e != nil {
		fmt.Println("[pydio.grpc.log] Cannot compute disk usage for bleve index", e.Error())
		return
	}
	if du > s.rotationSize {
		// Open a new index
		newPath := fmt.Sprintf("%s.%04d", s.indexPath, len(s.indexes))
		newIndex, er := openOneIndex(newPath, s.mappingName)
		if er != nil {
			fmt.Println("[pydio.grpc.log] Cannot create new bleve index", er.Error())
			return
		}
		s.indexes = append(s.indexes, newIndex)
		s.SearchIndex.Add(newIndex)
		s.cursor = len(s.indexes) - 1
	}
}

func (s *SyslogServer) flush() {
	if s.crtBatch != nil {
		s.getWriteIndex().Batch(s.crtBatch)
		s.rotateIfNeeded()
		s.crtBatch = nil
	}
}

// PutLog  adds a new LogMessage in the syslog index.
func (s *SyslogServer) PutLog(line *log.Log) error {
	select {
	case s.inserts <- line:
	default:
	}
	return nil
}

// ListLogs performs a query in the bleve index, based on the passed query string.
// It returns results as a stream of log.ListLogResponse for each corresponding hit.
// Results are ordered by descending timestamp rather than by score.
func (s *SyslogServer) ListLogs(str string, page, size int32) (chan log.ListLogResponse, error) {
	return BleveListLogs(s.SearchIndex, str, page, size)
}

// DeleteLogs truncate logs based on a search query
func (s *SyslogServer) DeleteLogs(query string) (int64, error) {
	return BleveDeleteLogs(s.getWriteIndex(), query)
}

// AggregatedLogs performs a faceted query in the syslog repository. UNIMPLEMENTED.
func (s *SyslogServer) AggregatedLogs(msgId string, timeRangeType string, refTime int32) (chan log.TimeRangeResponse, error) {
	return nil, fmt.Errorf("unimplemented method")
}

// Resync creates a copy of current index. It has been originally used for switching analyze format from bleve to scorch.
func (s *SyslogServer) Resync(logger *zap.Logger) error {

	copyDir := filepath.Join(filepath.Dir(s.indexPath), uuid.New())
	e := os.Mkdir(copyDir, 0777)
	if e != nil {
		return e
	}
	defer func() {
		os.RemoveAll(copyDir)
	}()
	copyPath := filepath.Join(copyDir, filepath.Base(s.indexPath))
	dup, er := NewSyslogServer(copyPath, s.mappingName, s.rotationSize)
	if er != nil {
		return er
	}
	logTaskInfo(logger, "Listing Index inside new one", "info")
	if err := BleveDuplicateIndex(s.SearchIndex, dup.inserts, func(s string) {
		logTaskInfo(logger, s, "info")
	}); err != nil {
		return err
	}
	s.Close()
	dup.Close()
	<-time.After(5 * time.Second) // Make sure original is closed

	logTaskInfo(logger, "Removing old indexes", "info")
	for _, ip := range s.listIndexes() {
		if err := os.RemoveAll(filepath.Join(filepath.Dir(s.indexPath), ip)); err != nil {
			return err
		}
	}
	logTaskInfo(logger, "Moving new indexes", "info")
	for _, ip := range dup.listIndexes() {
		src := filepath.Join(copyDir, ip)
		target := filepath.Join(filepath.Join(filepath.Dir(s.indexPath), ip))
		if err := os.Rename(src, target); err != nil {
			return err
		}
	}
	logTaskInfo(logger, "Restarting new server", "info")
	if err := s.Open(s.indexPath, s.mappingName); err != nil {
		return err
	}
	logTaskInfo(logger, "Resync operation done", "info")
	return nil

}

// Truncate gathers size of existing indexes, starting from last. When max is reached
// it starts deleting all previous indexes.
func (s *SyslogServer) Truncate(max int64, logger *zap.Logger) error {
	logTaskInfo(logger, "Closing log server, waiting for five seconds", "info")
	dir := filepath.Dir(s.indexPath)
	s.Close()
	<-time.After(5 * time.Second)
	logTaskInfo(logger, "Start purging old files", "info")
	indexes := s.listIndexes()
	var i int
	var total int64
	var remove bool
	for i = len(indexes) - 1; i >= 0; i-- {
		if remove {
			e := os.RemoveAll(filepath.Join(dir, indexes[i]))
			if e != nil {
				logTaskInfo(logger, fmt.Sprintf("cannot remove index %s", indexes[i]), "error")
			}
		} else if u, e := indexDiskUsage(filepath.Join(dir, indexes[i])); e == nil {
			total += u
			remove = total > max
		}
	}
	// Now restart - it will renumber files
	logTaskInfo(logger, "Re-opening log server", "info")
	s.Open(s.indexPath, s.mappingName)
	logTaskInfo(logger, "Truncate operation done", "info")
	return nil
}

func logTaskInfo(l *zap.Logger, msg string, level string) {
	if l == nil {
		fmt.Println("[pydio.grpc.log] " + msg)
	} else if level == "info" {
		l.Info(msg)
	} else if level == "error" {
		l.Error(msg)
	} else {
		l.Debug(msg)
	}
}

// openOneIndex tries to open an existing index at a given path, or creates a new one
func openOneIndex(bleveIndexPath string, mappingName string) (bleve.Index, error) {

	index, err := bleve.Open(bleveIndexPath)
	if err != nil {
		indexMapping := bleve.NewIndexMapping()
		// Create, configure and add a specific document mapping
		logMapping := bleve.NewDocumentMapping()
		// Exclude JSONZaps from indexing
		logMapping.AddFieldMapping(&mapping.FieldMapping{Type: "text", Name: "JsonZaps", Index: false, Store: true})
		indexMapping.AddDocumentMapping(mappingName, logMapping)

		// Creates the new index and initializes the server
		if bleveIndexPath == "" {
			index, err = bleve.NewMemOnly(indexMapping)
		} else {
			index, err = bleve.NewUsing(bleveIndexPath, indexMapping, scorch.Name, boltdb.Name, nil)
		}
		if err != nil {
			return nil, err
		}
	}
	return index, nil

}

// indexDiskUsage is a simple implementation for computing directory size
func indexDiskUsage(currPath string) (int64, error) {
	var size int64

	dir, err := os.Open(currPath)
	if err != nil {
		return 0, err
	}
	defer dir.Close()

	files, err := dir.Readdir(-1)
	if err != nil {
		return 0, err
	}

	for _, file := range files {
		if file.IsDir() {
			s, e := indexDiskUsage(filepath.Join(currPath, file.Name()))
			if e != nil {
				return 0, e
			}
			size += s
		} else {
			size += file.Size()
		}
	}

	return size, nil
}
