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

	"github.com/blevesearch/bleve"
	"github.com/rs/xid"

	"github.com/pydio/cells/common/proto/log"
)

// SyslogServer is the syslog specific implementation of the Log server
type SyslogServer struct {
	Index bleve.Index
	idgen xid.ID
}

// NewSyslogServer creates and configures a default Bleve instance to store technical logs
func NewSyslogServer(bleveIndexPath string, deleteOnClose ...bool) (*SyslogServer, error) {

	index, err := bleve.Open(bleveIndexPath)
	if err == nil {
		// Already existing, no need to create
		return &SyslogServer{Index: index}, nil
	}

	indexMapping := bleve.NewIndexMapping()

	// Create, configure and add a specific document mapping
	logMapping := bleve.NewDocumentMapping()

	// Specific fields
	// standardFieldMapping := bleve.NewTextFieldMapping()
	// logMapping.AddFieldMappingsAt("level", standardFieldMapping)
	// dateFieldMapping := bleve.NewDateTimeFieldMapping()
	// logMapping.AddFieldMappingsAt("ts", dateFieldMapping)
	// keywordFieldMapping := bleve.NewTextFieldMapping()
	// keywordFieldMapping.Analyzer = keyword.Name
	// logMapping.AddFieldMappingsAt("msg", keywordFieldMapping)

	indexMapping.AddDocumentMapping("sysLog", logMapping)

	// Creates the new index and initialises the server
	if bleveIndexPath == "" {
		index, err = bleve.NewMemOnly(indexMapping)
	} else {
		index, err = bleve.New(bleveIndexPath, indexMapping)
	}
	if err != nil {
		return &SyslogServer{}, err
	}
	return &SyslogServer{Index: index}, nil
}

// PutLog  adds a new LogMessage in the syslog index.
func (s *SyslogServer) PutLog(line map[string]string) error {
	return BlevePutLog(s.Index, line)
}

// ListLogs performs a query in the bleve index, based on the passed query string.
// It returns results as a stream of log.ListLogResponse for each corresponding hit.
// Results are ordered by descending timestamp rather than by score.
func (s *SyslogServer) ListLogs(str string, page, size int32) (chan log.ListLogResponse, error) {
	return BleveListLogs(s.Index, str, page, size)
}

// AggregatedLogs performs a faceted query in the syslog repository. UNIMPLEMENTED.
func (s *SyslogServer) AggregatedLogs(msgId string, timeRangeType string, refTime int32) (chan log.TimeRangeResponse, error) {
	return nil, fmt.Errorf("unimplemented method")
}
