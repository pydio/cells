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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _systemjs = require('systemjs');

var _systemjs2 = _interopRequireDefault(_systemjs);

var _redux = require('redux');

var _CodeMirror = require('./CodeMirror');

var _CodeMirror2 = _interopRequireDefault(_CodeMirror);

var define = window.define;
var require = window.require;

_systemjs2['default'].config({
    baseURL: 'plug/editor.codemirror/res/build',
    packages: {
        'codemirror': {},
        '.': {}
    }
});

var CodeMirrorLoader = (function (_React$Component) {
    _inherits(CodeMirrorLoader, _React$Component);

    function CodeMirrorLoader(props) {
        var _this = this;

        _classCallCheck(this, CodeMirrorLoader);

        _get(Object.getPrototypeOf(CodeMirrorLoader.prototype), 'constructor', this).call(this, props);

        var pydio = props.pydio;
        var node = props.node;
        var url = props.url;
        var onLoad = props.onLoad;

        var loaded = new Promise(function (resolve, reject) {

            window.define = _systemjs2['default'].amdDefine;
            window.require = window.requirejs = _systemjs2['default'].amdRequire;

            _systemjs2['default']['import']('codemirror/lib/codemirror').then(function (m) {
                var CodeMirror = m;
                _systemjs2['default']['import']('codemirror/addon/search/search');
                _systemjs2['default']['import']('codemirror/addon/mode/loadmode').then(function () {
                    _systemjs2['default']['import']('codemirror/mode/meta').then(function () {
                        CodeMirror.modeURL = 'codemirror/mode/%N/%N.js';
                        resolve(CodeMirror);
                    });
                });
            });
        });

        this.state = {
            url: url,
            loaded: loaded
        };

        this.onLoad = function (codemirror) {
            _this.props.onLoad(codemirror);

            window.define = define;
            window.require = window.requirejs = require;
        };
    }

    // Handling loading

    _createClass(CodeMirrorLoader, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            this.state.loaded.then(function (CodeMirror) {
                _this2.setState({ codemirrorInstance: CodeMirror });
            });
        }
    }, {
        key: 'render',
        value: function render() {

            // If Code Mirror library is not loaded, do not go further
            if (!this.state.codemirrorInstance) return null;
            var cmStyle = this.props.cmStyle;

            return React.createElement(_CodeMirror2['default'], {
                name: this.state.url,
                value: this.props.content,
                codeMirrorInstance: this.state.codemirrorInstance,
                options: this.props.options,

                onLoad: this.onLoad,
                onChange: this.props.onChange,
                onCursorChange: this.props.onCursorChange,
                cmStyle: cmStyle
            });
        }
    }]);

    return CodeMirrorLoader;
})(React.Component);

CodeMirrorLoader.propTypes = {
    url: React.PropTypes.string.isRequired,

    onChange: React.PropTypes.func.isRequired,
    onCursorChange: React.PropTypes.func.isRequired
};

exports['default'] = CodeMirrorLoader;
module.exports = exports['default'];
