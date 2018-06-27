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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var _require = require('material-ui');

var List = _require.List;
var ListItem = _require.ListItem;
var FlatButton = _require.FlatButton;
var Paper = _require.Paper;
var Divider = _require.Divider;

var PydioApi = require('pydio/http/api');

var _require$requireLib = require('pydio').requireLib('boot');

var Loader = _require$requireLib.Loader;
var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

var _require$requireLib2 = require('pydio').requireLib('components');

var ClipboardTextField = _require$requireLib2.ClipboardTextField;
var MaterialTable = _require$requireLib2.MaterialTable;

var DiagnosticDashboard = (function (_React$Component) {
    _inherits(DiagnosticDashboard, _React$Component);

    function DiagnosticDashboard(props, context) {
        _classCallCheck(this, DiagnosticDashboard);

        _get(Object.getPrototypeOf(DiagnosticDashboard.prototype), 'constructor', this).call(this, props, context);
        this.state = { loaded: false, entries: {}, copy: false };
    }

    _createClass(DiagnosticDashboard, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            if (this.state.loaded) return;
            this.setState({ loading: true });
            PydioApi.getClient().request({
                get_action: 'ls',
                dir: this.props.access || '/admin/php',
                format: 'json'
            }, function (transport) {
                var resp = transport.responseJSON;
                if (!resp || !resp.children) return;
                _this.setState({ loaded: true, loading: false, entries: resp.children });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state;
            var entries = _state.entries;
            var loading = _state.loading;
            var copy = _state.copy;

            var columns = [{ name: 'label', label: 'Label', style: { fontSize: 15, width: '30%' }, headerStyle: { width: '30%' } }, { name: 'info', label: 'Info' }];
            var tableData = [];
            var content = undefined,
                copyPanel = undefined,
                copyContent = '';
            if (loading) {
                content = React.createElement(Loader, null);
            } else {
                (function () {
                    var listItems = [];
                    Object.keys(entries).forEach(function (k) {
                        var entry = entries[k];
                        var data = entry.data;
                        if (typeof data === 'boolean') {
                            data = data ? 'Yes' : 'No';
                        }
                        listItems.push(React.createElement(ListItem, {
                            key: k,
                            primaryText: entry.label,
                            secondaryText: data,
                            disabled: true

                        }));
                        listItems.push(React.createElement(Divider, null));
                        copyContent += entry.label + ' : ' + data + '\n';
                        tableData.push({
                            label: entry.label,
                            info: data
                        });
                    });
                    if (listItems.length) {
                        listItems.pop();
                    }
                    content = React.createElement(
                        List,
                        null,
                        listItems
                    );
                    content = React.createElement(MaterialTable, {
                        data: tableData,
                        columns: columns,
                        onSelectRows: function () {},
                        showCheckboxes: false
                    });
                })();
            }

            if (copy) {
                copyPanel = React.createElement(
                    Paper,
                    { zDepth: 2, style: { position: 'absolute', top: '15%', left: '20%', width: '60%', padding: '20px 20px 0', height: 370, overflowY: 'auto', zIndex: 2 } },
                    React.createElement(
                        'div',
                        { style: { fontSize: 20 } },
                        'Copy Diagnostic'
                    ),
                    React.createElement(ClipboardTextField, { rows: 5, rowsMax: 10, multiLine: true, inputValue: copyContent, floatingLabelText: this.props.getMessage('5', 'settings'), getMessage: this.props.getMessage }),
                    React.createElement(
                        'div',
                        { style: { textAlign: 'right' } },
                        React.createElement(FlatButton, { label: 'Close', onTouchTap: function () {
                                _this2.setState({ copy: false });
                            }, secondary: true })
                    )
                );
            }

            return React.createElement(
                'div',
                { style: { height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' } },
                React.createElement(AdminComponents.Header, {
                    title: this.props.getMessage('5', 'settings'),
                    icon: "mdi mdi-stethoscope",
                    actions: React.createElement(FlatButton, { label: 'Copy', onTouchTap: function () {
                            _this2.setState({ copy: true });
                        }, secondary: true, style: { marginRight: 16 } }),
                    loading: loading
                }),
                copyPanel,
                React.createElement(
                    'div',
                    { style: { flex: 1, overflowY: 'auto' } },
                    React.createElement(
                        Paper,
                        { zDepth: 1, style: { margin: 16 } },
                        content
                    )
                )
            );
        }
    }]);

    return DiagnosticDashboard;
})(React.Component);

exports['default'] = DiagnosticDashboard = PydioContextConsumer(DiagnosticDashboard);
exports['default'] = DiagnosticDashboard;
module.exports = exports['default'];
