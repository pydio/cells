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

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var PaperEditorLayout = _Pydio$requireLib.PaperEditorLayout;

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
            parameters: null,
            m: function m(id) {
                return props.pydio.MessageHash['ajxp_admin.versions.editor.' + id] || id;
            }
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

            var _state = this.state;
            var m = _state.m;
            var policy = _state.policy;
            var pydio = this.props.pydio;

            pydio.UI.openConfirmDialog({
                message: m('delete.confirm'),
                destructive: [policy.Label],
                validCallback: function validCallback() {
                    _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
                        var api = new sdk.EnterpriseConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
                        api.deleteVersioningPolicy(policy.Uuid).then(function (r) {
                            _this2.props.closeEditor();
                        });
                    });
                }
            });
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
            var m = this.state.m;

            var newPolicy = VersionPolicyEditor.valuesToTreeVersioningPolicy(values);
            // Check periods
            var periods = newPolicy.KeepPeriods || [];
            var deleteAll = periods.findIndex(function (p) {
                return p.MaxNumber === 0;
            });
            if (deleteAll > -1 && deleteAll < periods.length - 1) {
                pydio.UI.displayMessage('ERROR', m('error.lastdelete'));
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
            var _this4 = this;

            var _props = this.props;
            var create = _props.create;
            var readonly = _props.readonly;
            var pydio = _props.pydio;
            var _state2 = this.state;
            var loaded = _state2.loaded;
            var parameters = _state2.parameters;
            var policy = _state2.policy;
            var saveValue = _state2.saveValue;
            var m = _state2.m;

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
                    titleActionBarButtons.push(PaperEditorLayout.actionButton(m('delete'), 'mdi mdi-delete', function () {
                        _this4.deleteSource();
                    }));
                    titleActionBarButtons.push(PaperEditorLayout.actionButton(this.context.getMessage('plugins.6'), 'mdi mdi-undo', function () {
                        _this4.resetForm();
                    }, !this.state.dirty));
                }
                titleActionBarButtons.push(PaperEditorLayout.actionButton(this.context.getMessage('53', ''), 'mdi mdi-content-save', function () {
                    _this4.saveSource();
                }, !this.state.valid || !this.state.dirty));
            }

            var policyName = saveValue ? saveValue.Name : policy.Name;
            if (!policyName) {
                policyName = '';
            }

            return _react2['default'].createElement(
                PaperEditorLayout,
                {
                    title: loaded && parameters ? m('title').replace('%s', policyName) : pydio.MessageHash['ajxp_admin.home.6'],
                    titleActionBar: titleActionBarButtons,
                    closeAction: this.props.closeEditor,
                    className: 'workspace-editor',
                    contentFill: true
                },
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { padding: '0 16px', backgroundColor: '#ECEFF1' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { overflowX: 'auto' } },
                        _react2['default'].createElement(_VersionPolicyPeriods2['default'], { pydio: pydio, periods: saveValue ? saveValue.KeepPeriods : policy.KeepPeriods })
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
