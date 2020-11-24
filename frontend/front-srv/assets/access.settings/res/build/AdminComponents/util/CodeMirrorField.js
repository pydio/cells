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

var _reactCodemirror = require('react-codemirror');

var _reactCodemirror2 = _interopRequireDefault(_reactCodemirror);

require('codemirror/mode/javascript/javascript');

require('codemirror/addon/hint/show-hint');

require('codemirror/addon/hint/javascript-hint');

var CodeEditorField = (function (_React$Component) {
    _inherits(CodeEditorField, _React$Component);

    function CodeEditorField() {
        _classCallCheck(this, CodeEditorField);

        _get(Object.getPrototypeOf(CodeEditorField.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(CodeEditorField, [{
        key: 'jsAutoComplete',
        value: function jsAutoComplete(cm) {
            var codeMirror = this.refs['CodeMirror'].getCodeMirrorInstance();

            // hint options for specific plugin & general show-hint
            // 'tables' is sql-hint specific
            // 'disableKeywords' is also sql-hint specific, and undocumented but referenced in sql-hint plugin
            // Other general hint config, like 'completeSingle' and 'completeOnSingleClick'
            // should be specified here and will be honored
            var hintOptions = {
                globalScope: this.props.globalScope,
                disableKeywords: true,
                completeSingle: false,
                completeOnSingleClick: false
            };

            // codeMirror.hint.sql is defined when importing codemirror/addon/hint/sql-hint
            // (this is mentioned in codemirror addon documentation)
            // Reference the hint function imported here when including other hint addons
            // or supply your own
            codeMirror.showHint(cm, codeMirror.hint.javascript, hintOptions);
        }
    }, {
        key: 'handleChange',
        value: function handleChange(value) {
            this.props.onChange(null, value);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            setTimeout(function () {
                window.dispatchEvent(new Event('resize'));
            }, 0);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var prevValue = prevProps.value ? prevProps.value.length : 0;
            var newValue = this.props.value ? this.props.value.length : 0;
            if (Math.abs(newValue - prevValue) > 50) {
                // We can consider it's a copy, trigger a resize if necessary
                setTimeout(function () {
                    window.dispatchEvent(new Event('resize'));
                }, 0);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var value = _props.value;
            var editorOptions = _props.editorOptions;

            var options = {
                lineNumbers: true,
                tabSize: 2,
                readOnly: this.props.readOnly || false
            };
            if (this.props.mode === 'javascript') {
                options = _extends({}, options, {
                    mode: 'text/javascript',
                    extraKeys: {
                        'Ctrl-Space': this.jsAutoComplete.bind(this)
                    }
                });
            } else if (this.props.mode === 'json') {
                options = _extends({}, options, {
                    mode: 'application/json'
                });
            }
            if (editorOptions) {
                options = _extends({}, options, editorOptions);
            }

            return _react2['default'].createElement(_reactCodemirror2['default'], {
                key: this.props.key,
                ref: 'CodeMirror',
                value: value,
                onChange: this.handleChange.bind(this),
                options: options
            });
        }
    }]);

    return CodeEditorField;
})(_react2['default'].Component);

exports['default'] = CodeEditorField;
module.exports = exports['default'];
