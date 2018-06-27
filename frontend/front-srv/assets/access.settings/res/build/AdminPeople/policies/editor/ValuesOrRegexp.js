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

var _materialUi = require('material-ui');

var ValuesOrRegexp = (function (_React$Component) {
    _inherits(ValuesOrRegexp, _React$Component);

    function ValuesOrRegexp(props) {
        _classCallCheck(this, ValuesOrRegexp);

        _get(Object.getPrototypeOf(ValuesOrRegexp.prototype), 'constructor', this).call(this, props);
        this.state = {
            showTextField: false,
            textFieldValue: ''
        };
    }

    _createClass(ValuesOrRegexp, [{
        key: 'onItemTouchTap',
        value: function onItemTouchTap(event, value) {
            var _this = this;

            var _props = this.props;
            var onValueSelected = _props.onValueSelected;
            var freeStringDefaultPrefix = _props.freeStringDefaultPrefix;

            if (value === -1 || value.startsWith("preset-free-string:")) {
                var prefix = freeStringDefaultPrefix ? freeStringDefaultPrefix : '';
                if (value !== -1) {
                    prefix = value.replace("preset-free-string:", "");
                }
                this.setState({
                    showTextField: true,
                    textFieldValue: prefix
                }, function () {
                    _this.refs.textField.focus();
                });
                return;
            }
            onValueSelected(value);
        }
    }, {
        key: 'onTextFieldSubmitted',
        value: function onTextFieldSubmitted() {
            var value = this.refs.textField.getValue();
            this.props.onValueSelected(value);
            this.setState({ showTextField: false, textFieldValue: '' });
        }
    }, {
        key: 'cancelTextField',
        value: function cancelTextField() {
            this.setState({ showTextField: false, textFieldValue: '' });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var presetValues = _props2.presetValues;
            var allowAll = _props2.allowAll;
            var allowFreeString = _props2.allowFreeString;
            var presetFreeStrings = _props2.presetFreeStrings;

            var items = [];
            if (presetValues) {
                items = presetValues.map(function (v) {
                    return _react2['default'].createElement(_materialUi.MenuItem, { value: v, primaryText: v });
                });
            }
            if (allowAll) {
                items.push(_react2['default'].createElement(_materialUi.MenuItem, { value: "<.+>", primaryText: "Any values (*)" }));
            }

            if (allowFreeString) {
                if (items.length) {
                    items.push(_react2['default'].createElement(_materialUi.Divider, null));
                }
                if (presetFreeStrings) {
                    Object.keys(presetFreeStrings).map(function (k) {
                        items.push(_react2['default'].createElement(_materialUi.MenuItem, { value: "preset-free-string:" + k, primaryText: presetFreeStrings[k] + "..." }));
                    });
                } else {
                    items.push(_react2['default'].createElement(_materialUi.MenuItem, { value: -1, primaryText: "Enter Free Value..." }));
                }
            }

            var editBoxStyle = {
                display: 'flex',
                position: 'absolute',
                right: 16,
                zIndex: 100,
                alignItems: 'center',
                backgroundColor: '#f4f4f4',
                paddingLeft: 10,
                borderRadius: 2
            };

            if (this.state.showTextField) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        _materialUi.Paper,
                        { zDepth: 2, style: editBoxStyle },
                        _react2['default'].createElement(_materialUi.TextField, { style: { width: 200 }, ref: 'textField', hintText: "Enter free value...", defaultValue: this.state.textFieldValue }),
                        _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-check", tooltip: "Add", onTouchTap: this.onTextFieldSubmitted.bind(this) }),
                        _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-cancel", tooltip: "Cancel", onTouchTap: this.cancelTextField.bind(this) })
                    ),
                    _react2['default'].createElement('div', { style: { height: 48 } })
                );
            } else {
                return _react2['default'].createElement(
                    _materialUi.IconMenu,
                    {
                        iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-plus", tooltip: "Add value..." }),
                        onChange: this.onItemTouchTap.bind(this)
                    },
                    items
                );
            }
        }
    }]);

    return ValuesOrRegexp;
})(_react2['default'].Component);

exports['default'] = ValuesOrRegexp;
module.exports = exports['default'];
