/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _TaskAction = require('./TaskAction');

var _TaskAction2 = _interopRequireDefault(_TaskAction);

var _materialUi = require('material-ui');

var JobEntry = (function (_React$Component) {
    _inherits(JobEntry, _React$Component);

    function JobEntry() {
        _classCallCheck(this, JobEntry);

        _React$Component.apply(this, arguments);
    }

    JobEntry.prototype.render = function render() {
        var job = this.props.job;

        var click = undefined,
            clickStyle = undefined;
        if (job.openDetailPane) {
            click = job.openDetailPane;
            clickStyle = { cursor: 'pointer' };
        }
        var task = undefined;
        job.Tasks.forEach(function (t) {
            if (t.Status === 'Running' || t.Status === 'Paused') {
                task = t;
            }
        });

        var progress = undefined;
        if (task && task.HasProgress && task.Status !== 'Error' && task.Progress < 1) {
            progress = _react2['default'].createElement(_materialUi.LinearProgress, { mode: 'determinate', min: 0, max: 100, value: task.Progress * 100, style: { width: '100%' } });
        }

        var styles = {
            paper: _extends({
                margin: 8,
                padding: 8
            }, clickStyle),
            title: {
                fontSize: 15,
                color: 'rgba(0,0,0,0.87)',
                flex: 1
            },
            status: {
                fontSize: 13,
                color: 'rgba(0,0,0,0.54)',
                padding: '8px 0'
            }
        };

        return _react2['default'].createElement(
            _materialUi.Paper,
            { zDepth: 1, style: styles.paper, onClick: click },
            _react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center' } },
                _react2['default'].createElement(
                    'div',
                    { style: styles.title },
                    job.Label
                ),
                _react2['default'].createElement(_TaskAction2['default'], _extends({}, this.props, { task: task }))
            ),
            _react2['default'].createElement(
                'div',
                { style: styles.status },
                task.StatusMessage
            ),
            progress
        );
    };

    return JobEntry;
})(_react2['default'].Component);

exports['default'] = JobEntry;
module.exports = exports['default'];
