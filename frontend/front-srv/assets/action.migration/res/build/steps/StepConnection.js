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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _materialUi = require('material-ui');

var _StepActions = require('./StepActions');

var _StepActions2 = _interopRequireDefault(_StepActions);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var StepConnection = (function (_React$Component) {
    _inherits(StepConnection, _React$Component);

    function StepConnection(props) {
        _classCallCheck(this, StepConnection);

        _get(Object.getPrototypeOf(StepConnection.prototype), 'constructor', this).call(this, props);
        this.state = {};
    }

    _createClass(StepConnection, [{
        key: 'T',
        value: function T(id) {
            var m = _pydio2['default'].getInstance().MessageHash;
            return m['migration.step.connection.' + id] || m['migration.' + id] || m[id] || id;
        }
    }, {
        key: 'testUrl',
        value: function testUrl(method, url, user, pwd) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url);
                xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pwd));
                xhr.onreadystatechange = function () {
                    if (xhr.readyState !== 4) {
                        return;
                    }
                    if (xhr.status !== 200) {
                        reject(new Error(_this.T('fail').replace('%s', url)));
                        return;
                    }
                    resolve();
                };
                xhr.send();
            });
        }
    }, {
        key: 'handleNext',
        value: function handleNext() {
            var _this2 = this;

            var _props = this.props;
            var url = _props.url;
            var user = _props.user;
            var pwd = _props.pwd;
            var pydio = _props.pydio;
            var onComplete = _props.onComplete;

            if (!url || !user || !pwd) {
                this.setState({ error: this.T('missing') });
                return;
            }

            this.testUrl('GET', _pydioUtilLang2['default'].trimRight(url, '/') + '/api/v2/admin/workspaces', user, pwd).then(function () {

                pydio.UI.displayMessage("SUCCESS", _this2.T('success'));
                _this2.setState({ error: null });
                onComplete();
            })['catch'](function (e) {

                _this2.setState({ error: e.message });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props2 = this.props;
            var url = _props2.url;
            var user = _props2.user;
            var pwd = _props2.pwd;
            var skipVerify = _props2.skipVerify;
            var onChange = _props2.onChange;
            var styles = _props2.styles;
            var onBack = _props2.onBack;

            var remainingProps = _objectWithoutProperties(_props2, ['url', 'user', 'pwd', 'skipVerify', 'onChange', 'styles', 'onBack']);

            var error = this.state.error;

            return _react2['default'].createElement(
                _materialUi.Step,
                remainingProps,
                _react2['default'].createElement(
                    _materialUi.StepLabel,
                    null,
                    'Pydio 8 Connection'
                ),
                _react2['default'].createElement(
                    _materialUi.StepContent,
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: styles.stepLegend },
                        'Use the form below connect to the Pydio 8 server with the "import" user you created.'
                    ),
                    _react2['default'].createElement(
                        _materialUi.Paper,
                        { zDepth: 1, style: { padding: 16, paddingTop: 24, margin: 3, width: 480 } },
                        _react2['default'].createElement(ModernTextField, { errorText: error, floatingLabelText: this.T('field.url'), hintText: "https://yourcompany.com/pydio", value: url, onChange: function (e, v) {
                                onChange({ url: v });
                            }, fullWidth: true, style: { marginTop: -10 } }),
                        _react2['default'].createElement(_materialUi.Checkbox, { label: this.T('field.skipssl'), checked: skipVerify, onCheck: function (e, v) {
                                onChange({ skipVerify: v });
                            } }),
                        _react2['default'].createElement(
                            'div',
                            { style: { display: 'flex', width: '100%' } },
                            _react2['default'].createElement(
                                'div',
                                { style: { marginRight: 10, flex: 1 } },
                                _react2['default'].createElement(ModernTextField, { floatingLabelText: this.T('field.login'), value: user, onChange: function (e, v) {
                                        onChange({ user: v });
                                    }, fullWidth: true, inputStyle: { backgroundColor: '#fafafa' } })
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { marginLeft: 10, flex: 1 } },
                                _react2['default'].createElement(ModernTextField, { floatingLabelText: this.T('field.pwd'), value: pwd, onChange: function (e, v) {
                                        onChange({ pwd: v });
                                    }, fullWidth: true, type: "password" })
                            )
                        )
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
                            onClick: function () {
                                return _this3.handleNext();
                            },
                            disabled: !url || !user || !pwd,
                            label: this.T('button.connect')
                        })
                    )
                )
            );
        }
    }]);

    return StepConnection;
})(_react2['default'].Component);

exports['default'] = StepConnection;
module.exports = exports['default'];
