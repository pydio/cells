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

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

/**
 * Search input building a set of query parameters and calling
 * the callbacks to display / hide results
 */

var SearchBox = (function (_React$Component) {
    _inherits(SearchBox, _React$Component);

    function SearchBox(props) {
        _classCallCheck(this, SearchBox);

        _React$Component.call(this, props);
        var dm = new PydioDataModel();
        dm.setRootNode(new AjxpNode());
        this.state = {
            dataModel: dm,
            displayResult: props.displayResultsState
        };
        this.searchDebounced = _lodashDebounce2['default'](this.triggerSearch, 500);
    }

    SearchBox.prototype.displayResultsState = function displayResultsState() {
        this.setState({
            displayResult: true
        });
    };

    SearchBox.prototype.hideResultsState = function hideResultsState() {
        this.setState({
            displayResult: false
        });
        this.props.hideResults();
    };

    SearchBox.prototype.triggerSearch = function triggerSearch() {
        var value = this.refs.query.getValue();
        if (!value) {
            this.hideResultsState();
            this.refs.query.blur();
            return;
        }
        var dm = this.state.dataModel;
        var params = this.props.parameters;
        params[this.props.queryParameterName] = value;
        params['limit'] = this.props.limit || 100;
        dm.getRootNode().setChildren([]);
        PydioApi.getClient().request(params, (function (transport) {
            var remoteNodeProvider = new RemoteNodeProvider({});
            remoteNodeProvider.parseNodes(dm.getRootNode(), transport);
            dm.getRootNode().setLoaded(true);
            this.displayResultsState();
            this.props.displayResults(value, dm);
        }).bind(this));
    };

    SearchBox.prototype.keyDown = function keyDown(event) {
        if (event.key === 'Enter') {
            this.triggerSearch();
        } else {
            this.searchDebounced();
        }
    };

    SearchBox.prototype.render = function render() {
        return _react2['default'].createElement(
            'div',
            { className: this.props.className ? this.props.className : '', style: _extends({ display: 'flex', alignItems: 'center', maxWidth: 220 }, this.props.style) },
            _react2['default'].createElement(
                'div',
                { style: { flex: 1 } },
                _react2['default'].createElement(_materialUi.TextField, { ref: 'query', onKeyDown: this.keyDown.bind(this), floatingLabelText: this.props.textLabel, fullWidth: true })
            ),
            _react2['default'].createElement(
                'div',
                { style: { paddingTop: 22, opacity: 0.3 } },
                _react2['default'].createElement(_materialUi.IconButton, {
                    ref: 'button',
                    onTouchTap: this.triggerSearch.bind(this),
                    iconClassName: 'mdi mdi-account-search',
                    tooltip: 'Search'
                })
            )
        );
    };

    return SearchBox;
})(_react2['default'].Component);

SearchBox.PropTypes = {
    // Required
    parameters: _react2['default'].PropTypes.object.isRequired,
    queryParameterName: _react2['default'].PropTypes.string.isRequired,
    // Other
    textLabel: _react2['default'].PropTypes.string,
    displayResults: _react2['default'].PropTypes.func,
    hideResults: _react2['default'].PropTypes.func,
    displayResultsState: _react2['default'].PropTypes.bool,
    limit: _react2['default'].PropTypes.number,
    style: _react2['default'].PropTypes.object
};

exports['default'] = SearchBox;
module.exports = exports['default'];
