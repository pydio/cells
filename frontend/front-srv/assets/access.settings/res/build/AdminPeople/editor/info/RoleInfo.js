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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _modelRole = require('../model/Role');

var _modelRole2 = _interopRequireDefault(_modelRole);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var FormPanel = _Pydio$requireLib.FormPanel;

var RoleInfo = (function (_React$Component) {
    _inherits(RoleInfo, _React$Component);

    function RoleInfo(props) {
        var _this = this;

        _classCallCheck(this, RoleInfo);

        _get(Object.getPrototypeOf(RoleInfo.prototype), 'constructor', this).call(this, props);
        this.state = {
            parameters: []
        };
        AdminComponents.PluginsLoader.getInstance(props.pydio).formParameters('//global_param[contains(@scope,\'role\')]|//param[contains(@scope,\'role\')]').then(function (params) {
            _this.setState({ parameters: params });
        });
    }

    _createClass(RoleInfo, [{
        key: 'getPydioRoleMessage',
        value: function getPydioRoleMessage(messageId) {
            var pydio = this.props.pydio;

            return pydio.MessageHash['role_editor.' + messageId] || messageId;
        }
    }, {
        key: 'onParameterChange',
        value: function onParameterChange(paramName, newValue, oldValue) {
            var role = this.props.role;

            var idmRole = role.getIdmRole();
            if (paramName === "applies") {
                idmRole.AutoApplies = newValue.split(',');
            } else if (paramName === "roleLabel") {
                idmRole.Label = newValue;
            } else {
                var param = this.getParameterByName(paramName);
                if (param.aclKey) {
                    role.setParameter(param.aclKey, newValue);
                }
            }
        }
    }, {
        key: 'getParameterByName',
        value: function getParameterByName(paramName) {
            var parameters = this.state.parameters;

            return parameters.filter(function (p) {
                return p.name === paramName;
            })[0];
        }
    }, {
        key: 'render',
        value: function render() {
            var role = this.props.role;
            var parameters = this.state.parameters;

            if (!parameters) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    'Loading...'
                );
            }

            // Load role parameters
            var params = [{ "name": "roleId", label: this.getPydioRoleMessage('31'), "type": "string", readonly: true }, { "name": "roleLabel", label: this.getPydioRoleMessage('32'), "type": "string" }, { "name": "applies", label: this.getPydioRoleMessage('33'), "type": "select", multiple: true, choices: 'admin|Administrators,standard|Standard,shared|Shared Users,anon|Anonymous' }].concat(_toConsumableArray(parameters));

            var values = { applies: [] };
            if (role) {
                var idmRole = role.getIdmRole();
                var applies = idmRole.AutoApplies || [];
                values = {
                    roleId: idmRole.Uuid,
                    applies: applies.filter(function (v) {
                        return !!v;
                    }), // filter empty values
                    roleLabel: idmRole.Label
                };
                parameters.map(function (p) {
                    if (p.aclKey && role.getParameterValue(p.aclKey)) {
                        values[p.name] = role.getParameterValue(p.aclKey);
                    }
                });
            }
            console.log(values);

            return _react2['default'].createElement(FormPanel, {
                parameters: params,
                onParameterChange: this.onParameterChange.bind(this),
                values: values,
                depth: -2
            });
        }
    }]);

    return RoleInfo;
})(_react2['default'].Component);

RoleInfo.PropTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']).isRequired,
    pluginsRegistry: _react2['default'].PropTypes.instanceOf(XMLDocument),
    role: _react2['default'].PropTypes.instanceOf(_modelRole2['default'])
};

exports['default'] = RoleInfo;
module.exports = exports['default'];
