/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var StepperDialog = (function (_React$Component) {
    _inherits(StepperDialog, _React$Component);

    function StepperDialog() {
        _classCallCheck(this, StepperDialog);

        _React$Component.apply(this, arguments);
    }

    StepperDialog.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
        if (prevProps.random !== this.props.random && this.refs['dialog']) {
            setTimeout(function () {
                window.dispatchEvent(new Event('resize'));
            }, 0);
        }
    };

    StepperDialog.prototype.render = function render() {
        var _props = this.props;
        var title = _props.title;
        var actions = _props.actions;
        var open = _props.open;
        var onDismiss = _props.onDismiss;
        var onFilter = _props.onFilter;
        var customFilter = _props.customFilter;
        var children = _props.children;
        var dialogProps = _props.dialogProps;

        var tt = title;
        if (onDismiss || onFilter || customFilter) {
            tt = _react2['default'].createElement(
                'div',
                { style: { position: 'relative', display: 'flex', alignItems: 'center' } },
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1 } },
                    title
                ),
                customFilter && _react2['default'].createElement(
                    'div',
                    { style: { marginRight: 16 } },
                    customFilter
                ),
                onFilter && _react2['default'].createElement(
                    'div',
                    { style: { width: 210, height: 34, marginTop: -10, marginRight: onDismiss ? 50 : 0 } },
                    _react2['default'].createElement(ModernTextField, { hintText: "Filter list", onChange: function (e, v) {
                            onFilter(v);
                        }, fullWidth: true })
                ),
                onDismiss && _react2['default'].createElement(
                    'div',
                    { style: { position: 'absolute', top: 11, right: 20 } },
                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-close", onClick: onDismiss })
                )
            );
        }

        return _react2['default'].createElement(
            _materialUi.Dialog,
            {
                ref: "dialog",
                title: tt,
                actions: actions,
                modal: dialogProps.modal,
                open: open,
                autoDetectWindowHeight: true,
                autoScrollBodyContent: true,
                contentClassName: "stepper-dialog",
                bodyStyle: _extends({
                    backgroundColor: 'rgb(236, 239, 241)',
                    borderRadius: '0 0 6px 6px'
                }, dialogProps.bodyStyle),
                contentStyle: _extends({
                    width: '90%',
                    maxWidth: 'none',
                    borderRadius: 6
                }, dialogProps.contentStyle),
                titleStyle: _extends({
                    borderBottom: 'none',
                    backgroundColor: 'rgb(246, 247, 248)',
                    borderRadius: '6px 6px 0 0'
                }, dialogProps.titleStyle)
            },
            children,
            _react2['default'].createElement('style', { type: "text/css", dangerouslySetInnerHTML: { __html: '.stepper-dialog > div{border-radius: 6px !important;}' } })
        );
    };

    return StepperDialog;
})(_react2['default'].Component);

exports['default'] = StepperDialog;
module.exports = exports['default'];
