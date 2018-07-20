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

var styles = {
    card: {
        backgroundColor: 'white'
    }
};

var CardsStates = {};

/**
 * Default InfoPanel Card
 */

var InfoPanelCard = (function (_React$Component) {
    _inherits(InfoPanelCard, _React$Component);

    function InfoPanelCard(props) {
        _classCallCheck(this, InfoPanelCard);

        _React$Component.call(this, props);
        if (props.identifier && CardsStates[props.identifier] !== undefined) {
            this.state = { open: CardsStates[props.identifier] };
        } else {
            this.state = { open: true };
        }
    }

    InfoPanelCard.prototype.toggle = function toggle() {
        var newState = !this.state.open;
        this.setState({ open: newState });
        if (this.props.identifier) {
            CardsStates[this.props.identifier] = newState;
        }
    };

    InfoPanelCard.prototype.render = function render() {
        var _this = this;

        var open = this.state.open;

        var icon = _react2['default'].createElement(
            'div',
            { className: 'panelIcon', style: { position: 'absolute', right: 2, top: open ? 8 : 2 } },
            _react2['default'].createElement(_materialUi.IconButton, { onClick: function () {
                    _this.toggle();
                }, iconClassName: "mdi mdi-chevron-" + (open ? 'up' : 'down') })
        );

        var openStyle = undefined;
        if (!open) {
            openStyle = { paddingTop: 16 };
        }
        var title = this.props.title ? _react2['default'].createElement(
            _materialUi.Paper,
            { zDepth: 0, className: 'panelHeader', style: _extends({ position: 'relative' }, openStyle) },
            icon,
            this.props.title
        ) : null;
        var actions = this.props.actions ? _react2['default'].createElement(
            'div',
            { className: 'panelActions' },
            this.props.actions
        ) : null;
        var rows = undefined,
            toolBar = undefined;
        if (this.props.standardData) {
            rows = this.props.standardData.map(function (object) {
                return _react2['default'].createElement(
                    'div',
                    { className: 'infoPanelRow', key: object.key },
                    _react2['default'].createElement(
                        'div',
                        { className: 'infoPanelLabel' },
                        object.label
                    ),
                    _react2['default'].createElement(
                        'div',
                        { className: 'infoPanelValue' },
                        object.value
                    )
                );
            });
        }
        if (this.props.primaryToolbars) {
            var themePalette = this.props.muiTheme.palette;
            var tBarStyle = {
                backgroundColor: themePalette.accent2Color,
                justifyContent: 'flex-end',
                position: 'relative'
            };
            toolBar = _react2['default'].createElement(PydioComponents.Toolbar, {
                toolbarStyle: tBarStyle,
                flatButtonStyle: { minWidth: 0 },
                buttonStyle: { color: 'white', paddingRight: 8, paddingLeft: 8 },
                className: 'primaryToolbar',
                renderingType: 'button',
                toolbars: this.props.primaryToolbars,
                controller: this.props.pydio.getController(),
                fabAction: "share_react",
                buttonMenuNoLabel: true,
                buttonMenuPopoverDirection: "right"
            });
        }

        return _react2['default'].createElement(
            _materialUi.Paper,
            { zDepth: 1, className: 'panelCard', style: _extends({}, this.props.style, styles.card) },
            title,
            open && _react2['default'].createElement(
                'div',
                { className: 'panelContent', style: this.props.contentStyle },
                this.props.children,
                rows,
                toolBar
            ),
            open && actions
        );
    };

    return InfoPanelCard;
})(_react2['default'].Component);

InfoPanelCard.PropTypes = {
    identifier: _react2['default'].PropTypes.string,
    title: _react2['default'].PropTypes.string,
    actions: _react2['default'].PropTypes.array
};

exports['default'] = InfoPanelCard = MaterialUI.Style.muiThemeable()(InfoPanelCard);

exports['default'] = InfoPanelCard;
module.exports = exports['default'];
