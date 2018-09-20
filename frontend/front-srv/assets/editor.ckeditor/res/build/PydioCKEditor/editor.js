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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _CKEditor = require('./CKEditor');

var _CKEditor2 = _interopRequireDefault(_CKEditor);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib.EditorActions;

var mapStateToProps = function mapStateToProps(state, props) {
    var tabs = state.tabs;

    var tab = tabs.filter(function (_ref) {
        var editorData = _ref.editorData;
        var node = _ref.node;
        return (!editorData || editorData.id === props.editorData.id) && node.getPath() === props.node.getPath();
    })[0] || {};

    return _extends({
        id: tab.id,
        tab: tab
    }, props);
};

var Editor = (function (_React$Component) {
    _inherits(Editor, _React$Component);

    function Editor() {
        _classCallCheck(this, _Editor);

        _get(Object.getPrototypeOf(_Editor.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Editor, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _props = this.props;
            var pydio = _props.pydio;
            var node = _props.node;
            var tab = _props.tab;
            var dispatch = _props.dispatch;
            var id = tab.id;
            var editorModify = this.props.editorModify;

            if (editorModify && this.props.isActive) {
                editorModify({ fixedToolbar: true });
            }

            pydio.ApiClient.getPlainContent(node, function (responseText) {
                dispatch(EditorActions.tabModify({ id: id, content: responseText }));
            });
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var editorModify = this.props.editorModify;

            if (editorModify && nextProps.isActive) {
                editorModify({ fixedToolbar: true });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var node = _props2.node;
            var tab = _props2.tab;
            var dispatch = _props2.dispatch;
            var _Editor$config = Editor.config;
            var desktop = _Editor$config.desktop;
            var mobile = _Editor$config.mobile;
            var id = tab.id;
            var content = tab.content;

            if (!content) return null;

            return _react2['default'].createElement(_CKEditor2['default'], {
                url: node.getPath(),
                content: content,
                config: pydio.UI.MOBILE_EXTENSIONS ? mobile : desktop,
                onChange: function (content) {
                    return dispatch(EditorActions.tabModify({ id: id, content: content }));
                }
            });
        }
    }], [{
        key: 'propTypes',
        get: function get() {
            return {
                showControls: _react2['default'].PropTypes.bool.isRequired
            };
        }
    }, {
        key: 'defaultProps',
        get: function get() {
            return {
                showControls: false
            };
        }
    }, {
        key: 'base',
        get: function get() {
            return {
                resize_enabled: false,
                toolbar: "Ajxp",
                contentsCss: '../../res/ckeditor.css',
                filebrowserBrowseUrl: 'index.php?external_selector_type=ckeditor',
                // IF YOU KNOW THE RELATIVE PATH OF THE IMAGES (BETWEEN REPOSITORY ROOT AND REAL FILE)
                // YOU CAN PASS IT WITH THE relative_path PARAMETER. FOR EXAMPLE :
                //filebrowserBrowseUrl : 'index.php?external_selector_type=ckeditor&relative_path=files',
                filebrowserImageBrowseUrl: 'index.php?external_selector_type=ckeditor',
                filebrowserFlashBrowseUrl: 'index.php?external_selector_type=ckeditor',
                language: pydio.currentLanguage,
                fullPage: true
            };
        }
    }, {
        key: 'config',
        get: function get() {
            return {
                basePath: DOMUtils.getUrlFromBase() + 'plug/editor.ckeditor/res/build/ckeditor/',
                desktop: _extends({}, Editor.base, {
                    toolbar_Ajxp: [['Source', 'Preview', 'Templates'], ['Undo', 'Redo', '-', 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Print', 'SpellChecker', 'Scayt'], ['Find', 'Replace', '-', 'SelectAll', 'RemoveFormat'], ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'], '/', ['Bold', 'Italic', 'Underline', 'Strike', '-', 'Subscript', 'Superscript'], ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', 'Blockquote'], ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'], ['Link', 'Unlink', 'Anchor'], ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak'], '/', ['Styles', 'Format', 'Font', 'FontSize'], ['TextColor', 'BGColor'], ['Maximize', 'ShowBlocks', '-', 'About']]
                }),
                mobile: _extends({}, Editor.base, {
                    toolbar_Ajxp: [['Bold', 'Italic', 'Underline', '-', 'NumberedList', 'BulletedList'], ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']]
                })
            };
        }
    }]);

    var _Editor = Editor;
    Editor = (0, _reactRedux.connect)(null, EditorActions)(Editor) || Editor;
    return Editor;
})(_react2['default'].Component);

CKEDITOR.basePath = Editor.config.basePath;
CKEDITOR.contentsCss = Editor.config.basePath + '../../res/css/ckeditor.css';

exports['default'] = (0, _reactRedux.connect)(mapStateToProps)(Editor);
module.exports = exports['default'];
