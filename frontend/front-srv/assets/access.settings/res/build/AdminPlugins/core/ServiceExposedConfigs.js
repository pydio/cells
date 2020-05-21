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

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var ServiceExposedConfigs = (function (_React$Component) {
    _inherits(ServiceExposedConfigs, _React$Component);

    function ServiceExposedConfigs(props) {
        _classCallCheck(this, ServiceExposedConfigs);

        _get(Object.getPrototypeOf(ServiceExposedConfigs.prototype), 'constructor', this).call(this, props);
        this.state = {};
    }

    _createClass(ServiceExposedConfigs, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var serviceName = this.props.serviceName;

            if (serviceName) {
                this.loadServiceData(serviceName);
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this = this;

            if (nextProps.serviceName && nextProps.serviceName !== this.props.serviceName) {
                this.setState({ values: {}, originalValues: {} }, function () {
                    _this.loadServiceData(nextProps.serviceName);
                });
            }
        }

        /**
         * @param {String} serviceName
         * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/RestDiscoveryResponse} and HTTP response
         */
    }, {
        key: 'configFormsDiscoveryWithHttpInfo',
        value: function configFormsDiscoveryWithHttpInfo(serviceName) {
            var postBody = null;

            // verify that the required parameter 'serviceName' is set
            if (serviceName === undefined || serviceName === null) {
                throw new Error("Missing the required parameter 'serviceName' when calling configFormsDiscovery");
            }

            var pathParams = {
                'ServiceName': serviceName
            };
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var authNames = [];
            var contentTypes = ['application/json'];
            var accepts = ['application/json'];
            var returnType = "String";

            return _pydioHttpApi2['default'].getRestClient().callApi('/config/discovery/forms/{ServiceName}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
        }
    }, {
        key: 'loadServiceData',
        value: function loadServiceData(serviceId) {
            var _this2 = this;

            this.configFormsDiscoveryWithHttpInfo(serviceId).then(function (responseAndData) {
                var xmlString = responseAndData.data;
                var domNode = XMLUtils.parseXml(xmlString);
                _this2.setState({
                    parameters: PydioForm.Manager.parseParameters(domNode, "//param"),
                    loaded: true
                });
            });

            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            api.getConfig("services/" + serviceId).then(function (restConfig) {
                if (restConfig.Data) {
                    var values = JSON.parse(restConfig.Data) || {};
                    _this2.setState({
                        originalValues: PydioForm.Manager.JsonToSlashes(values),
                        values: PydioForm.Manager.JsonToSlashes(values)
                    });
                }
            });
        }
    }, {
        key: 'save',
        value: function save() {
            var _this3 = this;

            var values = this.state.values;
            var _props = this.props;
            var onBeforeSave = _props.onBeforeSave;
            var onAfterSave = _props.onAfterSave;
            var serviceName = _props.serviceName;

            var jsonValues = PydioForm.Manager.SlashesToJson(values);
            if (onBeforeSave) {
                onBeforeSave(jsonValues);
            }
            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            var body = new _pydioHttpRestApi.RestConfiguration();
            body.FullPath = "services/" + serviceName;
            body.Data = JSON.stringify(jsonValues);
            return api.putConfig(body.FullPath, body).then(function (res) {
                _this3.setState({ dirty: false });
                if (onAfterSave) {
                    onAfterSave(body);
                }
            });
        }
    }, {
        key: 'revert',
        value: function revert() {
            var onRevert = this.props.onRevert;
            var originalValues = this.state.originalValues;

            this.setState({ dirty: false, values: originalValues });
            if (onRevert) {
                onRevert(originalValues);
            }
        }
    }, {
        key: 'onChange',
        value: function onChange(formValues, dirty) {
            var onDirtyChange = this.props.onDirtyChange;

            var jsonValues = PydioForm.Manager.SlashesToJson(formValues);
            var values = PydioForm.Manager.JsonToSlashes(jsonValues);
            this.setState({ dirty: dirty, values: values });
            if (onDirtyChange) {
                onDirtyChange(dirty, formValues);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _state = this.state;
            var parameters = _state.parameters;
            var values = _state.values;
            var accessByName = this.props.accessByName;

            if (!parameters) {
                return null;
            }

            return _react2['default'].createElement(PydioForm.FormPanel, _extends({}, this.props, {
                ref: 'formPanel',
                parameters: parameters,
                values: values,
                disabled: !accessByName('Create'),
                onChange: this.onChange.bind(this)
            }));
        }
    }]);

    return ServiceExposedConfigs;
})(_react2['default'].Component);

exports['default'] = ServiceExposedConfigs;
module.exports = exports['default'];
