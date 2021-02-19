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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('react');

var Component = _require.Component;

var _require2 = require('material-ui');

var FlatButton = _require2.FlatButton;
var FontIcon = _require2.FontIcon;

var _require3 = require('material-ui/styles');

var muiThemeable = _require3.muiThemeable;

var Color = require('color');
var PropTypes = require('prop-types');
var Pydio = require('pydio');

var _Pydio$requireLib = Pydio.requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;

var EmptyStateView = (function (_Component) {
    _inherits(EmptyStateView, _Component);

    function EmptyStateView(props, context) {
        _classCallCheck(this, EmptyStateView);

        _Component.call(this, props, context);
    }

    EmptyStateView.prototype.render = function render() {
        var _props = this.props;
        var style = _props.style;
        var iconClassName = _props.iconClassName;
        var primaryTextId = _props.primaryTextId;
        var secondaryTextId = _props.secondaryTextId;
        var actionLabelId = _props.actionLabelId;
        var actionCallback = _props.actionCallback;
        var actionStyle = _props.actionStyle;
        var actionIconClassName = _props.actionIconClassName;
        var getMessage = _props.getMessage;
        var iconStyle = _props.iconStyle;
        var legendStyle = _props.legendStyle;

        var mainColor = Color(this.props.muiTheme.palette.primary1Color);

        var styles = {
            container: _extends({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                flex: 1,
                backgroundColor: mainColor.lightness(97).rgb().toString()
            }, style),
            centered: {
                maxWidth: 280,
                textAlign: 'center',
                color: mainColor.fade(0.6).toString()
            },
            icon: _extends({
                fontSize: 100
            }, iconStyle),
            primaryText: _extends({
                fontSize: 16,
                fontWeight: 500
            }, legendStyle),
            secondaryText: {
                marginTop: 20,
                fontSize: 13
            },
            buttonContainer: {
                marginTop: 100,
                textAlign: 'center'
            },
            buttonStyle: {
                color: this.props.muiTheme.palette.accent2Color
            }
        };
        var buttonIcon = actionIconClassName ? React.createElement(FontIcon, { className: actionIconClassName }) : null;
        return React.createElement(
            'div',
            { style: styles.container },
            React.createElement(
                'div',
                { style: styles.centered },
                React.createElement('div', { className: iconClassName, style: styles.icon }),
                React.createElement(
                    'div',
                    { style: styles.primaryText },
                    getMessage(primaryTextId)
                ),
                secondaryTextId && React.createElement(
                    'div',
                    { style: styles.secondaryText },
                    getMessage(secondaryTextId)
                ),
                actionLabelId && actionCallback && React.createElement(
                    'div',
                    { style: _extends({}, styles.buttonContainer, actionStyle) },
                    React.createElement(FlatButton, { style: styles.buttonStyle, label: getMessage(actionLabelId), onTouchTap: actionCallback, icon: buttonIcon })
                )
            )
        );
    };

    return EmptyStateView;
})(Component);

EmptyStateView.propTypes = {

    pydio: PropTypes.instanceOf(Pydio).isRequired,
    iconClassName: PropTypes.string.isRequired,
    primaryTextId: PropTypes.string.isRequired,

    secondaryTextId: PropTypes.string,
    actionLabelId: PropTypes.string,
    actionCallback: PropTypes.func,
    actionStyle: PropTypes.object,

    style: PropTypes.object,
    iconStyle: PropTypes.object,
    legendStyle: PropTypes.object,
    getMessage: PropTypes.func

};

exports['default'] = EmptyStateView = PydioContextConsumer(EmptyStateView);
exports['default'] = EmptyStateView = muiThemeable()(EmptyStateView);

exports['default'] = EmptyStateView;
module.exports = exports['default'];
