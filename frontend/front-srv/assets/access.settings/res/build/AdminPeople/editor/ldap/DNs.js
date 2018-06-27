'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var DNs = (function (_React$Component) {
    _inherits(DNs, _React$Component);

    function DNs(props) {
        _classCallCheck(this, DNs);

        _get(Object.getPrototypeOf(DNs.prototype), 'constructor', this).call(this, props);
    }

    _createClass(DNs, [{
        key: 'addDn',
        value: function addDn() {
            var _props = this.props;
            var dns = _props.dns;
            var onChange = _props.onChange;

            var newDns = [].concat(_toConsumableArray(dns), ['']);
            onChange(newDns);
        }
    }, {
        key: 'editDn',
        value: function editDn(index, value) {
            var _props2 = this.props;
            var dns = _props2.dns;
            var onChange = _props2.onChange;

            var newVals = [].concat(_toConsumableArray(dns.slice(0, index > 0 ? index : 0)), [value], _toConsumableArray(dns.slice(index + 1)));
            onChange(newVals);
        }
    }, {
        key: 'removeDn',
        value: function removeDn(index) {
            var _props3 = this.props;
            var dns = _props3.dns;
            var onChange = _props3.onChange;

            onChange([].concat(_toConsumableArray(dns.slice(0, index)), _toConsumableArray(dns.slice(index + 1))));
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props4 = this.props;
            var dns = _props4.dns;
            var pydio = _props4.pydio;

            return _react2['default'].createElement(
                'div',
                null,
                dns.map(function (dn, k) {
                    return _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', alignItems: k === 0 ? 'baseline' : 'center' } },
                        _react2['default'].createElement(
                            'div',
                            { style: { flex: 1 } },
                            _react2['default'].createElement(_materialUi.TextField, { fullWidth: 1, floatingLabelText: k === 0 ? "DN" : undefined, hintText: k > 0 ? "DN" : undefined, value: dn, onChange: function (e, val) {
                                    return _this.editDn(k, val);
                                } })
                        ),
                        _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete", onTouchTap: function () {
                                _this.removeDn(k);
                            }, disabled: k === 0 })
                    );
                }),
                _react2['default'].createElement(
                    'div',
                    { style: { textAlign: 'left' } },
                    _react2['default'].createElement(_materialUi.RaisedButton, { label: pydio.MessageHash["ldap.11"], onTouchTap: function () {
                            _this.addDn();
                        }, disabled: !dns.length || !dns[dns.length - 1] })
                )
            );
        }
    }]);

    return DNs;
})(_react2['default'].Component);

exports['default'] = DNs;
module.exports = exports['default'];
