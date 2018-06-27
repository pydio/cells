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

var _materialUi = require('material-ui');

var VersionPolicyPeriods = (function (_React$Component) {
    _inherits(VersionPolicyPeriods, _React$Component);

    function VersionPolicyPeriods() {
        _classCallCheck(this, VersionPolicyPeriods);

        _get(Object.getPrototypeOf(VersionPolicyPeriods.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(VersionPolicyPeriods, [{
        key: 'render',
        value: function render() {
            var _ref = this.props || [];

            var periods = _ref.periods;
            var rendering = _ref.rendering;

            if (rendering === 'short') {

                var text = undefined;
                if (periods.length === 1) {
                    var p = periods[0];
                    if (p.MaxNumber === -1) {
                        text = "Always keep all versions";
                    } else {
                        text = "Keep " + p.MaxNumber + " versions";
                    }
                } else {
                    text = periods.length + " retention periods.";
                    var last = periods[periods.length - 1];
                    if (last.MaxNumber === 0 || last.MaxNumber === undefined) {
                        text += " Remove all after " + last.IntervalStart;
                    } else {
                        text += " Keep " + last.MaxNumber + " versions after " + last.IntervalStart;
                    }
                }

                return _react2['default'].createElement(
                    'span',
                    null,
                    text
                );
            }

            var steps = periods.map(function (p) {
                var label = p.MaxNumber;
                var timeLabel = undefined;
                var icon = _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-ray-start-arrow' });
                var style = {};
                if (p.IntervalStart === undefined || p.IntervalStart === "0") {
                    icon = _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-clock-start' });
                } else {
                    timeLabel = _react2['default'].createElement(
                        'span',
                        { style: { fontWeight: 500, fontSize: 16 } },
                        p.IntervalStart,
                        ' '
                    );
                }
                if (p.MaxNumber === -1) {
                    label = "Keep all";
                } else if (!p.MaxNumber) {
                    label = "Remove all";
                    icon = _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-delete', style: { color: '#c62828' } });
                    style = { color: '#c62828' };
                } else {
                    label = "Max. " + label + " versions";
                }
                return _react2['default'].createElement(
                    _materialUi.Step,
                    null,
                    _react2['default'].createElement(
                        _materialUi.StepLabel,
                        { icon: icon, style: style },
                        timeLabel,
                        label
                    )
                );
            });

            return _react2['default'].createElement(
                _materialUi.Stepper,
                { activeStep: periods.length - 1, linear: false },
                steps
            );
        }
    }]);

    return VersionPolicyPeriods;
})(_react2['default'].Component);

exports['default'] = VersionPolicyPeriods;
module.exports = exports['default'];
