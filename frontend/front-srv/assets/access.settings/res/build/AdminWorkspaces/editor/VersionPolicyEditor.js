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

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _VersionPolicyPeriods = require('./VersionPolicyPeriods');

var _VersionPolicyPeriods2 = _interopRequireDefault(_VersionPolicyPeriods);

var PydioForm = _pydio2['default'].requireLib('form');

var VersionPolicyEditor = (function (_React$Component) {
    _inherits(VersionPolicyEditor, _React$Component);

    function VersionPolicyEditor(props) {
        _classCallCheck(this, VersionPolicyEditor);

        _get(Object.getPrototypeOf(VersionPolicyEditor.prototype), 'constructor', this).call(this, props);
        this.state = {
            dirty: false,
            policy: props.versionPolicy,
            loaded: true,
            valid: true,
            parameters: null
        };
    }

    _createClass(VersionPolicyEditor, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            if (this.state.policy !== newProps.versionPolicy) {
                this.setState({ policy: newProps.versionPolicy });
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            _pydioHttpApi2['default'].getRestClient().callApi('/config/discovery/forms/{ServiceName}', 'GET', { ServiceName: 'pydio.grpc.versions' }, {}, {}, {}, null, [], ['application/json'], ['application/json'], "String").then(function (responseAndData) {
                var xmlString = responseAndData.data;
                var domNode = _pydioUtilXml2['default'].parseXml(xmlString);
                _this.setState({
                    parameters: PydioForm.Manager.parseParameters(domNode, "//param"),
                    loaded: true
                });
            });
        }
    }, {
        key: 'resetForm',
        value: function resetForm() {
            this.setState({ valid: true, dirty: false, saveValue: null });
        }
    }, {
        key: 'deleteSource',
        value: function deleteSource() {
            var _this2 = this;

            if (confirm('Are you sure you want to delete this policy? This is undoable!')) {
                _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
                    var api = new sdk.EnterpriseConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
                    api.deleteVersioningPolicy(_this2.state.policy.Uuid).then(function (r) {
                        _this2.props.closeEditor();
                    });
                });
            }
        }
    }, {
        key: 'saveSource',
        value: function saveSource() {
            var _this3 = this;

            if (this.state.saveValue) {
                (function () {
                    var saveValue = _this3.state.saveValue;

                    _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
                        var api = new sdk.EnterpriseConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
                        api.putVersioningPolicy(saveValue.Uuid, saveValue).then(function () {
                            _this3.props.reloadList();
                            _this3.setState({
                                dirty: false,
                                policy: saveValue,
                                saveValue: null
                            });
                        });
                    });
                })();
            }
        }
    }, {
        key: 'onFormChange',
        value: function onFormChange(values) {
            var newPolicy = VersionPolicyEditor.valuesToTreeVersioningPolicy(values);
            // Check periods
            var periods = newPolicy.KeepPeriods || [];
            var deleteAll = periods.findIndex(function (p) {
                return p.MaxNumber === 0;
            });
            if (deleteAll > -1 && deleteAll < periods.length - 1) {
                pydio.UI.displayMessage('ERROR', 'The Last period is configured to delete all version, you cannot add a new one!');
                var i = periods.length - 1 - deleteAll;
                while (i > 0) {
                    periods.pop();i--;
                }
            }
            newPolicy.KeepPeriods = periods;
            this.setState({
                saveValue: newPolicy,
                dirty: true
            });
        }
    }, {
        key: 'updateValidStatus',
        value: function updateValidStatus(valid) {
            //this.setState({valid: valid});
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var create = _props.create;
            var readonly = _props.readonly;
            var _state = this.state;
            var loaded = _state.loaded;
            var parameters = _state.parameters;
            var policy = _state.policy;
            var saveValue = _state.saveValue;

            var form = undefined;
            if (parameters && loaded) {
                var values = VersionPolicyEditor.TreeVersioningPolicyToValues(policy);
                if (saveValue) {
                    values = VersionPolicyEditor.TreeVersioningPolicyToValues(saveValue);
                }
                form = _react2['default'].createElement(PydioForm.FormPanel, {
                    parameters: parameters,
                    values: values,
                    className: 'full-width',
                    onChange: this.onFormChange.bind(this),
                    onValidStatusChange: this.updateValidStatus.bind(this),
                    disabled: readonly,
                    depth: -2
                });
            }

            var titleActionBarButtons = [];
            if (!readonly) {
                if (!create) {
                    titleActionBarButtons.push(_react2['default'].createElement(_materialUi.FlatButton, { key: 'delete', label: 'Delete Policy', secondary: true, onTouchTap: this.deleteSource.bind(this) }));
                    titleActionBarButtons.push(_react2['default'].createElement('div', { style: { display: 'inline', borderRight: '1px solid #757575', margin: '0 2px' }, key: 'separator' }));
                    titleActionBarButtons.push(_react2['default'].createElement(_materialUi.FlatButton, { key: 'reset', label: this.context.getMessage('plugins.6'), onTouchTap: this.resetForm.bind(this), secondary: true, disabled: !this.state.dirty }));
                }
                titleActionBarButtons.push(_react2['default'].createElement(_materialUi.FlatButton, { key: 'save', label: this.context.getMessage('53', ''), onTouchTap: this.saveSource.bind(this), secondary: true, disabled: !this.state.valid || !this.state.dirty }));
            }
            titleActionBarButtons.push(_react2['default'].createElement(_materialUi.RaisedButton, { key: 'close', label: this.context.getMessage('86', ''), onTouchTap: this.props.closeEditor }));

            var policyName = saveValue ? saveValue.Name : policy.Name;
            if (!policyName) {
                policyName = '';
            }

            return _react2['default'].createElement(
                PydioComponents.PaperEditorLayout,
                {
                    title: loaded && parameters ? "Policy " + policyName : "Loading...",
                    titleActionBar: titleActionBarButtons,
                    className: 'workspace-editor',
                    contentFill: true
                },
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { padding: '0 16px', backgroundColor: '#ECEFF1' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { overflowX: 'auto' } },
                        _react2['default'].createElement(_VersionPolicyPeriods2['default'], { periods: saveValue ? saveValue.KeepPeriods : policy.KeepPeriods })
                    )
                ),
                form
            );
        }
    }], [{
        key: 'valuesToTreeVersioningPolicy',
        value: function valuesToTreeVersioningPolicy(values) {
            var periods = [];
            var baseName = "IntervalStart";
            var baseNameMax = "MaxNumber";
            var nextName = baseName;
            var nextMax = baseNameMax;
            var index = 0;
            while (values[nextName] !== undefined && values[nextMax] !== undefined) {
                var period = new _pydioHttpRestApi.TreeVersioningKeepPeriod();
                period.IntervalStart = values[nextName];
                period.MaxNumber = values[nextMax];
                periods.push(period);
                delete values[nextMax];
                delete values[nextName];
                index++;
                nextName = baseName + "_" + index;
                nextMax = baseNameMax + "_" + index;
            }
            values.KeepPeriods = periods;
            return _pydioHttpRestApi.TreeVersioningPolicy.constructFromObject(values);
        }
    }, {
        key: 'TreeVersioningPolicyToValues',
        value: function TreeVersioningPolicyToValues(policy) {
            var values = _extends({}, policy);
            if (values.KeepPeriods) {
                (function () {
                    var i = 0;
                    values.KeepPeriods.map(function (p) {
                        if (i > 0) {
                            values['IntervalStart_' + i] = p.IntervalStart || 0;
                            values['MaxNumber_' + i] = p.MaxNumber || 0;
                        } else {
                            values['IntervalStart'] = p.IntervalStart || 0;
                            values['MaxNumber'] = p.MaxNumber || 0;
                        }
                        i++;
                    });
                })();
            }
            return values;
        }
    }]);

    return VersionPolicyEditor;
})(_react2['default'].Component);

VersionPolicyEditor.contextTypes = {
    messages: _react2['default'].PropTypes.object,
    getMessage: _react2['default'].PropTypes.func
};

exports['default'] = VersionPolicyEditor;
module.exports = exports['default'];
