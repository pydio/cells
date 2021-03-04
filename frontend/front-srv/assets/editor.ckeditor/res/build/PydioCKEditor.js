(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioCKEditor = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var Editor = (function (_Component) {
    _inherits(Editor, _Component);

    function Editor() {
        _classCallCheck(this, Editor);

        _get(Object.getPrototypeOf(Editor.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Editor, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _props = this.props;
            var pydio = _props.pydio;
            var url = _props.url;
            var content = _props.content;
            var config = _props.config;
            var onChange = _props.onChange;
            var id = this.textarea.id;

            this.textarea.value = content;

            var editor = CKEDITOR.replace(this.textarea, config);

            editor.on('change', function (_ref) {
                var editor = _ref.editor;
                return onChange(editor.getData());
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var id = this.textarea.id;

            if (CKEDITOR.instances[id]) {
                this.textarea.value = CKEDITOR.instances[id].getData();
                CKEDITOR.instances[id].destroy();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var url = this.props.url;
            var textarea = Editor.styles.textarea;

            var id = LangUtils.computeStringSlug(url);

            return _react2['default'].createElement('textarea', { ref: function (textarea) {
                    return _this.textarea = textarea;
                }, key: id, style: textarea });
        }
    }], [{
        key: 'styles',
        get: function get() {
            return {
                textarea: {
                    width: "100%"
                }
            };
        }
    }]);

    return Editor;
})(_react.Component);

Editor.propTypes = {
    url: _propTypes2['default'].string.isRequired
};

exports['default'] = Editor;
module.exports = exports['default'];

},{"prop-types":"prop-types","react":"react"}],2:[function(require,module,exports){
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib.EditorActions;

// Actions definitions
var onSave = function onSave(_ref) {
    var tab = _ref.tab;
    var dispatch = _ref.dispatch;
    return function () {
        return tab.pydio.ApiClient.postPlainTextContent(tab.url, tab.content, function (success) {
            if (!success) {
                dispatch(EditorActions.tabModify({ id: tab.id, error: "There was an error while saving" }));
            }
        });
    };
};
exports.onSave = onSave;

},{"pydio":"pydio"}],3:[function(require,module,exports){
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

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
                dispatch(EditorActions.tabModify({ id: id, editable: true, content: responseText }));
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
                showControls: _propTypes2['default'].bool.isRequired
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

},{"./CKEditor":1,"prop-types":"prop-types","pydio":"pydio","react":"react","react-redux":"react-redux","redux":"redux"}],4:[function(require,module,exports){
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _editor = require('./editor');

var _editor2 = _interopRequireDefault(_editor);

var _actions = require('./actions');

var Actions = _interopRequireWildcard(_actions);

exports.Editor = _editor2['default'];
exports.Actions = Actions;

},{"./actions":2,"./editor":3}]},{},[4])(4)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvUHlkaW9DS0VkaXRvci9DS0VkaXRvci5qcyIsInJlcy9idWlsZC9QeWRpb0NLRWRpdG9yL2FjdGlvbnMuanMiLCJyZXMvYnVpbGQvUHlkaW9DS0VkaXRvci9lZGl0b3IuanMiLCJyZXMvYnVpbGQvUHlkaW9DS0VkaXRvci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG52YXIgX3Byb3BUeXBlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcm9wVHlwZXMpO1xuXG52YXIgRWRpdG9yID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEVkaXRvciwgX0NvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBFZGl0b3IoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFZGl0b3IpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEVkaXRvci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhFZGl0b3IsIFt7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG4gICAgICAgICAgICB2YXIgdXJsID0gX3Byb3BzLnVybDtcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gX3Byb3BzLmNvbnRlbnQ7XG4gICAgICAgICAgICB2YXIgY29uZmlnID0gX3Byb3BzLmNvbmZpZztcbiAgICAgICAgICAgIHZhciBvbkNoYW5nZSA9IF9wcm9wcy5vbkNoYW5nZTtcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMudGV4dGFyZWEuaWQ7XG5cbiAgICAgICAgICAgIHRoaXMudGV4dGFyZWEudmFsdWUgPSBjb250ZW50O1xuXG4gICAgICAgICAgICB2YXIgZWRpdG9yID0gQ0tFRElUT1IucmVwbGFjZSh0aGlzLnRleHRhcmVhLCBjb25maWcpO1xuXG4gICAgICAgICAgICBlZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVkaXRvciA9IF9yZWYuZWRpdG9yO1xuICAgICAgICAgICAgICAgIHJldHVybiBvbkNoYW5nZShlZGl0b3IuZ2V0RGF0YSgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsVW5tb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMudGV4dGFyZWEuaWQ7XG5cbiAgICAgICAgICAgIGlmIChDS0VESVRPUi5pbnN0YW5jZXNbaWRdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0YXJlYS52YWx1ZSA9IENLRURJVE9SLmluc3RhbmNlc1tpZF0uZ2V0RGF0YSgpO1xuICAgICAgICAgICAgICAgIENLRURJVE9SLmluc3RhbmNlc1tpZF0uZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIHVybCA9IHRoaXMucHJvcHMudXJsO1xuICAgICAgICAgICAgdmFyIHRleHRhcmVhID0gRWRpdG9yLnN0eWxlcy50ZXh0YXJlYTtcblxuICAgICAgICAgICAgdmFyIGlkID0gTGFuZ1V0aWxzLmNvbXB1dGVTdHJpbmdTbHVnKHVybCk7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnLCB7IHJlZjogZnVuY3Rpb24gKHRleHRhcmVhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy50ZXh0YXJlYSA9IHRleHRhcmVhO1xuICAgICAgICAgICAgICAgIH0sIGtleTogaWQsIHN0eWxlOiB0ZXh0YXJlYSB9KTtcbiAgICAgICAgfVxuICAgIH1dLCBbe1xuICAgICAgICBrZXk6ICdzdHlsZXMnLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGV4dGFyZWE6IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IFwiMTAwJVwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBFZGl0b3I7XG59KShfcmVhY3QuQ29tcG9uZW50KTtcblxuRWRpdG9yLnByb3BUeXBlcyA9IHtcbiAgICB1cmw6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uc3RyaW5nLmlzUmVxdWlyZWRcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEVkaXRvcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBFZGl0b3JBY3Rpb25zID0gX1B5ZGlvJHJlcXVpcmVMaWIuRWRpdG9yQWN0aW9ucztcblxuLy8gQWN0aW9ucyBkZWZpbml0aW9uc1xudmFyIG9uU2F2ZSA9IGZ1bmN0aW9uIG9uU2F2ZShfcmVmKSB7XG4gICAgdmFyIHRhYiA9IF9yZWYudGFiO1xuICAgIHZhciBkaXNwYXRjaCA9IF9yZWYuZGlzcGF0Y2g7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRhYi5weWRpby5BcGlDbGllbnQucG9zdFBsYWluVGV4dENvbnRlbnQodGFiLnVybCwgdGFiLmNvbnRlbnQsIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBkaXNwYXRjaChFZGl0b3JBY3Rpb25zLnRhYk1vZGlmeSh7IGlkOiB0YWIuaWQsIGVycm9yOiBcIlRoZXJlIHdhcyBhbiBlcnJvciB3aGlsZSBzYXZpbmdcIiB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59O1xuZXhwb3J0cy5vblNhdmUgPSBvblNhdmU7XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9wcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbnZhciBfcHJvcFR5cGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Byb3BUeXBlcyk7XG5cbnZhciBfcmVhY3RSZWR1eCA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbnZhciBfcmVkdXggPSByZXF1aXJlKCdyZWR1eCcpO1xuXG52YXIgX0NLRWRpdG9yID0gcmVxdWlyZSgnLi9DS0VkaXRvcicpO1xuXG52YXIgX0NLRWRpdG9yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NLRWRpdG9yKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2hvYycpO1xuXG52YXIgRWRpdG9yQWN0aW9ucyA9IF9QeWRpbyRyZXF1aXJlTGliLkVkaXRvckFjdGlvbnM7XG5cbnZhciBtYXBTdGF0ZVRvUHJvcHMgPSBmdW5jdGlvbiBtYXBTdGF0ZVRvUHJvcHMoc3RhdGUsIHByb3BzKSB7XG4gICAgdmFyIHRhYnMgPSBzdGF0ZS50YWJzO1xuXG4gICAgdmFyIHRhYiA9IHRhYnMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgICAgIHZhciBlZGl0b3JEYXRhID0gX3JlZi5lZGl0b3JEYXRhO1xuICAgICAgICB2YXIgbm9kZSA9IF9yZWYubm9kZTtcbiAgICAgICAgcmV0dXJuICghZWRpdG9yRGF0YSB8fCBlZGl0b3JEYXRhLmlkID09PSBwcm9wcy5lZGl0b3JEYXRhLmlkKSAmJiBub2RlLmdldFBhdGgoKSA9PT0gcHJvcHMubm9kZS5nZXRQYXRoKCk7XG4gICAgfSlbMF0gfHwge307XG5cbiAgICByZXR1cm4gX2V4dGVuZHMoe1xuICAgICAgICBpZDogdGFiLmlkLFxuICAgICAgICB0YWI6IHRhYlxuICAgIH0sIHByb3BzKTtcbn07XG5cbnZhciBFZGl0b3IgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoRWRpdG9yLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEVkaXRvcigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIF9FZGl0b3IpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKF9FZGl0b3IucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRWRpdG9yLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMubm9kZTtcbiAgICAgICAgICAgIHZhciB0YWIgPSBfcHJvcHMudGFiO1xuICAgICAgICAgICAgdmFyIGRpc3BhdGNoID0gX3Byb3BzLmRpc3BhdGNoO1xuICAgICAgICAgICAgdmFyIGlkID0gdGFiLmlkO1xuICAgICAgICAgICAgdmFyIGVkaXRvck1vZGlmeSA9IHRoaXMucHJvcHMuZWRpdG9yTW9kaWZ5O1xuXG4gICAgICAgICAgICBpZiAoZWRpdG9yTW9kaWZ5ICYmIHRoaXMucHJvcHMuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICBlZGl0b3JNb2RpZnkoeyBmaXhlZFRvb2xiYXI6IHRydWUgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHB5ZGlvLkFwaUNsaWVudC5nZXRQbGFpbkNvbnRlbnQobm9kZSwgZnVuY3Rpb24gKHJlc3BvbnNlVGV4dCkge1xuICAgICAgICAgICAgICAgIGRpc3BhdGNoKEVkaXRvckFjdGlvbnMudGFiTW9kaWZ5KHsgaWQ6IGlkLCBlZGl0YWJsZTogdHJ1ZSwgY29udGVudDogcmVzcG9uc2VUZXh0IH0pKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgICAgICB2YXIgZWRpdG9yTW9kaWZ5ID0gdGhpcy5wcm9wcy5lZGl0b3JNb2RpZnk7XG5cbiAgICAgICAgICAgIGlmIChlZGl0b3JNb2RpZnkgJiYgbmV4dFByb3BzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgZWRpdG9yTW9kaWZ5KHsgZml4ZWRUb29sYmFyOiB0cnVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcbiAgICAgICAgICAgIHZhciBub2RlID0gX3Byb3BzMi5ub2RlO1xuICAgICAgICAgICAgdmFyIHRhYiA9IF9wcm9wczIudGFiO1xuICAgICAgICAgICAgdmFyIGRpc3BhdGNoID0gX3Byb3BzMi5kaXNwYXRjaDtcbiAgICAgICAgICAgIHZhciBfRWRpdG9yJGNvbmZpZyA9IEVkaXRvci5jb25maWc7XG4gICAgICAgICAgICB2YXIgZGVza3RvcCA9IF9FZGl0b3IkY29uZmlnLmRlc2t0b3A7XG4gICAgICAgICAgICB2YXIgbW9iaWxlID0gX0VkaXRvciRjb25maWcubW9iaWxlO1xuICAgICAgICAgICAgdmFyIGlkID0gdGFiLmlkO1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB0YWIuY29udGVudDtcblxuICAgICAgICAgICAgaWYgKCFjb250ZW50KSByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9DS0VkaXRvcjJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgIHVybDogbm9kZS5nZXRQYXRoKCksXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcbiAgICAgICAgICAgICAgICBjb25maWc6IHB5ZGlvLlVJLk1PQklMRV9FWFRFTlNJT05TID8gbW9iaWxlIDogZGVza3RvcCxcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpc3BhdGNoKEVkaXRvckFjdGlvbnMudGFiTW9kaWZ5KHsgaWQ6IGlkLCBjb250ZW50OiBjb250ZW50IH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1dLCBbe1xuICAgICAgICBrZXk6ICdwcm9wVHlwZXMnLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc2hvd0NvbnRyb2xzOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmJvb2wuaXNSZXF1aXJlZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGVmYXVsdFByb3BzJyxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNob3dDb250cm9sczogZmFsc2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Jhc2UnLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzaXplX2VuYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHRvb2xiYXI6IFwiQWp4cFwiLFxuICAgICAgICAgICAgICAgIGNvbnRlbnRzQ3NzOiAnLi4vLi4vcmVzL2NrZWRpdG9yLmNzcycsXG4gICAgICAgICAgICAgICAgZmlsZWJyb3dzZXJCcm93c2VVcmw6ICdpbmRleC5waHA/ZXh0ZXJuYWxfc2VsZWN0b3JfdHlwZT1ja2VkaXRvcicsXG4gICAgICAgICAgICAgICAgLy8gSUYgWU9VIEtOT1cgVEhFIFJFTEFUSVZFIFBBVEggT0YgVEhFIElNQUdFUyAoQkVUV0VFTiBSRVBPU0lUT1JZIFJPT1QgQU5EIFJFQUwgRklMRSlcbiAgICAgICAgICAgICAgICAvLyBZT1UgQ0FOIFBBU1MgSVQgV0lUSCBUSEUgcmVsYXRpdmVfcGF0aCBQQVJBTUVURVIuIEZPUiBFWEFNUExFIDpcbiAgICAgICAgICAgICAgICAvL2ZpbGVicm93c2VyQnJvd3NlVXJsIDogJ2luZGV4LnBocD9leHRlcm5hbF9zZWxlY3Rvcl90eXBlPWNrZWRpdG9yJnJlbGF0aXZlX3BhdGg9ZmlsZXMnLFxuICAgICAgICAgICAgICAgIGZpbGVicm93c2VySW1hZ2VCcm93c2VVcmw6ICdpbmRleC5waHA/ZXh0ZXJuYWxfc2VsZWN0b3JfdHlwZT1ja2VkaXRvcicsXG4gICAgICAgICAgICAgICAgZmlsZWJyb3dzZXJGbGFzaEJyb3dzZVVybDogJ2luZGV4LnBocD9leHRlcm5hbF9zZWxlY3Rvcl90eXBlPWNrZWRpdG9yJyxcbiAgICAgICAgICAgICAgICBsYW5ndWFnZTogcHlkaW8uY3VycmVudExhbmd1YWdlLFxuICAgICAgICAgICAgICAgIGZ1bGxQYWdlOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb25maWcnLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYmFzZVBhdGg6IERPTVV0aWxzLmdldFVybEZyb21CYXNlKCkgKyAncGx1Zy9lZGl0b3IuY2tlZGl0b3IvcmVzL2J1aWxkL2NrZWRpdG9yLycsXG4gICAgICAgICAgICAgICAgZGVza3RvcDogX2V4dGVuZHMoe30sIEVkaXRvci5iYXNlLCB7XG4gICAgICAgICAgICAgICAgICAgIHRvb2xiYXJfQWp4cDogW1snU291cmNlJywgJ1ByZXZpZXcnLCAnVGVtcGxhdGVzJ10sIFsnVW5kbycsICdSZWRvJywgJy0nLCAnQ3V0JywgJ0NvcHknLCAnUGFzdGUnLCAnUGFzdGVUZXh0JywgJ1Bhc3RlRnJvbVdvcmQnLCAnLScsICdQcmludCcsICdTcGVsbENoZWNrZXInLCAnU2NheXQnXSwgWydGaW5kJywgJ1JlcGxhY2UnLCAnLScsICdTZWxlY3RBbGwnLCAnUmVtb3ZlRm9ybWF0J10sIFsnRm9ybScsICdDaGVja2JveCcsICdSYWRpbycsICdUZXh0RmllbGQnLCAnVGV4dGFyZWEnLCAnU2VsZWN0JywgJ0J1dHRvbicsICdJbWFnZUJ1dHRvbicsICdIaWRkZW5GaWVsZCddLCAnLycsIFsnQm9sZCcsICdJdGFsaWMnLCAnVW5kZXJsaW5lJywgJ1N0cmlrZScsICctJywgJ1N1YnNjcmlwdCcsICdTdXBlcnNjcmlwdCddLCBbJ051bWJlcmVkTGlzdCcsICdCdWxsZXRlZExpc3QnLCAnLScsICdPdXRkZW50JywgJ0luZGVudCcsICdCbG9ja3F1b3RlJ10sIFsnSnVzdGlmeUxlZnQnLCAnSnVzdGlmeUNlbnRlcicsICdKdXN0aWZ5UmlnaHQnLCAnSnVzdGlmeUJsb2NrJ10sIFsnTGluaycsICdVbmxpbmsnLCAnQW5jaG9yJ10sIFsnSW1hZ2UnLCAnRmxhc2gnLCAnVGFibGUnLCAnSG9yaXpvbnRhbFJ1bGUnLCAnU21pbGV5JywgJ1NwZWNpYWxDaGFyJywgJ1BhZ2VCcmVhayddLCAnLycsIFsnU3R5bGVzJywgJ0Zvcm1hdCcsICdGb250JywgJ0ZvbnRTaXplJ10sIFsnVGV4dENvbG9yJywgJ0JHQ29sb3InXSwgWydNYXhpbWl6ZScsICdTaG93QmxvY2tzJywgJy0nLCAnQWJvdXQnXV1cbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtb2JpbGU6IF9leHRlbmRzKHt9LCBFZGl0b3IuYmFzZSwge1xuICAgICAgICAgICAgICAgICAgICB0b29sYmFyX0FqeHA6IFtbJ0JvbGQnLCAnSXRhbGljJywgJ1VuZGVybGluZScsICctJywgJ051bWJlcmVkTGlzdCcsICdCdWxsZXRlZExpc3QnXSwgWydKdXN0aWZ5TGVmdCcsICdKdXN0aWZ5Q2VudGVyJywgJ0p1c3RpZnlSaWdodCcsICdKdXN0aWZ5QmxvY2snXV1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHZhciBfRWRpdG9yID0gRWRpdG9yO1xuICAgIEVkaXRvciA9ICgwLCBfcmVhY3RSZWR1eC5jb25uZWN0KShudWxsLCBFZGl0b3JBY3Rpb25zKShFZGl0b3IpIHx8IEVkaXRvcjtcbiAgICByZXR1cm4gRWRpdG9yO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbkNLRURJVE9SLmJhc2VQYXRoID0gRWRpdG9yLmNvbmZpZy5iYXNlUGF0aDtcbkNLRURJVE9SLmNvbnRlbnRzQ3NzID0gRWRpdG9yLmNvbmZpZy5iYXNlUGF0aCArICcuLi8uLi9yZXMvY3NzL2NrZWRpdG9yLmNzcyc7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9ICgwLCBfcmVhY3RSZWR1eC5jb25uZWN0KShtYXBTdGF0ZVRvUHJvcHMpKEVkaXRvcik7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQob2JqKSB7IGlmIChvYmogJiYgb2JqLl9fZXNNb2R1bGUpIHsgcmV0dXJuIG9iajsgfSBlbHNlIHsgdmFyIG5ld09iaiA9IHt9OyBpZiAob2JqICE9IG51bGwpIHsgZm9yICh2YXIga2V5IGluIG9iaikgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgbmV3T2JqW2tleV0gPSBvYmpba2V5XTsgfSB9IG5ld09ialsnZGVmYXVsdCddID0gb2JqOyByZXR1cm4gbmV3T2JqOyB9IH1cblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX2VkaXRvciA9IHJlcXVpcmUoJy4vZWRpdG9yJyk7XG5cbnZhciBfZWRpdG9yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2VkaXRvcik7XG5cbnZhciBfYWN0aW9ucyA9IHJlcXVpcmUoJy4vYWN0aW9ucycpO1xuXG52YXIgQWN0aW9ucyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9hY3Rpb25zKTtcblxuZXhwb3J0cy5FZGl0b3IgPSBfZWRpdG9yMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5BY3Rpb25zID0gQWN0aW9ucztcbiJdfQ==
