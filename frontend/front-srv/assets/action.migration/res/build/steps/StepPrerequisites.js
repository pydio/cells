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

var StepPrerequisites = (function (_React$Component) {
    _inherits(StepPrerequisites, _React$Component);

    function StepPrerequisites() {
        _classCallCheck(this, StepPrerequisites);

        _get(Object.getPrototypeOf(StepPrerequisites.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(StepPrerequisites, [{
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
                    null,
                    this.T('step.prereq.welcome'),
                    _react2['default'].createElement('br', null),
                    this.T('step.prereq.check')
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { border: '2px solid rgb(96, 125, 138)', borderRadius: 8, padding: '8px 16px', flex: 1, marginRight: 8 } },
                        _react2['default'].createElement(
                            'h4',
                            { style: { color: '#607D8B', paddingTop: 0 } },
                            this.T('step.prereq.step1')
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.check.adminpydio')
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.check.install'),
                            ' : ',
                            _react2['default'].createElement(
                                'a',
                                { href: "https://download.pydio.com/pub/plugins/archives/action.migration.tar.gz", target: "_blank" },
                                _react2['default'].createElement(_materialUi.FontIcon, { style: { fontSize: 'inherit' }, className: "mdi mdi-open-in-new" })
                            )
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { border: '2px solid rgb(96, 125, 138)', borderRadius: 8, padding: '8px 16px', flex: 1 } },
                        _react2['default'].createElement(
                            'h4',
                            { style: { color: '#607D8B', paddingTop: 0 } },
                            this.T('step.prereq.step2')
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.check.admincell')
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.check.copy')
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { border: '2px solid rgb(96, 125, 138)', borderRadius: 8, padding: '8px 16px', flex: 1, marginLeft: 8 } },
                        _react2['default'].createElement(
                            'h4',
                            { style: { color: '#607D8B', paddingTop: 0 } },
                            this.T('step.prereq.step3')
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.ds.create')
                        ),
                        advanced && _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.ds.tpl.ed')
                        ),
                        !advanced && _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-alert", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.ds.tpl.home')
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.ds.done')
                        )
                    )
                )
            );

            return _react2['default'].createElement(_StepEmptyConfig2['default'], _extends({}, this.props, { title: this.T('step.prereq.title'), legend: content, nextLabel: this.T('step.prereq.start') }));
        }
    }]);

    return StepPrerequisites;
})(_react2['default'].Component);

exports['default'] = StepPrerequisites;
module.exports = exports['default'];
