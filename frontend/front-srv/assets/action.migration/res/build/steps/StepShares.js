'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _StepActions = require('./StepActions');

var _StepActions2 = _interopRequireDefault(_StepActions);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var StepShares = (function (_React$Component) {
    _inherits(StepShares, _React$Component);

    function StepShares(props) {
        _classCallCheck(this, StepShares);

        _get(Object.getPrototypeOf(StepShares.prototype), 'constructor', this).call(this, props);

        this.state = {
            features: {
                "links": { label: this.T('feature.links'), checked: true },
                "cells": { label: this.T('feature.cells'), checked: true }
            },
            ownerId: ''
        };
    }

    _createClass(StepShares, [{
        key: 'T',
        value: function T(id) {
            var m = _pydio2['default'].getInstance().MessageHash;
            return m['migration.step.shares.' + id] || m['migration.' + id] || m[id] || id;
        }
    }, {
        key: 'exportFeatures',
        value: function exportFeatures() {
            var _state = this.state;
            var features = _state.features;
            var ownerId = _state.ownerId;
            var onChange = this.props.onChange;

            var state = {};
            if (!features.links.checked || !features.cells.checked) {
                state.shareType = features.links.checked ? 'LINK' : 'CELL';
            }
            if (ownerId) {
                state.ownerId = ownerId;
            }
            onChange({ sharesFeatures: state });
        }
    }, {
        key: 'toggle',
        value: function toggle(featureName, checked) {
            var _this = this;

            var features = this.state.features;

            features[featureName].checked = checked;
            if (!features.links.checked && !features.cells.checked) {
                alert(this.T('alert'));
                return;
            }
            this.setState({ features: features }, function () {
                _this.exportFeatures();
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var onBack = _props.onBack;
            var onComplete = _props.onComplete;
            var styles = _props.styles;
            var _state2 = this.state;
            var features = _state2.features;
            var ownerId = _state2.ownerId;

            return _react2['default'].createElement(
                _materialUi.Step,
                this.props,
                _react2['default'].createElement(
                    _materialUi.StepLabel,
                    null,
                    this.T('title')
                ),
                _react2['default'].createElement(
                    _materialUi.StepContent,
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: styles.stepLegend },
                        this.T('legend')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { marginTop: 10 } },
                        this.T('restrict.type')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: '10px 0' } },
                        Object.keys(features).map(function (k) {
                            var f = features[k];
                            return _react2['default'].createElement(_materialUi.Checkbox, { style: { padding: '6px 0' }, label: f.label, checked: f.checked, onCheck: function (e, v) {
                                    _this2.toggle(k, v);
                                } });
                        })
                    ),
                    _react2['default'].createElement(
                        'div',
                        null,
                        this.T('restrict.user')
                    ),
                    _react2['default'].createElement(ModernTextField, { hintText: this.T('restrict.user.login'), value: ownerId, onChange: function (e, v) {
                            _this2.setState({ ownerId: v }, function () {
                                _this2.exportFeatures();
                            });
                        } }),
                    _react2['default'].createElement(
                        _StepActions2['default'],
                        null,
                        _react2['default'].createElement(_materialUi.RaisedButton, {
                            onClick: function () {
                                return onBack();
                            },
                            label: this.T('back')
                        }),
                        '  ',
                        _react2['default'].createElement(_materialUi.RaisedButton, {
                            onClick: function () {
                                return onComplete();
                            },
                            label: this.T('next'),
                            disabled: !features.links.checked && !features.cells.checked,
                            primary: true
                        })
                    )
                )
            );
        }
    }]);

    return StepShares;
})(_react2['default'].Component);

exports['default'] = StepShares;
module.exports = exports['default'];
