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
        var newScroll = 8;

        var innerPane = this.refs.innerPane;

        if (innerPane && innerPane.children) {
            for (var i = 0; i < innerPane.children.length; i++) {
                newScroll += innerPane.children.item(i).clientHeight + 8;
            }
        }
        if (newScroll && this.state.innerScroll !== newScroll) {
            this.setState({ innerScroll: newScroll });
        }
    };

    TasksPanel.prototype.componentDidUpdate = function componentDidUpdate() {
        this.recomputeInnerScrollDebounced();
    };

    TasksPanel.prototype.render = function render() {
        var _this2 = this;

        var _props = this.props;
        var muiTheme = _props.muiTheme;
        var mode = _props.mode;
        var panelStyle = _props.panelStyle;
        var headerStyle = _props.headerStyle;
        var pydio = _props.pydio;
        var _state = this.state;
        var jobs = _state.jobs;
        var folded = _state.folded;
        var innerScroll = _state.innerScroll;

        var palette = muiTheme.palette;
        var Color = require('color');
        var headerColor = Color(palette.primary1Color).darken(0.1).alpha(0.50).toString();

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
            panel: _extends({
                position: 'absolute',
                width: 400,
                bottom: 0,
                left: '50%',
                marginLeft: -200,
                overflowX: 'hidden',
                zIndex: 20001,
                height: height,
                display: 'flex',
                flexDirection: 'column'
            }, panelStyle),
            header: _extends({
                color: headerColor,
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 500,
                backgroundColor: 'transparent'
            }, headerStyle),
            innerPane: {
                flex: 1,
                overflowY: 'auto'
            },
            iconButtonStyles: {
                style: { width: 30, height: 30, padding: 6, marginRight: 4 },
                iconStyle: { width: 15, height: 15, fontSize: 15, color: palette.primary1Color }
            }
        };
        var mainDepth = 3;
        if (folded) {
            styles.panel = _extends({}, styles.panel, {
                height: 33,
                cursor: 'pointer'
            });
            styles.innerPane = {
                display: 'none'
            };
        }
        if (mode === 'flex') {
            mainDepth = 0;
            styles.panel = _extends({}, styles.panel, {
                position: null,
                marginLeft: null,
                left: null,
                width: null
            });
        }

        if (!elements.length) {
            if (mode !== 'flex') {
                styles.panel.bottom = -10000;
            }
            styles.panel.height = 0;
        }

        var mainTouchTap = undefined;
        var title = pydio.MessageHash['ajax_gui.background.jobs.running'] || 'Jobs Running';
        var badge = undefined;
        if (elements.length) {
            badge = _react2['default'].createElement(
                'span',
                { style: {
                        display: 'inline-block',
                        backgroundColor: palette.accent1Color,
                        width: 18,
                        height: 18,
                        fontSize: 11,
                        lineHeight: '20px',
                        textAlign: 'center',
                        borderRadius: '50%',
                        color: 'white',
                        marginTop: -1
                    } },
                elements.length
            );
        }
        if (folded) {
            mainTouchTap = function () {
                return _this2.setState({ folded: false });
            };
        }

        return _react2['default'].createElement(
            _materialUi.Paper,
            { zDepth: mainDepth, style: styles.panel, onClick: mainTouchTap, rounded: false },
            _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 0, style: styles.header, className: 'handle' },
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '12px 8px 12px 16px' } },
                    title
                ),
                badge,
                _react2['default'].createElement('span', { style: { flex: 1 } }),
                !folded && _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-chevron-down" }, styles.iconButtonStyles, { onTouchTap: function () {
                        return _this2.setState({ folded: true, innerScroll: 300 });
                    } })),
                folded && _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-chevron-right" }, styles.iconButtonStyles, { onTouchTap: function () {
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
