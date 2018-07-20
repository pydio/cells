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

var _Utils = require('./Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _IconButtonMenu = require('./IconButtonMenu');

var _IconButtonMenu2 = _interopRequireDefault(_IconButtonMenu);

var _ButtonMenu = require('./ButtonMenu');

var _ButtonMenu2 = _interopRequireDefault(_ButtonMenu);

var _IconButtonPopover = require('./IconButtonPopover');

var _IconButtonPopover2 = _interopRequireDefault(_IconButtonPopover);

var _materialUi = require('material-ui');

exports['default'] = _react2['default'].createClass({
    displayName: 'Toolbar',

    propTypes: {
        toolbars: _react2['default'].PropTypes.array,
        groupOtherList: _react2['default'].PropTypes.array,
        renderingType: _react2['default'].PropTypes.string,
        controller: _react2['default'].PropTypes.instanceOf(Controller),
        toolbarStyle: _react2['default'].PropTypes.object,
        buttonStyle: _react2['default'].PropTypes.object,
        fabAction: _react2['default'].PropTypes.string,
        buttonMenuNoLabel: _react2['default'].PropTypes.bool
    },

    componentDidMount: function componentDidMount() {
        this._observer = (function () {
            if (!this.isMounted()) return;
            this.setState({
                groups: this.props.controller.getToolbarsActions(this.props.toolbars, this.props.groupOtherList)
            });
        }).bind(this);
        if (this.props.controller === pydio.Controller) {
            pydio.observe("actions_refreshed", this._observer);
        } else {
            this.props.controller.observe("actions_refreshed", this._observer);
        }
    },

    componentWillUnmount: function componentWillUnmount() {
        if (this.props.controller === pydio.Controller) {
            pydio.stopObserving("actions_refreshed", this._observer);
        } else {
            this.props.controller.stopObserving("actions_refreshed", this._observer);
        }
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        if (nextProps.toolbars !== this.props.toolbars) {
            this.setState({
                groups: this.props.controller.getToolbarsActions(nextProps.toolbars, nextProps.groupOtherList)
            });
        }
    },

    getInitialState: function getInitialState() {
        return {
            groups: this.props.controller.getToolbarsActions(this.props.toolbars, this.props.groupOtherList)
        };
    },

    getDefaultProps: function getDefaultProps() {
        return {
            controller: global.pydio.Controller,
            renderingType: 'button',
            groupOtherList: []
        };
    },

    render: function render() {
        var groups = this.state.groups;

        var actions = [];
        var _props = this.props;
        var toolbars = _props.toolbars;
        var renderingType = _props.renderingType;
        var groupOtherList = _props.groupOtherList;
        var buttonStyle = _props.buttonStyle;
        var tooltipPosition = _props.tooltipPosition;
        var controller = _props.controller;
        var fabAction = _props.fabAction;
        var toolbarStyle = _props.toolbarStyle;
        var buttonMenuNoLabel = _props.buttonMenuNoLabel;
        var buttonMenuPopoverDirection = _props.buttonMenuPopoverDirection;
        var flatButtonStyle = _props.flatButtonStyle;

        var allToolbars = [].concat(toolbars);
        if (groupOtherList.length) {
            allToolbars = allToolbars.concat(['MORE_ACTION']);
        }
        allToolbars.map(function (barName) {
            if (!groups.has(barName)) return;
            groups.get(barName).map(function (action) {
                if (action.deny) return;
                var menuItems = undefined,
                    popoverContent = undefined,
                    menuTitle = undefined,
                    menuIcon = undefined;
                var actionName = action.options.name;

                menuTitle = action.options.text;
                menuIcon = action.options.icon_class;

                if (barName === 'MORE_ACTION') {
                    (function () {
                        var subItems = action.subMenuItems.dynamicItems;
                        var items = [];
                        subItems.map(function (obj) {
                            if (obj.separator) {
                                items.push(obj);
                            } else if (obj.actionId && !obj.actionId.deny) {
                                items.push(obj.actionId.getMenuData());
                            }
                        });
                        menuItems = _Utils2['default'].pydioActionsToItems(items);
                    })();
                } else if (action.subMenuItems.staticItems) {
                    menuItems = _Utils2['default'].pydioActionsToItems(action.subMenuItems.staticItems);
                } else if (action.subMenuItems.dynamicBuilder) {
                    menuItems = _Utils2['default'].pydioActionsToItems(action.subMenuItems.dynamicBuilder(controller));
                } else if (action.subMenuItems.popoverContent) {
                    popoverContent = action.subMenuItems.popoverContent;
                } else {}
                var id = 'action-' + action.options.name;
                if (renderingType === 'button-icon') {
                    menuTitle = _react2['default'].createElement(
                        'span',
                        { className: 'button-icon' },
                        _react2['default'].createElement('span', { className: "button-icon-icon " + menuIcon }),
                        _react2['default'].createElement(
                            'span',
                            { className: 'button-icon-label' },
                            menuTitle
                        )
                    );
                }
                if (menuItems) {
                    if (renderingType === 'button' || renderingType === 'button-icon') {
                        actions.push(_react2['default'].createElement(_ButtonMenu2['default'], {
                            key: actionName,
                            className: id,
                            buttonTitle: buttonMenuNoLabel ? '' : menuTitle,
                            menuItems: menuItems,
                            buttonLabelStyle: buttonStyle,
                            direction: buttonMenuPopoverDirection
                        }));
                    } else {
                        actions.push(_react2['default'].createElement(_IconButtonMenu2['default'], {
                            key: actionName,
                            className: id,
                            onMenuClicked: function (object) {
                                object.payload();
                            },
                            buttonClassName: menuIcon,
                            buttonTitle: menuTitle,
                            menuItems: menuItems,
                            buttonStyle: buttonStyle,
                            popoverDirection: buttonMenuPopoverDirection
                        }));
                    }
                } else if (popoverContent) {
                    actions.push(_react2['default'].createElement(_IconButtonPopover2['default'], {
                        key: actionName,
                        className: id,
                        buttonClassName: menuIcon,
                        buttonTitle: menuTitle,
                        buttonStyle: buttonStyle,
                        popoverContent: popoverContent
                    }));
                } else {
                    var click = function click(synthEvent) {
                        action.apply();
                    };
                    if (fabAction && fabAction === actionName) {
                        actions.push(_react2['default'].createElement(_materialUi.FloatingActionButton, {
                            key: actionName,
                            onTouchTap: click,
                            iconClassName: menuIcon,
                            mini: true,
                            backgroundColor: toolbarStyle.backgroundColor,
                            style: { position: 'absolute', top: -20, left: 10 }
                        }));
                    } else if (renderingType === 'button-icon') {
                        actions.push(_react2['default'].createElement(ReactMUI.FlatButton, {
                            key: actionName,
                            className: id,
                            onTouchTap: click,
                            label: menuTitle,
                            labelStyle: buttonStyle
                        }));
                    } else if (renderingType === 'button') {
                        actions.push(_react2['default'].createElement(_materialUi.FlatButton, {
                            key: actionName,
                            className: id,
                            onTouchTap: click,
                            label: menuTitle,
                            labelStyle: buttonStyle,
                            style: flatButtonStyle
                        }));
                    } else {
                        actions.push(_react2['default'].createElement(_materialUi.IconButton, {
                            key: actionName,
                            iconClassName: menuIcon + ' ' + id,
                            iconStyle: buttonStyle,
                            onTouchTap: click,
                            tooltip: menuTitle,
                            tooltipPosition: tooltipPosition
                        }));
                    }
                }
            });
        });
        var cName = this.props.className ? this.props.className : '';
        cName += ' ' + 'toolbar';
        if (!actions.length) {
            cName += ' empty-toolbar';
        }
        var style = _extends({}, toolbarStyle);
        return _react2['default'].createElement(
            'div',
            { className: cName, style: style, id: this.props.id },
            actions
        );
    }

});
module.exports = exports['default'];
