'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _StepActions = require('./StepActions');

var _StepActions2 = _interopRequireDefault(_StepActions);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var StepEmptyConfig = (function (_React$Component) {
    _inherits(StepEmptyConfig, _React$Component);

    function StepEmptyConfig(props) {
        _classCallCheck(this, StepEmptyConfig);

        _get(Object.getPrototypeOf(StepEmptyConfig.prototype), 'constructor', this).call(this, props);
    }

    _createClass(StepEmptyConfig, [{
        key: 'T',
        value: function T(id) {
            return _pydio2['default'].getInstance().MessageHash['migration.' + id] || id;
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var onBack = _props.onBack;
            var onComplete = _props.onComplete;
            var nextLabel = _props.nextLabel;
            var legend = _props.legend;
            var styles = _props.styles;
            var otherButtons = _props.otherButtons;
            var _props2 = this.props;
            var title = _props2.title;

            var remainingProps = _objectWithoutProperties(_props2, ['title']);

            return _react2['default'].createElement(
                _materialUi.Step,
                remainingProps,
                _react2['default'].createElement(
                    _materialUi.StepLabel,
                    null,
                    title
                ),
                _react2['default'].createElement(
                    _materialUi.StepContent,
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: styles.stepLegend },
                        legend
                    ),
                    _react2['default'].createElement(
                        _StepActions2['default'],
                        null,
                        otherButtons,
                        onBack && _react2['default'].createElement(_materialUi.RaisedButton, {
                            onClick: function () {
                                return onBack();
                            },
                            label: this.T('back')
                        }),
                        '  ',
                        _react2['default'].createElement(_materialUi.RaisedButton, {
                            primary: true,
                            onClick: function () {
                                return onComplete();
                            },
                            label: nextLabel || this.T('next')
                        })
                    )
                )
            );
        }
    }]);

    return StepEmptyConfig;
})(_react2['default'].Component);

exports['default'] = StepEmptyConfig;
module.exports = exports['default'];
