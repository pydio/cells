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

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var _materialUi = require('material-ui');

var DsStorageType = (function (_React$Component) {
    _inherits(DsStorageType, _React$Component);

    function DsStorageType() {
        _classCallCheck(this, DsStorageType);

        _get(Object.getPrototypeOf(DsStorageType.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(DsStorageType, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var onSelect = _props.onSelect;
            var selected = _props.selected;
            var value = _props.value;
            var primaryText = _props.primaryText;
            var image = _props.image;

            var styles = {
                cont: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '10px 10px 0 10px',
                    backgroundColor: 'transparent',
                    borderBottom: '2px solid transparent',
                    transition: _pydioUtilDom2['default'].getBeziersTransition()
                },
                image: {
                    width: 30,
                    height: 30,
                    opacity: .3,
                    transition: _pydioUtilDom2['default'].getBeziersTransition()
                },
                label: {
                    margin: 5,
                    marginTop: 8,
                    /*textTransform: 'uppercase',*/
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'rgba(0,0,0,.3)',
                    textAlign: 'center',
                    transition: _pydioUtilDom2['default'].getBeziersTransition()
                }
            };
            if (selected) {
                styles.cont.borderBottom = '2px solid #0e4d6d';
                //styles.cont.backgroundColor = '#fff';
                styles.image.opacity = 1;
                styles.label.color = '#0e4d6d';
            }

            return _react2['default'].createElement(
                'div',
                { zDepth: 0, style: styles.cont, onClick: function (e) {
                        onSelect(value);
                    }, rounded: false },
                image && _react2['default'].createElement('img', { style: styles.image, src: "plug/access.settings/res/images/" + image }),
                _react2['default'].createElement(
                    'div',
                    { style: styles.label },
                    primaryText
                )
            );
        }
    }]);

    return DsStorageType;
})(_react2['default'].Component);

var DsStorageSelector = (function (_React$Component2) {
    _inherits(DsStorageSelector, _React$Component2);

    function DsStorageSelector(props) {
        _classCallCheck(this, DsStorageSelector);

        _get(Object.getPrototypeOf(DsStorageSelector.prototype), 'constructor', this).call(this, props);
    }

    _createClass(DsStorageSelector, [{
        key: 'onChange',
        value: function onChange(newValue) {
            var _props2 = this.props;
            var values = _props2.values;
            var onChange = _props2.onChange;

            var i = Object.keys(values).indexOf(newValue);
            onChange(null, i, newValue);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props3 = this.props;
            var values = _props3.values;
            var value = _props3.value;
            var disabled = _props3.disabled;

            var style = {
                display: 'flex',
                padding: '0 1px',
                backgroundColor: '#ECEFF1'
            };
            return _react2['default'].createElement(
                'div',
                { style: style },
                Object.keys(values).map(function (k) {
                    return _react2['default'].createElement(DsStorageType, {
                        value: k,
                        selected: k === value,
                        onSelect: disabled ? function () {} : _this.onChange.bind(_this),
                        primaryText: values[k].primaryText,
                        image: values[k].image
                    });
                })
            );
        }
    }]);

    return DsStorageSelector;
})(_react2['default'].Component);

exports['default'] = DsStorageSelector;
module.exports = exports['default'];
