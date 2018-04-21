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

package grpc

import (
	"io"

	"github.com/pydio/cells/common/proto/tree"
)

// putStreamMock is a naive and non-thread safe implementation of a SyncChanges_PutStream mock
type putStreamMock struct {
	counter    int
	mockEvents []*tree.SyncChange
}

func newPutStreamMock(mockEvents []*tree.SyncChange) *putStreamMock {
	mock := putStreamMock{}
	mock.mockEvents = mockEvents
	return &mock
}

func (p *putStreamMock) Recv() (*tree.SyncChange, error) {
	if p.counter < len(p.mockEvents) {
		event := p.mockEvents[p.counter]
		p.counter++
		return event, nil
	}
	return nil, io.EOF
}

func (p *putStreamMock) SendMsg(interface{}) error { return nil }
func (p *putStreamMock) RecvMsg(interface{}) error { return nil }
func (p *putStreamMock) Close() error              { return nil }

// searchStreamMock is a naive and non-thread safe implementation of a SyncChanges_SearchStream mock
type searchStreamMock struct {
	counter    int
	mockEvents []*tree.SyncChange
}

func newSearchStreamMock() *searchStreamMock {
	mock := searchStreamMock{} // counter: 0 useless
	mock.mockEvents = make([]*tree.SyncChange, 10)
	return &mock
}

func (s *searchStreamMock) Send(event *tree.SyncChange) error {
	// insure there is no overflow by doubling the size of the array if necessary
	if s.counter == len(s.mockEvents) {
		tmpArray := make([]*tree.SyncChange, len(s.mockEvents)*2)
		//copy everything up to the position
		copy(tmpArray, s.mockEvents[:s.counter-1])
		s.mockEvents = tmpArray
	}
	s.mockEvents[s.counter] = event
	s.counter++
	return nil
}

func (s *searchStreamMock) SendMsg(interface{}) error { return nil }
func (s *searchStreamMock) RecvMsg(interface{}) error { return nil }
func (s *searchStreamMock) Close() error              { return nil }
