/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _materialUiStyles = require('material-ui/styles');

var _uuid = require('uuid');

var _policiesPolicy = require('../policies/Policy');

var _policiesPolicy2 = _interopRequireDefault(_policiesPolicy);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib.MaterialTable;

var ResourceGroups = ["acl", "rest", "oidc"];

var PoliciesBoard = _react2['default'].createClass({
    displayName: 'PoliciesBoard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(_pydioModelDataModel2['default']).isRequired,
        rootNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        currentNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        openEditor: _react2['default'].PropTypes.func.isRequired,
        openRightPane: _react2['default'].PropTypes.func.isRequired,
        closeRightPane: _react2['default'].PropTypes.func.isRequired,
        readonly: _react2['default'].PropTypes.bool
    },

    componentWillMount: function componentWillMount() {
        this.listPolicies();
    },

    getInitialState: function getInitialState() {
        return { policies: {}, popoverOpen: false, anchorEl: null };
    },

    groupByResourcesGroups: function groupByResourcesGroups(policies) {
        var result = [];
        ResourceGroups.map(function (k) {

            var groupPolicies = policies.PolicyGroups.filter(function (pol) {
                var g = pol.ResourceGroup || 'rest';
                return g === k;
            });
            if (groupPolicies.length) {
                groupPolicies.sort(function (a, b) {
                    return a.Name.toLowerCase() < b.Name.toLowerCase() ? -1 : a.Name.toLowerCase() === b.Name.toLowerCase() ? 0 : 1;
                });
                result[k] = groupPolicies;
            }
        });

        return result;
    },

    listPolicies: function listPolicies() {
        var _this = this;

        this.setState({ loading: true });
        var api = new _pydioHttpRestApi.PolicyServiceApi(_pydioHttpApi2['default'].getRestClient());
        _pydio2['default'].startLoading();
        api.listPolicies(new _pydioHttpRestApi.IdmListPolicyGroupsRequest()).then(function (data) {
            _pydio2['default'].endLoading();
            var grouped = _this.groupByResourcesGroups(data);
            _this.setState({ policies: grouped, loading: false });
        })['catch'](function (reason) {
            _pydio2['default'].endLoading();
            _this.setState({ error: reason, loading: false });
        });
    },

    /**
     *
     * @param policy IdmPolicyGroup
     * @param revertOnly
     */
    savePolicy: function savePolicy(policy, revertOnly) {
        "use strict";

        var _this2 = this;

        if (revertOnly) {
            this.listPolicies();
            return;
        }
        _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
            var api = new sdk.EnterprisePolicyServiceApi(_pydioHttpApi2['default'].getRestClient());
            api.putPolicy(policy).then(function () {
                _this2.listPolicies();
            })['catch'](function (reason) {
                _this2.setState({ error: reason });
            });
        });
    },

    deletePolicy: function deletePolicy(policy) {
        var _this3 = this;

        var pydio = this.props.pydio;

        pydio.UI.openConfirmDialog({
            message: pydio.MessageHash['ajxp_admin.policies.policy.delete.confirm'],
            destructive: [policy.Name],
            validCallback: function validCallback() {
                _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
                    var api = new sdk.EnterprisePolicyServiceApi(_pydioHttpApi2['default'].getRestClient());
                    api.deletePolicy(policy.Uuid).then(function () {
                        _this3.listPolicies();
                    })['catch'](function (reason) {
                        _this3.setState({ error: reason });
                    });
                });
            }
        });
    },

    createPolicy: function createPolicy(event) {
        var _refs = this.refs;
        var newPolicyName = _refs.newPolicyName;
        var newPolicyDescription = _refs.newPolicyDescription;
        var newPolicyType = this.state.newPolicyType;

        var newId = (0, _uuid.v4)();

        var policy = {
            Uuid: newId,
            Name: newPolicyName.getValue(),
            Description: newPolicyDescription.getValue(),
            ResourceGroup: newPolicyType,
            Policies: []
        };

        var policies = _extends({}, this.state.policies);
        if (!policies[newPolicyType]) {
            policies[newPolicyType] = [];
        }
        policies[newPolicyType].push(policy);
        this.setState({
            policies: policies,
            popoverOpen: false,
            newPolicyId: newId
        });
    },

    openPopover: function openPopover(event) {
        "use strict";
        // This prevents ghost click.

        var _this4 = this;

        event.preventDefault();
        this.setState({
            newPolicyType: 'acl',
            popoverOpen: true,
            anchorEl: event.currentTarget
        }, function () {
            setTimeout(function () {
                _this4.refs.newPolicyName.focus();
            }, 200);
        });
    },

    handleRequestClose: function handleRequestClose() {
        this.setState({ popoverOpen: false });
    },

    handleChangePolicyType: function handleChangePolicyType(event, index, value) {
        this.setState({ newPolicyType: value });
    },

    render: function render() {
        var _this5 = this;

        var _props = this.props;
        var muiTheme = _props.muiTheme;
        var currentNode = _props.currentNode;
        var pydio = _props.pydio;
        var accessByName = _props.accessByName;
        var readonly = this.props.readonly;

        readonly = readonly || !accessByName('Create');
        var _state = this.state;
        var policies = _state.policies;
        var selectedPolicy = _state.selectedPolicy;
        var newPolicyId = _state.newPolicyId;

        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.policies.' + id] || id;
        };
        var adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

        var columns = [{ name: 'Name', label: m('policy.name'), style: { fontSize: 15 }, sorter: { type: 'string', 'default': true } }, { name: 'Rules', label: m('policy.rules'), style: { width: 80, textAlign: 'center' }, headerStyle: { width: 80, textAlign: 'center' }, renderCell: function renderCell(row) {
                return row.Policies.length;
            }, sorter: { type: 'number' } }, { name: 'Description', label: m('policy.description'), sorter: { type: 'string' } }];

        var actions = [];
        if (readonly) {
            actions.push({
                iconClassName: 'mdi mdi-eye',
                tooltip: m('policy.display'),
                onTouchTap: function onTouchTap(policy) {
                    return _this5.setState({ selectedPolicy: selectedPolicy === policy.Uuid ? null : policy.Uuid });
                }
            });
        } else {
            actions.push({
                iconClassName: 'mdi mdi-pencil',
                tooltip: m('policy.edit'),
                onTouchTap: function onTouchTap(policy) {
                    return _this5.setState({ selectedPolicy: selectedPolicy === policy.Uuid ? null : policy.Uuid });
                }
            });
            actions.push({
                iconClassName: 'mdi mdi-delete',
                tooltip: m('policy.delete'),
                onTouchTap: function onTouchTap(policy) {
                    _this5.deletePolicy(policy);
                }
            });
        }

        var tables = Object.keys(policies).map(function (k) {
            if (readonly && k === 'acl') {
                return null;
            }
            var data = policies[k];
            var dd = data.map(function (policy) {
                if (policy.Uuid === selectedPolicy) {
                    return _extends({}, policy, { expandedRow: _react2['default'].createElement(_policiesPolicy2['default'], _extends({}, _this5.props, {
                            readonly: readonly,
                            key: policy.Name,
                            policy: policy,
                            savePolicy: _this5.savePolicy.bind(_this5),
                            deletePolicy: _this5.deletePolicy.bind(_this5),
                            newPolicyWithRule: newPolicyId === policy.Uuid ? policy.Name : null
                        })) });
                } else {
                    return policy;
                }
            });
            var title = m('type.' + k + '.title');
            var legend = m('type.' + k + '.legend');
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(AdminComponents.SubHeader, { title: title, legend: legend }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    _extends({}, adminStyles.body.block.props, { style: adminStyles.body.block.container }),
                    _react2['default'].createElement(MaterialTable, {
                        data: dd,
                        columns: columns,
                        actions: actions,
                        deselectOnClickAway: true,
                        showCheckboxes: false,
                        masterStyles: adminStyles.body.tableMaster
                    })
                )
            );
        });

        var action = _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement(_materialUi.FlatButton, _extends({}, adminStyles.props.header.flatButton, {
                primary: true,
                onTouchTap: this.openPopover.bind(this),
                label: m('policy.new')
            })),
            _react2['default'].createElement(
                _materialUi.Popover,
                {
                    open: this.state.popoverOpen,
                    anchorEl: this.state.anchorEl,
                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                    targetOrigin: { horizontal: 'right', vertical: 'top' },
                    onRequestClose: this.handleRequestClose.bind(this)
                },
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: '0 12px' } },
                        _react2['default'].createElement(_materialUi.TextField, { floatingLabelText: m('policy.name'), ref: 'newPolicyName' }),
                        _react2['default'].createElement('br', null),
                        _react2['default'].createElement(_materialUi.TextField, { floatingLabelText: m('policy.description'), ref: 'newPolicyDescription' }),
                        _react2['default'].createElement('br', null),
                        _react2['default'].createElement(
                            _materialUi.SelectField,
                            {
                                floatingLabelText: m('policy.type'),
                                ref: 'newPolicyType',
                                value: this.state.newPolicyType || 'rest',
                                onChange: this.handleChangePolicyType.bind(this)
                            },
                            ResourceGroups.map(function (k) {
                                return _react2['default'].createElement(_materialUi.MenuItem, { value: k, primaryText: m('type.' + k + '.title') });
                            })
                        )
                    ),
                    _react2['default'].createElement(_materialUi.Divider, null),
                    _react2['default'].createElement(
                        'div',
                        { style: { textAlign: 'right', padding: '6px 12px' } },
                        _react2['default'].createElement(_materialUi.FlatButton, { label: pydio.MessageHash['54'], onTouchTap: this.handleRequestClose.bind(this) }),
                        _react2['default'].createElement(_materialUi.FlatButton, { label: m('policy.create'), onTouchTap: this.createPolicy.bind(this) })
                    )
                )
            )
        );

        return _react2['default'].createElement(
            'div',
            { className: 'vertical-layout', style: { height: '100%' } },
            _react2['default'].createElement(AdminComponents.Header, {
                title: currentNode.getLabel(),
                icon: currentNode.getMetadata().get('icon_class'),
                actions: readonly ? null : action,
                reloadAction: this.listPolicies.bind(this),
                loading: this.state.loading
            }),
            _react2['default'].createElement(
                'div',
                { className: 'layout-fill' },
                tables
            )
        );
    }

});

exports['default'] = PoliciesBoard = (0, _materialUiStyles.muiThemeable)()(PoliciesBoard);
exports['default'] = PoliciesBoard;
module.exports = exports['default'];
