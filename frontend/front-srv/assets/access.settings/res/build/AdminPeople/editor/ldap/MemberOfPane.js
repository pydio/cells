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

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _DNs = require('./DNs');

var _DNs2 = _interopRequireDefault(_DNs);

var MemberOfPane = (function (_React$Component) {
    _inherits(MemberOfPane, _React$Component);

    function MemberOfPane() {
        _classCallCheck(this, MemberOfPane);

        _get(Object.getPrototypeOf(MemberOfPane.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(MemberOfPane, [{
        key: 'enableMapping',
        value: function enableMapping() {
            var config = this.props.config;

            var m = new _pydioHttpRestApi.AuthLdapMemberOfMapping();
            m.Mapping = new _pydioHttpRestApi.AuthLdapMapping();
            m.GroupFilter = new _pydioHttpRestApi.AuthLdapSearchFilter();
            m.RealMemberOf = true;
            config.MemberOfMapping = m;
        }
    }, {
        key: 'disableMapping',
        value: function disableMapping() {
            var config = this.props.config;

            config.MemberOfMapping = null;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var titleStyle = _props.titleStyle;
            var legendStyle = _props.legendStyle;
            var style = _props.style;
            var config = _props.config;
            var divider = _props.divider;

            var mOf = config.MemberOfMapping;
            var content = undefined;
            if (mOf) {
                (function () {
                    var rule = mOf.Mapping;
                    var group = mOf.GroupFilter;
                    content = _react2['default'].createElement(
                        'div',
                        null,
                        divider,
                        _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(
                                'div',
                                { style: titleStyle },
                                'Mapping'
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: legendStyle },
                                pydio.MessageHash["ldap.31"]
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { display: 'flex', alignItems: 'baseline' } },
                                _react2['default'].createElement(
                                    'div',
                                    { style: { flex: 1, margin: '0 5px' } },
                                    _react2['default'].createElement(_materialUi.TextField, { fullWidth: 1, floatingLabelText: "Left Attribute", hintText: "Left Attribute", value: rule.LeftAttribute, onChange: function (e, val) {
                                            rule.LeftAttribute = val;
                                        } })
                                ),
                                _react2['default'].createElement(
                                    'div',
                                    { style: { flex: 2, margin: '0 5px' } },
                                    _react2['default'].createElement(_materialUi.TextField, { fullWidth: 1, floatingLabelText: "Rule String", hintText: "Rule String", value: rule.RuleString, onChange: function (e, val) {
                                            rule.RuleString = val;
                                        } })
                                ),
                                _react2['default'].createElement(
                                    'div',
                                    { style: { flex: 1, margin: '0 5px' } },
                                    _react2['default'].createElement(_materialUi.TextField, { fullWidth: 1, floatingLabelText: "Right Attribute", hintText: "Right Attribute", value: rule.RightAttribute, onChange: function (e, val) {
                                            rule.RightAttribute = val;
                                        } })
                                )
                            )
                        ),
                        divider,
                        _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(
                                'div',
                                { style: _extends({}, titleStyle, { marginTop: 20 }) },
                                'Groups Filtering'
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: legendStyle },
                                pydio.MessageHash["ldap.32"]
                            ),
                            _react2['default'].createElement(_DNs2['default'], { dns: group.DNs || [''], onChange: function (val) {
                                    group.DNs = val;
                                }, pydio: pydio }),
                            _react2['default'].createElement(_materialUi.TextField, {
                                fullWidth: true,
                                floatingLabelText: pydio.MessageHash["ldap.7"],
                                value: group.Filter, onChange: function (e, v) {
                                    group.Filter = v;
                                }
                            }),
                            _react2['default'].createElement(_materialUi.TextField, {
                                fullWidth: true,
                                floatingLabelText: pydio.MessageHash["ldap.8"],
                                value: group.IDAttribute, onChange: function (e, v) {
                                    group.IDAttribute = v;
                                }
                            }),
                            _react2['default'].createElement(_materialUi.TextField, {
                                fullWidth: true,
                                floatingLabelText: pydio.MessageHash["ldap.33"],
                                value: group.DisplayAttribute, onChange: function (e, v) {
                                    group.DisplayAttribute = v;
                                }
                            })
                        ),
                        divider,
                        _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(
                                'div',
                                { style: _extends({}, titleStyle, { marginTop: 20 }) },
                                'MemberOf Attribute'
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: legendStyle },
                                pydio.MessageHash["ldap.34"]
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { height: 50, display: 'flex', alignItems: 'center' } },
                                _react2['default'].createElement(_materialUi.Toggle, { toggled: mOf.RealMemberOf, onToggle: function (e, v) {
                                        mOf.RealMemberOf = v;
                                    }, label: "Native MemberOf support", labelPosition: "right" })
                            ),
                            mOf.RealMemberOf && _react2['default'].createElement(
                                'div',
                                null,
                                _react2['default'].createElement(_materialUi.TextField, {
                                    fullWidth: true,
                                    floatingLabelText: pydio.MessageHash["ldap.35"],
                                    value: mOf.RealMemberOfAttribute, onChange: function (e, v) {
                                        mOf.RealMemberOfAttribute = v;
                                    }
                                }),
                                _react2['default'].createElement(_materialUi.TextField, {
                                    fullWidth: true,
                                    floatingLabelText: pydio.MessageHash["ldap.36"],
                                    value: mOf.RealMemberOfValueFormat, onChange: function (e, v) {
                                        mOf.RealMemberOfValueFormat = v;
                                    }
                                })
                            ),
                            !mOf.RealMemberOf && _react2['default'].createElement(
                                'div',
                                null,
                                _react2['default'].createElement(_materialUi.TextField, {
                                    fullWidth: true,
                                    floatingLabelText: pydio.MessageHash["ldap.37"],
                                    value: mOf.PydioMemberOfAttribute, onChange: function (e, v) {
                                        mOf.PydioMemberOfAttribute = v;
                                    }
                                }),
                                _react2['default'].createElement(_materialUi.TextField, {
                                    fullWidth: true,
                                    floatingLabelText: pydio.MessageHash["ldap.38"],
                                    value: mOf.PydioMemberOfValueFormat, onChange: function (e, v) {
                                        mOf.PydioMemberOfValueFormat = v;
                                    }
                                })
                            )
                        )
                    );
                })();
            }

            return _react2['default'].createElement(
                'div',
                { style: style },
                _react2['default'].createElement(
                    'div',
                    { style: titleStyle },
                    pydio.MessageHash["ldap.39"]
                ),
                _react2['default'].createElement(
                    'div',
                    { style: legendStyle },
                    pydio.MessageHash["ldap.40"]
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { height: 50, display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(_materialUi.Toggle, { toggled: mOf, onToggle: function (e, v) {
                            v ? _this.enableMapping() : _this.disableMapping();
                        }, label: "Enable MemberOf Mapping", labelPosition: "right" })
                ),
                content
            );
        }
    }]);

    return MemberOfPane;
})(_react2['default'].Component);

MemberOfPane.propTypes = {
    style: _react2['default'].PropTypes.object,
    config: _react2['default'].PropTypes.instanceOf(_pydioHttpRestApi.AuthLdapServerConfig)
};

exports['default'] = MemberOfPane;
module.exports = exports['default'];
