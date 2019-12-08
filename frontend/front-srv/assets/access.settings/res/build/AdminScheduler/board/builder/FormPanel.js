'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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
        this.state = {};
        if (props.actionInfo && props.actionInfo.HasForm) {
            this.loadForm(props.action.ID);
        }
    }

    _createClass(FormPanel, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.action.ID !== this.props.action.ID && nextProps.actionInfo && nextProps.actionInfo.HasForm) {
                this.loadForm(nextProps.action.ID);
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
    }, {
        key: 'onFormChange',
        value: function onFormChange(values) {
            console.log(values);
        }
    }, {
        key: 'actionPicker',
        value: function actionPicker() {
            var _this2 = this;

            var _props = this.props;
            var actions = _props.actions;
            var onChange = _props.onChange;
            var onDismiss = _props.onDismiss;
            var newActionID = this.state.newActionID;

            var options = Object.keys(actions).map(function (id) {
                return _react2['default'].createElement(_materialUi.MenuItem, { primaryText: actions[id].Label || actions[id].Name, value: id });
            });
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    _materialUi.SelectField,
                    {
                        value: newActionID,
                        onChange: function (ev, i, value) {
                            _this2.setState({ newActionID: value });
                        }
                    },
                    options
                ),
                _react2['default'].createElement(_materialUi.RaisedButton, { primary: true, label: "OK", disabled: !newActionID, onTouchTap: function () {
                        var action = _this2.props.action;

                        action.ID = newActionID;
                        onChange(action);
                        onDismiss();
                    } })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var actionInfo = _props2.actionInfo;
            var action = _props2.action;
            var onDismiss = _props2.onDismiss;
            var formParams = this.state.formParams;

            var values = {};
            if (action.Parameters) {
                values = action.Parameters;
            }
            var title = undefined,
                description = undefined,
                icon = undefined;
            if (action.ID === _actionsEditor.JOB_ACTION_EMPTY) {
                title = 'New action';
                icon = 'chip';
                description = this.actionPicker();
            } else if (actionInfo) {
                title = actionInfo.Label;
                icon = actionInfo.Icon;
                description = actionInfo.Description;
            } else {
                title = action.ID;
                icon = 'chip';
                description = '';
            }
            return _react2['default'].createElement(
                _styles.RightPanel,
                { title: title, icon: icon, onDismiss: onDismiss },
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 10 } },
                    description
                ),
                formParams && _react2['default'].createElement(
                    'div',
                    { style: { margin: -10 } },
                    _react2['default'].createElement(PydioForm.FormPanel, {
                        ref: 'formPanel',
                        depth: -1,
                        parameters: formParams,
                        values: values,
                        onChange: this.onFormChange.bind(this)
                    })
                )
            );
        }
    }]);

    return FormPanel;
})(_react2['default'].Component);

exports['default'] = FormPanel;
module.exports = exports['default'];
