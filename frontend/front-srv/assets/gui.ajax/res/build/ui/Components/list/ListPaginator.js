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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _utilMessagesConsumerMixin = require('../util/MessagesConsumerMixin');

var _utilMessagesConsumerMixin2 = _interopRequireDefault(_utilMessagesConsumerMixin);

/**
 * Pagination component reading metadata "paginationData" from current node.
 */
exports['default'] = _react2['default'].createClass({
    displayName: 'ListPaginator',

    mixins: [_utilMessagesConsumerMixin2['default']],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(PydioDataModel).isRequired,
        node: _react2['default'].PropTypes.instanceOf(AjxpNode)
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        if (!this.props.node) {
            (function () {
                var dm = _this.props.dataModel;
                _this._dmObserver = (function () {
                    this.setState({ node: dm.getContextNode() });
                }).bind(_this);
                dm.observe("context_changed", _this._dmObserver);
                _this.setState({ node: dm.getContextNode() });
            })();
        }
    },

    componentWillUnmount: function componentWillUnmount() {
        if (this._dmObserver) {
            this.props.dataModel.stopObserving("context_changed", this._dmObserver);
        }
    },

    getInitialState: function getInitialState() {
        return { node: this.props.node };
    },

    changePage: function changePage(event) {
        this.state.node.getMetadata().get("paginationData").set("new_page", event.currentTarget.getAttribute('data-page'));
        this.props.dataModel.requireContextChange(this.state.node);
    },

    onMenuChange: function onMenuChange(event, index, value) {
        this.state.node.getMetadata().get("paginationData").set("new_page", value);
        this.props.dataModel.requireContextChange(this.state.node);
    },

    render: function render() {
        var _this2 = this;

        if (!this.state.node || !this.state.node.getMetadata().get("paginationData")) {
            return null;
        }
        var pData = this.state.node.getMetadata().get("paginationData");
        var current = parseInt(pData.get("current"));
        var total = parseInt(pData.get("total"));
        var pages = [],
            next = undefined,
            last = undefined,
            previous = undefined,
            first = undefined;
        var pageWord = this.context.getMessage ? this.context.getMessage('331', '') : this.props.getMessage('331', '');
        for (var i = 1; i <= total; i++) {
            pages.push(_react2['default'].createElement(_materialUi.MenuItem, {
                value: i,
                primaryText: pageWord + ' ' + i + (i === current ? ' / ' + total : '')
            }));
        }
        if (pages.length <= 1) {
            return null;
        }
        previous = _react2['default'].createElement(_materialUi.IconButton, { onTouchTap: function () {
                _this2.onMenuChange(null, 0, current - 1);
            }, iconClassName: "mdi mdi-chevron-left", disabled: current === 1 });
        next = _react2['default'].createElement(_materialUi.IconButton, { onTouchTap: function () {
                _this2.onMenuChange(null, 0, current + 1);
            }, iconClassName: "mdi mdi-chevron-right", disabled: current === total, style: { marginLeft: -20 } });

        return _react2['default'].createElement(
            'div',
            { id: this.props.id, style: _extends({ display: 'flex', alignItems: 'center' }, this.props.style) },
            previous,
            _react2['default'].createElement(
                _materialUi.DropDownMenu,
                {
                    style: { width: 150, marginTop: -6 },
                    onChange: this.onMenuChange,
                    value: current,
                    underlineStyle: { display: 'none' },
                    labelStyle: { color: 'white' }
                },
                pages
            ),
            next
        );
    }

});
module.exports = exports['default'];
