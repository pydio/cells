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

var _JobsStore = require('./JobsStore');

var _JobsStore2 = _interopRequireDefault(_JobsStore);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _JobEntry = require('./JobEntry');

var _JobEntry2 = _interopRequireDefault(_JobEntry);

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

/**
 * TasksPanel provides a view on the tasks registered
 * in the JobStore
 */

var TasksPanel = (function (_React$Component) {
    _inherits(TasksPanel, _React$Component);

    function TasksPanel(props) {
        _classCallCheck(this, TasksPanel);

        _React$Component.call(this, props);
        this.state = {
            jobs: new Map(),
            folded: true,
            innerScroll: 0
        };
        this.recomputeInnerScrollDebounced = _lodashDebounce2['default'](this.recomputeInnerScroll.bind(this), 100);
    }

    TasksPanel.prototype.reload = function reload() {
        var _this = this;

        _JobsStore2['default'].getInstance().getJobs().then(function (jobs) {
            _this.setState({ jobs: jobs });
        })['catch'](function (reason) {
            _this.setState({ error: reason.message });
        });
    };

    TasksPanel.prototype.componentDidMount = function componentDidMount() {
        this.reload();
        _JobsStore2['default'].getInstance().observe("tasks_updated", this.reload.bind(this));
    };

    TasksPanel.prototype.componentWillUnmount = function componentWillUnmount() {
        _JobsStore2['default'].getInstance().stopObserving("tasks_updated");
    };

    TasksPanel.prototype.recomputeInnerScroll = function recomputeInnerScroll() {
        if (this.state.folded) {
            return;
        }
        var innerPane = this.refs.innerPane;

        var newScroll = 8;
        for (var i = 0; i < innerPane.children.length; i++) {
            newScroll += innerPane.children.item(i).clientHeight + 8;
        }
        if (newScroll && this.state.innerScroll != newScroll) {
            this.setState({ innerScroll: newScroll });
        }
    };

    TasksPanel.prototype.componentDidUpdate = function componentDidUpdate() {
        this.recomputeInnerScrollDebounced();
    };

    TasksPanel.prototype.render = function render() {
        var _this2 = this;

        var muiTheme = this.props.muiTheme;
        var _state = this.state;
        var jobs = _state.jobs;
        var folded = _state.folded;
        var innerScroll = _state.innerScroll;

        var filtered = [];
        jobs.forEach(function (j) {
            if (!j.Tasks) {
                return;
            }
            var hasRunning = false;
            j.Tasks.map(function (t) {
                if (t.Status === 'Running' || t.Status === 'Paused') {
                    hasRunning = true;
                    j.Time = t.StartTime;
                }
            });
            if (hasRunning) {
                filtered.push(j);
            }
        });
        filtered.sort(function (a, b) {
            if (a.Time === b.Time) {
                return 0;
            }
            return a.Time > b.Time ? -1 : 1;
        });

        var elements = filtered.map(function (j) {
            return _react2['default'].createElement(_JobEntry2['default'], { key: j.ID, job: j, onTaskAction: _JobsStore2['default'].getInstance().controlTask });
        });
        var height = Math.min(elements.length * 72, 300) + 38;
        if (innerScroll) {
            height = Math.min(innerScroll, 300) + 38;
        }
        var styles = {
            panel: {
                position: 'absolute',
                width: 400,
                bottom: 0,
                left: '50%',
                marginLeft: -200,
                overflowX: 'hidden',
                zIndex: 20001,
                backgroundColor: '#e9e9e9',
                height: height,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 0,
                borderTop: '2px solid ' + muiTheme.palette.accent1Color
            },
            header: {
                backgroundColor: 'white',
                color: 'rgba(0,0,0,.87)',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '2px 2px 0 0',
                fontSize: 15,
                fontWeight: 500
            },
            innerPane: {
                flex: 1,
                overflowY: 'auto'
            },
            iconButtonStyles: {
                style: { width: 30, height: 30, padding: 6, marginRight: 4 },
                iconStyle: { width: 15, height: 15, fontSize: 15, color: 'rgba(0,0,0,.87)' }
            }
        };
        var mainDepth = 2;
        if (folded) {
            mainDepth = 1;
            styles.panel = _extends({}, styles.panel, {
                height: 36,
                cursor: 'pointer',
                borderRadius: '2px 2px 0 0'
            });
            styles.innerPane = {
                display: 'none'
            };
        }

        if (!elements.length) {
            styles.panel.bottom = -10000;
            styles.panel.height = 0;
            styles.panel.borderTop = 0;
        }

        var mainTouchTap = undefined;
        var title = 'Background Jobs';
        if (folded) {
            mainTouchTap = function () {
                return _this2.setState({ folded: false });
            };
            title = _react2['default'].createElement(
                'span',
                null,
                elements.length,
                ' jobs running ',
                _react2['default'].createElement('span', { className: 'mdi mdi-timer-sand' })
            );
        }

        return _react2['default'].createElement(
            _materialUi.Paper,
            { zDepth: mainDepth, style: styles.panel, onClick: mainTouchTap },
            _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 1, style: styles.header, className: 'handle' },
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1, padding: 8 } },
                    title
                ),
                !folded && _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-window-minimize" }, styles.iconButtonStyles, { onTouchTap: function () {
                        return _this2.setState({ folded: true, innerScroll: 300 });
                    } })),
                folded && _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-arrow-expand" }, styles.iconButtonStyles, { onTouchTap: function () {
                        return _this2.setState({ folded: false, innerScroll: 300 });
                    } }))
            ),
            _react2['default'].createElement(
                'div',
                { style: styles.innerPane, ref: 'innerPane' },
                elements
            )
        );
    };

    return TasksPanel;
})(_react2['default'].Component);

exports['default'] = TasksPanel = _materialUiStyles.muiThemeable()(TasksPanel);

exports['default'] = TasksPanel;
module.exports = exports['default'];
