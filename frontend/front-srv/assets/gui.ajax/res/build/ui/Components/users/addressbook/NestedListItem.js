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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _materialUi = require('material-ui');

/**
 * Left panel of the address book
 * Display treeview hierarchy of users, teams, groups.
 */

var NestedListItem = (function (_Component) {
    _inherits(NestedListItem, _Component);

    function NestedListItem() {
        _classCallCheck(this, NestedListItem);

        _Component.apply(this, arguments);
    }

    /**
     * Triggers this.props.onTouchTap
     */

    NestedListItem.prototype.onTouchTap = function onTouchTap() {
        this.props.onTouchTap(this.props.entry);
    };

    /**
     * Recursively build other NestedListItem
     * @param data
     */

    NestedListItem.prototype.buildNestedItems = function buildNestedItems(data) {
        return data.map((function (entry) {
            return React.createElement(NestedListItem, {
                nestedLevel: this.props.nestedLevel + 1,
                entry: entry,
                onTouchTap: this.props.onTouchTap,
                selected: this.props.selected,
                showIcons: true
            });
        }).bind(this));
    };

    NestedListItem.prototype.render = function render() {
        var _props = this.props;
        var showIcons = _props.showIcons;
        var entry = _props.entry;
        var selected = _props.selected;
        var id = entry.id;
        var label = entry.label;
        var icon = entry.icon;

        var children = entry.collections || [];
        var nested = this.buildNestedItems(children);
        var fontIcon = undefined;
        if (icon && showIcons) {
            fontIcon = React.createElement(_materialUi.FontIcon, { className: icon });
        }
        return React.createElement(_materialUi.ListItem, {
            nestedLevel: this.props.nestedLevel,
            key: id,
            primaryText: label,
            onTouchTap: this.onTouchTap.bind(this),
            nestedItems: nested,
            initiallyOpen: true,
            leftIcon: fontIcon,
            innerDivStyle: { fontWeight: selected === entry.id ? 500 : 400 },
            style: selected === entry.id ? { backgroundColor: "#efefef" } : {}
        });
    };

    return NestedListItem;
})(_react.Component);

NestedListItem.propTypes = {
    /**
     * Keeps track of the current depth level
     */
    nestedLevel: _propTypes2['default'].number,
    /**
     * Currently selected node id
     */
    selected: _propTypes2['default'].string,
    /**
     * Callback triggered when an entry is selected
     */
    onTouchTap: _propTypes2['default'].func
};

exports['default'] = NestedListItem;
module.exports = exports['default'];
