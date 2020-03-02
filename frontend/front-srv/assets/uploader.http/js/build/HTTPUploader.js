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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9VcGxvYWRlci5qcyIsImpzL2J1aWxkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdVcGxvYWRlcicsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlyOiBweWRpby51c2VyLmdldEFjdGl2ZVJlcG9zaXRvcnlPYmplY3QoKS5nZXRTbHVnKCkgKyBweWRpby5nZXRDb250ZXh0Tm9kZSgpLmdldFBhdGgoKSxcbiAgICAgICAgICAgIHN1Ym1pdHRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgY3VycmVudFVSTDogXCJcIixcbiAgICAgICAgICAgIHVybHM6IFtdXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIF9oYW5kbGVDaGFuZ2VVUkw6IGZ1bmN0aW9uIF9oYW5kbGVDaGFuZ2VVUkwoaWQpIHtcbiAgICAgICAgcmV0dXJuIChmdW5jdGlvbiAoZSwgbmV3VmFsdWUpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuc3VibWl0dGluZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5ld1ZhbHVlID09PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlRGVsZXRlVVJMKGlkKSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHVybHMgPSB0aGlzLnN0YXRlLnVybHM7XG5cbiAgICAgICAgICAgIHVybHNbaWRdID0gbmV3VmFsdWU7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB1cmxzOiB1cmxzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICB9LFxuXG4gICAgX2hhbmRsZURlbGV0ZVVSTDogZnVuY3Rpb24gX2hhbmRsZURlbGV0ZVVSTChpZCkge1xuICAgICAgICByZXR1cm4gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnN1Ym1pdHRpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB1cmxzID0gdGhpcy5zdGF0ZS51cmxzO1xuXG4gICAgICAgICAgICB1cmxzLnNwbGljZShpZCwgMSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHVybHM6IHVybHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgIH0sXG5cbiAgICBfaGFuZGxlQ2hhbmdlQ3VycmVudFVSTDogZnVuY3Rpb24gX2hhbmRsZUNoYW5nZUN1cnJlbnRVUkwoZSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjdXJyZW50VVJMOiB2YWx1ZVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgX2hhbmRsZUFkZFVSTDogZnVuY3Rpb24gX2hhbmRsZUFkZFVSTChlKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc3VibWl0dGluZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGUudHlwZSA9PT0gXCJrZXlkb3duXCIgJiYgZS5rZXlDb2RlICE9PSAxMykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHZhciBjdXJyZW50VVJMID0gX3N0YXRlLmN1cnJlbnRVUkw7XG4gICAgICAgIHZhciB1cmxzID0gX3N0YXRlLnVybHM7XG5cbiAgICAgICAgaWYgKGN1cnJlbnRVUkwgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybHMucHVzaChjdXJyZW50VVJMKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGN1cnJlbnRVUkw6IFwiXCIsXG4gICAgICAgICAgICB1cmxzOiB1cmxzXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfaGFuZGxlU3VibWl0OiBmdW5jdGlvbiBfaGFuZGxlU3VibWl0KGUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHZhciBweWRpbyA9IHRoaXMucHJvcHMucHlkaW87XG4gICAgICAgIHZhciBfc3RhdGUyID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgdmFyIGRpciA9IF9zdGF0ZTIuZGlyO1xuICAgICAgICB2YXIgdXJscyA9IF9zdGF0ZTIudXJscztcblxuICAgICAgICBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKS51c2VySm9iKFwicmVtb3RlLWRvd25sb2FkXCIsIHsgdGFyZ2V0OiBkaXIsIHVybHM6IHVybHMgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHVybHM6IFtdIH0pO1xuICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICB2YXIgbXNnID0gZXJyLkRldGFpbCB8fCBlcnIubWVzc2FnZSB8fCBlcnI7XG4gICAgICAgICAgICBweWRpby5VSS5kaXNwbGF5TWVzc2FnZSgnRVJST1InLCBtc2cpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgdmFyIHVybHMgPSB0aGlzLnN0YXRlLnVybHM7XG5cbiAgICAgICAgdmFyIGl0ZW1zID0gdXJscy5tYXAoKGZ1bmN0aW9uIChpdGVtLCBpZCkge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJywgcGFkZGluZzogJzBweCAyNHB4Jywgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMTAwJScgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHsgZGlzYWJsZWQ6IHRoaXMuc3RhdGUuc3VibWl0dGluZywgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9LCB2YWx1ZTogaXRlbSwgdW5kZXJsaW5lU2hvdzogZmFsc2UsIGZ1bGxXaWR0aDogdHJ1ZSwgb25DaGFuZ2U6IHRoaXMuX2hhbmRsZUNoYW5nZVVSTChpZCkgfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGZvbnRTaXplOiAnMWVtJyB9LCBjbGFzc05hbWU6ICdtZGkgbWRpLWRlbGV0ZScsIG9uQ2xpY2s6IHRoaXMuX2hhbmRsZURlbGV0ZVVSTChpZCkgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScsIHBhZGRpbmc6IDEwIH0gfSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScsIG1hcmdpbjogMTAsIGZvbnRTaXplOiAxMyB9LCBjbGFzc05hbWU6ICdkaWFsb2dsZWdlbmQnIH0sXG4gICAgICAgICAgICAgICAgbWVzc2FnZXNbJ2h0dHBkb3dubG9hZGVyLjQnXVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgbWluSGVpZ2h0OiAxNjAgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICAgICAgeyB6RGVwdGg6IDEsIHN0eWxlOiB7IG1hcmdpbkJvdHRvbTogMTAsIG1heEhlaWdodDogMzAwLCBvdmVyZmxvd1k6ICdhdXRvJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nTGVmdDogMjQgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7IGRpc2FibGVkOiB0aGlzLnN0YXRlLnN1Ym1pdHRpbmcsIGhpbnRUZXh0OiBtZXNzYWdlc1snaHR0cGRvd25sb2FkZXIuNSddICsgJyArIEhpdCBFbnRlcicsIHZhbHVlOiB0aGlzLnN0YXRlLmN1cnJlbnRVUkwsIHVuZGVybGluZVNob3c6IGZhbHNlLCBmdWxsV2lkdGg6IHRydWUsIG9uQ2hhbmdlOiB0aGlzLl9oYW5kbGVDaGFuZ2VDdXJyZW50VVJMLCBvbktleURvd246IHRoaXMuX2hhbmRsZUFkZFVSTCwgb25CbHVyOiB0aGlzLl9oYW5kbGVBZGRVUkwgfSlcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyB0ZXh0QWxpZ246ICdyaWdodCcgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhaXNlZEJ1dHRvbiwgeyBkaXNhYmxlZDogdXJscy5sZW5ndGggPT09IDAsIHByaW1hcnk6IHRydWUsIGxhYmVsOiAnU3RhcnQnLCBvbkNsaWNrOiB0aGlzLl9oYW5kbGVTdWJtaXQgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX1VwbG9hZGVyID0gcmVxdWlyZSgnLi9VcGxvYWRlcicpO1xuXG52YXIgX1VwbG9hZGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1VwbG9hZGVyKTtcblxuZXhwb3J0cy5VcGxvYWRlciA9IF9VcGxvYWRlcjJbJ2RlZmF1bHQnXTtcbiJdfQ==
