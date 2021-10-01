'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _reduxForm = require('redux-form');

var _styles = require('material-ui/styles');

var _MuiThemeProvider = require('material-ui/styles/MuiThemeProvider');

var _MuiThemeProvider2 = _interopRequireDefault(_MuiThemeProvider);

var _install = require('./install');

var _install2 = _interopRequireDefault(_install);

var _client = require('./client');

var _client2 = _interopRequireDefault(_client);

var _InstallServiceApi = require('./gen/api/InstallServiceApi');

var _InstallServiceApi2 = _interopRequireDefault(_InstallServiceApi);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var api = new _InstallServiceApi2.default(new _client2.default());

var reducer = (0, _redux.combineReducers)({
    config: _config2.default,
    form: _reduxForm.reducer // mounted under "form"
});

var store = (window.devToolsExtension ? window.devToolsExtension()(_redux.createStore) : _redux.createStore)(reducer);

var PydioInstaller = function (_React$Component) {
    _inherits(PydioInstaller, _React$Component);

    function PydioInstaller() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, PydioInstaller);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = PydioInstaller.__proto__ || Object.getPrototypeOf(PydioInstaller)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            installPerformed: false,
            installError: null
        }, _this.handleSubmit = function (values) {
            return api.postInstall({
                config: values
            }).then(function (res) {
                _this.setState({ installPerformed: true });
            }).catch(function (reason) {
                _this.setState({ installError: reason.message });
            });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(PydioInstaller, [{
        key: 'render',
        value: function render() {

            var bgBlue = 'rgb(38, 64, 95)';
            var bgRed = 'rgb(219, 25, 24)';

            var originalTheme = (0, _styles.getMuiTheme)();
            var newPalette = _extends({}, originalTheme.palette, { primary1Color: bgBlue, accent1Color: bgRed });
            var muiTheme = (0, _styles.getMuiTheme)({ palette: newPalette });
            console.log(originalTheme, muiTheme);

            return _react2.default.createElement(
                _reactRedux.Provider,
                { store: store },
                _react2.default.createElement(
                    _MuiThemeProvider2.default,
                    { muiTheme: muiTheme },
                    _react2.default.createElement(_install2.default, _extends({ onSubmit: this.handleSubmit }, this.state))
                )
            );
        }
    }]);

    return PydioInstaller;
}(_react2.default.Component);

_reactDom2.default.render(_react2.default.createElement(PydioInstaller, null), document.getElementById('install'));
