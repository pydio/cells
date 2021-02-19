'use strict';

exports.__esModule = true;

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

var React = require('react');

var _require = require('material-ui');

var IconButton = _require.IconButton;
var Popover = _require.Popover;

var IconButtonPopover = (function (_React$Component) {
    _inherits(IconButtonPopover, _React$Component);

    function IconButtonPopover(props, context) {
        _classCallCheck(this, IconButtonPopover);

        _React$Component.call(this, props, context);
        this.state = { showPopover: false };
    }

    IconButtonPopover.prototype.showPopover = function showPopover(event) {
        this.setState({
            showPopover: true,
            anchor: event.currentTarget
        });
    };

    IconButtonPopover.prototype.render = function render() {
        var _this = this;

        return React.createElement(
            'span',
            { className: "toolbars-button-menu " + (this.props.className ? this.props.className : '') },
            React.createElement(IconButton, {
                ref: 'menuButton',
                tooltip: this.props.buttonTitle,
                iconClassName: this.props.buttonClassName,
                onTouchTap: this.showPopover.bind(this),
                iconStyle: this.props.buttonStyle
            }),
            React.createElement(
                Popover,
                {
                    open: this.state.showPopover,
                    anchorEl: this.state.anchor,
                    anchorOrigin: { horizontal: this.props.direction || 'right', vertical: 'bottom' },
                    targetOrigin: { horizontal: this.props.direction || 'right', vertical: 'top' },
                    onRequestClose: function () {
                        _this.setState({ showPopover: false });
                    },
                    useLayerForClickAway: false
                },
                this.props.popoverContent
            )
        );
    };

    return IconButtonPopover;
})(React.Component);

IconButtonPopover.propTypes = {
    buttonTitle: PropTypes.string.isRequired,
    buttonClassName: PropTypes.string.isRequired,
    className: PropTypes.string,
    direction: PropTypes.oneOf(['right', 'left']),
    popoverContent: PropTypes.object.isRequired
};

exports['default'] = IconButtonPopover;
module.exports = exports['default'];
