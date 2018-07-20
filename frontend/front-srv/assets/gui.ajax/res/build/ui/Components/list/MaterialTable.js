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

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var moment = _Pydio$requireLib.moment;

/**
 * Simple material table
 * columns are objects of shape {name, label, style, headerStyle}
 */

var MaterialTable = (function (_React$Component) {
    _inherits(MaterialTable, _React$Component);

    function MaterialTable() {
        _classCallCheck(this, MaterialTable);

        _React$Component.apply(this, arguments);
    }

    MaterialTable.prototype.onRowSelection = function onRowSelection(indexes) {
        var _props = this.props;
        var data = _props.data;
        var onSelectRows = _props.onSelectRows;

        if (!onSelectRows) {
            return;
        }
        if (indexes === 'none') {
            onSelectRows([]);
        } else if (indexes === 'all') {
            onSelectRows(data);
        } else {
            (function () {
                var selection = [];
                indexes.map(function (i) {
                    selection.push(data[i]);
                });
                onSelectRows(selection);
            })();
        }
    };

    MaterialTable.prototype.render = function render() {
        var _props2 = this.props;
        var columns = _props2.columns;
        var data = _props2.data;
        var deselectOnClickAway = _props2.deselectOnClickAway;
        var emptyStateString = _props2.emptyStateString;
        var onSelectRows = _props2.onSelectRows;
        var computeRowStyle = _props2.computeRowStyle;
        var showCheckboxes = this.props.showCheckboxes;

        var rows = data.map(function (model) {
            var rowStyle = undefined;
            if (computeRowStyle) {
                rowStyle = computeRowStyle(model);
            }
            return _react2['default'].createElement(
                _materialUi.TableRow,
                { selectable: onSelectRows !== undefined, style: rowStyle },
                columns.map(function (column) {
                    var value = model[column.name];
                    if (column.useMoment && value) {
                        value = moment(new Date(parseInt(value) * 1000)).fromNow();
                    } else if (column.renderCell) {
                        value = column.renderCell(model);
                    }
                    return _react2['default'].createElement(
                        _materialUi.TableRowColumn,
                        { style: column.style || {}, title: value },
                        value
                    );
                })
            );
        });
        var headers = columns.map(function (column) {
            return _react2['default'].createElement(
                _materialUi.TableHeaderColumn,
                { style: column.headerStyle || {} },
                column.label
            );
        });
        if (emptyStateString && !rows.length) {
            showCheckboxes = false;
            rows = [_react2['default'].createElement(
                _materialUi.TableRow,
                null,
                _react2['default'].createElement(
                    _materialUi.TableRowColumn,
                    { colspan: columns.length },
                    emptyStateString
                )
            )];
        }

        return _react2['default'].createElement(
            _materialUi.Table,
            { onRowSelection: this.onRowSelection.bind(this), multiSelectable: showCheckboxes },
            _react2['default'].createElement(
                _materialUi.TableHeader,
                { displaySelectAll: showCheckboxes, adjustForCheckbox: showCheckboxes, enableSelectAll: showCheckboxes },
                _react2['default'].createElement(
                    _materialUi.TableRow,
                    null,
                    headers
                )
            ),
            _react2['default'].createElement(
                _materialUi.TableBody,
                { deselectOnClickaway: deselectOnClickAway, displayRowCheckbox: showCheckboxes },
                rows
            )
        );
    };

    return MaterialTable;
})(_react2['default'].Component);

MaterialTable.PropTypes = {
    data: _react2['default'].PropTypes.array,
    columns: _react2['default'].PropTypes.array,
    onSelectRows: _react2['default'].PropTypes.func,
    emptyStateString: _react2['default'].PropTypes.string
};

exports['default'] = MaterialTable;
module.exports = exports['default'];
