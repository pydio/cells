/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _boardDashboard = require('./board/Dashboard');

var _boardDashboard2 = _interopRequireDefault(_boardDashboard);

var _boardJobsList = require('./board/JobsList');

var _boardJobsList2 = _interopRequireDefault(_boardJobsList);

var _boardTasksList = require('./board/TasksList');

var _boardTasksList2 = _interopRequireDefault(_boardTasksList);

var _boardScheduleForm = require('./board/ScheduleForm');

var _boardScheduleForm2 = _interopRequireDefault(_boardScheduleForm);

var _boardEvents = require('./board/Events');

var _boardEvents2 = _interopRequireDefault(_boardEvents);

var _boardLoader = require('./board/Loader');

var _boardLoader2 = _interopRequireDefault(_boardLoader);

window.AdminScheduler = {
  Dashboard: _boardDashboard2['default'],
  JobsList: _boardJobsList2['default'],
  TasksList: _boardTasksList2['default'],
  ScheduleForm: _boardScheduleForm2['default'],
  Events: _boardEvents2['default'],
  Loader: _boardLoader2['default']
};
