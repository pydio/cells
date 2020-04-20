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

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var moment = _Pydio$requireLib.moment;

var _Pydio$requireLib2 = _pydio2['default'].requireLib("hoc");

var ModernStyles = _Pydio$requireLib2.ModernStyles;

var Sorter = (function () {
    function Sorter(state, onSort) {
        var defaultCol = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
        var defaultDir = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

        _classCallCheck(this, Sorter);

        this.state = _extends({}, state);
        if (!state.sortCol && defaultCol) {
            state.sortCol = defaultCol;
            state.sortDir = defaultDir || 'asc';
        }
        this.onSort = onSort;
    }

    /**
     * Simple material table
     * columns are objects of shape {name, label, style, headerStyle}
     */

    Sorter.prototype.renderHeader = function renderHeader(name, label) {
        var _this = this;

        var _state = this.state;
        var sortCol = _state.sortCol;
        var sortDir = _state.sortDir;

        var hStyle = { cursor: 'pointer', position: 'relative' };
        var icStyle = { left: -17, position: 'absolute' };
        if (sortCol !== name || sortDir === '') {
            return _react2['default'].createElement(
                'span',
                { onClick: function () {
                        _this.onSort(name, 'asc');
                    }, style: hStyle },
                label
            );
        }
        var header = label;
        if (sortDir === 'asc') {
            header = _react2['default'].createElement(
                'span',
                { onClick: function () {
                        _this.onSort(name, 'desc');
                    }, style: hStyle },
                label,
                ' ',
                _react2['default'].createElement('span', { style: icStyle, className: "mdi mdi-arrow-up" })
            );
        } else if (sortDir === 'desc') {
            header = _react2['default'].createElement(
                'span',
                { onClick: function () {
                        _this.onSort(name, '');
                    }, style: hStyle },
                label,
                ' ',
                _react2['default'].createElement('span', { style: icStyle, className: "mdi mdi-arrow-down" })
            );
        }
        return header;
    };

    Sorter.prototype.setData = function setData(columns, data) {
        this.columns = columns;
        this.data = data;
    };

    Sorter.prototype.sorted = function sorted() {
        var _state2 = this.state;
        var sortCol = _state2.sortCol;
        var sortDir = _state2.sortDir;

        if (!sortCol || !sortDir) {
            return this.data;
        }
        var data = [].concat(this.data);
        var col = this.columns.filter(function (c) {
            return c.name === sortCol;
        })[0];
        var sorter = col.sorter;
        if (!sorter) {
            return this.data;
        }
        data.sort(function (a, b) {
            var cpa = undefined,
                cpb = undefined;
            if (sorter.value) {
                cpa = sorter.value(a);
                cpb = sorter.value(b);
            } else if (col.renderCell) {
                cpa = col.renderCell(a);
                cpb = col.renderCell(b);
            } else {
                cpa = a[sortCol];
                cpb = b[sortCol];
            }
            if (sorter.type === 'string') {
                if (!cpa) cpa = '';
                if (!cpb) cpb = '';
                cpa = cpa.toLowerCase();
                cpb = cpb.toLowerCase();
            } else if (sorter.type === 'number') {
                cpa = parseInt(cpa);
                cpb = parseInt(cpb);
            }
            if (sortDir === 'asc') {
                return cpa > cpb ? 1 : cpa < cpb ? -1 : 0;
            } else {
                return cpa < cpb ? 1 : cpa > cpb ? -1 : 0;
            }
        });
        return data;
    };

    return Sorter;
})();

