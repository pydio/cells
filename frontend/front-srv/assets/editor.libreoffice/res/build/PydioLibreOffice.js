(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioLibreOffice = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class; /*
                   * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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


var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _api = require('pydio/http/api');

var _api2 = _interopRequireDefault(_api);

var _cellsSdk = require('cells-sdk');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Pydio$requireLib = _pydio2.default.requireLib('hoc'),
    EditorActions = _Pydio$requireLib.EditorActions;

var Editor = (_dec = (0, _reactRedux.connect)(null, EditorActions), _dec(_class = function (_React$Component) {
    _inherits(Editor, _React$Component);

    function Editor(props) {
        _classCallCheck(this, Editor);

        var _this = _possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this, props));

        _this.state = {};
        return _this;
    }

    _createClass(Editor, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var editorModify = this.props.editorModify;

            if (nextProps.isActive) {
                editorModify({ fixedToolbar: true });
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var editorModify = this.props.editorModify;

            if (this.props.isActive) {
                editorModify({ fixedToolbar: true });
            }
            _pydio2.default.getInstance().notify('longtask_starting');

            var iframeUrl = "/loleaflet/dist/loleaflet.html";
            var frontUrl = _pydio2.default.getInstance().getFrontendUrl();
            var protocol = frontUrl.protocol === 'https:' ? 'wss:' : 'ws:';
            var webSocketUrl = protocol + '//' + frontUrl.host; //host.replace(/^http/gi, 'ws');

            // Check current action state for permission
            var readonly = _pydio2.default.getInstance().getController().getActionByName("move").deny;
            var permission = readonly ? "readonly" : "edit";
            var uri = "/wopi/files/" + this.props.node.getMetadata().get("uuid");
            var fileSrcUrl = encodeURIComponent(frontUrl.protocol + '//' + frontUrl.host + uri);

            var api = new _cellsSdk.TokenServiceApi(_api2.default.getRestClient());
            var req = new _cellsSdk.RestDocumentAccessTokenRequest();
            req.Path = _pydio2.default.getInstance().user.getActiveRepositoryObject().getSlug() + this.props.node.getPath();
            api.generateDocumentAccessToken(req).then(function (response) {
                _this2.setState({ url: iframeUrl + '?host=' + webSocketUrl + '&WOPISrc=' + fileSrcUrl + '&access_token=' + response.AccessToken + '&permission=' + permission });
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _pydio2.default.getInstance().notify('longtask_finished');
        }
    }, {
        key: 'render',
        value: function render() {
            var url = this.state.url;

            return _react2.default.createElement('iframe', { src: url, style: { backgroundColor: "white", width: "100%", height: "100%", border: 0, flex: 1 } });
        }
    }]);

    return Editor;
}(_react2.default.Component)) || _class);
exports.default = Editor;

},{"cells-sdk":"cells-sdk","pydio":"pydio","pydio/http/api":"pydio/http/api","react":"react","react-redux":"react-redux"}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _editor = require('./editor');

Object.defineProperty(exports, 'Editor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_editor).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./editor":1}]},{},[2])(2)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy8ucG5wbS9icm93c2VyLXBhY2tANi4xLjAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInJlcy9idWlsZC9QeWRpb0xpYnJlT2ZmaWNlL2VkaXRvci5qcyIsInJlcy9idWlsZC9QeWRpb0xpYnJlT2ZmaWNlL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfZGVjLCBfY2xhc3M7IC8qXG4gICAgICAgICAgICAgICAgICAgKiBDb3B5cmlnaHQgMjAwNy0yMDE5IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICAgICAgICAgICAgICAgICAgICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICAgICAgICAgICAgICAgICAgICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gICAgICAgICAgICAgICAgICAgKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICAgICAgICAgICAgICAgICAgICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICAgICAgICAgICAgICAgICAgICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAgICAgICAgICAgICAgICAgICAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAgICAgICAgICAgICAgICAgICAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICAgICAgICAgICAgICAgICAgICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gICAgICAgICAgICAgICAgICAgKi9cblxuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfYXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9hcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYXBpKTtcblxudmFyIF9jZWxsc1NkayA9IHJlcXVpcmUoJ2NlbGxzLXNkaycpO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcmVhY3RSZWR1eCA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMi5kZWZhdWx0LnJlcXVpcmVMaWIoJ2hvYycpLFxuICAgIEVkaXRvckFjdGlvbnMgPSBfUHlkaW8kcmVxdWlyZUxpYi5FZGl0b3JBY3Rpb25zO1xuXG52YXIgRWRpdG9yID0gKF9kZWMgPSAoMCwgX3JlYWN0UmVkdXguY29ubmVjdCkobnVsbCwgRWRpdG9yQWN0aW9ucyksIF9kZWMoX2NsYXNzID0gZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoRWRpdG9yLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEVkaXRvcihwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRWRpdG9yKTtcblxuICAgICAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoRWRpdG9yLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoRWRpdG9yKSkuY2FsbCh0aGlzLCBwcm9wcykpO1xuXG4gICAgICAgIF90aGlzLnN0YXRlID0ge307XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRWRpdG9yLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgICAgICB2YXIgZWRpdG9yTW9kaWZ5ID0gdGhpcy5wcm9wcy5lZGl0b3JNb2RpZnk7XG5cbiAgICAgICAgICAgIGlmIChuZXh0UHJvcHMuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICBlZGl0b3JNb2RpZnkoeyBmaXhlZFRvb2xiYXI6IHRydWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBlZGl0b3JNb2RpZnkgPSB0aGlzLnByb3BzLmVkaXRvck1vZGlmeTtcblxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICBlZGl0b3JNb2RpZnkoeyBmaXhlZFRvb2xiYXI6IHRydWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5ub3RpZnkoJ2xvbmd0YXNrX3N0YXJ0aW5nJyk7XG5cbiAgICAgICAgICAgIHZhciBpZnJhbWVVcmwgPSBcIi9sb2xlYWZsZXQvZGlzdC9sb2xlYWZsZXQuaHRtbFwiO1xuICAgICAgICAgICAgdmFyIGZyb250VXJsID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0RnJvbnRlbmRVcmwoKTtcbiAgICAgICAgICAgIHZhciBwcm90b2NvbCA9IGZyb250VXJsLnByb3RvY29sID09PSAnaHR0cHM6JyA/ICd3c3M6JyA6ICd3czonO1xuICAgICAgICAgICAgdmFyIHdlYlNvY2tldFVybCA9IHByb3RvY29sICsgJy8vJyArIGZyb250VXJsLmhvc3Q7IC8vaG9zdC5yZXBsYWNlKC9eaHR0cC9naSwgJ3dzJyk7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGN1cnJlbnQgYWN0aW9uIHN0YXRlIGZvciBwZXJtaXNzaW9uXG4gICAgICAgICAgICB2YXIgcmVhZG9ubHkgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRDb250cm9sbGVyKCkuZ2V0QWN0aW9uQnlOYW1lKFwibW92ZVwiKS5kZW55O1xuICAgICAgICAgICAgdmFyIHBlcm1pc3Npb24gPSByZWFkb25seSA/IFwicmVhZG9ubHlcIiA6IFwiZWRpdFwiO1xuICAgICAgICAgICAgdmFyIHVyaSA9IFwiL3dvcGkvZmlsZXMvXCIgKyB0aGlzLnByb3BzLm5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoXCJ1dWlkXCIpO1xuICAgICAgICAgICAgdmFyIGZpbGVTcmNVcmwgPSBlbmNvZGVVUklDb21wb25lbnQoZnJvbnRVcmwucHJvdG9jb2wgKyAnLy8nICsgZnJvbnRVcmwuaG9zdCArIHVyaSk7XG5cbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX2NlbGxzU2RrLlRva2VuU2VydmljZUFwaShfYXBpMi5kZWZhdWx0LmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICB2YXIgcmVxID0gbmV3IF9jZWxsc1Nkay5SZXN0RG9jdW1lbnRBY2Nlc3NUb2tlblJlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcS5QYXRoID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkudXNlci5nZXRBY3RpdmVSZXBvc2l0b3J5T2JqZWN0KCkuZ2V0U2x1ZygpICsgdGhpcy5wcm9wcy5ub2RlLmdldFBhdGgoKTtcbiAgICAgICAgICAgIGFwaS5nZW5lcmF0ZURvY3VtZW50QWNjZXNzVG9rZW4ocmVxKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHVybDogaWZyYW1lVXJsICsgJz9ob3N0PScgKyB3ZWJTb2NrZXRVcmwgKyAnJldPUElTcmM9JyArIGZpbGVTcmNVcmwgKyAnJmFjY2Vzc190b2tlbj0nICsgcmVzcG9uc2UuQWNjZXNzVG9rZW4gKyAnJnBlcm1pc3Npb249JyArIHBlcm1pc3Npb24gfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5ub3RpZnkoJ2xvbmd0YXNrX2ZpbmlzaGVkJyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgdXJsID0gdGhpcy5zdGF0ZS51cmw7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJywgeyBzcmM6IHVybCwgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiBcIndoaXRlXCIsIHdpZHRoOiBcIjEwMCVcIiwgaGVpZ2h0OiBcIjEwMCVcIiwgYm9yZGVyOiAwLCBmbGV4OiAxIH0gfSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRWRpdG9yO1xufShfcmVhY3QyLmRlZmF1bHQuQ29tcG9uZW50KSkgfHwgX2NsYXNzKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEVkaXRvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9lZGl0b3IgPSByZXF1aXJlKCcuL2VkaXRvcicpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0VkaXRvcicsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2VkaXRvcikuZGVmYXVsdDtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG4iXX0=
