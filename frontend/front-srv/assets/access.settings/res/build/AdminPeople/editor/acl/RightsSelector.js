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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _utilMessagesMixin = require('../util/MessagesMixin');

var _PoliciesLoader = require('./PoliciesLoader');

var _PoliciesLoader2 = _interopRequireDefault(_PoliciesLoader);

exports['default'] = _react2['default'].createClass({
    displayName: 'RightsSelector',

    mixins: [_utilMessagesMixin.RoleMessagesConsumerMixin],

    propTypes: {
        acl: _react2['default'].PropTypes.string,
        disabled: _react2['default'].PropTypes.bool,
        hideDeny: _react2['default'].PropTypes.bool,
        hideLabels: _react2['default'].PropTypes.bool,
        advancedAcl: _react2['default'].PropTypes.bool,
        onChange: _react2['default'].PropTypes.func
    },

    getInitialState: function getInitialState() {
        return {
            acl: this.props.acl,
            loaded: false,
            policies: []
        };
    },

    componentWillMount: function componentWillMount() {
        var _this = this;

        _PoliciesLoader2['default'].getInstance().getPolicies().then(function (data) {
            _this.setState({ policies: data, loaded: true });
        });
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        this.setState({ acl: newProps.acl });
    },

    getAcl: function getAcl() {
        return this.state.acl;
    },

    updateAcl: function updateAcl() {

        if (this.props.disabled) {
            return;
        }

        var d = this.refs.deny.isChecked();
        var r = !d && this.refs.read.isChecked();
        var w = !d && this.refs.write.isChecked();
        var acl = undefined;
        if (d) {
            acl = 'PYDIO_VALUE_CLEAR';
            this.setState({ acl: acl });
        } else {
            var parts = [];
            if (r) {
                parts.push("read");
            }
            if (w) {
                parts.push("write");
            }
            acl = parts.join(",");
            this.setState({ acl: acl });
        }
        if (this.props.onChange) {
            this.props.onChange(acl, this.props.acl);
        } else {
            this.setState({ acl: acl });
        }
    },

    handleChangePolicy: function handleChangePolicy(event, value) {
        var acl = 'policy:' + value;
        if (this.props.onChange) {
            this.props.onChange(acl, this.props.acl);
        } else {
            this.setState({ acl: acl });
        }
    },

    render: function render() {
        var advancedAcl = this.props.advancedAcl;

        var acl = this.state.acl || '';
        var policies = this.state.policies;

        var selectedPolicy = 'manual-rights';
        var policyLabel = undefined;
        if (acl.startsWith('policy:')) {
            selectedPolicy = acl.replace('policy:', '');
            var pol = policies.find(function (entry) {
                return entry.id === selectedPolicy;
            });
            if (pol) {
                policyLabel = pol.label;
            } else {
                policyLabel = 'Loading...';
            }
        }

        var checkboxStyle = { width: 44 };

        var deny = undefined;
        if (!this.props.hideDeny) {
            deny = _react2['default'].createElement(_materialUi.Checkbox, { ref: 'deny', label: this.props.hideLabels ? "" : this.context.getMessage('react.5', 'ajxp_admin'), value: '-', disabled: this.props.disabled,
                onCheck: this.updateAcl, checked: acl.indexOf('PYDIO_VALUE_CLEAR') !== -1, style: checkboxStyle });
        }
        return _react2['default'].createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', width: advancedAcl ? 180 : 140, height: 40 } },
            advancedAcl && _react2['default'].createElement(
                _materialUi.IconMenu,
                {
                    iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-dots-vertical" }),
                    onChange: this.handleChangePolicy.bind(this),
                    value: selectedPolicy,
                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                    targetOrigin: { horizontal: 'right', vertical: 'top' }
                },
                _react2['default'].createElement(_materialUi.MenuItem, { value: 'manual-rights', primaryText: "Rights set manually" }),
                policies.map(function (entry) {
                    return _react2['default'].createElement(_materialUi.MenuItem, { value: entry.id, primaryText: entry.label });
                })
            ),
            selectedPolicy === 'manual-rights' && _react2['default'].createElement(_materialUi.Checkbox, { ref: 'read',
                label: this.props.hideLabels ? "" : this.context.getMessage('react.5a', 'ajxp_admin'),
                value: 'read',
                onCheck: this.updateAcl, disabled: this.props.disabled || acl === 'PYDIO_VALUE_CLEAR',
                checked: acl !== 'PYDIO_VALUE_CLEAR' && acl.indexOf('read') !== -1,
                style: checkboxStyle
            }),
            selectedPolicy === 'manual-rights' && _react2['default'].createElement(_materialUi.Checkbox, { ref: 'write', label: this.props.hideLabels ? "" : this.context.getMessage('react.5b', 'ajxp_admin'), value: 'write',
                onCheck: this.updateAcl, disabled: this.props.disabled || acl === 'PYDIO_VALUE_CLEAR',
                checked: acl !== 'PYDIO_VALUE_CLEAR' && acl.indexOf('write') !== -1, style: checkboxStyle }),
            selectedPolicy === 'manual-rights' && deny,
            selectedPolicy !== 'manual-rights' && _react2['default'].createElement(
                'div',
                { style: { padding: 12, paddingLeft: 0, fontSize: 14, width: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                policyLabel
            )
        );
    }

});
module.exports = exports['default'];
