'use strict';

exports.__esModule = true;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelDataModel = require('pydio/model/data-model');

/**
 * Get info from Pydio controller an build an
 * action bar with active actions.
 * TBC
 */

var SimpleReactActionBar = (function (_React$Component) {
    _inherits(SimpleReactActionBar, _React$Component);

    function SimpleReactActionBar() {
        _classCallCheck(this, SimpleReactActionBar);

        _React$Component.apply(this, arguments);
    }

    SimpleReactActionBar.prototype.clickAction = function clickAction(event) {
        var pydio = _pydio2['default'].getInstance();
        var actionName = event.currentTarget.getAttribute("data-action");
        var _props = this.props;
        var dataModel = _props.dataModel;
        var node = _props.node;

        dataModel.setSelectedNodes([node]);
        var a = pydio.Controller.getActionByName(actionName);
        a.fireContextChange(dataModel, true, pydio.user);
        a.apply([dataModel]);
        event.stopPropagation();
        event.preventDefault();
    };

    SimpleReactActionBar.prototype.render = function render() {
        var actions = this.props.actions.map((function (a) {
            var _this = this;

            return _react2['default'].createElement('div', {
                key: a.options.name,
                className: a.options.icon_class + ' material-list-action-inline' || '',
                title: a.options.title,
                'data-action': a.options.name,
                onClick: function (e) {
                    return _this.clickAction(e);
                } });
        }).bind(this));
        return _react2['default'].createElement(
            'span',
            null,
            actions
        );
    };

    _createClass(SimpleReactActionBar, null, [{
        key: 'propTypes',
        value: {
            dataModel: _propTypes2['default'].instanceOf(_pydioModelDataModel.PydioDataModel).isRequired,
            node: _propTypes2['default'].instanceOf(_pydioModelNode.Node).isRequired,
            actions: _propTypes2['default'].array
        },
        enumerable: true
    }]);

    return SimpleReactActionBar;
})(_react2['default'].Component);

exports['default'] = SimpleReactActionBar;
module.exports = exports['default'];
