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

        var _state2 = this.state;
        var dir = _state2.dir;
        var urls = _state2.urls;

        _pydioHttpApi2['default'].getRestClient().userJob("remote-download", { target: dir, urls: urls }).then(function () {
            _this.setState({ urls: [] });
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9VcGxvYWRlci5qcyIsImpzL2J1aWxkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdVcGxvYWRlcicsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlyOiBweWRpby51c2VyLmdldEFjdGl2ZVJlcG9zaXRvcnlPYmplY3QoKS5nZXRTbHVnKCkgKyBweWRpby5nZXRDb250ZXh0Tm9kZSgpLmdldFBhdGgoKSxcbiAgICAgICAgICAgIHN1Ym1pdHRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgY3VycmVudFVSTDogXCJcIixcbiAgICAgICAgICAgIHVybHM6IFtdXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIF9oYW5kbGVDaGFuZ2VVUkw6IGZ1bmN0aW9uIF9oYW5kbGVDaGFuZ2VVUkwoaWQpIHtcbiAgICAgICAgcmV0dXJuIChmdW5jdGlvbiAoZSwgbmV3VmFsdWUpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuc3VibWl0dGluZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5ld1ZhbHVlID09PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlRGVsZXRlVVJMKGlkKSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHVybHMgPSB0aGlzLnN0YXRlLnVybHM7XG5cbiAgICAgICAgICAgIHVybHNbaWRdID0gbmV3VmFsdWU7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB1cmxzOiB1cmxzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICB9LFxuXG4gICAgX2hhbmRsZURlbGV0ZVVSTDogZnVuY3Rpb24gX2hhbmRsZURlbGV0ZVVSTChpZCkge1xuICAgICAgICByZXR1cm4gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnN1Ym1pdHRpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB1cmxzID0gdGhpcy5zdGF0ZS51cmxzO1xuXG4gICAgICAgICAgICB1cmxzLnNwbGljZShpZCwgMSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHVybHM6IHVybHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgIH0sXG5cbiAgICBfaGFuZGxlQ2hhbmdlQ3VycmVudFVSTDogZnVuY3Rpb24gX2hhbmRsZUNoYW5nZUN1cnJlbnRVUkwoZSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjdXJyZW50VVJMOiB2YWx1ZVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgX2hhbmRsZUFkZFVSTDogZnVuY3Rpb24gX2hhbmRsZUFkZFVSTChlKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc3VibWl0dGluZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGUudHlwZSA9PT0gXCJrZXlkb3duXCIgJiYgZS5rZXlDb2RlICE9PSAxMykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHZhciBjdXJyZW50VVJMID0gX3N0YXRlLmN1cnJlbnRVUkw7XG4gICAgICAgIHZhciB1cmxzID0gX3N0YXRlLnVybHM7XG5cbiAgICAgICAgaWYgKGN1cnJlbnRVUkwgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybHMucHVzaChjdXJyZW50VVJMKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGN1cnJlbnRVUkw6IFwiXCIsXG4gICAgICAgICAgICB1cmxzOiB1cmxzXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfaGFuZGxlU3VibWl0OiBmdW5jdGlvbiBfaGFuZGxlU3VibWl0KGUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgdmFyIF9zdGF0ZTIgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgZGlyID0gX3N0YXRlMi5kaXI7XG4gICAgICAgIHZhciB1cmxzID0gX3N0YXRlMi51cmxzO1xuXG4gICAgICAgIF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpLnVzZXJKb2IoXCJyZW1vdGUtZG93bmxvYWRcIiwgeyB0YXJnZXQ6IGRpciwgdXJsczogdXJscyB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgdXJsczogW10gfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblxuICAgICAgICB2YXIgbWVzc2FnZXMgPSB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoO1xuICAgICAgICB2YXIgdXJscyA9IHRoaXMuc3RhdGUudXJscztcblxuICAgICAgICB2YXIgaXRlbXMgPSB1cmxzLm1hcCgoZnVuY3Rpb24gKGl0ZW0sIGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBwYWRkaW5nOiAnMHB4IDI0cHgnLCB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICcxMDAlJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwgeyBkaXNhYmxlZDogdGhpcy5zdGF0ZS5zdWJtaXR0aW5nLCBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH0sIHZhbHVlOiBpdGVtLCB1bmRlcmxpbmVTaG93OiBmYWxzZSwgZnVsbFdpZHRoOiB0cnVlLCBvbkNoYW5nZTogdGhpcy5faGFuZGxlQ2hhbmdlVVJMKGlkKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZm9udFNpemU6ICcxZW0nIH0sIGNsYXNzTmFtZTogJ21kaSBtZGktZGVsZXRlJywgb25DbGljazogdGhpcy5faGFuZGxlRGVsZXRlVVJMKGlkKSB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgcGFkZGluZzogMTAgfSB9LFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgbWFyZ2luOiAxMCwgZm9udFNpemU6IDEzIH0sIGNsYXNzTmFtZTogJ2RpYWxvZ2xlZ2VuZCcgfSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlc1snaHR0cGRvd25sb2FkZXIuNCddXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBtaW5IZWlnaHQ6IDE2MCB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgICAgICB7IHpEZXB0aDogMSwgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAxMCwgbWF4SGVpZ2h0OiAzMDAsIG92ZXJmbG93WTogJ2F1dG8nIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXMsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdMZWZ0OiAyNCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHsgZGlzYWJsZWQ6IHRoaXMuc3RhdGUuc3VibWl0dGluZywgaGludFRleHQ6IG1lc3NhZ2VzWydodHRwZG93bmxvYWRlci41J10gKyAnICsgSGl0IEVudGVyJywgdmFsdWU6IHRoaXMuc3RhdGUuY3VycmVudFVSTCwgdW5kZXJsaW5lU2hvdzogZmFsc2UsIGZ1bGxXaWR0aDogdHJ1ZSwgb25DaGFuZ2U6IHRoaXMuX2hhbmRsZUNoYW5nZUN1cnJlbnRVUkwsIG9uS2V5RG93bjogdGhpcy5faGFuZGxlQWRkVVJMLCBvbkJsdXI6IHRoaXMuX2hhbmRsZUFkZFVSTCB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHRleHRBbGlnbjogJ3JpZ2h0JyB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFpc2VkQnV0dG9uLCB7IGRpc2FibGVkOiB1cmxzLmxlbmd0aCA9PT0gMCwgcHJpbWFyeTogdHJ1ZSwgbGFiZWw6ICdTdGFydCcsIG9uQ2xpY2s6IHRoaXMuX2hhbmRsZVN1Ym1pdCB9KVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfVXBsb2FkZXIgPSByZXF1aXJlKCcuL1VwbG9hZGVyJyk7XG5cbnZhciBfVXBsb2FkZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVXBsb2FkZXIpO1xuXG5leHBvcnRzLlVwbG9hZGVyID0gX1VwbG9hZGVyMlsnZGVmYXVsdCddO1xuIl19
