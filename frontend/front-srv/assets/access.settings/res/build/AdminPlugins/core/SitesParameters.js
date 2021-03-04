/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _Loader = require('./Loader');

var _Loader2 = _interopRequireDefault(_Loader);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernStyles = _Pydio$requireLib.ModernStyles;

var styles = {
    th: {
        padding: 8,
        fontWeight: 500
    },
    td: {
        padding: 8
    }
};

var SitesParameters = (function (_React$Component) {
    _inherits(SitesParameters, _React$Component);

    function SitesParameters() {
        _classCallCheck(this, SitesParameters);

        _get(Object.getPrototypeOf(SitesParameters.prototype), 'constructor', this).call(this);
        this.state = { sites: [], mailerConfig: {}, shareConfig: {} };
    }

    _createClass(SitesParameters, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var type = _props.type;

            var loader = _Loader2['default'].getInstance(pydio);
            // Sites must be loaded for both modes
            loader.loadSites().then(function (data) {
                return data.Sites || [];
            }).then(function (sites) {
                _this.setState({ sites: sites });
            });
            if (type === 'externals') {
                this.loadValues();
            }
        }
    }, {
        key: 'loadValues',
        value: function loadValues() {
            var _this2 = this;

            var pydio = this.props.pydio;

            var loader = _Loader2['default'].getInstance(pydio);
            loader.loadServiceConfigs("pydio.grpc.mailer").then(function (data) {
                _this2.setState({ mailerConfig: data });
            });
            loader.loadServiceConfigs("pydio.rest.share").then(function (data) {
                _this2.setState({ shareConfig: data });
            });
        }
    }, {
        key: 'onNewRequest',
        value: function onNewRequest(type, v, save) {
            var _this3 = this;

            var _state = this.state;
            var mailerConfig = _state.mailerConfig;
            var shareConfig = _state.shareConfig;

            var value = typeof v === 'string' ? v : v.value;
            var cb = undefined;
            if (save) {
                cb = function () {
                    return _this3.save(type);
                };
            }
            if (type === 'share') {
                this.setState({ shareConfig: _extends({}, shareConfig, { url: value }) }, cb);
            } else if (type === 'mailer') {
                this.setState({ mailerConfig: _extends({}, mailerConfig, { url: value }) }, cb);
            }
        }
    }, {
        key: 'save',
        value: function save(type) {
            var _this4 = this;

            var _state2 = this.state;
            var mailerConfig = _state2.mailerConfig;
            var shareConfig = _state2.shareConfig;
            var pydio = this.props.pydio;

            var loader = _Loader2['default'].getInstance(pydio);
            if (type === 'mailer') {
                loader.saveServiceConfigs("pydio.grpc.mailer", mailerConfig).then(function () {
                    _this4.setState({ mailDirty: false });
                });
            } else {
                loader.saveServiceConfigs("pydio.rest.share", shareConfig).then(function () {
                    _this4.setState({ shareDirty: false });
                });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            var _props2 = this.props;
            var muiTheme = _props2.muiTheme;
            var m = _props2.m;
            var type = _props2.type;
            var _state3 = this.state;
            var sites = _state3.sites;
            var shareConfig = _state3.shareConfig;
            var mailerConfig = _state3.mailerConfig;
            var mailDirty = _state3.mailDirty;
            var shareDirty = _state3.shareDirty;

            var adminStyles = AdminComponents.AdminStyles(muiTheme.palette);
            var hStyle = adminStyles.body.block.headerFull;
            var urls = {};
            var defaultSite = undefined;
            sites.forEach(function (s) {
                if (!defaultSite && s.ReverseProxyURL) {
                    defaultSite = s.ReverseProxyURL;
                }
            });
            sites.forEach(function (s) {
                var scheme = s.SelfSigned || s.LetsEncrypt || s.Certificate ? "https://" : "http://";
                var re = new RegExp(':80$|:443$');
                s.Binds.forEach(function (v) {
                    var url = scheme + v;
                    url = url.replace(re, '');
                    urls[url] = url;
                    if (!defaultSite) {
                        defaultSite = url;
                    }
                });
                if (s.ReverseProxyURL) {
                    urls[s.ReverseProxyURL] = s.ReverseProxyURL;
                }
            });
            var completeValues = Object.keys(urls).map(function (k) {
                return { text: k, value: k };
            });

            if (type === 'sites') {
                return _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: hStyle },
                        m('sites.title')
                    ),
                    _react2['default'].createElement('div', { style: { padding: '8px 16px', fontSize: 12, color: 'inherit', fontWeight: 'normal' }, className: "form-legend", dangerouslySetInnerHTML: { __html: m('sites.details') } }),
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: '8px 16px' }, className: "form-legend" },
                        m('sites.detected.sites')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { backgroundColor: 'rgb(245 245 245)', margin: '0 16px 16px', borderRadius: 3 } },
                        _react2['default'].createElement(
                            'table',
                            { style: { width: '100%' } },
                            _react2['default'].createElement(
                                'tr',
                                null,
                                _react2['default'].createElement(
                                    'th',
                                    { style: styles.th },
                                    m('sites.column.bind')
                                ),
                                _react2['default'].createElement(
                                    'th',
                                    { style: styles.th },
                                    m('sites.column.tls')
                                ),
                                _react2['default'].createElement(
                                    'th',
                                    { style: styles.th },
                                    m('sites.column.external')
                                )
                            ),
                            sites.map(function (s) {
                                var tls = undefined;
                                if (s.LetsEncrypt) {
                                    tls = m('sites.configs.tls.letsencrypt');
                                } else if (s.SelfSigned) {
                                    tls = m('sites.configs.tls.self');
                                } else if (s.Certificate) {
                                    tls = m('sites.configs.tls.certificate');
                                } else {
                                    tls = m('sites.configs.tls.notls');
                                    if (s.ReverseProxyURL && s.ReverseProxyURL.indexOf('https://') === 0) {
                                        tls = m('sites.configs.tls.notls-reverse');
                                    }
                                }
                                return _react2['default'].createElement(
                                    'tr',
                                    null,
                                    _react2['default'].createElement(
                                        'td',
                                        { style: styles.td },
                                        s.Binds.join(', ')
                                    ),
                                    _react2['default'].createElement(
                                        'td',
                                        { style: styles.td },
                                        tls
                                    ),
                                    _react2['default'].createElement(
                                        'td',
                                        { style: styles.td },
                                        s.ReverseProxyURL || "-"
                                    )
                                );
                            })
                        )
                    ),
                    _react2['default'].createElement('div', { style: { padding: '8px 16px 16px', fontSize: 12, color: 'inherit', fontWeight: 'normal' }, className: "form-legend", dangerouslySetInnerHTML: { __html: m('sites.details.note') } })
                );
            } else {

                return _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: hStyle },
                        m('sites.externals')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: '8px 16px 2px' } },
                        _react2['default'].createElement('div', { style: { paddingBottom: 8, fontSize: 12, color: 'inherit', fontWeight: 'normal' }, className: "form-legend", dangerouslySetInnerHTML: { __html: m('sites.externals.details') } }),
                        _react2['default'].createElement(
                            'div',
                            { className: "form-legend" },
                            m('sites.mailer.url'),
                            mailDirty && " " + m('sites.enter-to-save')
                        ),
                        _react2['default'].createElement(_materialUi.AutoComplete, _extends({}, ModernStyles.textField, {
                            hintText: defaultSite || m('sites.no-defaults'),
                            dataSource: completeValues,
                            filter: function (searchText, key) {
                                return searchText === '' || key.indexOf(searchText) === 0;
                            },
                            fullWidth: true,
                            openOnFocus: true,
                            onUpdateInput: function (searchText) {
                                _this5.onNewRequest('mailer', searchText, false);_this5.setState({ mailDirty: true });
                            },
                            searchText: mailerConfig.url || '',
                            onNewRequest: function (v) {
                                _this5.onNewRequest('mailer', v, true);
                            }
                        }))
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: '0 16px 16px' } },
                        _react2['default'].createElement(
                            'div',
                            { className: "form-legend" },
                            m('sites.links.url'),
                            shareDirty && " " + m('sites.enter-to-save')
                        ),
                        _react2['default'].createElement(_materialUi.AutoComplete, _extends({}, ModernStyles.textField, {
                            hintText: defaultSite || m('sites.no-defaults'),
                            dataSource: completeValues,
                            filter: function (searchText, key) {
                                return searchText === '' || key.indexOf(searchText) === 0;
                            },
                            fullWidth: true,
                            openOnFocus: true,
                            onUpdateInput: function (searchText) {
                                _this5.onNewRequest('share', searchText, false);_this5.setState({ shareDirty: true });
                            },
                            searchText: shareConfig.url || '',
                            onNewRequest: function (v) {
                                _this5.onNewRequest('share', v, true);
                            }
                        }))
                    )
                );
            }
        }
    }]);

    return SitesParameters;
})(_react2['default'].Component);

SitesParameters = (0, _materialUiStyles.muiThemeable)()(SitesParameters);
exports['default'] = SitesParameters;
module.exports = exports['default'];
