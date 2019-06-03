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

var _JobsStore = require('./JobsStore');

var _JobsStore2 = _interopRequireDefault(_JobsStore);

var SingleJobProgress = (function (_React$Component) {
    _inherits(SingleJobProgress, _React$Component);

    function SingleJobProgress(props) {
        var _this = this;

        _classCallCheck(this, SingleJobProgress);

        _React$Component.call(this, props);
        this.store = _JobsStore2['default'].getInstance();
        this.state = { task: null };
        this.observer = function () {
            _this.reloadTask();
        };
    }

    SingleJobProgress.prototype.reloadTask = function reloadTask() {
        var _this2 = this;

        var _props = this.props;
        var jobID = _props.jobID;
        var taskID = _props.taskID;

        this.store.getJobs(false).then(function (tasksList) {
            if (tasksList && tasksList.has(jobID)) {
                var job = tasksList.get(jobID);
                _this2.setState({ jobLabel: job.Label });
                if (job.Tasks && job.Tasks.length) {
                    var task = undefined;
                    if (taskID) {
                        var filtered = job.Tasks.filter(function (t) {
                            return t.ID === taskID;
                        });
                        if (filtered.length) {
                            task = filtered[0];
                        }
                    } else {
                        task = job.Tasks[0];
                    }
                    if (task) {
                        if (task.Progress === 1 && _this2.props.onEnd) {
                            _this2.props.onEnd();
                        }
                        _this2.setState({ task: task });
                    }
                }
            }
        });
    };

    SingleJobProgress.prototype.componentDidMount = function componentDidMount() {
        this.reloadTask();
        this.store.observe("tasks_updated", this.observer);
    };

    SingleJobProgress.prototype.componentWillUnmount = function componentWillUnmount() {
        this.store.stopObserving("tasks_updated", this.observer);
    };

    SingleJobProgress.prototype.render = function render() {
        var _state = this.state;
        var task = _state.task;
        var jobLabel = _state.jobLabel;
        var _props2 = this.props;
        var style = _props2.style;
        var labelStyle = _props2.labelStyle;
        var lineStyle = _props2.lineStyle;
        var progressStyle = _props2.progressStyle;
        var noProgress = _props2.noProgress;
        var noLabel = _props2.noLabel;
        var circular = _props2.circular;
        var thickness = _props2.thickness;
        var size = _props2.size;

        if (!task) {
            return _react2['default'].createElement(
                'div',
                null,
                jobLabel ? jobLabel : "..."
            );
        }
        var progress = undefined;
        if (!noProgress && task.HasProgress && task.Status !== 'Error' && task.Progress < 1) {
            if (circular) {
                progress = _react2['default'].createElement(_materialUi.CircularProgress, { mode: 'determinate', min: 0, max: 100, value: task.Progress * 100, size: size, thickness: thickness });
            } else {
                progress = _react2['default'].createElement(_materialUi.LinearProgress, { mode: 'determinate', min: 0, max: 100, value: task.Progress * 100, style: { width: '100%' } });
            }
        }
        var lStyle = _extends({}, labelStyle);
        if (task.Status === 'Error') {
            lStyle = _extends({}, lStyle, { color: '#e53935' });
        }

        return _react2['default'].createElement(
            'div',
            { style: style },
            !noLabel && _react2['default'].createElement(
                'div',
                { style: lStyle },
                task.StatusMessage.split("\n").map(function (s) {
                    return _react2['default'].createElement(
                        'div',
                        { style: lineStyle },
                        s
                    );
                })
            ),
            progress && _react2['default'].createElement(
                'div',
                { style: progressStyle },
                progress
            )
        );
    };

    return SingleJobProgress;
})(_react2['default'].Component);

exports['default'] = SingleJobProgress;
module.exports = exports['default'];
