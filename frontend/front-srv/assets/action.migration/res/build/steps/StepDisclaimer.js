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

var _StepEmptyConfig = require('./StepEmptyConfig');

var _StepEmptyConfig2 = _interopRequireDefault(_StepEmptyConfig);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var StepDisclaimer = (function (_React$Component) {
    _inherits(StepDisclaimer, _React$Component);

    function StepDisclaimer() {
        _classCallCheck(this, StepDisclaimer);

        _get(Object.getPrototypeOf(StepDisclaimer.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(StepDisclaimer, [{
        key: 'T',
        value: function T(id) {
            return _pydio2['default'].getInstance().MessageHash['migration.' + id] || id;
        }
    }, {
        key: 'render',
        value: function render() {
            var advanced = this.props.advanced;

            var content = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'p',
                    { style: { border: '2px solid #C62828', color: '#C62828', borderRadius: 4, padding: 12, fontWeight: 500, marginBottom: 8 } },
                    this.T('step.disclaimer'),
                    _react2['default'].createElement('br', null),
                    _react2['default'].createElement('br', null),
                    this.T('step.disclaimer.' + (advanced ? "ed" : "home"))
                )
            );

            var otherButtons = [];
            if (advanced) {
                otherButtons.push(_react2['default'].createElement(_materialUi.RaisedButton, { label: this.T('step.disclaimer.support'), onTouchTap: function () {
                        window.open('https://pydio.com/en/user/login');
                    } }));
            } else {
                otherButtons.push(_react2['default'].createElement(_materialUi.RaisedButton, { label: this.T('step.disclaimer.quote'), onTouchTap: function () {
                        window.open('https://pydio.com/en/pricing/contact');
                    } }));
            }

            return _react2['default'].createElement(_StepEmptyConfig2['default'], _extends({}, this.props, { title: this.T('step.disclaimer.title'), legend: content, nextLabel: this.T('step.disclaimer.start'), otherButtons: otherButtons }));
        }
    }]);

    return StepDisclaimer;
})(_react2['default'].Component);

exports['default'] = StepDisclaimer;
module.exports = exports['default'];
