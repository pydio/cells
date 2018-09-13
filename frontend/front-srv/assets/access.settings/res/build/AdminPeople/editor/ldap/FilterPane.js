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

var _DNs = require('./DNs');

var _DNs2 = _interopRequireDefault(_DNs);

var FilterPane = (function (_React$Component) {
    _inherits(FilterPane, _React$Component);

    function FilterPane() {
        _classCallCheck(this, FilterPane);

        _get(Object.getPrototypeOf(FilterPane.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(FilterPane, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var style = _props.style;
            var config = _props.config;
            var legendStyle = _props.legendStyle;
            var titleStyle = _props.titleStyle;
            var pydio = _props.pydio;

            var user = config.User;

            return _react2['default'].createElement(
                'div',
                { style: style },
                _react2['default'].createElement(
                    'div',
                    { style: titleStyle },
                    pydio.MessageHash["ldap.9"]
                ),
                _react2['default'].createElement(
                    'div',
                    { style: legendStyle },
                    pydio.MessageHash["ldap.10"]
                ),
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_DNs2['default'], { dns: user.DNs || [''], onChange: function (val) {
                            user.DNs = val;
                        }, pydio: pydio }),
                    _react2['default'].createElement(_materialUi.TextField, {
                        fullWidth: true,
                        floatingLabelText: pydio.MessageHash["ldap.7"],
                        value: user.Filter, onChange: function (e, v) {
                            user.Filter = v;
                        }
                    }),
                    _react2['default'].createElement(_materialUi.TextField, {
                        fullWidth: true,
                        floatingLabelText: pydio.MessageHash["ldap.8"],
                        value: user.IDAttribute, onChange: function (e, v) {
                            user.IDAttribute = v;
                        }
                    })
                )
            );
        }
    }]);

    return FilterPane;
})(_react2['default'].Component);

FilterPane.propTypes = {
    style: _react2['default'].PropTypes.object
};

exports['default'] = FilterPane;
module.exports = exports['default'];
