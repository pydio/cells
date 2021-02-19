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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var ThemeableTitle = (function (_React$Component) {
    _inherits(ThemeableTitle, _React$Component);

    function ThemeableTitle() {
        _classCallCheck(this, ThemeableTitle);

        _get(Object.getPrototypeOf(ThemeableTitle.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ThemeableTitle, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var pydio = _props.pydio;
            var filterByType = _props.filterByType;
            var muiTheme = _props.muiTheme;

            var messages = pydio.MessageHash;
            var bgColor = filterByType === 'entries' ? muiTheme.palette.primary1Color : MaterialUI.Style.colors.teal500;
            var title = messages[filterByType === 'entries' ? 468 : 469];
            var cardTitleStyle = { backgroundColor: bgColor, color: 'white', padding: 16, fontSize: 24, lineHeight: '36px' };

            return React.createElement(
                MaterialUI.Paper,
                { zDepth: 0, rounded: false, style: cardTitleStyle },
                title
            );
        }
    }]);

    return ThemeableTitle;
})(React.Component);

ThemeableTitle = MaterialUI.Style.muiThemeable()(ThemeableTitle);

var WorkspacesListCard = (function (_React$Component2) {
    _inherits(WorkspacesListCard, _React$Component2);

    function WorkspacesListCard() {
        _classCallCheck(this, WorkspacesListCard);

        _get(Object.getPrototypeOf(WorkspacesListCard.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(WorkspacesListCard, [{
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var filterByType = _props2.filterByType;

            var props = _extends({}, this.props);
            if (props.style) {
                props.style = _extends({}, props.style, { overflowY: 'auto', zIndex: 1 });
            }

            var blackAndWhiteTitle = React.createElement(MaterialUI.CardTitle, { title: pydio.MessageHash[filterByType === 'entries' ? 468 : 469] });
            var themedTitle = React.createElement(ThemeableTitle, this.props);

            return React.createElement(
                MaterialUI.Paper,
                _extends({ zDepth: 1 }, props, { transitionEnabled: false, rounded: false }),
                this.props.closeButton,
                React.createElement(
                    'div',
                    { style: { height: '100%', display: 'flex', flexDirection: 'column' } },
                    React.createElement(PydioWorkspaces.WorkspacesListMaterial, {
                        className: "vertical_fit filter-" + filterByType,
                        pydio: pydio,
                        workspaces: pydio.user ? pydio.user.getRepositoriesList() : [],
                        showTreeForWorkspace: false,
                        filterByType: this.props.filterByType,
                        sectionTitleStyle: { display: 'none' },
                        style: { flex: 1, overflowY: 'auto' }
                    })
                )
            );
        }
    }]);

    return WorkspacesListCard;
})(React.Component);

exports['default'] = WorkspacesListCard;
module.exports = exports['default'];
