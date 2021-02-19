'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PropTypes = require('prop-types');
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

var _require = require('react');

var Component = _require.Component;

var _require2 = require('material-ui');

var FlatButton = _require2.FlatButton;

var _require3 = require('material-ui/styles');

var muiThemeable = _require3.muiThemeable;

exports['default'] = function (PydioComponent, displayName) {
    var gridDimension = arguments.length <= 2 || arguments[2] === undefined ? { gridWidth: 4, gridHeight: 12 } : arguments[2];
    var builderFields = arguments.length <= 3 || arguments[3] === undefined ? undefined : arguments[3];

    var originalDisplayName = PydioComponent.displayName || PydioComponent.name;
    PydioComponent = muiThemeable()(PydioComponent);

    var GridItem = (function (_Component) {
        _inherits(GridItem, _Component);

        function GridItem(props, context) {
            _classCallCheck(this, GridItem);

            _Component.call(this, props, context);
            this.state = { focus: false, showCloseAction: false };
        }

        GridItem.prototype.focusItem = function focusItem() {
            this.setState({ focus: true });
        };

        GridItem.prototype.blurItem = function blurItem() {
            this.setState({ focus: false });
        };

        GridItem.prototype.mergeStyleWithFocus = function mergeStyleWithFocus() {
            return _extends({}, this.props.style, { zIndex: this.state.focus ? 1 : null });
        };

        GridItem.prototype.toggleEditMode = function toggleEditMode() {
            var value = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

            if (value === undefined) {
                this.setState({ showCloseAction: !(this.state && this.state.showCloseAction) });
            } else {
                this.setState({ showCloseAction: value });
            }
        };

        GridItem.prototype.getCloseButton = function getCloseButton() {
            var closeAction = function closeAction() {};
            if (this.props.onCloseAction) {
                closeAction = this.props.onCloseAction;
            }
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
                React.createElement(FlatButton, {
                    label: this.props.pydio.MessageHash['ajxp_admin.home.48'],
                    className: 'card-close-button',
                    onClick: closeAction,
                    style: { color: 'white' }
                })
            );
        };

        GridItem.prototype.render = function render() {
            var props = _extends({}, this.props, {
                style: this.mergeStyleWithFocus(),
                closeButton: this.state.showCloseAction ? this.getCloseButton() : null,
                onFocusItem: this.focusItem.bind(this),
                onBlurItem: this.blurItem.bind(this)
            });
            return React.createElement(PydioComponent, props);
        };

        return GridItem;
    })(Component);

    GridItem.propTypes = {
        onCloseAction: PropTypes.func
    };

    GridItem.displayName = originalDisplayName;
    GridItem.builderDisplayName = displayName;

    GridItem.getGridLayout = function (x, y) {
        return {
            x: x || 0,
            y: y || 0,
            w: gridDimension.gridWidth || 4,
            h: gridDimension.gridHeight || 12,
            isResizable: false
        };
    };

    GridItem.hasBuilderFields = function () {
        return builderFields !== undefined;
    };
    GridItem.getBuilderFields = function () {
        return builderFields;
    };

    return GridItem;
};

module.exports = exports['default'];
