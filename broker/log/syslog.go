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
	"time"

	"github.com/blevesearch/bleve"
	"github.com/blevesearch/bleve/index/scorch"
	"github.com/blevesearch/bleve/index/store/boltdb"
	"github.com/rs/xid"

	"github.com/pydio/cells/common/proto/log"
)

// SyslogServer is the syslog specific implementation of the Log server
type SyslogServer struct {
	Index       bleve.Index
	idgen       xid.ID
	indexPath   string
	mappingName string

	inserts  chan map[string]string
	done     chan bool
	crtBatch *bleve.Batch
}

// NewSyslogServer creates and configures a default Bleve instance to store technical logs
func NewSyslogServer(bleveIndexPath string, mappingName string, deleteOnClose ...bool) (*SyslogServer, error) {

	index, err := openIndex(bleveIndexPath, mappingName)
	if err != nil {
		return nil, err
	}
	server := &SyslogServer{
		Index:       index,
		indexPath:   bleveIndexPath,
		mappingName: mappingName,
		inserts:     make(chan map[string]string),
		done:        make(chan bool),
	}
	go server.watchInserts()
	return server, nil
}

func openIndex(bleveIndexPath string, mappingName string) (bleve.Index, error) {

	index, err := bleve.Open(bleveIndexPath)
	if err != nil {
		indexMapping := bleve.NewIndexMapping()
		// Create, configure and add a specific document mapping
		logMapping := bleve.NewDocumentMapping()
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

func (s *SyslogServer) watchInserts() {
	for {
		select {
		case line := <-s.inserts:
			if msg, err := MarshallLogMsg(line); err == nil {
				if s.crtBatch == nil {
					s.crtBatch = s.Index.NewBatch()
				}
				s.crtBatch.Index(xid.New().String(), msg)
				if s.crtBatch.Size() > 5000 {
					s.flush()
				}
			}
		case <-time.After(3 * time.Second):
			s.flush()
		case <-s.done:
			s.flush()
			s.Index.Close()
			return
		}
	}
}

func (s *SyslogServer) flush() {
	if s.crtBatch != nil {
		s.Index.Batch(s.crtBatch)
		s.crtBatch = nil
	}
}

func (s *SyslogServer) Close() {
	close(s.done)
}

// PutLog  adds a new LogMessage in the syslog index.
func (s *SyslogServer) PutLog(line map[string]string) error {
	s.inserts <- line
	return nil
}

// ListLogs performs a query in the bleve index, based on the passed query string.
// It returns results as a stream of log.ListLogResponse for each corresponding hit.
// Results are ordered by descending timestamp rather than by score.
func (s *SyslogServer) ListLogs(str string, page, size int32) (chan log.ListLogResponse, error) {
	return BleveListLogs(s.Index, str, page, size)
}

func (s *SyslogServer) DeleteLogs(query string) (int64, error) {
	return BleveDeleteLogs(s.Index, query)
}

// AggregatedLogs performs a faceted query in the syslog repository. UNIMPLEMENTED.
func (s *SyslogServer) AggregatedLogs(msgId string, timeRangeType string, refTime int32) (chan log.TimeRangeResponse, error) {
	return nil, fmt.Errorf("unimplemented method")
}

func (s *SyslogServer) Resync() error {

	copyPath := s.indexPath + ".copy"
	indexMapping := bleve.NewIndexMapping()
	// Create, configure and add a specific document mapping
	logMapping := bleve.NewDocumentMapping()
	indexMapping.AddDocumentMapping(s.mappingName, logMapping)
	// Creates the new index and initializes the server
	target, err := bleve.NewUsing(copyPath, indexMapping, scorch.Name, boltdb.Name, nil)
	if err != nil {
		return err
	}
	fmt.Println("Listing Index inside new one")
	if err = BleveDuplicateIndex(s.Index, target); err != nil {
		return err
	}
	s.Close()
	target.Close()
	<-time.After(5 * time.Second) // Make sure original is closed
	s.done = make(chan bool)
	fmt.Println("Removing old index")
	if err = os.RemoveAll(s.indexPath); err != nil {
		return err
	}
	fmt.Println("Replacing with new one")
	if err = os.Rename(copyPath, s.indexPath); err != nil {
		return err
	}
	fmt.Println("Reopening new index")
	index, err := openIndex(s.indexPath, s.mappingName)
	if err != nil {
		return err
	}
	fmt.Println("Finished Reindexation")
	s.Index = index
	go s.watchInserts()
	return nil

}
