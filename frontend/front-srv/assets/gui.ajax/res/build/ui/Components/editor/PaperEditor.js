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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

/**
 * Two columns layout used for Workspaces and Plugins editors
 */
var PaperEditorLayout = _react2['default'].createClass({
    displayName: 'PaperEditorLayout',

    propTypes: {
        title: _react2['default'].PropTypes.any,
        titleActionBar: _react2['default'].PropTypes.any,
        leftNav: _react2['default'].PropTypes.any,
        contentFill: _react2['default'].PropTypes.bool,
        className: _react2['default'].PropTypes.string
    },

    toggleMenu: function toggleMenu() {
        var crtLeftOpen = this.state && this.state.forceLeftOpen;
        this.setState({ forceLeftOpen: !crtLeftOpen });
    },

    render: function render() {

        var styles = {
            title: {
                backgroundColor: '#455A64',
                borderRadius: '2px 2px 0 0',
                display: 'flex'
            },
            titleH2: {
                color: 'white',
                flex: 1,
                fontSize: 26,
                padding: '14px 12px 10px',
                marginBottom: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            },
            titleBar: {
                marginTop: 15,
                marginRight: 16
            }
        };

        return _react2['default'].createElement(
            'div',
            { className: "paper-editor-content layout-fill vertical-layout" + (this.props.className ? ' ' + this.props.className : '') },
            _react2['default'].createElement(
                'div',
                { className: 'paper-editor-title', style: styles.title },
                _react2['default'].createElement(
                    'h2',
                    { style: styles.titleH2 },
                    this.props.title,
                    ' ',
                    _react2['default'].createElement(
                        'div',
                        { className: 'left-picker-toggle' },
                        _react2['default'].createElement(_materialUi.IconButton, { iconClassName: 'icon-caret-down', onClick: this.toggleMenu })
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: styles.titleBar },
                    this.props.titleActionBar
                )
            ),
            _react2['default'].createElement(
                'div',
                { className: 'layout-fill main-layout-nav-to-stack' },
                this.props.leftNav && _react2['default'].createElement(
                    'div',
                    { className: "paper-editor-left" + (this.state && this.state.forceLeftOpen ? ' picker-open' : ''), onClick: this.toggleMenu },
                    this.props.leftNav
                ),
                _react2['default'].createElement(
                    'div',
                    { className: "layout-fill paper-editor-right" + (this.props.contentFill ? ' vertical-layout' : ''), style: this.props.contentFill ? {} : { overflowY: 'auto' } },
                    this.props.children
                )
            )
        );
    }
});
/**
 * Navigation subheader used by PaperEditorLayout
 */
var PaperEditorNavHeader = _react2['default'].createClass({
    displayName: 'PaperEditorNavHeader',

    propTypes: {
        label: _react2['default'].PropTypes.string
    },

    render: function render() {

        return _react2['default'].createElement(
            'div',
            { className: "mui-subheader", style: { fontSize: 13, fontWeight: 500, color: 'rgba(0, 0, 0, 0.25)', lineHeight: '48px', paddingLeft: 16 } },
            this.props.children,
            this.props.label
        );
    }

});
/**
 * Navigation entry used by PaperEditorLayout.
 */
var PaperEditorNavEntry = _react2['default'].createClass({
    displayName: 'PaperEditorNavEntry',

    propTypes: {
        keyName: _react2['default'].PropTypes.string.isRequired,
        onClick: _react2['default'].PropTypes.func.isRequired,
        label: _react2['default'].PropTypes.string,
        selectedKey: _react2['default'].PropTypes.string,
        isLast: _react2['default'].PropTypes.bool,
        // Drop Down Data
        dropDown: _react2['default'].PropTypes.bool,
        dropDownData: _react2['default'].PropTypes.object,
        dropDownChange: _react2['default'].PropTypes.func,
        dropDownDefaultItems: _react2['default'].PropTypes.array
    },

    onClick: function onClick() {
        this.props.onClick(this.props.keyName);
    },

    captureDropDownClick: function captureDropDownClick() {
        if (this.preventClick) {
            this.preventClick = false;
            return;
        }
        this.props.onClick(this.props.keyName);
    },

    dropDownChange: function dropDownChange(event, index, item) {
        this.preventClick = true;
        this.props.dropDownChange(item);
    },

    render: function render() {

        if (!this.props.dropDown || !this.props.dropDownData) {
            return _react2['default'].createElement(
                'div',
                {
                    className: 'menu-entry' + (this.props.keyName == this.props.selectedKey ? ' menu-entry-selected' : '') + (this.props.isLast ? ' last' : ''),
                    onClick: this.onClick },
                this.props.children,
                this.props.label
            );
        }

        // dropDown & dropDownData are loaded
        var menuItemsTpl = [{ text: this.props.label, payload: '-1' }];
        if (this.props.dropDownDefaultItems) {
            menuItemsTpl = menuItemsTpl.concat(this.props.dropDownDefaultItems);
        }
        this.props.dropDownData.forEach(function (v, k) {
            menuItemsTpl.push({ text: v.label, payload: v });
        });
        return _react2['default'].createElement(
            'div',
            { onClick: this.captureDropDownClick, className: 'menu-entry-dropdown' + (this.props.keyName == this.props.selectedKey ? ' menu-entry-selected' : '') + (this.props.isLast ? ' last' : '') },
            _react2['default'].createElement(_materialUi.DropDownMenu, {
                menuItems: menuItemsTpl,
                className: 'dropdown-full-width',
                style: { width: 256 },
                autoWidth: false,
                onChange: this.dropDownChange
            })
        );
    }
});

exports.PaperEditorLayout = PaperEditorLayout;
exports.PaperEditorNavEntry = PaperEditorNavEntry;
exports.PaperEditorNavHeader = PaperEditorNavHeader;
