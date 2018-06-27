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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var Dashboard = _react2['default'].createClass({
    displayName: 'Dashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    keys: {
        'date': { label: 'Date', message: '17' },
        'ip': { label: 'IP', message: '18' },
        'level': { label: 'Level', message: '19' },
        'user': { label: 'User', message: '20' },
        'action': { label: 'Action', message: '21' },
        'source': { label: 'Source', message: '22' },
        'params': { label: 'More Info', message: '22a' }
    },

    componentDidMount: function componentDidMount() {
        Object.keys(this.keys).map((function (k) {
            this.keys[k]['label'] = this.context.getMessage(this.keys[k]['message'], 'settings');
        }).bind(this));
    },

    getInitialState: function getInitialState() {
        return {
            currentDate: new Date(),
            currentNode: this.dateToLogNode(new Date())
        };
    },

    openLogDate: function openLogDate(event, jsDate) {
        this.setState({
            currentDate: jsDate,
            currentNode: this.dateToLogNode(jsDate)
        });
    },

    nodeSelected: function nodeSelected(node) {
        this.setState({ selectedLog: node }, (function () {
            this.refs.dialog.show();
        }).bind(this));
        return false;
    },

    clearNodeSelected: function clearNodeSelected() {
        this.setState({ selectedLog: null }, (function () {
            this.refs.dialog.dismiss();
        }).bind(this));
    },

    renderActions: function renderActions(node) {
        return null;
    },

    dateToLogNode: function dateToLogNode(date) {
        var dateY = date.getFullYear();
        var dateM = date.getMonth() + 1;
        var dateD = date.getDate();
        var path = "/admin/logs/" + dateY + "/" + dateM + "/" + dateY + "-" + dateM + "-" + dateD;
        return new AjxpNode(path);
    },

    currentIsToday: function currentIsToday() {
        var d = new Date();
        var c = this.state.currentDate;
        return d.getFullYear() == c.getFullYear() && d.getMonth() == c.getMonth() && d.getDate() == c.getDate();
    },

    changeFilter: function changeFilter(event) {
        var keys = this.keys;
        var filter = event.target.value.toLowerCase();
        if (!filter) {
            this.setState({ filterNodes: function filterNodes(node) {
                    return true;
                } });
        } else {
            this.setState({ filterNodes: function filterNodes(node) {
                    var res = false;
                    for (var k in keys) {
                        if (keys.hasOwnProperty(k)) {
                            var val = node.getMetadata().get(k);
                            if (val && val.toLowerCase().indexOf(filter) !== -1) res = true;
                        }
                    }
                    return res;
                } });
        }
    },

    openExporter: function openExporter() {
        this.props.pydio.UI.openComponentInModal('EnterpriseComponents', 'LogsExporter');
    },

    render: function render() {
        var maxDate = new Date();
        var dialogButtons = [{ text: this.context.getMessage('48', ''), onClick: this.clearNodeSelected }];
        var dialogContent;
        if (this.state.selectedLog) {
            var items = Object.keys(this.keys).map((function (k) {
                var value = this.state.selectedLog.getMetadata().get(k);
                var label = this.context.getMessage(this.keys[k].message, 'settings');
                return _react2['default'].createElement(
                    'div',
                    { className: 'log-detail' },
                    _react2['default'].createElement(
                        'div',
                        { className: 'log-detail-label' },
                        label
                    ),
                    _react2['default'].createElement(
                        'div',
                        { className: 'log-detail-value' },
                        value
                    )
                );
            }).bind(this));
            dialogContent = _react2['default'].createElement(
                'div',
                null,
                items
            );
        }
        var exportButton = _react2['default'].createElement(_materialUi.RaisedButton, { label: this.context.getMessage("logs.11"), onTouchTap: this.openExporter });
        if (!ResourcesManager.moduleIsAvailable('EnterpriseComponents')) {
            exportButton = _react2['default'].createElement(_materialUi.RaisedButton, { label: this.context.getMessage("logs.11"), disabled: true });
        }

        var headerActions = _react2['default'].createElement(
            'div',
            { style: { marginTop: -10 } },
            _react2['default'].createElement(
                'div',
                { style: { float: 'right', padding: '28px 10px 0' } },
                exportButton
            ),
            _react2['default'].createElement(
                'div',
                { className: 'logger-filterInput' },
                _react2['default'].createElement(ReactMUI.TextField, {
                    onChange: this.changeFilter,
                    floatingLabelText: this.context.getMessage('logs.3')
                })
            ),
            _react2['default'].createElement(
                'div',
                { className: 'logger-dateInput' },
                _react2['default'].createElement(
                    'div',
                    { className: 'datepicker-legend' },
                    this.context.getMessage('logs.2')
                ),
                _react2['default'].createElement(ReactMUI.DatePicker, {
                    ref: 'logDate',
                    onChange: this.openLogDate,
                    key: 'start',
                    autoOk: true,
                    maxDate: maxDate,
                    defaultDate: this.state.currentDate,
                    showYearSelector: true })
            )
        );

        return _react2['default'].createElement(
            'div',
            { className: 'vertical-layout logs-dashboard', style: { height: '100%' } },
            _react2['default'].createElement(
                ReactMUI.Dialog,
                {
                    ref: 'dialog',
                    title: this.context.getMessage('logs.5'),
                    actions: dialogButtons,
                    contentClassName: 'dialog-max-480'
                },
                dialogContent
            ),
            _react2['default'].createElement(AdminComponents.Header, {
                title: this.context.getMessage('logs.1'),
                icon: 'mdi mdi-pulse',
                actions: headerActions
            }),
            _react2['default'].createElement(PydioComponents.SimpleList, {
                node: this.state.currentNode,
                dataModel: this.props.dataModel,
                className: 'logs-list layout-fill',
                actionBarGroups: [],
                infineSliceCount: 1000,
                tableKeys: this.keys,
                entryRenderActions: this.renderActions,
                filterNodes: this.state.filterNodes,
                autoRefresh: this.currentIsToday() ? 10000 : null,
                reloadAtCursor: true,
                openEditor: this.nodeSelected,
                elementHeight: {
                    "max-width:480px": 201,
                    "(min-width:480px) and (max-width:760px)": 80,
                    "min-width:760px": PydioComponents.SimpleList.HEIGHT_ONE_LINE
                }
            })
        );
    }

});

exports['default'] = Dashboard;
module.exports = exports['default'];
