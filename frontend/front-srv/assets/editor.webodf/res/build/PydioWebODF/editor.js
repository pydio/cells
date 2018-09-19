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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib.EditorActions;
var withLoader = _Pydio$requireLib.withLoader;
var withErrors = _Pydio$requireLib.withErrors;

var Viewer = (function (_React$Component) {
    _inherits(Viewer, _React$Component);

    function Viewer() {
        _classCallCheck(this, Viewer);

        _get(Object.getPrototypeOf(Viewer.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Viewer, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var path = this.props.path;
            var iframe = this.refs.iframe;

            if (iframe) {
                var ifrm = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
                var content = "<html>\n" + "<head>\n" + "    <script src=\"http://webodf.org/demo/demobrowser/webodf.js\" type=\"text/javascript\" charset=\"utf-8\"></script>\n" + "    <script type=\"text/javascript\" charset=\"utf-8\">\n" + "        function init()\n" + "        {\n" + "            var odfelement = document.getElementById(\"odf\");\n" + "            window.odfcanvas = new odf.OdfCanvas(odfelement);\n" + "            window.odfcanvas.load(\"../../\" + window.parent.ajxpServerAccessPath + \"&get_action=download&file=" + path + "\");\n" + "        }\n" + "        window.setTimeout(init, 0);\n" + "    </script>\n" + "    <style type=\"text/css\">\n" + "        .shadow_class{\n" + "            box-shadow: 1px 1px 6px black;\n" + "        }\n" + "    </style>\n" + "</head>\n" + "<body style=\"background-color: rgb(85, 85, 85);\">\n" + "    <div id=\"odf\" class=\"shadow_class\"></div>\n" + "</body>\n" + "</html>\n";
                ifrm.document.write(content);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var style = _props.style;
            var onLoad = _props.onLoad;

            return _react2['default'].createElement('iframe', { ref: "iframe", style: _extends({}, style, { height: "100%", border: 0, flex: 1 }), onLoad: onLoad, className: 'vertical_fit' });
        }
    }]);

    return Viewer;
})(_react2['default'].Component);

var Editor = (function (_React$Component2) {
    _inherits(Editor, _React$Component2);

    function Editor() {
        _classCallCheck(this, _Editor);

        _get(Object.getPrototypeOf(_Editor.prototype), 'constructor', this).apply(this, arguments);
    }

    // Define HOCs

    _createClass(Editor, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.loadNode(this.props);
            var editorModify = this.props.editorModify;

            if (this.props.isActive) {
                editorModify({ fixedToolbar: true });
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.node !== this.props.node) {
                this.loadNode(nextProps);
            }
            var editorModify = this.props.editorModify;

            if (nextProps.isActive) {
                editorModify({ fixedToolbar: true });
            }
        }
    }, {
        key: 'loadNode',
        value: function loadNode(props) {
            var node = props.node;

            this.setState({ path: node.getPath() });
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2['default'].createElement(Viewer, _extends({ ref: 'iframe' }, this.props, this.state));
        }
    }]);

    var _Editor = Editor;
    Editor = (0, _reactRedux.connect)(null, EditorActions)(Editor) || Editor;
    return Editor;
})(_react2['default'].Component);

Viewer = withLoader(Viewer);
Viewer = withErrors(Viewer);

exports['default'] = Editor;
module.exports = exports['default'];
