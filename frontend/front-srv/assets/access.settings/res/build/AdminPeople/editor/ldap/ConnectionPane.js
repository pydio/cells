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

var ConnectionPane = (function (_React$Component) {
    _inherits(ConnectionPane, _React$Component);

    function ConnectionPane(props) {
        _classCallCheck(this, ConnectionPane);

        _get(Object.getPrototypeOf(ConnectionPane.prototype), 'constructor', this).call(this, props);
        this.state = { advanced: false };
    }

    _createClass(ConnectionPane, [{
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var style = _props.style;
            var config = _props.config;
            var titleStyle = _props.titleStyle;
            var legendStyle = _props.legendStyle;
            var divider = _props.divider;
            var pydio = _props.pydio;
            var advanced = this.state.advanced;

            return _react2['default'].createElement(
                'div',
                { style: style },
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: titleStyle },
                        'Connection'
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: legendStyle },
                        'Required parameters to connect to your external directory (LDAP or ActiveDirectory)'
                    ),
                    _react2['default'].createElement(_materialUi.TextField, {
                        fullWidth: true,
                        floatingLabelText: "Host",
                        value: config.Host, onChange: function (e, v) {
                            config.Host = v;
                        }
                    }),
                    _react2['default'].createElement(
                        _materialUi.SelectField,
                        {
                            floatingLabelText: pydio.MessageHash["ldap.12"],
                            value: config.Connection || 'normal',
                            onChange: function (e, i, val) {
                                config.Connection = val;
                            },
                            fullWidth: true
                        },
                        _react2['default'].createElement(_materialUi.MenuItem, { value: 'normal', primaryText: pydio.MessageHash["ldap.15"] }),
                        _react2['default'].createElement(_materialUi.MenuItem, { value: 'ssl', primaryText: pydio.MessageHash["ldap.16"] }),
                        _react2['default'].createElement(_materialUi.MenuItem, { value: 'starttls', primaryText: pydio.MessageHash["ldap.17"] })
                    ),
                    _react2['default'].createElement(_materialUi.TextField, {
                        fullWidth: true,
                        floatingLabelText: pydio.MessageHash["ldap.18"],
                        value: config.BindDN, onChange: function (e, v) {
                            config.BindDN = v;
                        }
                    }),
                    _react2['default'].createElement(_materialUi.TextField, {
                        fullWidth: true,
                        floatingLabelText: pydio.MessageHash["ldap.19"],
                        value: config.BindPW || '', onChange: function (e, v) {
                            config.BindPW = v;
                        },
                        type: "password",
                        autoComplete: false
                    })
                ),
                divider,
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: _extends({}, titleStyle, { display: 'flex', alignItems: 'center', marginTop: 10, paddingBottom: 0 }) },
                        _react2['default'].createElement(
                            'span',
                            { style: { flex: 1 } },
                            'Advanced Settings'
                        ),
                        _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-chevron-" + (advanced ? 'up' : 'down'), onTouchTap: function () {
                                _this.setState({ advanced: !advanced });
                            } })
                    ),
                    advanced && _react2['default'].createElement(
                        'div',
                        null,
                        _react2['default'].createElement(
                            'div',
                            { style: { height: 50, display: 'flex', alignItems: 'flex-end' } },
                            _react2['default'].createElement(_materialUi.Toggle, {
                                toggled: config.SkipVerifyCertificate,
                                onToggle: function (e, val) {
                                    config.SkipVerifyCertificate = val;
                                },
                                labelPosition: "right",
                                label: pydio.MessageHash["ldap.20"]
                            })
                        ),
                        _react2['default'].createElement(_materialUi.TextField, {
                            fullWidth: true,
                            floatingLabelText: pydio.MessageHash["ldap.21"],
                            value: config.RootCA, onChange: function (e, v) {
                                config.RootCA = v;
                            }
                        }),
                        _react2['default'].createElement(_materialUi.TextField, {
                            fullWidth: true,
                            floatingLabelText: pydio.MessageHash["ldap.22"],
                            multiLine: true,
                            value: config.RootCAData, onChange: function (e, v) {
                                config.RootCAData = v;
                            }
                        }),
                        _react2['default'].createElement(_materialUi.TextField, {
                            fullWidth: true,
                            floatingLabelText: pydio.MessageHash["ldap.23"],
                            value: config.PageSize || 500, onChange: function (e, v) {
                                config.PageSize = parseInt(v);
                            },
                            type: "number"
                        })
                    )
                )
            );
        }
    }]);

    return ConnectionPane;
})(_react2['default'].Component);

ConnectionPane.propTypes = {
    style: _react2['default'].PropTypes.object
};

exports['default'] = ConnectionPane;
module.exports = exports['default'];
