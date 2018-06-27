'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var GeneralPane = (function (_React$Component) {
    _inherits(GeneralPane, _React$Component);

    function GeneralPane(props) {
        _classCallCheck(this, GeneralPane);

        _get(Object.getPrototypeOf(GeneralPane.prototype), 'constructor', this).call(this, props);
    }

    /**
     *
     * @param d {Date}
     */

    _createClass(GeneralPane, [{
        key: 'updateSyncDate',
        value: function updateSyncDate(d) {
            var config = this.props.config;

            config.SchedulerDetails = d.getHours() + ":" + d.getMinutes();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var style = _props.style;
            var config = _props.config;
            var titleStyle = _props.titleStyle;
            var legendStyle = _props.legendStyle;

            var hDate = new Date();
            if (config.Schedule === 'daily' || !config.Schedule) {
                var detail = config.SchedulerDetails || '3:00';

                var _detail$split = detail.split(':');

                var _detail$split2 = _slicedToArray(_detail$split, 2);

                var h = _detail$split2[0];
                var m = _detail$split2[1];

                hDate.setHours(parseInt(h), parseInt(m));
            }

            return _react2['default'].createElement(
                'div',
                { style: style },
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: titleStyle },
                        'External Directory'
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: legendStyle },
                        'Define how this directory will appear to users and when it will be synchronized with Pydio internal directory.'
                    ),
                    _react2['default'].createElement(_materialUi.TextField, {
                        fullWidth: true,
                        floatingLabelText: "Label",
                        value: config.DomainName, onChange: function (e, v) {
                            config.DomainName = v;
                        }
                    }),
                    _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', alignItems: 'flex-end' } },
                        _react2['default'].createElement(
                            'div',
                            { style: { flex: 1 } },
                            _react2['default'].createElement(
                                _materialUi.SelectField,
                                {
                                    floatingLabelText: 'Synchronization',
                                    value: config.Schedule || 'daily',
                                    onChange: function (e, i, val) {
                                        config.Schedule = val;
                                    },
                                    fullWidth: true
                                },
                                _react2['default'].createElement(_materialUi.MenuItem, { value: 'daily', primaryText: 'Daily' }),
                                _react2['default'].createElement(_materialUi.MenuItem, { value: 'hourly', primaryText: 'Hourly' }),
                                _react2['default'].createElement(_materialUi.MenuItem, { value: 'manual', primaryText: 'Manual' })
                            )
                        ),
                        (config.Schedule === 'daily' || !config.Schedule) && _react2['default'].createElement(
                            'div',
                            { style: { height: 52, paddingLeft: 10 } },
                            _react2['default'].createElement(_materialUi.TimePicker, {
                                format: 'ampm',
                                minutesStep: 5,
                                hintText: "Sync Time",
                                textFieldStyle: { width: 100, marginRight: 5 },
                                value: hDate, onChange: function (e, v) {
                                    _this.updateSyncDate(v);
                                }
                            })
                        )
                    )
                )
            );
        }
    }]);

    return GeneralPane;
})(_react2['default'].Component);

GeneralPane.propTypes = {
    style: _react2['default'].PropTypes.object,
    config: _react2['default'].PropTypes.instanceOf(_pydioHttpRestApi.AuthLdapServerConfig)
};

exports['default'] = GeneralPane;
module.exports = exports['default'];
