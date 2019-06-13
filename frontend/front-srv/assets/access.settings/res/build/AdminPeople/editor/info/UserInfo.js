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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _modelUser = require('../model/User');

var _modelUser2 = _interopRequireDefault(_modelUser);

var _materialUi = require('material-ui');

var _userUserRolesPicker = require('../user/UserRolesPicker');

var _userUserRolesPicker2 = _interopRequireDefault(_userUserRolesPicker);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var FormPanel = _Pydio$requireLib.FormPanel;

var UserInfo = (function (_React$Component) {
    _inherits(UserInfo, _React$Component);

    function UserInfo(props) {
        var _this = this;

        _classCallCheck(this, UserInfo);

        _get(Object.getPrototypeOf(UserInfo.prototype), 'constructor', this).call(this, props);
        this.state = {
            parameters: []
        };
        AdminComponents.PluginsLoader.getInstance(props.pydio).formParameters('//global_param[contains(@scope,"user")]|//param[contains(@scope,"user")]').then(function (params) {
            _this.setState({ parameters: params });
        });
    }

    _createClass(UserInfo, [{
        key: 'getBinaryContext',
        value: function getBinaryContext() {
            var user = this.props.user;

            return "user_id=" + user.getIdmUser().Login + (user.getIdmUser().Attributes && user.getIdmUser().Attributes['avatar'] ? '?' + user.getIdmUser().Attributes['avatar'] : '');
        }
    }, {
        key: 'getPydioRoleMessage',
        value: function getPydioRoleMessage(messageId) {
            var pydio = this.props.pydio;

            return pydio.MessageHash['role_editor.' + messageId] || messageId;
        }
    }, {
        key: 'onParameterChange',
        value: function onParameterChange(paramName, newValue, oldValue) {
            var user = this.props.user;
            var parameters = this.state.parameters;

            var params = parameters.filter(function (p) {
                return p.name === paramName;
            });
            var idmUser = user.getIdmUser();
            var role = user.getRole();
            // do something
            if (paramName === 'displayName' || paramName === 'email' || paramName === 'profile' || paramName === 'avatar') {
                idmUser.Attributes[paramName] = newValue;
            } else if (params.length && params[0].aclKey) {
                role.setParameter(params[0].aclKey, newValue);
            }
        }
    }, {
        key: 'buttonCallback',
        value: function buttonCallback(action) {
            var user = this.props.user;

            if (action === "update_user_pwd") {
                this.props.pydio.UI.openComponentInModal('AdminPeople', 'UserPasswordDialog', { user: user });
            } else {
                (function () {
                    var idmUser = user.getIdmUser();
                    var lockName = action === 'user_set_lock-lock' ? 'logout' : 'pass_change';
                    var currentLocks = [];
                    if (idmUser.Attributes['locks']) {
                        var test = JSON.parse(idmUser.Attributes['locks']);
                        if (test && typeof test === "object") {
                            currentLocks = test;
                        }
                    }
                    if (currentLocks.indexOf(lockName) > -1) {
                        currentLocks = currentLocks.filter(function (l) {
                            return l !== lockName;
                        });
                        if (action === 'user_set_lock-lock') {
                            // Reset also the failedConnections attempts
                            delete idmUser.Attributes["failedConnections"];
                        }
                    } else {
                        currentLocks.push(lockName);
                    }
                    idmUser.Attributes['locks'] = JSON.stringify(currentLocks);
                    user.save();
                })();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var user = _props.user;
            var pydio = _props.pydio;
            var parameters = this.state.parameters;

            if (!parameters) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    'Loading...'
                );
            }

            var values = { profiles: [] };
            var locks = [];
            var rolesPicker = undefined;

            if (user) {
                (function () {
                    // Compute values
                    var idmUser = user.getIdmUser();
                    var role = user.getRole();
                    if (idmUser.Attributes['locks']) {
                        locks = JSON.parse(idmUser.Attributes['locks']) || [];
                        if (typeof locks === 'object' && locks.length === undefined) {
                            (function () {
                                // Backward compat issue
                                var arrL = [];
                                Object.keys(locks).forEach(function (k) {
                                    if (locks[k] === true) {
                                        arrL.push(k);
                                    }
                                });
                                locks = arrL;
                            })();
                        }
                    }
                    rolesPicker = _react2['default'].createElement(_userUserRolesPicker2['default'], {
                        roles: idmUser.Roles,
                        addRole: function (r) {
                            return user.addRole(r);
                        },
                        removeRole: function (r) {
                            return user.removeRole(r);
                        },
                        switchRoles: function (r1, r2) {
                            return user.switchRoles(r1, r2);
                        }
                    });

                    var attributes = idmUser.Attributes || {};
                    values = _extends({}, values, {
                        avatar: attributes['avatar'],
                        displayName: attributes['displayName'],
                        email: attributes['email'],
                        profile: attributes['profile'],
                        login: idmUser.Login
                    });
                    parameters.map(function (p) {
                        if (p.aclKey && role.getParameterValue(p.aclKey)) {
                            values[p.name] = role.getParameterValue(p.aclKey);
                        }
                    });
                })();
            }
            var params = [{ name: "login", label: this.getPydioRoleMessage('21'), description: pydio.MessageHash['pydio_role.31'], "type": "string", readonly: true }, { name: "profile", label: this.getPydioRoleMessage('22'), description: pydio.MessageHash['pydio_role.32'], "type": "select", choices: 'admin|Administrator,standard|Standard,shared|Shared' }].concat(_toConsumableArray(parameters));

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'h3',
                    { className: "paper-right-title", style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1 } },
                        pydio.MessageHash['pydio_role.24'],
                        _react2['default'].createElement(
                            'div',
                            { className: "section-legend" },
                            pydio.MessageHash['pydio_role.54']
                        )
                    ),
                    _react2['default'].createElement(
                        _materialUi.IconMenu,
                        {
                            iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-dots-vertical" }),
                            anchorOrigin: { horizontal: 'right', vertical: 'top' },
                            targetOrigin: { horizontal: 'right', vertical: 'top' },
                            tooltip: "Actions"
                        },
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.getPydioRoleMessage('25'), onTouchTap: function () {
                                return _this2.buttonCallback('update_user_pwd');
                            } }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.getPydioRoleMessage(locks.indexOf('logout') > -1 ? '27' : '26'), onTouchTap: function () {
                                return _this2.buttonCallback('user_set_lock-lock');
                            } }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.getPydioRoleMessage(locks.indexOf('pass_change') > -1 ? '28b' : '28'), onTouchTap: function () {
                                return _this2.buttonCallback('user_set_lock-pass_change');
                            } })
                    )
                ),
                _react2['default'].createElement(FormPanel, {
                    parameters: params,
                    onParameterChange: this.onParameterChange.bind(this),
                    values: values,
                    depth: -2,
                    binary_context: this.getBinaryContext()
                }),
                rolesPicker
            );
        }
    }]);

    return UserInfo;
})(_react2['default'].Component);

UserInfo.PropTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']).isRequired,
    pluginsRegistry: _react2['default'].PropTypes.instanceOf(XMLDocument),
    user: _react2['default'].PropTypes.instanceOf(_modelUser2['default'])
};

exports['default'] = UserInfo;
module.exports = exports['default'];
