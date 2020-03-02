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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _materialUi = require('material-ui');

exports['default'] = _react2['default'].createClass({
    displayName: 'Uploader',

    getInitialState: function getInitialState() {
        var pydio = this.props.pydio;

        return {
            dir: pydio.user.getActiveRepositoryObject().getSlug() + pydio.getContextNode().getPath(),
            submitting: false,
            currentURL: "",
            urls: []
        };
    },

    _handleChangeURL: function _handleChangeURL(id) {
        return (function (e, newValue) {

            if (this.state.submitting) {
                return;
            }

            if (newValue === "") {
                this._handleDeleteURL(id)();
                return;
            }

            var urls = this.state.urls;

            urls[id] = newValue;
            this.setState({
                urls: urls
            });
        }).bind(this);
    },

    _handleDeleteURL: function _handleDeleteURL(id) {
        return (function () {
            if (this.state.submitting) {
                return;
            }

            var urls = this.state.urls;

            urls.splice(id, 1);

            this.setState({
                urls: urls
            });
        }).bind(this);
    },

    _handleChangeCurrentURL: function _handleChangeCurrentURL(e, value) {
        this.setState({
            currentURL: value
        });
    },

    _handleAddURL: function _handleAddURL(e) {

        if (this.state.submitting) {
            return;
        }

        if (e.type === "keydown" && e.keyCode !== 13) {
            return;
        }

        var _state = this.state;
        var currentURL = _state.currentURL;
        var urls = _state.urls;

        if (currentURL === "") {
            return;
        }

        urls.push(currentURL);

        this.setState({
            currentURL: "",
            urls: urls
        });
    },

    _handleSubmit: function _handleSubmit(e) {
        var _this = this;

        e.preventDefault();
        e.stopPropagation();
        var pydio = this.props.pydio;
        var _state2 = this.state;
        var dir = _state2.dir;
        var urls = _state2.urls;

        _pydioHttpApi2['default'].getRestClient().userJob("remote-download", { target: dir, urls: urls }).then(function () {
            _this.setState({ urls: [] });
        })['catch'](function (err) {
            var msg = err.Detail || err.message || err;
            pydio.UI.displayMessage('ERROR', msg);
        });
    },

    render: function render() {

        var messages = this.props.pydio.MessageHash;
        var urls = this.state.urls;

        var items = urls.map((function (item, id) {
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', justifyContent: 'space-between', padding: '0px 24px', width: '100%', height: '100%' } },
                    _react2['default'].createElement(_materialUi.TextField, { disabled: this.state.submitting, style: { display: 'flex', alignItems: 'center' }, value: item, underlineShow: false, fullWidth: true, onChange: this._handleChangeURL(id) }),
                    _react2['default'].createElement(_materialUi.FontIcon, { style: { display: 'flex', alignItems: 'center', fontSize: '1em' }, className: 'mdi mdi-delete', onClick: this._handleDeleteURL(id) })
                ),
                _react2['default'].createElement(_materialUi.Divider, null)
            );
        }).bind(this));

        return _react2['default'].createElement(
            'div',
            { style: { position: 'relative', padding: 10 } },
            _react2['default'].createElement(
                'div',
                { style: { position: 'relative', margin: 10, fontSize: 13 }, className: 'dialoglegend' },
                messages['httpdownloader.4']
            ),
            _react2['default'].createElement(
                'div',
                { style: { minHeight: 160 } },
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { marginBottom: 10, maxHeight: 300, overflowY: 'auto' } },
                    items,
                    _react2['default'].createElement(
                        'div',
                        { style: { paddingLeft: 24 } },
                        _react2['default'].createElement(_materialUi.TextField, { disabled: this.state.submitting, hintText: messages['httpdownloader.5'] + ' + Hit Enter', value: this.state.currentURL, underlineShow: false, fullWidth: true, onChange: this._handleChangeCurrentURL, onKeyDown: this._handleAddURL, onBlur: this._handleAddURL })
                    ),
                    _react2['default'].createElement(_materialUi.Divider, null)
                )
            ),
            _react2['default'].createElement(
                'div',
                { style: { textAlign: 'right' } },
                _react2['default'].createElement(_materialUi.RaisedButton, { disabled: urls.length === 0, primary: true, label: 'Start', onClick: this._handleSubmit })
            )
        );
    }
});
module.exports = exports['default'];
