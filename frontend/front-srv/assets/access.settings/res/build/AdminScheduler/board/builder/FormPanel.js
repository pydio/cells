'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _styles = require('./styles');

var _actionsEditor = require("../actions/editor");

var PydioForm = _pydio2['default'].requireLib('form');

var FormLoader = (function () {
    function FormLoader() {
        _classCallCheck(this, FormLoader);
    }

    _createClass(FormLoader, null, [{
        key: 'loadAction',
        value: function loadAction(actionName) {

            if (FormLoader.FormsCache[actionName]) {
                return Promise.resolve(FormLoader.FormsCache[actionName]);
            }

            var postBody = null;

            // verify the required parameter 'serviceName' is set
            if (actionName === undefined || actionName === null) {
                throw new Error("Missing the required parameter 'serviceName' when calling configFormsDiscovery");
            }
            var pathParams = {
                'ActionName': actionName
            };
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var authNames = [];
            var contentTypes = ['application/json'];
            var accepts = ['application/json'];
            var returnType = "String";

            return _pydioHttpApi2['default'].getRestClient().callApi('/config/scheduler/actions/{ActionName}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType).then(function (responseAndData) {
                var xmlString = responseAndData.data;
                var domNode = _pydioUtilXml2['default'].parseXml(xmlString);
                var parameters = PydioForm.Manager.parseParameters(domNode, "//param");
                FormLoader.FormsCache[actionName] = parameters;
                return parameters;
            });
        }
    }]);

    return FormLoader;
})();

FormLoader.FormsCache = {};

var FormPanel = (function (_React$Component) {
    _inherits(FormPanel, _React$Component);

    function FormPanel(props) {
        _classCallCheck(this, FormPanel);

        _get(Object.getPrototypeOf(FormPanel.prototype), 'constructor', this).call(this, props);
        var action = props.action;

        this.state = {
            action: action,
            actionInfo: this.getActionInfo(action)
        };
    }

    _createClass(FormPanel, [{
        key: 'getActionInfo',
        value: function getActionInfo(action) {
            var actions = this.props.actions;

            var actionInfo = undefined;
            if (actions[action.ID]) {
                actionInfo = actions[action.ID];
                if (actionInfo.HasForm) {
                    this.loadForm(action.ID);
                }
            } else if (action.ID === _actionsEditor.JOB_ACTION_EMPTY) {
                actionInfo = {
                    Name: _actionsEditor.JOB_ACTION_EMPTY,
                    Label: 'Create Action',
                    Icon: 'chip',
                    Description: 'Pick an action'
                };
            } else {
                actionInfo = {
                    Name: action.ID,
                    Label: action.ID,
                    Icon: 'chip',
                    Description: 'No description provided'
                };
            }
            return actionInfo;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.action !== this.state.action) {
                this.setState({
                    action: nextProps.action,
                    actionInfo: this.getActionInfo(nextProps.action)
                });
            }
        }
    }, {
        key: 'loadForm',
        value: function loadForm(actionID) {
            var _this = this;

            FormLoader.loadAction(actionID).then(function (params) {
                _this.setState({ formParams: params });
            });
        }

        /**
         * Convert standard json to map[string]string for Parameters field
         * @param params
         */
    }, {
        key: 'toStringString',
        value: function toStringString() {
            var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var map = {};
            Object.keys(params).forEach(function (k) {
                var value = params[k];
                var v = undefined;
                switch (typeof value) {
                    case 'string':
                        v = value;
                        break;
                    case 'number':
                        v = '' + value;
                        break;
                    case 'boolean':
                        v = value ? 'true' : 'false';
                        break;
                    default:
                        v = '' + value;
                }
                map[k] = v;
            });
            return map;
        }

        /**
         * Convert map[string]string to form usable parameters
         * @param params
         * @param map
         */
    }, {
        key: 'fromStringString',
        value: function fromStringString(params) {
            var map = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            if (!map) {
                map = {};
            }
            var values = {};
            params.forEach(function (p) {
                if (map[p.name]) {
                    if (p.type === 'boolean') {
                        values[p.name] = map[p.name] === 'true';
                    } else if (p.type === 'integer') {
                        values[p.name] = parseInt(map[p.name]);
                    } else {
                        values[p.name] = map[p.name];
                    }
                }
            });
            return values;
        }
    }, {
        key: 'onFormChange',
        value: function onFormChange(values) {
            var action = this.state.action;

            action.Parameters = this.toStringString(values);
            console.log(action.Parameters);
        }
    }, {
        key: 'onIdChange',
        value: function onIdChange(id) {
            var action = this.state.action;

            action.ID = id;
            // Refresh state
            this.setState({
                action: action,
                actionInfo: this.getActionInfo(action)
            });
        }
    }, {
        key: 'actionPicker',
        value: function actionPicker() {
            var _this2 = this;

            var actions = this.props.actions;
            var action = this.state.action;

            var options = Object.keys(actions).map(function (id) {
                return _react2['default'].createElement(_materialUi.MenuItem, { primaryText: actions[id].Label || actions[id].Name, value: id });
            });
            return _react2['default'].createElement(
                _materialUi.SelectField,
                {
                    value: action.ID,
                    onChange: function (ev, i, value) {
                        _this2.onIdChange(value);
                    }
                },
                [_react2['default'].createElement(_materialUi.MenuItem, { value: _actionsEditor.JOB_ACTION_EMPTY, primaryText: "Please pick an action" })].concat(_toConsumableArray(options))
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var onDismiss = _props.onDismiss;
            var onChange = _props.onChange;
            var create = _props.create;
            var _state = this.state;
            var actionInfo = _state.actionInfo;
            var action = _state.action;
            var formParams = _state.formParams;

            return _react2['default'].createElement(
                _styles.RightPanel,
                { title: actionInfo.Label, icon: actionInfo.Icon, onDismiss: onDismiss },
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 10 } },
                    actionInfo.Description
                ),
                create && this.actionPicker(),
                formParams && _react2['default'].createElement(
                    'div',
                    { style: { margin: -10 } },
                    _react2['default'].createElement(PydioForm.FormPanel, {
                        ref: 'formPanel',
                        depth: -1,
                        parameters: formParams,
                        values: this.fromStringString(formParams, action.Parameters),
                        onChange: this.onFormChange.bind(this)
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.RaisedButton, {
                        primary: true,
                        label: "SAVE",
                        disabled: action.ID === _actionsEditor.JOB_ACTION_EMPTY,
                        onTouchTap: function () {
                            onChange(action);
                            onDismiss();
                        } })
                )
            );
        }
    }]);

    return FormPanel;
})(_react2['default'].Component);

exports['default'] = FormPanel;
module.exports = exports['default'];
