(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.HTTPUploader = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
        var _props = this.props;
        var pydio = _props.pydio;
        var showDismiss = _props.showDismiss;
        var onDismiss = _props.onDismiss;
        var urls = this.state.urls;

        var messages = pydio.MessageHash;

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
            showDismiss && _react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center' } },
                _react2['default'].createElement(
                    'h4',
                    { style: { flex: 1, paddingTop: 16, paddingLeft: 8 } },
                    messages['httpdownloader.10'].replace('APPLICATION_TITLE', pydio.Parameters.get('APPLICATION_TITLE'))
                ),
                _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-close", onTouchTap: function () {
                        onDismiss();
                    } })
            ),
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

},{"material-ui":"material-ui","pydio/http/api":"pydio/http/api","react":"react"}],2:[function(require,module,exports){
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

var _Uploader = require('./Uploader');

var _Uploader2 = _interopRequireDefault(_Uploader);

exports.Uploader = _Uploader2['default'];

},{"./Uploader":1}]},{},[2])(2)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9VcGxvYWRlci5qcyIsImpzL2J1aWxkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1VwbG9hZGVyJyxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICB2YXIgcHlkaW8gPSB0aGlzLnByb3BzLnB5ZGlvO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaXI6IHB5ZGlvLnVzZXIuZ2V0QWN0aXZlUmVwb3NpdG9yeU9iamVjdCgpLmdldFNsdWcoKSArIHB5ZGlvLmdldENvbnRleHROb2RlKCkuZ2V0UGF0aCgpLFxuICAgICAgICAgICAgc3VibWl0dGluZzogZmFsc2UsXG4gICAgICAgICAgICBjdXJyZW50VVJMOiBcIlwiLFxuICAgICAgICAgICAgdXJsczogW11cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgX2hhbmRsZUNoYW5nZVVSTDogZnVuY3Rpb24gX2hhbmRsZUNoYW5nZVVSTChpZCkge1xuICAgICAgICByZXR1cm4gKGZ1bmN0aW9uIChlLCBuZXdWYWx1ZSkge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zdWJtaXR0aW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmV3VmFsdWUgPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVEZWxldGVVUkwoaWQpKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdXJscyA9IHRoaXMuc3RhdGUudXJscztcblxuICAgICAgICAgICAgdXJsc1tpZF0gPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHVybHM6IHVybHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgIH0sXG5cbiAgICBfaGFuZGxlRGVsZXRlVVJMOiBmdW5jdGlvbiBfaGFuZGxlRGVsZXRlVVJMKGlkKSB7XG4gICAgICAgIHJldHVybiAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuc3VibWl0dGluZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHVybHMgPSB0aGlzLnN0YXRlLnVybHM7XG5cbiAgICAgICAgICAgIHVybHMuc3BsaWNlKGlkLCAxKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdXJsczogdXJsc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgfSxcblxuICAgIF9oYW5kbGVDaGFuZ2VDdXJyZW50VVJMOiBmdW5jdGlvbiBfaGFuZGxlQ2hhbmdlQ3VycmVudFVSTChlLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGN1cnJlbnRVUkw6IHZhbHVlXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfaGFuZGxlQWRkVVJMOiBmdW5jdGlvbiBfaGFuZGxlQWRkVVJMKGUpIHtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zdWJtaXR0aW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZS50eXBlID09PSBcImtleWRvd25cIiAmJiBlLmtleUNvZGUgIT09IDEzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgdmFyIGN1cnJlbnRVUkwgPSBfc3RhdGUuY3VycmVudFVSTDtcbiAgICAgICAgdmFyIHVybHMgPSBfc3RhdGUudXJscztcblxuICAgICAgICBpZiAoY3VycmVudFVSTCA9PT0gXCJcIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJscy5wdXNoKGN1cnJlbnRVUkwpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY3VycmVudFVSTDogXCJcIixcbiAgICAgICAgICAgIHVybHM6IHVybHNcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9oYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uIF9oYW5kbGVTdWJtaXQoZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcbiAgICAgICAgdmFyIF9zdGF0ZTIgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgZGlyID0gX3N0YXRlMi5kaXI7XG4gICAgICAgIHZhciB1cmxzID0gX3N0YXRlMi51cmxzO1xuXG4gICAgICAgIF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpLnVzZXJKb2IoXCJyZW1vdGUtZG93bmxvYWRcIiwgeyB0YXJnZXQ6IGRpciwgdXJsczogdXJscyB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgdXJsczogW10gfSk7XG4gICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIHZhciBtc2cgPSBlcnIuRGV0YWlsIHx8IGVyci5tZXNzYWdlIHx8IGVycjtcbiAgICAgICAgICAgIHB5ZGlvLlVJLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsIG1zZyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgdmFyIHNob3dEaXNtaXNzID0gX3Byb3BzLnNob3dEaXNtaXNzO1xuICAgICAgICB2YXIgb25EaXNtaXNzID0gX3Byb3BzLm9uRGlzbWlzcztcbiAgICAgICAgdmFyIHVybHMgPSB0aGlzLnN0YXRlLnVybHM7XG5cbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gcHlkaW8uTWVzc2FnZUhhc2g7XG5cbiAgICAgICAgdmFyIGl0ZW1zID0gdXJscy5tYXAoKGZ1bmN0aW9uIChpdGVtLCBpZCkge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJywgcGFkZGluZzogJzBweCAyNHB4Jywgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMTAwJScgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHsgZGlzYWJsZWQ6IHRoaXMuc3RhdGUuc3VibWl0dGluZywgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9LCB2YWx1ZTogaXRlbSwgdW5kZXJsaW5lU2hvdzogZmFsc2UsIGZ1bGxXaWR0aDogdHJ1ZSwgb25DaGFuZ2U6IHRoaXMuX2hhbmRsZUNoYW5nZVVSTChpZCkgfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGZvbnRTaXplOiAnMWVtJyB9LCBjbGFzc05hbWU6ICdtZGkgbWRpLWRlbGV0ZScsIG9uQ2xpY2s6IHRoaXMuX2hhbmRsZURlbGV0ZVVSTChpZCkgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScsIHBhZGRpbmc6IDEwIH0gfSxcbiAgICAgICAgICAgIHNob3dEaXNtaXNzICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdoNCcsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgcGFkZGluZ1RvcDogMTYsIHBhZGRpbmdMZWZ0OiA4IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXNbJ2h0dHBkb3dubG9hZGVyLjEwJ10ucmVwbGFjZSgnQVBQTElDQVRJT05fVElUTEUnLCBweWRpby5QYXJhbWV0ZXJzLmdldCgnQVBQTElDQVRJT05fVElUTEUnKSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLWNsb3NlXCIsIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRGlzbWlzcygpO1xuICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgbWFyZ2luOiAxMCwgZm9udFNpemU6IDEzIH0sIGNsYXNzTmFtZTogJ2RpYWxvZ2xlZ2VuZCcgfSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlc1snaHR0cGRvd25sb2FkZXIuNCddXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBtaW5IZWlnaHQ6IDE2MCB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgICAgICB7IHpEZXB0aDogMSwgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAxMCwgbWF4SGVpZ2h0OiAzMDAsIG92ZXJmbG93WTogJ2F1dG8nIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXMsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdMZWZ0OiAyNCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHsgZGlzYWJsZWQ6IHRoaXMuc3RhdGUuc3VibWl0dGluZywgaGludFRleHQ6IG1lc3NhZ2VzWydodHRwZG93bmxvYWRlci41J10gKyAnICsgSGl0IEVudGVyJywgdmFsdWU6IHRoaXMuc3RhdGUuY3VycmVudFVSTCwgdW5kZXJsaW5lU2hvdzogZmFsc2UsIGZ1bGxXaWR0aDogdHJ1ZSwgb25DaGFuZ2U6IHRoaXMuX2hhbmRsZUNoYW5nZUN1cnJlbnRVUkwsIG9uS2V5RG93bjogdGhpcy5faGFuZGxlQWRkVVJMLCBvbkJsdXI6IHRoaXMuX2hhbmRsZUFkZFVSTCB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHRleHRBbGlnbjogJ3JpZ2h0JyB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFpc2VkQnV0dG9uLCB7IGRpc2FibGVkOiB1cmxzLmxlbmd0aCA9PT0gMCwgcHJpbWFyeTogdHJ1ZSwgbGFiZWw6ICdTdGFydCcsIG9uQ2xpY2s6IHRoaXMuX2hhbmRsZVN1Ym1pdCB9KVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfVXBsb2FkZXIgPSByZXF1aXJlKCcuL1VwbG9hZGVyJyk7XG5cbnZhciBfVXBsb2FkZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVXBsb2FkZXIpO1xuXG5leHBvcnRzLlVwbG9hZGVyID0gX1VwbG9hZGVyMlsnZGVmYXVsdCddO1xuIl19
