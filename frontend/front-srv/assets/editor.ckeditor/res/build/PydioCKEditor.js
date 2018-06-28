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
    url: _react2['default'].PropTypes.string.isRequired
};

exports['default'] = Editor;
module.exports = exports['default'];

},{"react":"react"}],2:[function(require,module,exports){
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
    var pydio = _ref.pydio;
    var url = _ref.url;
    var content = _ref.content;
    var dispatch = _ref.dispatch;
    var id = _ref.id;

    return pydio.ApiClient.postPlainTextContent(url, content, function (success) {
        if (!success) {
            dispatch(EditorActions.tabModify({ id: id, error: "There was an error while saving" }));
        }
    });
};

exports.onSave = onSave;
/*export const onUndo = ({codemirror}) => codemirror.undo()
export const onRedo = ({codemirror}) => codemirror.redo()
export const onToggleLineNumbers = ({dispatch, id, lineNumbers}) => dispatch(EditorActions.tabModify({id, lineNumbers: !lineNumbers}))
export const onToggleLineWrapping = ({dispatch, id, lineWrapping}) => dispatch(EditorActions.tabModify({id, lineWrapping: !lineWrapping}))

export const onSearch = ({codemirror, cursor}) => (value) => {
    const query = parseQuery(value)

    let cur = codemirror.getSearchCursor(query, cursor.to);

    if (!cur.find()) {
        cur = codemirror.getSearchCursor(query, 0);
        if (!cur.find()) return;
    }

    codemirror.setSelection(cur.from(), cur.to());
    codemirror.scrollIntoView({from: cur.from(), to: cur.to()}, 20);
}

export const onJumpTo = ({codemirror}) => (value) => {
    const line = parseInt(value)
    const cur = codemirror.getCursor();

    codemirror.focus();
    codemirror.setCursor(line - 1, cur.ch);
    codemirror.scrollIntoView({line: line - 1, ch: cur.ch}, 20);
}
*/

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

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Save = PydioHOCs.ContentControls.Save;

var ContentControls = { Save: Save };
exports.ContentControls = ContentControls;

},{}],4:[function(require,module,exports){
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

var Editor = (function (_React$Component) {
    _inherits(Editor, _React$Component);

    function Editor() {
        _classCallCheck(this, Editor);

        _get(Object.getPrototypeOf(Editor.prototype), 'constructor', this).apply(this, arguments);
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

            pydio.ApiClient.getPlainContent(node, function (responseText) {
                dispatch(EditorActions.tabModify({ id: id, content: responseText }));
            });
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

    return Editor;
})(_react2['default'].Component);

CKEDITOR.basePath = Editor.config.basePath;
CKEDITOR.contentsCss = Editor.config.basePath + '../../res/css/ckeditor.css';

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

exports['default'] = (0, _reactRedux.connect)(mapStateToProps)(Editor);
module.exports = exports['default'];

},{"./CKEditor":1,"pydio":"pydio","react":"react","react-redux":"react-redux","redux":"redux"}],5:[function(require,module,exports){
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

var _controls = require('./controls');

var Controls = _interopRequireWildcard(_controls);

exports.Editor = _editor2['default'];
exports.Actions = Actions;
exports.Controls = Controls;

},{"./actions":2,"./controls":3,"./editor":4}]},{},[5])(5)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvUHlkaW9DS0VkaXRvci9DS0VkaXRvci5qcyIsInJlcy9idWlsZC9QeWRpb0NLRWRpdG9yL2FjdGlvbnMuanMiLCJyZXMvYnVpbGQvUHlkaW9DS0VkaXRvci9jb250cm9scy5qcyIsInJlcy9idWlsZC9QeWRpb0NLRWRpdG9yL2VkaXRvci5qcyIsInJlcy9idWlsZC9QeWRpb0NLRWRpdG9yL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgRWRpdG9yID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEVkaXRvciwgX0NvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBFZGl0b3IoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFZGl0b3IpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEVkaXRvci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhFZGl0b3IsIFt7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG4gICAgICAgICAgICB2YXIgdXJsID0gX3Byb3BzLnVybDtcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gX3Byb3BzLmNvbnRlbnQ7XG4gICAgICAgICAgICB2YXIgY29uZmlnID0gX3Byb3BzLmNvbmZpZztcbiAgICAgICAgICAgIHZhciBvbkNoYW5nZSA9IF9wcm9wcy5vbkNoYW5nZTtcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMudGV4dGFyZWEuaWQ7XG5cbiAgICAgICAgICAgIHRoaXMudGV4dGFyZWEudmFsdWUgPSBjb250ZW50O1xuXG4gICAgICAgICAgICB2YXIgZWRpdG9yID0gQ0tFRElUT1IucmVwbGFjZSh0aGlzLnRleHRhcmVhLCBjb25maWcpO1xuXG4gICAgICAgICAgICBlZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVkaXRvciA9IF9yZWYuZWRpdG9yO1xuICAgICAgICAgICAgICAgIHJldHVybiBvbkNoYW5nZShlZGl0b3IuZ2V0RGF0YSgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsVW5tb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMudGV4dGFyZWEuaWQ7XG5cbiAgICAgICAgICAgIGlmIChDS0VESVRPUi5pbnN0YW5jZXNbaWRdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0YXJlYS52YWx1ZSA9IENLRURJVE9SLmluc3RhbmNlc1tpZF0uZ2V0RGF0YSgpO1xuICAgICAgICAgICAgICAgIENLRURJVE9SLmluc3RhbmNlc1tpZF0uZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIHVybCA9IHRoaXMucHJvcHMudXJsO1xuICAgICAgICAgICAgdmFyIHRleHRhcmVhID0gRWRpdG9yLnN0eWxlcy50ZXh0YXJlYTtcblxuICAgICAgICAgICAgdmFyIGlkID0gTGFuZ1V0aWxzLmNvbXB1dGVTdHJpbmdTbHVnKHVybCk7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnLCB7IHJlZjogZnVuY3Rpb24gKHRleHRhcmVhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy50ZXh0YXJlYSA9IHRleHRhcmVhO1xuICAgICAgICAgICAgICAgIH0sIGtleTogaWQsIHN0eWxlOiB0ZXh0YXJlYSB9KTtcbiAgICAgICAgfVxuICAgIH1dLCBbe1xuICAgICAgICBrZXk6ICdzdHlsZXMnLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGV4dGFyZWE6IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IFwiMTAwJVwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBFZGl0b3I7XG59KShfcmVhY3QuQ29tcG9uZW50KTtcblxuRWRpdG9yLnByb3BUeXBlcyA9IHtcbiAgICB1cmw6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWRcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEVkaXRvcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBFZGl0b3JBY3Rpb25zID0gX1B5ZGlvJHJlcXVpcmVMaWIuRWRpdG9yQWN0aW9ucztcblxuLy8gQWN0aW9ucyBkZWZpbml0aW9uc1xudmFyIG9uU2F2ZSA9IGZ1bmN0aW9uIG9uU2F2ZShfcmVmKSB7XG4gICAgdmFyIHB5ZGlvID0gX3JlZi5weWRpbztcbiAgICB2YXIgdXJsID0gX3JlZi51cmw7XG4gICAgdmFyIGNvbnRlbnQgPSBfcmVmLmNvbnRlbnQ7XG4gICAgdmFyIGRpc3BhdGNoID0gX3JlZi5kaXNwYXRjaDtcbiAgICB2YXIgaWQgPSBfcmVmLmlkO1xuXG4gICAgcmV0dXJuIHB5ZGlvLkFwaUNsaWVudC5wb3N0UGxhaW5UZXh0Q29udGVudCh1cmwsIGNvbnRlbnQsIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgICAgZGlzcGF0Y2goRWRpdG9yQWN0aW9ucy50YWJNb2RpZnkoeyBpZDogaWQsIGVycm9yOiBcIlRoZXJlIHdhcyBhbiBlcnJvciB3aGlsZSBzYXZpbmdcIiB9KSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmV4cG9ydHMub25TYXZlID0gb25TYXZlO1xuLypleHBvcnQgY29uc3Qgb25VbmRvID0gKHtjb2RlbWlycm9yfSkgPT4gY29kZW1pcnJvci51bmRvKClcbmV4cG9ydCBjb25zdCBvblJlZG8gPSAoe2NvZGVtaXJyb3J9KSA9PiBjb2RlbWlycm9yLnJlZG8oKVxuZXhwb3J0IGNvbnN0IG9uVG9nZ2xlTGluZU51bWJlcnMgPSAoe2Rpc3BhdGNoLCBpZCwgbGluZU51bWJlcnN9KSA9PiBkaXNwYXRjaChFZGl0b3JBY3Rpb25zLnRhYk1vZGlmeSh7aWQsIGxpbmVOdW1iZXJzOiAhbGluZU51bWJlcnN9KSlcbmV4cG9ydCBjb25zdCBvblRvZ2dsZUxpbmVXcmFwcGluZyA9ICh7ZGlzcGF0Y2gsIGlkLCBsaW5lV3JhcHBpbmd9KSA9PiBkaXNwYXRjaChFZGl0b3JBY3Rpb25zLnRhYk1vZGlmeSh7aWQsIGxpbmVXcmFwcGluZzogIWxpbmVXcmFwcGluZ30pKVxuXG5leHBvcnQgY29uc3Qgb25TZWFyY2ggPSAoe2NvZGVtaXJyb3IsIGN1cnNvcn0pID0+ICh2YWx1ZSkgPT4ge1xuICAgIGNvbnN0IHF1ZXJ5ID0gcGFyc2VRdWVyeSh2YWx1ZSlcblxuICAgIGxldCBjdXIgPSBjb2RlbWlycm9yLmdldFNlYXJjaEN1cnNvcihxdWVyeSwgY3Vyc29yLnRvKTtcblxuICAgIGlmICghY3VyLmZpbmQoKSkge1xuICAgICAgICBjdXIgPSBjb2RlbWlycm9yLmdldFNlYXJjaEN1cnNvcihxdWVyeSwgMCk7XG4gICAgICAgIGlmICghY3VyLmZpbmQoKSkgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvZGVtaXJyb3Iuc2V0U2VsZWN0aW9uKGN1ci5mcm9tKCksIGN1ci50bygpKTtcbiAgICBjb2RlbWlycm9yLnNjcm9sbEludG9WaWV3KHtmcm9tOiBjdXIuZnJvbSgpLCB0bzogY3VyLnRvKCl9LCAyMCk7XG59XG5cbmV4cG9ydCBjb25zdCBvbkp1bXBUbyA9ICh7Y29kZW1pcnJvcn0pID0+ICh2YWx1ZSkgPT4ge1xuICAgIGNvbnN0IGxpbmUgPSBwYXJzZUludCh2YWx1ZSlcbiAgICBjb25zdCBjdXIgPSBjb2RlbWlycm9yLmdldEN1cnNvcigpO1xuXG4gICAgY29kZW1pcnJvci5mb2N1cygpO1xuICAgIGNvZGVtaXJyb3Iuc2V0Q3Vyc29yKGxpbmUgLSAxLCBjdXIuY2gpO1xuICAgIGNvZGVtaXJyb3Iuc2Nyb2xsSW50b1ZpZXcoe2xpbmU6IGxpbmUgLSAxLCBjaDogY3VyLmNofSwgMjApO1xufVxuKi9cbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG52YXIgU2F2ZSA9IFB5ZGlvSE9Dcy5Db250ZW50Q29udHJvbHMuU2F2ZTtcblxudmFyIENvbnRlbnRDb250cm9scyA9IHsgU2F2ZTogU2F2ZSB9O1xuZXhwb3J0cy5Db250ZW50Q29udHJvbHMgPSBDb250ZW50Q29udHJvbHM7XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9yZWFjdFJlZHV4ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxudmFyIF9yZWR1eCA9IHJlcXVpcmUoJ3JlZHV4Jyk7XG5cbnZhciBfQ0tFZGl0b3IgPSByZXF1aXJlKCcuL0NLRWRpdG9yJyk7XG5cbnZhciBfQ0tFZGl0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ0tFZGl0b3IpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBFZGl0b3JBY3Rpb25zID0gX1B5ZGlvJHJlcXVpcmVMaWIuRWRpdG9yQWN0aW9ucztcblxudmFyIEVkaXRvciA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhFZGl0b3IsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gRWRpdG9yKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRWRpdG9yKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihFZGl0b3IucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRWRpdG9yLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMubm9kZTtcbiAgICAgICAgICAgIHZhciB0YWIgPSBfcHJvcHMudGFiO1xuICAgICAgICAgICAgdmFyIGRpc3BhdGNoID0gX3Byb3BzLmRpc3BhdGNoO1xuICAgICAgICAgICAgdmFyIGlkID0gdGFiLmlkO1xuXG4gICAgICAgICAgICBweWRpby5BcGlDbGllbnQuZ2V0UGxhaW5Db250ZW50KG5vZGUsIGZ1bmN0aW9uIChyZXNwb25zZVRleHQpIHtcbiAgICAgICAgICAgICAgICBkaXNwYXRjaChFZGl0b3JBY3Rpb25zLnRhYk1vZGlmeSh7IGlkOiBpZCwgY29udGVudDogcmVzcG9uc2VUZXh0IH0pKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcbiAgICAgICAgICAgIHZhciBub2RlID0gX3Byb3BzMi5ub2RlO1xuICAgICAgICAgICAgdmFyIHRhYiA9IF9wcm9wczIudGFiO1xuICAgICAgICAgICAgdmFyIGRpc3BhdGNoID0gX3Byb3BzMi5kaXNwYXRjaDtcbiAgICAgICAgICAgIHZhciBfRWRpdG9yJGNvbmZpZyA9IEVkaXRvci5jb25maWc7XG4gICAgICAgICAgICB2YXIgZGVza3RvcCA9IF9FZGl0b3IkY29uZmlnLmRlc2t0b3A7XG4gICAgICAgICAgICB2YXIgbW9iaWxlID0gX0VkaXRvciRjb25maWcubW9iaWxlO1xuICAgICAgICAgICAgdmFyIGlkID0gdGFiLmlkO1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB0YWIuY29udGVudDtcblxuICAgICAgICAgICAgaWYgKCFjb250ZW50KSByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9DS0VkaXRvcjJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgIHVybDogbm9kZS5nZXRQYXRoKCksXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcbiAgICAgICAgICAgICAgICBjb25maWc6IHB5ZGlvLlVJLk1PQklMRV9FWFRFTlNJT05TID8gbW9iaWxlIDogZGVza3RvcCxcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpc3BhdGNoKEVkaXRvckFjdGlvbnMudGFiTW9kaWZ5KHsgaWQ6IGlkLCBjb250ZW50OiBjb250ZW50IH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1dLCBbe1xuICAgICAgICBrZXk6ICdwcm9wVHlwZXMnLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc2hvd0NvbnRyb2xzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGVmYXVsdFByb3BzJyxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNob3dDb250cm9sczogZmFsc2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Jhc2UnLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzaXplX2VuYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHRvb2xiYXI6IFwiQWp4cFwiLFxuICAgICAgICAgICAgICAgIGNvbnRlbnRzQ3NzOiAnLi4vLi4vcmVzL2NrZWRpdG9yLmNzcycsXG4gICAgICAgICAgICAgICAgZmlsZWJyb3dzZXJCcm93c2VVcmw6ICdpbmRleC5waHA/ZXh0ZXJuYWxfc2VsZWN0b3JfdHlwZT1ja2VkaXRvcicsXG4gICAgICAgICAgICAgICAgLy8gSUYgWU9VIEtOT1cgVEhFIFJFTEFUSVZFIFBBVEggT0YgVEhFIElNQUdFUyAoQkVUV0VFTiBSRVBPU0lUT1JZIFJPT1QgQU5EIFJFQUwgRklMRSlcbiAgICAgICAgICAgICAgICAvLyBZT1UgQ0FOIFBBU1MgSVQgV0lUSCBUSEUgcmVsYXRpdmVfcGF0aCBQQVJBTUVURVIuIEZPUiBFWEFNUExFIDpcbiAgICAgICAgICAgICAgICAvL2ZpbGVicm93c2VyQnJvd3NlVXJsIDogJ2luZGV4LnBocD9leHRlcm5hbF9zZWxlY3Rvcl90eXBlPWNrZWRpdG9yJnJlbGF0aXZlX3BhdGg9ZmlsZXMnLFxuICAgICAgICAgICAgICAgIGZpbGVicm93c2VySW1hZ2VCcm93c2VVcmw6ICdpbmRleC5waHA/ZXh0ZXJuYWxfc2VsZWN0b3JfdHlwZT1ja2VkaXRvcicsXG4gICAgICAgICAgICAgICAgZmlsZWJyb3dzZXJGbGFzaEJyb3dzZVVybDogJ2luZGV4LnBocD9leHRlcm5hbF9zZWxlY3Rvcl90eXBlPWNrZWRpdG9yJyxcbiAgICAgICAgICAgICAgICBsYW5ndWFnZTogcHlkaW8uY3VycmVudExhbmd1YWdlLFxuICAgICAgICAgICAgICAgIGZ1bGxQYWdlOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb25maWcnLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYmFzZVBhdGg6IERPTVV0aWxzLmdldFVybEZyb21CYXNlKCkgKyAncGx1Zy9lZGl0b3IuY2tlZGl0b3IvcmVzL2J1aWxkL2NrZWRpdG9yLycsXG4gICAgICAgICAgICAgICAgZGVza3RvcDogX2V4dGVuZHMoe30sIEVkaXRvci5iYXNlLCB7XG4gICAgICAgICAgICAgICAgICAgIHRvb2xiYXJfQWp4cDogW1snU291cmNlJywgJ1ByZXZpZXcnLCAnVGVtcGxhdGVzJ10sIFsnVW5kbycsICdSZWRvJywgJy0nLCAnQ3V0JywgJ0NvcHknLCAnUGFzdGUnLCAnUGFzdGVUZXh0JywgJ1Bhc3RlRnJvbVdvcmQnLCAnLScsICdQcmludCcsICdTcGVsbENoZWNrZXInLCAnU2NheXQnXSwgWydGaW5kJywgJ1JlcGxhY2UnLCAnLScsICdTZWxlY3RBbGwnLCAnUmVtb3ZlRm9ybWF0J10sIFsnRm9ybScsICdDaGVja2JveCcsICdSYWRpbycsICdUZXh0RmllbGQnLCAnVGV4dGFyZWEnLCAnU2VsZWN0JywgJ0J1dHRvbicsICdJbWFnZUJ1dHRvbicsICdIaWRkZW5GaWVsZCddLCAnLycsIFsnQm9sZCcsICdJdGFsaWMnLCAnVW5kZXJsaW5lJywgJ1N0cmlrZScsICctJywgJ1N1YnNjcmlwdCcsICdTdXBlcnNjcmlwdCddLCBbJ051bWJlcmVkTGlzdCcsICdCdWxsZXRlZExpc3QnLCAnLScsICdPdXRkZW50JywgJ0luZGVudCcsICdCbG9ja3F1b3RlJ10sIFsnSnVzdGlmeUxlZnQnLCAnSnVzdGlmeUNlbnRlcicsICdKdXN0aWZ5UmlnaHQnLCAnSnVzdGlmeUJsb2NrJ10sIFsnTGluaycsICdVbmxpbmsnLCAnQW5jaG9yJ10sIFsnSW1hZ2UnLCAnRmxhc2gnLCAnVGFibGUnLCAnSG9yaXpvbnRhbFJ1bGUnLCAnU21pbGV5JywgJ1NwZWNpYWxDaGFyJywgJ1BhZ2VCcmVhayddLCAnLycsIFsnU3R5bGVzJywgJ0Zvcm1hdCcsICdGb250JywgJ0ZvbnRTaXplJ10sIFsnVGV4dENvbG9yJywgJ0JHQ29sb3InXSwgWydNYXhpbWl6ZScsICdTaG93QmxvY2tzJywgJy0nLCAnQWJvdXQnXV1cbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtb2JpbGU6IF9leHRlbmRzKHt9LCBFZGl0b3IuYmFzZSwge1xuICAgICAgICAgICAgICAgICAgICB0b29sYmFyX0FqeHA6IFtbJ0JvbGQnLCAnSXRhbGljJywgJ1VuZGVybGluZScsICctJywgJ051bWJlcmVkTGlzdCcsICdCdWxsZXRlZExpc3QnXSwgWydKdXN0aWZ5TGVmdCcsICdKdXN0aWZ5Q2VudGVyJywgJ0p1c3RpZnlSaWdodCcsICdKdXN0aWZ5QmxvY2snXV1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBFZGl0b3I7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuQ0tFRElUT1IuYmFzZVBhdGggPSBFZGl0b3IuY29uZmlnLmJhc2VQYXRoO1xuQ0tFRElUT1IuY29udGVudHNDc3MgPSBFZGl0b3IuY29uZmlnLmJhc2VQYXRoICsgJy4uLy4uL3Jlcy9jc3MvY2tlZGl0b3IuY3NzJztcblxudmFyIG1hcFN0YXRlVG9Qcm9wcyA9IGZ1bmN0aW9uIG1hcFN0YXRlVG9Qcm9wcyhzdGF0ZSwgcHJvcHMpIHtcbiAgICB2YXIgdGFicyA9IHN0YXRlLnRhYnM7XG5cbiAgICB2YXIgdGFiID0gdGFicy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgICAgdmFyIGVkaXRvckRhdGEgPSBfcmVmLmVkaXRvckRhdGE7XG4gICAgICAgIHZhciBub2RlID0gX3JlZi5ub2RlO1xuICAgICAgICByZXR1cm4gKCFlZGl0b3JEYXRhIHx8IGVkaXRvckRhdGEuaWQgPT09IHByb3BzLmVkaXRvckRhdGEuaWQpICYmIG5vZGUuZ2V0UGF0aCgpID09PSBwcm9wcy5ub2RlLmdldFBhdGgoKTtcbiAgICB9KVswXSB8fCB7fTtcblxuICAgIHJldHVybiBfZXh0ZW5kcyh7XG4gICAgICAgIGlkOiB0YWIuaWQsXG4gICAgICAgIHRhYjogdGFiXG4gICAgfSwgcHJvcHMpO1xufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gKDAsIF9yZWFjdFJlZHV4LmNvbm5lY3QpKG1hcFN0YXRlVG9Qcm9wcykoRWRpdG9yKTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHsgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkgeyByZXR1cm4gb2JqOyB9IGVsc2UgeyB2YXIgbmV3T2JqID0ge307IGlmIChvYmogIT0gbnVsbCkgeyBmb3IgKHZhciBrZXkgaW4gb2JqKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldOyB9IH0gbmV3T2JqWydkZWZhdWx0J10gPSBvYmo7IHJldHVybiBuZXdPYmo7IH0gfVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfZWRpdG9yID0gcmVxdWlyZSgnLi9lZGl0b3InKTtcblxudmFyIF9lZGl0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZWRpdG9yKTtcblxudmFyIF9hY3Rpb25zID0gcmVxdWlyZSgnLi9hY3Rpb25zJyk7XG5cbnZhciBBY3Rpb25zID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2FjdGlvbnMpO1xuXG52YXIgX2NvbnRyb2xzID0gcmVxdWlyZSgnLi9jb250cm9scycpO1xuXG52YXIgQ29udHJvbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfY29udHJvbHMpO1xuXG5leHBvcnRzLkVkaXRvciA9IF9lZGl0b3IyWydkZWZhdWx0J107XG5leHBvcnRzLkFjdGlvbnMgPSBBY3Rpb25zO1xuZXhwb3J0cy5Db250cm9scyA9IENvbnRyb2xzO1xuIl19
