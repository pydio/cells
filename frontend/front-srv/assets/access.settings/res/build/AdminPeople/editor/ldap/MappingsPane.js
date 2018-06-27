'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var MappingsPane = (function (_React$Component) {
    _inherits(MappingsPane, _React$Component);

    function MappingsPane() {
        _classCallCheck(this, MappingsPane);

        _get(Object.getPrototypeOf(MappingsPane.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(MappingsPane, [{
        key: 'addRule',
        value: function addRule() {
            var config = this.props.config;

            var rules = config.MappingRules || [];
            config.MappingRules = [].concat(_toConsumableArray(rules), [new _pydioHttpRestApi.AuthLdapMapping()]);
        }
    }, {
        key: 'removeRule',
        value: function removeRule(index) {
            var config = this.props.config;

            config.MappingRules = [].concat(_toConsumableArray(config.MappingRules.slice(0, index)), _toConsumableArray(config.MappingRules.slice(index + 1)));
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var style = _props.style;
            var config = _props.config;
            var titleStyle = _props.titleStyle;
            var legendStyle = _props.legendStyle;
            var pydio = _props.pydio;

            var rules = config.MappingRules || [];

            return _react2['default'].createElement(
                'div',
                { style: _extends({}, style) },
                _react2['default'].createElement(
                    'div',
                    { style: titleStyle },
                    pydio.MessageHash["ldap.29"]
                ),
                _react2['default'].createElement(
                    'div',
                    { style: legendStyle },
                    pydio.MessageHash["ldap.30"]
                ),
                rules.map(function (rule, k) {
                    return _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', alignItems: k === 0 ? 'baseline' : 'center' } },
                        _react2['default'].createElement(
                            'div',
                            { style: { flex: 1, margin: '0 5px' } },
                            _react2['default'].createElement(_materialUi.TextField, { fullWidth: 1, floatingLabelText: k === 0 ? "Left Attribute" : undefined, hintText: k > 0 ? "Left Attribute" : undefined, value: rule.LeftAttribute, onChange: function (e, val) {
                                    rule.LeftAttribute = val;
                                } })
                        ),
                        _react2['default'].createElement(
                            'div',
                            { style: { flex: 2, margin: '0 5px' } },
                            _react2['default'].createElement(_materialUi.TextField, { fullWidth: 1, floatingLabelText: k === 0 ? "Rule String" : undefined, hintText: k > 0 ? "Rule String" : undefined, value: rule.RuleString, onChange: function (e, val) {
                                    rule.RuleString = val;
                                } })
                        ),
                        _react2['default'].createElement(
                            'div',
                            { style: { flex: 1, margin: '0 5px' } },
                            _react2['default'].createElement(_materialUi.TextField, { fullWidth: 1, floatingLabelText: k === 0 ? "Right Attribute" : undefined, hintText: k > 0 ? "Right Attribute" : undefined, value: rule.RightAttribute, onChange: function (e, val) {
                                    rule.RightAttribute = val;
                                } })
                        ),
                        _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete", onTouchTap: function () {
                                _this.removeRule(k);
                            } })
                    );
                }),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 20, textAlign: 'center' } },
                    _react2['default'].createElement(_materialUi.FlatButton, { label: pydio.MessageHash["ldap.27"], onTouchTap: function () {
                            _this.addRule();
                        } })
                )
            );
        }
    }]);

    return MappingsPane;
})(_react2['default'].Component);

MappingsPane.propTypes = {
    style: _react2['default'].PropTypes.object,
    config: _react2['default'].PropTypes.instanceOf(_pydioHttpRestApi.AuthLdapServerConfig)
};

exports['default'] = MappingsPane;
module.exports = exports['default'];
