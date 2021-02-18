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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

/**
 * Pagination component reading metadata "paginationData" from current node.
 */

var ListPaginator = (function (_React$Component) {
    _inherits(ListPaginator, _React$Component);

    // propTypes:{
    //     dataModel:React.PropTypes.instanceOf(PydioDataModel).isRequired,
    //     node:React.PropTypes.instanceOf(AjxpNode)
    // },

    function ListPaginator(props) {
        _classCallCheck(this, ListPaginator);

        _React$Component.call(this, props);
        this.state = { node: this.props.node };
    }

    ListPaginator.prototype.componentDidMount = function componentDidMount() {
        var _this = this;

        if (!this.props.node) {
            (function () {
                var dm = _this.props.dataModel;
                _this._dmObserver = function () {
                    _this.setState({ node: dm.getContextNode() });
                };
                dm.observe("context_changed", _this._dmObserver);
                _this.setState({ node: dm.getContextNode() });
            })();
        }
    };

    ListPaginator.prototype.componentWillUnmount = function componentWillUnmount() {
        if (this._dmObserver) {
            this.props.dataModel.stopObserving("context_changed", this._dmObserver);
        }
    };

    ListPaginator.prototype.changePage = function changePage(event) {
        this.state.node.getMetadata().get("paginationData").set("new_page", event.currentTarget.getAttribute('data-page'));
        this.props.dataModel.requireContextChange(this.state.node);
    };

    ListPaginator.prototype.onMenuChange = function onMenuChange(event, index, value) {
        this.state.node.getMetadata().get("paginationData").set("new_page", value);
        this.props.dataModel.requireContextChange(this.state.node);
    };

    ListPaginator.prototype.render = function render() {
        var _this2 = this;

        var node = this.state.node;
        var _props = this.props;
        var toolbarDisplay = _props.toolbarDisplay;
        var toolbarColor = _props.toolbarColor;
        var smallDisplay = _props.smallDisplay;
        var style = _props.style;
        var id = _props.id;

        if (!node || !node.getMetadata().get("paginationData")) {
            return null;
        }
        var pData = node.getMetadata().get("paginationData");
        var current = parseInt(pData.get("current"));
        var total = parseInt(pData.get("total"));
        var pages = [],
            next = undefined,
            last = undefined,
            previous = undefined,
            first = undefined;
        var pageWord = _pydio2['default'].getMessages()['331'];
        for (var i = 1; i <= total; i++) {
            pages.push(_react2['default'].createElement(_materialUi.MenuItem, {
                value: i,
                primaryText: pageWord + ' ' + i + (i === current ? ' / ' + total : '')
            }));
        }
        if (pages.length <= 1) {
            return null;
        }
        var whiteStyle = undefined;
        var smallButtonsLabel = undefined,
            smallButtonsIcStyle = undefined;
        if (toolbarDisplay) {
            whiteStyle = { color: toolbarColor ? toolbarColor : 'white' };
            if (smallDisplay) {
                smallButtonsLabel = { fontSize: 13 };
                smallButtonsIcStyle = { fontSize: 20 };
            }
        }

        previous = _react2['default'].createElement(_materialUi.IconButton, {
            onTouchTap: function () {
                _this2.onMenuChange(null, 0, current - 1);
            },
            iconClassName: "mdi mdi-chevron-left",
            disabled: current === 1,
            iconStyle: _extends({}, whiteStyle, smallButtonsIcStyle),
            style: smallDisplay ? { marginRight: -20, width: 40, height: 40 } : null
        });
        next = _react2['default'].createElement(_materialUi.IconButton, {
            onTouchTap: function () {
                _this2.onMenuChange(null, 0, current + 1);
            },
            iconClassName: "mdi mdi-chevron-right",
            disabled: current === total,
            style: smallDisplay ? { marginLeft: -40, width: 40, height: 40 } : { marginLeft: -20 },
            iconStyle: _extends({}, whiteStyle, smallButtonsIcStyle)
        });

        return _react2['default'].createElement(
            'div',
            { id: id, style: _extends({ display: 'flex', alignItems: 'center' }, style) },
            previous,
            _react2['default'].createElement(
                _materialUi.DropDownMenu,
                {
                    style: { width: 150, marginTop: -6 },
                    onChange: this.onMenuChange,
                    value: current,
                    underlineStyle: { display: 'none' },
                    labelStyle: _extends({}, whiteStyle, smallButtonsLabel)
                },
                pages
            ),
            next
        );
    };

    return ListPaginator;
})(_react2['default'].Component);

exports['default'] = ListPaginator;
module.exports = exports['default'];
