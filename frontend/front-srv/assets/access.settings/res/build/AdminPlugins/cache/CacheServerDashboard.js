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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _corePluginEditor = require('../core/PluginEditor');

var _corePluginEditor2 = _interopRequireDefault(_corePluginEditor);

var _require = require('react-chartjs');

var Doughnut = _require.Doughnut;

var CacheServerDashboard = _react2['default'].createClass({
    displayName: 'CacheServerDashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    getInitialState: function getInitialState() {
        return { cacheStatuses: [], loading: false };
    },

    componentDidMount: function componentDidMount() {
        this.checkCacheStats();
    },

    clearCache: function clearCache(namespace) {
        PydioApi.getClient().request({ get_action: 'cache_service_clear_cache', namespace: namespace }, (function (transp) {
            this.checkCacheStats();
        }).bind(this));
    },

    checkCacheStats: function checkCacheStats() {
        this.setState({ loading: true });
        PydioApi.getClient().request({ get_action: 'cache_service_expose_stats' }, (function (transp) {
            this.setState({ loading: false });
            if (!this.isMounted()) return;
            var response = transp.responseJSON;
            this.setState({ cacheStatuses: response });
            setTimeout(this.checkCacheStats.bind(this), 4000);
        }).bind(this));
    },

    formatUptime: function formatUptime(time) {
        var sec_num = parseInt(time, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - hours * 3600) / 60);
        var seconds = sec_num - hours * 3600 - minutes * 60;

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return hours + ':' + minutes + ':' + seconds;
    },

    renderCachePane: function renderCachePane(cacheData) {
        var healthPercent = parseInt(100 * cacheData.misses / cacheData.hits);
        var health = undefined;
        if (healthPercent < 5) {
            health = '< 5%';
        } else if (healthPercent < 20) {
            health = '< 20%';
        } else if (healthPercent < 40) {
            health = '< 40%';
        } else if (healthPercent < 60) {
            health = '> 40%';
        } else {
            health = '> 60%';
        }
        var memoryUsage = undefined;
        if (cacheData.memory_available) {
            memoryUsage = _react2['default'].createElement(
                'div',
                { className: 'doughnut-chart' },
                _react2['default'].createElement(
                    'h5',
                    null,
                    'Memory Usage'
                ),
                _react2['default'].createElement(Doughnut, {
                    data: [{
                        value: cacheData.memory_usage,
                        color: "rgba(247, 70, 74, 0.51)",
                        highlight: "#FF5A5E",
                        label: "Memory Used"
                    }, {
                        value: cacheData.memory_available - cacheData.memory_usage,
                        color: "rgba(70, 191, 189, 0.59)",
                        highlight: "#5AD3D1",
                        label: "Memory Available"
                    }],
                    options: {},
                    width: 150
                }),
                _react2['default'].createElement(
                    'span',
                    { className: 'figure' },
                    parseInt(100 * cacheData.memory_usage / cacheData.memory_available),
                    '%'
                )
            );
        } else {
            memoryUsage = _react2['default'].createElement(
                'div',
                { className: 'doughnut-chart' },
                _react2['default'].createElement(
                    'h5',
                    null,
                    'Memory Usage'
                ),
                _react2['default'].createElement(
                    'div',
                    { className: 'figure', style: { top: 'auto' } },
                    PathUtils.roundFileSize(cacheData.memory_usage)
                )
            );
        }

        return _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement(
                'h4',
                null,
                'Namespace \'',
                cacheData.namespace,
                '\''
            ),
            _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: { width: '50%', float: 'left' } },
                    memoryUsage
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { width: '50%', float: 'left' } },
                    _react2['default'].createElement(
                        'div',
                        { className: 'doughnut-chart' },
                        _react2['default'].createElement(
                            'h5',
                            null,
                            'Cache Health'
                        ),
                        _react2['default'].createElement(Doughnut, {
                            data: [{
                                value: cacheData.misses,
                                color: "rgba(247, 70, 74, 0.51)",
                                highlight: "#FF5A5E",
                                label: "Missed"
                            }, {
                                value: cacheData.hits,
                                color: "rgba(70, 191, 189, 0.59)",
                                highlight: "#5AD3D1",
                                label: "Hits"
                            }],
                            options: {},
                            width: 150
                        }),
                        _react2['default'].createElement(
                            'span',
                            { className: 'figure' },
                            health
                        )
                    )
                )
            ),
            _react2['default'].createElement(
                'div',
                null,
                'Uptime: ',
                this.formatUptime(cacheData.uptime)
            )
        );
    },

    renderClearButton: function renderClearButton(cacheData) {
        return _react2['default'].createElement(
            'div',
            { style: { paddingBottom: 10 } },
            _react2['default'].createElement(_materialUi.RaisedButton, {
                label: "Clear " + cacheData.namespace + " cache",
                onTouchTap: this.clearCache.bind(this, cacheData.namespace)
            })
        );
    },

    renderStatusPane: function renderStatusPane() {
        var overall = this.state.cacheStatuses.length ? this.renderCachePane(this.state.cacheStatuses[0]) : null;
        return _react2['default'].createElement(
            'div',
            { style: { padding: '0 20px' } },
            _react2['default'].createElement(
                'h3',
                null,
                'Status'
            ),
            _react2['default'].createElement(
                'div',
                null,
                overall
            ),
            _react2['default'].createElement(
                'h3',
                null,
                'Cache Control'
            ),
            _react2['default'].createElement(
                'div',
                null,
                this.state.cacheStatuses.map(this.renderClearButton.bind(this))
            )
        );
    },

    render: function render() {
        var pane = this.renderStatusPane();
        return _react2['default'].createElement(
            'div',
            { className: 'cache-server-panel', style: { height: '100%' } },
            _react2['default'].createElement(_corePluginEditor2['default'], _extends({}, this.props, {
                additionalPanes: { top: [], bottom: [pane] }
            }))
        );
    }

});

exports['default'] = CacheServerDashboard;
module.exports = exports['default'];
