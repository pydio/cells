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

exports.__esModule = true;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _FormPanel = require('./FormPanel');

var _FormPanel2 = _interopRequireDefault(_FormPanel);

var _fieldsInputSelectBox = require('../fields/InputSelectBox');

var _fieldsInputSelectBox2 = _interopRequireDefault(_fieldsInputSelectBox);

var React = require('react');

var LangUtils = require('pydio/util/lang');

/**
 * Sub form with a selector, switching its fields depending
 * on the selector value.
 */

var _default = (function (_React$Component) {
    _inherits(_default, _React$Component);

    function _default() {
        var _this = this;

        _classCallCheck(this, _default);

        _React$Component.apply(this, arguments);

        this.computeSubPanelParameters = function () {

            // CREATE SUB FORM PANEL
            // Get all values
            var switchName = _this.props.paramAttributes['type'].split(":").pop();
            var parentName = _this.props.paramAttributes['name'];
            var switchValues = {},
                potentialSubSwitches = [];

            _this.props.parameters.map((function (p) {
                "use strict";
                if (!p['group_switch_name']) return;
                if (p['group_switch_name'] != switchName) {
                    potentialSubSwitches.push(p);
                    return;
                }
                var crtSwitch = p['group_switch_value'];
                if (!switchValues[crtSwitch]) {
                    switchValues[crtSwitch] = {
                        label: p['group_switch_label'],
                        fields: [],
                        values: {},
                        fieldsKeys: {}
                    };
                }
                p = LangUtils.deepCopy(p);
                delete p['group_switch_name'];
                p['name'] = parentName + '/' + p['name'];
                var vKey = p['name'];
                var paramName = vKey;
                if (switchValues[crtSwitch].fieldsKeys[paramName]) {
                    return;
                }
                switchValues[crtSwitch].fields.push(p);
                switchValues[crtSwitch].fieldsKeys[paramName] = paramName;
                if (this.props.values && this.props.values[vKey]) {
                    switchValues[crtSwitch].values[paramName] = this.props.values[vKey];
                }
            }).bind(_this));
            // Remerge potentialSubSwitches to each parameters set
            for (var k in switchValues) {
                if (switchValues.hasOwnProperty(k)) {
                    var sv = switchValues[k];
                    sv.fields = sv.fields.concat(potentialSubSwitches);
                }
            }

            return switchValues;
        };

        this.clearSubParametersValues = function (parentName, newValue, newFields) {
            var vals = LangUtils.deepCopy(_this.props.values);
            var toRemove = {};
            for (var key in vals) {
                if (vals.hasOwnProperty(key) && key.indexOf(parentName + '/') === 0) {
                    toRemove[key] = '';
                }
            }
            vals[parentName] = newValue;

            newFields.map(function (p) {
                if (p.type == 'hidden' && p['default'] && !p['group_switch_name'] || p['group_switch_name'] == parentName) {
                    vals[p['name']] = p['default'];
                    if (toRemove[p['name']] !== undefined) delete toRemove[p['name']];
                } else if (p['name'].indexOf(parentName + '/') === 0 && p['default']) {
                    if (p['type'] && p['type'].startsWith('group_switch:')) {
                        //vals[p['name']] = {group_switch_value:p['default']};
                        vals[p['name']] = p['default'];
                    } else {
                        vals[p['name']] = p['default'];
                    }
                }
            });
            _this.props.onChange(vals, true, toRemove);
            //this.onParameterChange(parentName, newValue);
        };

        this.onChange = function (newValues, dirty, removeValues) {
            _this.props.onChange(newValues, true, removeValues);
        };
    }

    _default.prototype.render = function render() {
        var attributes = this.props.paramAttributes;
        var values = this.props.values;

        var paramName = attributes['name'];
        var switchValues = this.computeSubPanelParameters(attributes);
        var selectorValues = new Map();
        Object.keys(switchValues).map(function (k) {
            selectorValues.set(k, switchValues[k].label);
        });
        var selectorChanger = (function (newValue) {
            this.clearSubParametersValues(paramName, newValue, switchValues[newValue] ? switchValues[newValue].fields : []);
        }).bind(this);
        var subForm = undefined,
            selectorLegend = undefined;
        var selector = React.createElement(_fieldsInputSelectBox2['default'], {
            key: paramName,
            name: paramName,
            className: 'group-switch-selector',
            attributes: {
                name: paramName,
                choices: selectorValues,
                label: attributes['label'],
                mandatory: attributes['mandatory']
            },
            value: values[paramName],
            onChange: selectorChanger,
            displayContext: 'form',
            disabled: this.props.disabled,
            ref: 'subFormSelector'
        });

        var helperMark = undefined;
        if (this.props.setHelperData && this.props.checkHasHelper && this.props.checkHasHelper(attributes['name'], this.props.helperTestFor)) {
            var showHelper = (function () {
                this.props.setHelperData({ paramAttributes: attributes, values: values });
            }).bind(this);
            helperMark = React.createElement('span', { className: 'icon-question-sign', onClick: showHelper });
        }

        if (values[paramName] && switchValues[values[paramName]]) {
            var _props = this.props;
            var onAltTextSwitch = _props.onAltTextSwitch;
            var altTextSwitchIcon = _props.altTextSwitchIcon;
            var altTextSwitchTip = _props.altTextSwitchTip;

            subForm = React.createElement(_FormPanel2['default'], {
                onParameterChange: this.props.onParameterChange,
                applyButtonAction: this.props.applyButtonAction,
                disabled: this.props.disabled,
                ref: paramName + '-SUB',
                key: paramName + '-SUB',
                className: 'sub-form',
                parameters: switchValues[values[paramName]].fields,
                values: values,
                depth: this.props.depth + 1,
                onChange: this.onChange,
                checkHasHelper: this.props.checkHasHelper,
                setHelperData: this.props.setHelperData,
                helperTestFor: values[paramName],
                accordionizeIfGroupsMoreThan: 5,
                onAltTextSwitch: onAltTextSwitch,
                altTextSwitchIcon: altTextSwitchIcon,
                altTextSwitchTip: altTextSwitchTip
            });
        }
        return React.createElement(
            'div',
            { className: 'sub-form-group' },
            React.createElement(
                'div',
                { className: 'form-legend' },
                attributes['description'],
                ' ',
                helperMark
            ),
            selector,
            subForm
        );
    };

    _createClass(_default, null, [{
        key: 'propTypes',
        value: {
            paramAttributes: React.PropTypes.object.isRequired,
            parameters: React.PropTypes.array.isRequired,
            values: React.PropTypes.object.isRequired,
            onChange: React.PropTypes.func.isRequired
        },
        enumerable: true
    }]);

    return _default;
})(React.Component);

exports['default'] = _default;
module.exports = exports['default'];
