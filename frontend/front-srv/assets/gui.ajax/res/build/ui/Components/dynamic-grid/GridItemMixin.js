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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

exports['default'] = {

    propTypes: {
        showCloseAction: React.PropTypes.bool,
        onCloseAction: React.PropTypes.func
    },

    focusItem: function focusItem() {
        this.setState({ focus: true });
    },

    blurItem: function blurItem() {
        this.setState({ focus: false });
    },

    mergeStyleWithFocus: function mergeStyleWithFocus() {
        return _extends({}, this.props.style, { zIndex: this.state.focus ? 1 : null });
    },

    getInitialSate: function getInitialSate() {
        return { focus: false, showCloseAction: false };
    },

    toggleEditMode: function toggleEditMode() {
        var value = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

        if (value === undefined) {
            this.setState({ showCloseAction: !(this.state && this.state.showCloseAction) });
        } else {
            this.setState({ showCloseAction: value });
        }
    },

    getCloseButton: function getCloseButton() {
        if (this.state && this.state.showCloseAction) {
            var closeAction = this.props.onCloseAction || function () {};
            var overlayStyle = {
                position: 'absolute',
                backgroundColor: 'rgba(0,0,0,0.53)',
                zIndex: 10,
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            };
            return React.createElement(
                'div',
                { style: overlayStyle },
                React.createElement(_materialUi.FlatButton, {
                    label: _pydio2['default'].getInstance().MessageHash['ajxp_admin.home.48'],
                    className: 'card-close-button',
                    onTouchTap: closeAction,
                    style: { color: 'white' }
                })
            );
        } else {
            return null;
        }
    },

    statics: {
        getGridLayout: function getGridLayout(x, y) {
            return {
                x: x || 0,
                y: y || 0,
                w: this.gridWidth || 4,
                h: this.gridHeight || 12,
                isResizable: false
            };
        },
        hasBuilderFields: function hasBuilderFields() {
            return this.builderFields ? true : false;
        },
        getBuilderFields: function getBuilderFields() {
            return this.builderFields;
        }
    }

};
module.exports = exports['default'];
