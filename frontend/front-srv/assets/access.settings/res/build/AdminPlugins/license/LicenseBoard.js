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

var _reactChartjs = require('react-chartjs');

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var moment = _Pydio$requireLib.moment;

var AboutPanel = (function (_React$Component) {
    _inherits(AboutPanel, _React$Component);

    function AboutPanel(props) {
        _classCallCheck(this, AboutPanel);

        _get(Object.getPrototypeOf(AboutPanel.prototype), 'constructor', this).call(this, props);
        this.state = { content: '' };
    }

    _createClass(AboutPanel, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.state.content) return;
            global.PydioApi.getClient().request({
                get_action: 'display_doc',
                doc_file: 'CREDITS-ONLY'
            }, (function (t) {
                this.setState({ content: t.responseText });
            }).bind(this));
        }
    }, {
        key: 'render',
        value: function render() {

            var setContent = (function () {
                var c = 'Loading...';
                if (this.state.content) {
                    c = '<u>Pydio Enterprise Distribution</u> is covered by an <a href="plugins/boot.enterprise/EULA.txt" target="_blank">End-User License Agreement</a> that you have agreed when installing the software.<br/>' + this.state.content;
                }
                return { __html: c };
            }).bind(this);

            return _react2['default'].createElement(
                'div',
                { style: { padding: '0 20px', overflow: 'auto', height: '100%' } },
                _react2['default'].createElement(
                    'h3',
                    null,
                    'Open Source Credits'
                ),
                _react2['default'].createElement('div', { className: 'pydio-oss-credits', dangerouslySetInnerHTML: setContent() })
            );
        }
    }]);

    return AboutPanel;
})(_react2['default'].Component);

var Dashboard = (function (_React$Component2) {
    _inherits(Dashboard, _React$Component2);

    function Dashboard(props) {
        _classCallCheck(this, Dashboard);

        _get(Object.getPrototypeOf(Dashboard.prototype), 'constructor', this).call(this, props);
        this.state = { certLicense: {} };
    }

    _createClass(Dashboard, [{
        key: 'load',
        value: function load() {
            var _this = this;

            // Load and trigger callback
            var api = new _pydioHttpRestApi.LicenseServiceApi(_pydioHttpApi2['default'].getRestClient());
            api.licenseStats(false).then(function (res) {
                _this.setState({ certLicense: res });
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.load();
        }
    }, {
        key: 'getMessage',
        value: function getMessage(id) {
            var pydio = this.props.pydio;

            return pydio.MessageHash['license.' + id] || id;
        }
    }, {
        key: 'render',
        value: function render() {

            var additionalPane = undefined;
            var certLicense = this.state.certLicense;

            if (certLicense.License) {

                var activeUsers = parseInt(certLicense.ActiveUsers);
                var maxUsers = parseInt(certLicense.License.MaxUsers);
                var expireTime = certLicense.License.ExpireTime;
                var nowTime = Math.floor(new Date() / 1000);
                var expireDate = new Date(expireTime * 1000);

                var usersData = [{
                    value: activeUsers,
                    color: "rgba(247, 70, 74, 0.51)",
                    highlight: "#FF5A5E",
                    label: this.getMessage('1')
                }, {
                    value: Math.max(0, maxUsers - activeUsers),
                    color: "rgba(70, 191, 189, 0.59)",
                    highlight: "#5AD3D1",
                    label: this.getMessage('3')
                }];

                var isTrial = false;
                var isInvalid = false;
                var isExpired = expireTime < nowTime;
                var usersReached = activeUsers >= maxUsers;

                var licenseStatus = undefined,
                    licenseStats = undefined;
                var statusMessage = "5",
                    statusIcon = "ok";
                if (isExpired) {
                    statusMessage = "14";
                    statusIcon = "warning";
                } else if (usersReached) {
                    statusMessage = "15";
                    statusIcon = "warning";
                } else if (isInvalid) {
                    statusMessage = "6";
                    statusIcon = "warning";
                } else if (isTrial) {
                    statusMessage = "12";
                    statusIcon = "ok";
                }

                licenseStatus = _react2['default'].createElement(
                    'h3',
                    null,
                    this.getMessage('4'),
                    ': ',
                    _react2['default'].createElement('span', { className: "icon-" + statusIcon + "-sign" }),
                    ' ',
                    this.getMessage(statusMessage)
                );
                if (isInvalid) {
                    licenseStats = _react2['default'].createElement(
                        'div',
                        null,
                        this.getMessage('13')
                    );
                } else {
                    licenseStats = _react2['default'].createElement(
                        'div',
                        null,
                        _react2['default'].createElement(
                            'div',
                            { className: 'doughnut-chart' },
                            _react2['default'].createElement(
                                'h5',
                                null,
                                this.getMessage('7'),
                                ' ',
                                _react2['default'].createElement(
                                    'b',
                                    null,
                                    moment(expireDate).fromNow()
                                ),
                                '.'
                            ),
                            _react2['default'].createElement(_reactChartjs.Doughnut, {
                                data: usersData,
                                options: {},
                                width: 200
                            }),
                            _react2['default'].createElement(
                                'span',
                                { className: 'figure' },
                                Math.round(activeUsers / maxUsers * 100) + '%'
                            )
                        )
                    );
                }

                additionalPane = _react2['default'].createElement(
                    'div',
                    { style: { padding: '0 20px' } },
                    licenseStatus,
                    licenseStats
                );
            } else {
                additionalPane = _react2['default'].createElement(
                    'div',
                    { style: { padding: 20 } },
                    _react2['default'].createElement(
                        'h3',
                        null,
                        this.getMessage('4')
                    ),
                    _react2['default'].createElement(
                        'div',
                        null,
                        ' ... '
                    )
                );
            }

            return _react2['default'].createElement(
                'div',
                { className: "main-layout-nav-to-stack vertical-layout plugin-board", style: this.props.style },
                _react2['default'].createElement(AdminComponents.Header, { title: "Pydio Enterprise License", icon: "mdi mdi-certificate" }),
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex' } },
                    _react2['default'].createElement(
                        _materialUi.Paper,
                        { zDepth: 1, style: { margin: 10, flex: 1 } },
                        additionalPane
                    ),
                    _react2['default'].createElement(
                        _materialUi.Paper,
                        { zDepth: 1, style: { margin: 10, flex: 1 } },
                        _react2['default'].createElement(AboutPanel, null)
                    )
                )
            );
        }
    }]);

    return Dashboard;
})(_react2['default'].Component);

exports['default'] = Dashboard;
module.exports = exports['default'];