var MaterialTable = (function (_React$Component) {
    _inherits(MaterialTable, _React$Component);

    function MaterialTable(props) {
        _classCallCheck(this, MaterialTable);

        _React$Component.call(this, props);
        this.state = {};
    }

    MaterialTable.prototype.onRowSelection = function onRowSelection(indexes) {
        var _this2 = this;

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
                var src = data;
                var sorter = _this2.computeSorter();
                if (sorter) {
                    src = sorter.sorted();
                }
                var pagination = _this2.computePagination();
                if (pagination.use) {
                    src = src.slice(pagination.sliceStart, pagination.sliceEnd);
                }
                var selection = [];
                indexes.map(function (i) {
                    // Find if previous data has expanded rows : do not count them in for selection
                    var expanded = src.slice(0, i).filter(function (d) {
                        return d.expandedRow;
                    }).length;
                    if (expanded) {
                        i -= expanded;
                    }
                    selection.push(src[i]);
                });
                onSelectRows(selection);
            })();
        }
    };

    MaterialTable.prototype.computeSorter = function computeSorter() {
        var _this3 = this;

        var _props2 = this.props;
        var columns = _props2.columns;
        var data = _props2.data;

        var sorter = undefined;
        var withSorter = columns.filter(function (c) {
            return c.sorter;
        });
        if (withSorter.length) {
            var defaultSortColumn = withSorter[0].name;
            var defaultSorter = withSorter.filter(function (c) {
                return c.sorter['default'];
            });
            if (defaultSorter.length) {
                defaultSortColumn = defaultSorter[0].name;
            }
            sorter = new Sorter(this.state, function (sortCol, sortDir) {
                _this3.setState({ sortCol: sortCol, sortDir: sortDir });
            }, defaultSortColumn);
            sorter.setData(columns, data);
        }
        return sorter;
    };

    MaterialTable.prototype.computePagination = function computePagination() {
        var _props3 = this.props;
        var data = _props3.data;
        var paginate = _props3.paginate;
        var defaultPageSize = _props3.defaultPageSize;
        var pagination = _props3.pagination;

        if (pagination) {
            // externally managed
            return _extends({}, pagination, { use: true });
        }
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
        var _this4 = this;

        var data = this.props.data;
        var page = pagination.page;
        var pageSize = pagination.pageSize;
        var pages = pagination.pages;
        var pageSizes = pagination.pageSizes;
        var sliceStart = pagination.sliceStart;
        var sliceEnd = pagination.sliceEnd;
        var nextDisabled = pagination.nextDisabled;
        var prevDisabled = pagination.prevDisabled;
        var onPageNext = pagination.onPageNext;
        var onPagePrev = pagination.onPagePrev;
        var onPageSizeChange = pagination.onPageSizeChange;

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
                            if (onPageSizeChange) {
                                onPageSizeChange(v);
                            } else {
                                _this4.setState({ page: 1, pageSize: v });
                            }
                        } }),
                    pageSizes.map(function (ps) {
                        return _react2['default'].createElement(_materialUi.MenuItem, { value: ps, primaryText: ps });
                    })
                )
            ),
            onPagePrev && _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-chevron-left", disabled: prevDisabled, onTouchTap: function () {
                    return onPagePrev();
                } }),
            !onPagePrev && _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-chevron-left", disabled: page === 1, onTouchTap: function () {
                    return _this4.setState({ page: page - 1 });
                } }),
            (sliceStart || sliceEnd) && _react2['default'].createElement(
                'div',
                null,
                sliceStart + 1,
                '-',
                sliceEnd,
                ' of ',
                data.length
            ),
            onPageNext && _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-chevron-right", disabled: nextDisabled, onTouchTap: function () {
                    return onPageNext();
                } }),
            !onPageNext && _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-chevron-right", disabled: page === pages.length, onTouchTap: function () {
                    return _this4.setState({ page: page + 1 });
                } })
        );
    };

    MaterialTable.prototype.render = function render() {
        var _props4 = this.props;
        var columns = _props4.columns;
        var deselectOnClickAway = _props4.deselectOnClickAway;
        var emptyStateString = _props4.emptyStateString;
        var _props4$masterStyles = _props4.masterStyles;
        var masterStyles = _props4$masterStyles === undefined ? {} : _props4$masterStyles;
        var emptyStateStyle = _props4.emptyStateStyle;
        var onSelectRows = _props4.onSelectRows;
        var computeRowStyle = _props4.computeRowStyle;
        var actions = this.props.actions;
        var _props5 = this.props;
        var data = _props5.data;
        var showCheckboxes = _props5.showCheckboxes;

        var actionsColor = masterStyles.actionsColor || 'rgba(0,0,0,.33)';

        // Detect sorting info
        var sorter = this.computeSorter();
        if (sorter) {
            data = sorter.sorted();
        }

        var pagination = this.computePagination();
        var paginator = undefined;
        if (pagination.use) {
            data = data.slice(pagination.sliceStart, pagination.sliceEnd);
            paginator = this.renderPagination(pagination);
        }

        var actionsColumn = undefined,
            actionsSpan = 0;
        if (actions && actions.length) {
            actionsColumn = true;
            actionsSpan = 1;
        }

        var rows = [];
        data.map(function (model) {
            var rowStyle = undefined;
            if (computeRowStyle) {
                rowStyle = computeRowStyle(model);
            }
            if (model.Subheader) {
                var headerStyle = _extends({
                    fontSize: 12, color: '#616161', backgroundColor: '#FAFAFA', fontWeight: 500
                }, model.style);
                rows.push(_react2['default'].createElement(
                    _materialUi.TableRow,
                    { className: "media-small-hide", style: _extends({}, masterStyles.row) },
                    _react2['default'].createElement(
                        _materialUi.TableRowColumn,
                        { colSpan: columns.length + actionsSpan, style: headerStyle },
                        model.Subheader
                    )
                ));
                return;
            }
            if (model.colSpan) {
                rows.push(_react2['default'].createElement(
                    _materialUi.TableRow,
                    { style: _extends({}, model.rowStyle, masterStyles.row) },
                    _react2['default'].createElement(
                        _materialUi.TableRowColumn,
                        { colSpan: columns.length + actionsSpan, style: _extends({ height: 'auto', paddingLeft: 0, paddingRight: 0, backgroundColor: 'transparent' }, model.cellStyle) },
                        model.element
                    )
                ));
                return;
            }
            var mainRowStyle = _extends({}, rowStyle, masterStyles.row);
            if (model.expandedRow) {
                mainRowStyle = _extends({}, mainRowStyle, masterStyles.expanderRow);
            }
            rows.push(_react2['default'].createElement(
                _materialUi.TableRow,
                { selectable: onSelectRows !== undefined, style: mainRowStyle },
                columns.map(function (column) {
                    var value = model[column.name];
                    var tip = value;
                    if (column.useMoment && value) {
                        value = moment(new Date(parseInt(value) * 1000)).fromNow();
                        tip = value;
                    } else if (column.renderCell) {
                        value = column.renderCell(model);
                        if (value && typeof value === 'object' && value.element && value.text) {
                            tip = value.text;
                            value = value.element;
                        }
                    }
                    return _react2['default'].createElement(
                        _materialUi.TableRowColumn,
                        {
                            style: column.style || {},
                            title: typeof tip === 'object' ? null : tip,
                            className: column.hideSmall ? 'media-small-hide' : null },
                        value
                    );
                }),
                actionsColumn && _react2['default'].createElement(
                    _materialUi.TableRowColumn,
                    { style: { overflow: 'visible', textOverflow: 'none', width: actions.length * 48 + 32 } },
                    actions.map(function (a) {
                        return _react2['default'].createElement(_materialUi.IconButton, {
                            style: { padding: 14 },
                            iconStyle: { fontSize: 20, color: actionsColor },
                            onTouchTap: function () {
                                a.onTouchTap(model);
                            },
                            iconClassName: a.iconClassName,
                            tooltip: a.tooltip,
                            disabled: a.disable ? a.disable(model) : null,
                            onClick: function (e) {
                                return e.stopPropagation();
                            }
                        });
                    })
                )
            ));
            if (model.expandedRow) {
                rows.push(_react2['default'].createElement(
                    _materialUi.TableRow,
                    { selectable: false, style: _extends({}, masterStyles.row, masterStyles.expandedRow) },
                    _react2['default'].createElement(
                        _materialUi.TableRowColumn,
                        { colSpan: columns.length + actionsSpan, style: _extends({ height: 'auto', paddingLeft: 0, paddingRight: 0, backgroundColor: 'transparent' }, model.cellStyle) },
                        model.expandedRow
                    )
                ));
            }
        });
        var headers = columns.map(function (column) {
            var label = column.label;
            if (sorter && column.sorter) {
                label = sorter.renderHeader(column.name, column.label);
            }
            return _react2['default'].createElement(
                _materialUi.TableHeaderColumn,
                {
                    style: _extends({}, column.headerStyle, { height: 48, backgroundColor: '#F5F5F5', fontWeight: 500 }, masterStyles.head),
                    className: column.hideSmall ? 'media-small-hide' : null
                },
                label
            );
        });
        if (actionsColumn) {
            headers.push(_react2['default'].createElement(_materialUi.TableHeaderColumn, { style: { width: 48 * actions.length + 32 } }));
        }
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
