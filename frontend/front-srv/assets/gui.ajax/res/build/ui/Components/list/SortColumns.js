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

"use strict";

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require("pydio");

var _pydio2 = _interopRequireDefault(_pydio);

var _menuIconButtonMenu = require('../menu/IconButtonMenu');

var _menuIconButtonMenu2 = _interopRequireDefault(_menuIconButtonMenu);

var _Pydio$requireLib = _pydio2["default"].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;

var SortColumns = (function (_React$Component) {
    _inherits(SortColumns, _React$Component);

    function SortColumns() {
        _classCallCheck(this, SortColumns);

        _React$Component.apply(this, arguments);
    }

    // static propTypes = {
    //     tableKeys           : React.PropTypes.object.isRequired,
    //     columnClicked       : React.PropTypes.func,
    //     sortingInfo         : React.PropTypes.object,
    //     displayMode         : React.PropTypes.string
    // };

    SortColumns.prototype.onMenuClicked = function onMenuClicked(object) {
        this.props.columnClicked(object.payload);
    };

    SortColumns.prototype.onHeaderClick = function onHeaderClick(key, callback) {
        var data = this.props.tableKeys[key];
        if (data && data['sortType'] && this.props.columnClicked) {
            data['name'] = key;
            this.props.columnClicked(data, callback);
        }
    };

    SortColumns.prototype.getColumnsItems = function getColumnsItems(displayMode) {
        var _this = this;

        var controller = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        var items = [];
        var _callback = function _callback() {
            if (controller) {
                controller.notify('actions_refreshed');
            }
        };

        var _loop = function (key) {
            if (!_this.props.tableKeys.hasOwnProperty(key)) {
                return "continue";
            }
            var data = _this.props.tableKeys[key];
            var style = data['width'] ? { width: data['width'] } : null;
            var icon = undefined;
            var className = 'cell header_cell cell-' + key;
            if (data['sortType']) {
                className += ' sortable';
                if (_this.props.sortingInfo && (_this.props.sortingInfo.attribute === key || _this.props.sortingInfo.attribute === data['sortAttribute'] || _this.props.sortingInfo.attribute === data['remoteSortAttribute'])) {
                    icon = _this.props.sortingInfo.direction === 'asc' ? 'mdi mdi-sort-ascending' : 'mdi mdi-sort-descending';
                    className += ' active-sort-' + _this.props.sortingInfo.direction;
                }
            }
            if (displayMode === 'menu') {
                data['name'] = key;
                items.push({
                    payload: data,
                    text: data['label'],
                    iconClassName: icon
                });
            } else if (displayMode === 'menu_data') {
                items.push({
                    name: data['label'],
                    callback: function callback() {
                        _this.onHeaderClick(key, _callback);
                    },
                    icon_class: icon || (data['sortType'] === 'number' ? 'mdi mdi-sort-numeric' : 'mdi mdi-sort-alphabetical') // '__INSET__'
                });
            } else {
                    items.push(_react2["default"].createElement(
                        "span",
                        {
                            key: key,
                            className: className,
                            style: style,
                            onClick: function () {
                                _this.onHeaderClick(key, _callback);
                            }
                        },
                        data['label']
                    ));
                }
        };

        for (var key in this.props.tableKeys) {
            var _ret = _loop(key);

            if (_ret === "continue") continue;
        }
        return items;
    };

    SortColumns.prototype.buildSortingMenuItems = function buildSortingMenuItems(controller) {
        return this.getColumnsItems('menu_data', controller);
    };

    SortColumns.prototype.componentDidMount = function componentDidMount() {

        var sortAction = new Action({
            name: 'sort_action',
            icon_class: 'mdi mdi-sort-descending',
            text_id: 450,
            title_id: 450,
            text: this.props.getMessage(450),
            title: this.props.getMessage(450),
            hasAccessKey: false,
            subMenu: true,
            subMenuUpdateImage: true,
            weight: 50
        }, {
            selection: false,
            dir: true,
            actionBar: true,
            actionBarGroup: 'display_toolbar',
            contextMenu: false,
            infoPanel: false
        }, {}, {}, {
            dynamicBuilder: this.buildSortingMenuItems.bind(this)
        });
        var buttons = new Map();
        buttons.set('sort_action', sortAction);
        this.props.pydio.getController().updateGuiActions(buttons);
    };

    SortColumns.prototype.componentWillUnmount = function componentWillUnmount() {
        this.props.pydio.getController().deleteFromGuiActions('sort_action');
    };

    SortColumns.prototype.render = function render() {
        var _this2 = this;

        if (this.props.displayMode === 'hidden') {
            return null;
        } else if (this.props.displayMode === 'menu') {
            return _react2["default"].createElement(_menuIconButtonMenu2["default"], { buttonTitle: "Sort by...", buttonClassName: "mdi mdi-sort-descending", menuItems: this.getColumnsItems('menu', this.props.pydio.getController()), onMenuClicked: function (o) {
                    return _this2.onMenuClicked(o);
                } });
        } else {
            return _react2["default"].createElement(
                "div",
                { className: "mui-toolbar-group mui-left" },
                this.getColumnsItems('header', this.props.pydio.getController())
            );
        }
    };

    return SortColumns;
})(_react2["default"].Component);

exports["default"] = SortColumns = PydioContextConsumer(SortColumns);
exports["default"] = SortColumns;
module.exports = exports["default"];
