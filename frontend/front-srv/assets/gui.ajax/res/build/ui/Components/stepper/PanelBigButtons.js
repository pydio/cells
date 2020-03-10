/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
    root: {
        paddingTop: 20
    },
    section: {
        container: {},
        title: {},
        description: {},
        actions: {}
    },
    action: {
        container: {},
        icon: {},
        title: {},
        description: {}
    },
    deleteButton: {},
    deleteIconProps: {
        style: {
            position: 'absolute',
            top: 0,
            right: 0
        },
        iconStyle: {
            color: '#bdbdbd',
            hoverColor: '#9e9e9e'
        }
    }
};

var css = '\n.react-mui-context .bbpanel .stepper-section-actions {\n    display: flex;\n    flex-wrap: wrap;\n}\n\n.react-mui-context .bbpanel .stepper-section-container {\n    margin-bottom: 30px;\n}\n\n.react-mui-context .bbpanel .stepper-section-title {\n    font-size: 13px;\n    font-weight: 500;\n    color: #455a64;\n    padding-bottom: 20px;    \n}\n\n.react-mui-context .bbpanel .stepper-action-container {\n    margin: 10px;\n    width: 230px;\n    height: 210px;\n    display: flex;\n    flex-direction: column;\n    font-size: 15px;\n    padding: 10px 20px;\n    border-radius: 6px !important;\n    box-shadow: 1px 10px 20px 0 rgba(40,60,75,.15);\n    cursor: pointer;\n    position:relative;\n}\n\n.react-mui-context .bbpanel .stepper-action-container:hover {\n    box-shadow: 1px 10px 20px 0 rgba(40,60,75,.3)\n}\n\n.react-mui-context .bbpanel .stepper-action-icon {\n    flex: 1;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}\n\n.react-mui-context .bbpanel .stepper-action-icon > span {\n    font-size: 50px !important;\n}\n\n.react-mui-context .bbpanel .stepper-action-title {\n    padding-bottom: 20px;\n    font-weight: 500;\n    text-align: center;\n    font-size: 16px;\n}\n\n.react-mui-context .bbpanel .stepper-action-description {\n    text-align: center;\n    font-weight: 300;\n    font-size: 13px;\n    padding-bottom: 10px;   \n}\n';

var PanelBigButtons = (function (_React$Component) {
    _inherits(PanelBigButtons, _React$Component);

    function PanelBigButtons(props) {
        _classCallCheck(this, PanelBigButtons);

        if (!props.model) {
            props.model = { Sections: [] };
        }
        _React$Component.call(this, props);
    }

    PanelBigButtons.prototype.stProps = function stProps(a, b) {
        return {
            style: styles[a][b],
            className: 'stepper-' + a + '-' + b
        };
    };

    PanelBigButtons.prototype.render = function render() {
        var _this = this;

        var _props = this.props;
        var model = _props.model;
        var style = _props.style;
        var onPick = _props.onPick;

        return _react2['default'].createElement(
            'div',
            { style: _extends({}, styles.root, style), className: "bbpanel" },
            model.Sections.map(function (ss) {
                return _react2['default'].createElement(
                    'div',
                    _this.stProps('section', 'container'),
                    _react2['default'].createElement(
                        'div',
                        _this.stProps('section', 'title'),
                        ss.title
                    ),
                    _react2['default'].createElement(
                        'div',
                        _this.stProps('section', 'description'),
                        ss.description
                    ),
                    _react2['default'].createElement(
                        'div',
                        _this.stProps('section', 'actions'),
                        ss.Actions.map(function (a) {
                            var d = a.description;
                            if (d && d.length > 70) {
                                d = _react2['default'].createElement(
                                    'span',
                                    { title: d },
                                    d.substr(0, 70) + "..."
                                );
                            }
                            return _react2['default'].createElement(
                                _materialUi.Paper,
                                _extends({ zDepth: 0 }, _this.stProps('action', 'container'), { onClick: function () {
                                        onPick(a.value);
                                    } }),
                                a.onDelete && _react2['default'].createElement(
                                    'div',
                                    _this.stProps('action', 'deleteButton'),
                                    _react2['default'].createElement(_materialUi.IconButton, _extends({
                                        iconClassName: "mdi mdi-close",
                                        tooltip: "Remove",
                                        onTouchTap: function (e) {
                                            a.onDelete();
                                        },
                                        onClick: function (e) {
                                            e.stopPropagation();e.preventDefault();
                                        }
                                    }, styles.deleteIconProps))
                                ),
                                _react2['default'].createElement(
                                    'div',
                                    _this.stProps('action', 'icon'),
                                    _react2['default'].createElement(_materialUi.FontIcon, { color: a.tint || '#03A9F4', className: a.icon })
                                ),
                                _react2['default'].createElement(
                                    'div',
                                    _this.stProps('action', 'title'),
                                    a.title
                                ),
                                _react2['default'].createElement(
                                    'div',
                                    _this.stProps('action', 'description'),
                                    d
                                )
                            );
                        })
                    )
                );
            }),
            _react2['default'].createElement('style', { type: "text/css", dangerouslySetInnerHTML: { __html: css } })
        );
    };

    return PanelBigButtons;
})(_react2['default'].Component);

exports['default'] = PanelBigButtons;
module.exports = exports['default'];
