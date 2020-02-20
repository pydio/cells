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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var _Pydio$requireLib2 = _pydio2['default'].requireLib("hoc");

var ModernStyles = _Pydio$requireLib2.ModernStyles;

/**
 * Simple material table
 * columns are objects of shape {name, label, style, headerStyle}
 */

var MaterialTable = (function (_React$Component) {
    _inherits(MaterialTable, _React$Component);

    function MaterialTable(props) {
        _classCallCheck(this, MaterialTable);

        _React$Component.call(this, props);
        this.state = {};
    }

    MaterialTable.prototype.onRowSelection = function onRowSelection(indexes) {
        var _this = this;

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
                var pagination = _this.computePagination();
                var src = data;
                if (pagination.use) {
                    src = src.slice(pagination.sliceStart, pagination.sliceEnd);
                }
                var selection = [];
                indexes.map(function (i) {
                    selection.push(src[i]);
                });
                onSelectRows(selection);
            })();
        }
    };

    MaterialTable.prototype.computePagination = function computePagination() {
        var _props2 = this.props;
        var data = _props2.data;
        var paginate = _props2.paginate;
        var defaultPageSize = _props2.defaultPageSize;

        if (!paginate || !data || !data.length) {
            return { use: false };
        }
        var pageSize = this.state.pageSize || defaultPageSize || paginate[0];
        if (data.length <= pageSize) {
            return { use: false };
        }
        var _state$page = this.state.page;
        var page = _state$page === undefined ? 1 : _state$page;

        var max = Math.ceil(data.length / pageSize);
        var sliceStart = (page - 1) * pageSize;
        var sliceEnd = Math.min(page * pageSize, data.length);
        var pages = [];
        for (var i = 1; i <= max; i++) {
            pages.push(i);
        }
        return {
            use: true,
            sliceStart: sliceStart,
            sliceEnd: sliceEnd,
            pages: pages,
            page: page,
            pageSize: pageSize,
            pageSizes: paginate
        };
    };

    MaterialTable.prototype.renderPagination = function renderPagination(pagination) {
        var _this2 = this;

        var data = this.props.data;
        var page = pagination.page;
        var pageSize = pagination.pageSize;
        var pages = pagination.pages;
        var pageSizes = pagination.pageSizes;
        var sliceStart = pagination.sliceStart;
        var sliceEnd = pagination.sliceEnd;

        return _react2['default'].createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#757575' } },
            pageSizes.length > 1 && _react2['default'].createElement(
                'div',
                { style: { paddingRight: 10 } },
                'Rows per page :'
            ),
            pageSizes.length > 1 && _react2['default'].createElement(
                'div',
                { style: { width: 90 } },
                _react2['default'].createElement(
                    _materialUi.SelectField,
                    _extends({}, ModernStyles.selectField, { fullWidth: true, value: pageSize, onChange: function (e, i, v) {
                            return _this2.setState({ page: 1, pageSize: v });
                        } }),
                    pageSizes.map(function (ps) {
                        return _react2['default'].createElement(_materialUi.MenuItem, { value: ps, primaryText: ps });
                    })
                )
            ),
            _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-chevron-left", disabled: page === 1, onTouchTap: function () {
                    return _this2.setState({ page: page - 1 });
                } }),
            _react2['default'].createElement(
                'div',
                null,
                sliceStart + 1,
                '-',
                sliceEnd,
                ' of ',
                data.length
            ),
            _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-chevron-right", disabled: page === pages.length, onTouchTap: function () {
                    return _this2.setState({ page: page + 1 });
                } })
        );
    };

    MaterialTable.prototype.render = function render() {
        var _props3 = this.props;
        var columns = _props3.columns;
        var deselectOnClickAway = _props3.deselectOnClickAway;
        var emptyStateString = _props3.emptyStateString;
        var _props3$masterStyles = _props3.masterStyles;
        var masterStyles = _props3$masterStyles === undefined ? {} : _props3$masterStyles;
        var emptyStateStyle = _props3.emptyStateStyle;
        var onSelectRows = _props3.onSelectRows;
        var computeRowStyle = _props3.computeRowStyle;
        var data = this.props.data;
        var showCheckboxes = this.props.showCheckboxes;

        var pagination = this.computePagination();
        var paginator = undefined;
        if (pagination.use) {
            data = data.slice(pagination.sliceStart, pagination.sliceEnd);
            paginator = this.renderPagination(pagination);
        }

        var rows = data.map(function (model) {
            var rowStyle = undefined;
            if (computeRowStyle) {
                rowStyle = computeRowStyle(model);
            }
            if (model.Subheader) {
                var headerStyle = _extends({
                    fontSize: 12, color: '#616161', backgroundColor: '#FAFAFA', fontWeight: 500
                }, model.style);
                return _react2['default'].createElement(
                    _materialUi.TableRow,
                    { className: "media-small-hide", style: _extends({}, masterStyles.row) },
                    _react2['default'].createElement(
                        _materialUi.TableRowColumn,
                        { colSpan: columns.length, style: headerStyle },
                        model.Subheader
                    )
                );
            }
            if (model.colSpan) {
                return _react2['default'].createElement(
                    _materialUi.TableRow,
                    { style: _extends({}, model.rowStyle, masterStyles.row) },
                    _react2['default'].createElement(
                        _materialUi.TableRowColumn,
                        { colSpan: columns.length, style: _extends({ height: 'auto', paddingLeft: 0, paddingRight: 0, backgroundColor: 'transparent' }, model.cellStyle) },
                        model.element
                    )
                );
            }
            return _react2['default'].createElement(
                _materialUi.TableRow,
                { selectable: onSelectRows !== undefined, style: _extends({}, rowStyle, masterStyles.row) },
                columns.map(function (column) {
                    var value = model[column.name];
                    if (column.useMoment && value) {
                        value = moment(new Date(parseInt(value) * 1000)).fromNow();
                    } else if (column.renderCell) {
                        value = column.renderCell(model);
                    }
                    return _react2['default'].createElement(
                        _materialUi.TableRowColumn,
                        {
                            style: column.style || {},
                            title: value,
                            className: column.hideSmall ? 'media-small-hide' : null },
                        value
                    );
                })
            );
        });
        var headers = columns.map(function (column) {
            return _react2['default'].createElement(
                _materialUi.TableHeaderColumn,
                {
                    style: _extends({}, column.headerStyle, { height: 48, backgroundColor: '#F5F5F5', fontWeight: 500 }, masterStyles.head),
                    className: column.hideSmall ? 'media-small-hide' : null
                },
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
                    { colSpan: columns.length, style: emptyStateStyle },
                    emptyStateString
                )
            )];
        }
        if (data.length && data[0].Subheader || emptyStateString && !rows.length) {
            // Add fake first line to fix width
            rows.unshift(_react2['default'].createElement(
                _materialUi.TableRow,
                { style: _extends({ borderBottom: 'none', height: 0 }, masterStyles.row) },
                columns.map(function (col) {
                    var s = col.style || {};
                    return _react2['default'].createElement(_materialUi.TableRowColumn, { style: _extends({}, s, { height: 0 }), className: col.hideSmall ? 'media-small-hide' : null });
                })
            ));
        }

        var hideHeaders = this.props.hideHeaders;

        return _react2['default'].createElement(
            _materialUi.Table,
            { onRowSelection: this.onRowSelection.bind(this), multiSelectable: showCheckboxes },
            !hideHeaders && _react2['default'].createElement(
                _materialUi.TableHeader,
                { displaySelectAll: showCheckboxes, adjustForCheckbox: showCheckboxes, enableSelectAll: showCheckboxes },
                _react2['default'].createElement(
                    _materialUi.TableRow,
                    { style: masterStyles.row },
                    headers
                )
            ),
            _react2['default'].createElement(
                _materialUi.TableBody,
                { deselectOnClickaway: deselectOnClickAway, displayRowCheckbox: showCheckboxes },
                rows
            ),
            paginator && _react2['default'].createElement(
                _materialUi.TableFooter,
                null,
                _react2['default'].createElement(
                    _materialUi.TableRow,
                    { style: { backgroundColor: '#fafafa' } },
                    _react2['default'].createElement(
                        _materialUi.TableRowColumn,
                        { colSpan: columns.length },
                        paginator
                    )
                )
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
