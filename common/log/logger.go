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

package log

import (
	"sync"

	"go.uber.org/zap"
)

type logger struct {
	*zap.Logger

	init func() *zap.Logger
	once *sync.Once
}

func newLogger() *logger {
	return &logger{
		Logger: zap.New(nil),
		once:   &sync.Once{},
	}
}

func (l *logger) set(init func() *zap.Logger) {
	l.init = init
	l.once = &sync.Once{}
}

func (l *logger) forceReset() {
	l.once = &sync.Once{}
}

func (l *logger) get() *zap.Logger {
	l.once.Do(func() {
		if l.init != nil {
			l.Logger = l.init()
		}
	})

	return l.Logger
}
