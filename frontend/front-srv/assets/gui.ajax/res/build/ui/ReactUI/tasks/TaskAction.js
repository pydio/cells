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

var _materialUi = require('material-ui');

var TaskAction = (function (_React$Component) {
    _inherits(TaskAction, _React$Component);

    function TaskAction(props) {
        _classCallCheck(this, TaskAction);

        _React$Component.call(this, props);
        this.state = { showProgress: true };
    }

    TaskAction.prototype.showAction = function showAction() {
        this.setState({ showProgress: false });
    };

    TaskAction.prototype.showProgress = function showProgress() {
        this.setState({ showProgress: true });
    };

    TaskAction.prototype.render = function render() {
        var _props = this.props;
        var task = _props.task;
        var onTaskAction = _props.onTaskAction;

        var style = {
            iconButtonStyles: {
                style: { width: 30, height: 30, padding: 6 },
                iconStyle: { width: 15, height: 15, fontSize: 15, color: 'rgab(0,0,0,.87)' }
            }
        };

        var actions = [];
        if (task.Status === 'Running' && task.CanPause && onTaskAction) {
            actions.push(_react2['default'].createElement(_materialUi.IconButton, _extends({}, style.iconButtonStyles, { key: 'pause', iconClassName: 'mdi mdi-pause', onTouchTap: function () {
                    return onTaskAction(task, 'Pause');
                } })));
        }
        if (task.Status === 'Paused' && task.CanPause && onTaskAction) {
            actions.push(_react2['default'].createElement(_materialUi.IconButton, _extends({}, style.iconButtonStyles, { key: 'play', iconClassName: 'mdi mdi-play', onTouchTap: function () {
                    return onTaskAction(task, 'Resume');
                } })));
        }
        if ((task.Status === 'Running' || task.Status === 'Paused') && task.CanStop && onTaskAction) {
            actions.push(_react2['default'].createElement(_materialUi.IconButton, _extends({}, style.iconButtonStyles, { key: 'stop', iconClassName: 'mdi mdi-stop', onTouchTap: function () {
                    return onTaskAction(task, 'Stop');
                } })));
        }
        return _react2['default'].createElement(
            'div',
            null,
            actions
        );
    };

    return TaskAction;
})(_react2['default'].Component);

exports['default'] = TaskAction;
module.exports = exports['default'];
