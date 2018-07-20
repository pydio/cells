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

var _SearchForm = require('./SearchForm');

var _SearchForm2 = _interopRequireDefault(_SearchForm);

var _UsersList = require('./UsersList');

var _UsersList2 = _interopRequireDefault(_UsersList);

var _Loaders = require('./Loaders');

var _Loaders2 = _interopRequireDefault(_Loaders);

/**
 * Ready to use Form + Result List for search users
 */

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

var _require$requireLib = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

var SearchPanel = (function (_Component) {
    _inherits(SearchPanel, _Component);

    function SearchPanel(props, context) {
        _classCallCheck(this, SearchPanel);

        _Component.call(this, props.context);
        this.state = { items: [] };
    }

    SearchPanel.prototype.onSearch = function onSearch(value) {
        var _this = this;

        if (!value) {
            this.setState({ items: [] });
            return;
        }
        var params = { value: value, existing_only: 'true' };
        if (this.props.params) {
            params = _extends({}, params, this.props.params);
        }
        _Loaders2['default'].listUsers(params, function (children) {
            _this.setState({ items: children });
        });
    };

    SearchPanel.prototype.render = function render() {
        var _this2 = this;

        var _props = this.props;
        var mode = _props.mode;
        var item = _props.item;
        var getMessage = _props.getMessage;

        return React.createElement(
            'div',
            { style: { flex: 1, display: 'flex', flexDirection: 'column' } },
            React.createElement(
                'div',
                { style: { padding: 10, height: 56, backgroundColor: this.state.select ? activeTbarColor : '#fafafa', display: 'flex', alignItems: 'center', transition: DOMUtils.getBeziersTransition() } },
                mode === "selector" && item._parent && React.createElement(MaterialUI.IconButton, { iconClassName: 'mdi mdi-chevron-left', onTouchTap: function () {
                        _this2.props.onFolderClicked(item._parent);
                    } }),
                mode === 'book' && React.createElement(
                    'div',
                    { style: { fontSize: 20, color: 'rgba(0,0,0,0.87)', flex: 1 } },
                    this.props.title
                ),
                React.createElement(_SearchForm2['default'], { style: mode === 'book' ? { minWidth: 320 } : { flex: 1 }, searchLabel: this.props.searchLabel, onSearch: this.onSearch.bind(this) })
            ),
            React.createElement(_UsersList2['default'], {
                mode: this.props.mode,
                onItemClicked: this.props.onItemClicked,
                item: { leafs: this.state.items },
                noToolbar: true,
                emptyStatePrimaryText: getMessage(587, ''),
                emptyStateSecondaryText: getMessage(588, '')
            })
        );
    };

    return SearchPanel;
})(Component);

SearchPanel.propTypes = {
    /**
     * Optional parameters added to listUsers() request
     */
    params: PropTypes.object,
    /**
     * Label displayed in the toolbar
     */
    searchLabel: PropTypes.string,
    /**
     * Callback triggered when a search result is clicked
     */
    onItemClicked: PropTypes.func,
    /**
     * Currently selected item, required for navigation
     */
    item: PropTypes.object,
    /**
     * Callback triggered if the result is a collection
     */
    onFolderClicked: PropTypes.func
};

exports['default'] = SearchPanel = PydioContextConsumer(SearchPanel);
exports['default'] = SearchPanel;
module.exports = exports['default'];
