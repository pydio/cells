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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _hocAsFormField = require("../hoc/asFormField");

var _hocAsFormField2 = _interopRequireDefault(_hocAsFormField);

var _hocWithChoices = require('../hoc/withChoices');

var _hocWithChoices2 = _interopRequireDefault(_hocWithChoices);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var React = require('react');

var _require = require('material-ui');

var SelectField = _require.SelectField;
var MenuItem = _require.MenuItem;
var Chip = _require.Chip;

var LangUtils = require('pydio/util/lang');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernSelectField = _Pydio$requireLib.ModernSelectField;

/**
 * Select box input conforming to Pydio standard form parameter.
 */

var InputSelectBox = (function (_React$Component) {
    _inherits(InputSelectBox, _React$Component);

    function InputSelectBox() {
        _classCallCheck(this, InputSelectBox);

        _React$Component.apply(this, arguments);
    }

    InputSelectBox.prototype.onDropDownChange = function onDropDownChange(event, index, value) {
        this.props.onChange(event, value);
        this.props.toggleEditMode();
    };

    InputSelectBox.prototype.onMultipleSelect = function onMultipleSelect(event, index, newValue) {
        if (newValue === -1) {
            return;
        }
        var currentValue = this.props.value;
        var currentValues = typeof currentValue === 'string' ? currentValue.split(',') : currentValue;
        if (!currentValues.indexOf(newValue) !== -1) {
            currentValues.push(newValue);
            this.props.onChange(event, currentValues.join(','));
        }
        this.props.toggleEditMode();
    };

    InputSelectBox.prototype.onMultipleRemove = function onMultipleRemove(value) {
        var currentValue = this.props.value;
        var currentValues = typeof currentValue === 'string' ? currentValue.split(',') : currentValue;
        if (currentValues.indexOf(value) !== -1) {
            currentValues = LangUtils.arrayWithout(currentValues, currentValues.indexOf(value));
            this.props.onChange(null, currentValues.join(','));
        }
    };

    InputSelectBox.prototype.render = function render() {
        var _this = this;

        var currentValue = this.props.value;
        var menuItems = [],
            multipleOptions = [];
        if (!this.props.attributes['mandatory'] || this.props.attributes['mandatory'] !== "true") {
            menuItems.push(React.createElement(MenuItem, { value: -1, primaryText: this.props.attributes['label'] + '...' }));
        }
        var choices = this.props.choices;

        choices.forEach(function (value, key) {
            menuItems.push(React.createElement(MenuItem, { value: key, primaryText: value }));
            multipleOptions.push({ value: key, label: value });
        });
        if (this.props.isDisplayGrid() && !this.props.editMode || this.props.disabled) {
            var value = this.props.value;
            if (choices.get(value)) {
                value = choices.get(value);
            }
            return React.createElement(
                'div',
                {
                    onClick: this.props.disabled ? function () {} : this.props.toggleEditMode,
                    className: value ? '' : 'paramValue-empty' },
                value ? value : 'Empty',
                '   ',
                React.createElement('span', { className: 'icon-caret-down' })
            );
        } else {
            if (this.props.multiple && this.props.multiple === true) {
                var currentValues = currentValue;
                if (typeof currentValue === "string") {
                    currentValues = currentValue.split(",");
                }
                return React.createElement(
                    'span',
                    { className: "multiple has-value" },
                    React.createElement(
                        'div',
                        { style: { display: 'flex', flexWrap: 'wrap' } },
                        currentValues.map(function (v) {
                            return React.createElement(
                                Chip,
                                { onRequestDelete: function () {
                                        _this.onMultipleRemove(v);
                                    } },
                                v
                            );
                        })
                    ),
                    React.createElement(
                        ModernSelectField,
                        {
                            value: -1,
                            onChange: function (e, i, v) {
                                return _this.onMultipleSelect(e, i, v);
                            },
                            fullWidth: true,
                            className: this.props.className
                        },
                        menuItems
                    )
                );
            } else {
                return React.createElement(
                    'span',
                    null,
                    React.createElement(
                        ModernSelectField,
                        {
                            hintText: this.props.attributes.label,
                            value: currentValue,
                            onChange: function (e, i, v) {
                                return _this.onDropDownChange(e, i, v);
                            },
                            fullWidth: true,
                            className: this.props.className
                        },
                        menuItems
                    )
                );
            }
        }
    };

    return InputSelectBox;
})(React.Component);

exports['default'] = InputSelectBox = _hocAsFormField2['default'](InputSelectBox, true);
exports['default'] = InputSelectBox = _hocWithChoices2['default'](InputSelectBox);
exports['default'] = InputSelectBox;
module.exports = exports['default'];
