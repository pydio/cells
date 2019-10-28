'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _StepActions = require('./StepActions');

var _StepActions2 = _interopRequireDefault(_StepActions);

var StepCategories = (function (_React$Component) {
    _inherits(StepCategories, _React$Component);

    function StepCategories(props) {
        _classCallCheck(this, StepCategories);

        _get(Object.getPrototypeOf(StepCategories.prototype), 'constructor', this).call(this, props);
        this.state = {
            valid: false
        };
    }

    _createClass(StepCategories, [{
        key: 'T',
        value: function T(id) {
            var m = _pydio2['default'].getInstance().MessageHash;
            return m['migration.step.categories.' + id] || m['migration.' + id] || m[id] || id;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var features = nextProps.features;

            this.setState({
                valid: Object.keys(features).reduce(function (valid, key) {
                    return valid || features[key].value;
                }, false)
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var features = _props.features;
            var onBack = _props.onBack;
            var onChange = _props.onChange;
            var onComplete = _props.onComplete;
            var summary = _props.summary;
            var styles = _props.styles;
            var summaryState = _props.summaryState;
            var hasRunning = _props.hasRunning;

            var remainingProps = _objectWithoutProperties(_props, ['features', 'onBack', 'onChange', 'onComplete', 'summary', 'styles', 'summaryState', 'hasRunning']);

            var valid = this.state.valid;

            var title = undefined,
                legend = undefined,
                boxes = undefined;
            if (summary) {
                title = this.T("summary");
                legend = this.T("summary.legend");
                boxes = [];
                Object.keys(features).forEach(function (k) {
                    var feature = features[k];
                    if (feature.value) {
                        boxes.push(_react2['default'].createElement(
                            'div',
                            { style: { padding: '6px 0' } },
                            _react2['default'].createElement(_materialUi.Checkbox, { label: feature.label, checked: true, labelStyle: { fontWeight: 500, fontSize: 15 } }),
                            feature.summary && _react2['default'].createElement(
                                'div',
                                { style: { marginLeft: 40, marginTop: 10 } },
                                feature.summary(summaryState)
                            ),
                            !feature.summary && _react2['default'].createElement(
                                'div',
                                { style: { marginLeft: 40, marginTop: 10 } },
                                _this.T('summary.empty')
                            )
                        ));
                    }
                });
            } else {
                title = this.T("choose");
                legend = this.T("choose.legend");
                boxes = Object.keys(features).map(function (k) {
                    var feature = features[k];

                    var featureProps = _objectWithoutProperties(feature, []);

                    return _react2['default'].createElement(
                        'div',
                        { style: { padding: feature.depends ? '6px 20px' : '6px 0' } },
                        _react2['default'].createElement(_materialUi.Checkbox, { label: feature.label, disabled: feature.depends && !features[feature.depends].value, checked: feature.value, onCheck: function (e, v) {
                                var changes = _defineProperty({}, k, _extends({}, featureProps, { value: v }));
                                if (!v) {
                                    // Disable depending features
                                    Object.keys(features).forEach(function (sub) {
                                        var subFeature = features[sub];
                                        if (subFeature.depends && subFeature.depends === k) {
                                            changes[sub] = _extends({}, subFeature, { value: false });
                                        }
                                    });
                                }
                                onChange(changes);
                            } })
                    );
                });
            }

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
                        'div',
                        null,
                        boxes
                    ),
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
                            primary: true,
                            disabled: !valid || hasRunning,
                            onClick: function () {
                                return onComplete();
                            },
                            label: summary ? this.T('summary.launch') : this.T('next')
                        })
                    )
                )
            );
        }
    }]);

    return StepCategories;
})(_react2['default'].Component);

exports['default'] = StepCategories;
module.exports = exports['default'];
