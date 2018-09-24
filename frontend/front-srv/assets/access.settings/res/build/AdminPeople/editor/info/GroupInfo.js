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

var _modelUser = require('../model/User');

var _modelUser2 = _interopRequireDefault(_modelUser);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var FormPanel = _Pydio$requireLib.FormPanel;

var GroupInfo = (function (_React$Component) {
    _inherits(GroupInfo, _React$Component);

    function GroupInfo(props) {
        var _this = this;

        _classCallCheck(this, GroupInfo);

        _get(Object.getPrototypeOf(GroupInfo.prototype), 'constructor', this).call(this, props);
        this.state = {
            parameters: []
        };
        AdminComponents.PluginsLoader.getInstance(props.pydio).formParameters('//global_param[contains(@scope,"group")]|//param[contains(@scope,"group")]').then(function (params) {
            _this.setState({ parameters: params });
        });
    }

    _createClass(GroupInfo, [{
        key: 'getPydioRoleMessage',
        value: function getPydioRoleMessage(messageId) {
            var pydio = this.props.pydio;

            return pydio.MessageHash['role_editor.' + messageId] || messageId;
        }
    }, {
        key: 'onParameterChange',
        value: function onParameterChange(paramName, newValue, oldValue) {
            var group = this.props.group;
            var parameters = this.state.parameters;

            var params = parameters.filter(function (p) {
                return p.name === paramName;
            });
            var idmUser = group.getIdmUser();
            var role = group.getRole();
            if (paramName === 'displayName' || paramName === 'email' || paramName === 'profile') {
                idmUser.Attributes[paramName] = newValue;
            } else if (params.length && params[0].aclKey) {
                role.setParameter(params[0].aclKey, newValue);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var group = _props.group;
            var pydio = _props.pydio;
            var parameters = this.state.parameters;

            if (!parameters) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    'Loading...'
                );
            }

            // Load group-scope parameters
            var values = {},
                locks = '';
            if (group) {
                (function () {
                    // Compute values
                    var idmUser = group.getIdmUser();
                    var role = group.getRole();
                    var label = idmUser.GroupLabel;
                    if (idmUser.Attributes && idmUser.Attributes['displayName']) {
                        label = idmUser.Attributes['displayName'];
                    }
                    values = {
                        groupPath: LangUtils.trimRight(idmUser.GroupPath, '/') + '/' + idmUser.GroupLabel,
                        displayName: label
                    };
                    parameters.map(function (p) {
                        if (p.aclKey && role.getParameterValue(p.aclKey)) {
                            values[p.name] = role.getParameterValue(p.aclKey);
                        }
                    });
                })();
            }
            var params = [{ "name": "groupPath", label: this.getPydioRoleMessage('34'), "type": "string", readonly: true }, { "name": "displayName", label: this.getPydioRoleMessage('35'), "type": "string" }].concat(_toConsumableArray(parameters));

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(FormPanel, {
                    parameters: params,
                    onParameterChange: this.onParameterChange.bind(this),
                    values: values,
                    depth: -2
                })
            );
        }
    }]);

    return GroupInfo;
})(_react2['default'].Component);

GroupInfo.PropTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']).isRequired,
    pluginsRegistry: _react2['default'].PropTypes.instanceOf(XMLDocument),
    group: _react2['default'].PropTypes.instanceOf(_modelUser2['default'])
};

exports['default'] = GroupInfo;
module.exports = exports['default'];
