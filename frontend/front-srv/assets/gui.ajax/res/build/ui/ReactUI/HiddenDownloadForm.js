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

exports.__esModule = true;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var HiddenDownloadForm = (function (_React$Component) {
    _inherits(HiddenDownloadForm, _React$Component);

    function HiddenDownloadForm(props) {
        var _this = this;

        _classCallCheck(this, HiddenDownloadForm);

        _React$Component.call(this, props);

        this.state = {};

        this.configs = pydio.getPluginConfigs('mq');

        this.validateDownload = function () {
            try {
                var iframe = _this.iframe.contentDocument || _this.iframe.contentWindow.document;
            } catch (e) {
                // Setting the BOOSTER DOWNLOAD to off
                _this.configs.set("DOWNLOAD_ACTIVE", false);
                _this.forceUpdate();
            }
        };
    }

    HiddenDownloadForm.prototype.componentDidMount = function componentDidMount() {
        pydio.UI.registerHiddenDownloadForm(this);

        this.iframe.addEventListener("load", this.validateDownload, true);
    };

    HiddenDownloadForm.prototype.componentWillUnmount = function componentWillUnmount() {
        pydio.UI.unRegisterHiddenDownloadForm(this);

        this.iframe.removeEventListener("load", this.validateDownload);
    };

    HiddenDownloadForm.prototype.triggerDownload = function triggerDownload(userSelection, parameters) {
        var _this2 = this;

        if (parameters['presignedUrl']) {
            this.iframe.src = parameters['presignedUrl'];
            return;
        }
        this.setState({
            nodes: userSelection ? userSelection.getSelectedNodes() : null,
            parameters: parameters
        }, function () {
            _this2.refs.form.submit();
            _this2.timeout = setTimeout(function () {
                return _this2.validateDownload();
            }, 1000);
        });
    };

    HiddenDownloadForm.prototype.render = function render() {
        var _this3 = this;

        var _state = this.state;
        var nodes = _state.nodes;
        var parameters = _state.parameters;

        // Variables to fill
        var url = undefined;

        if (nodes && nodes.length === 1 && nodes[0].isLeaf() && this.configs.get("DOWNLOAD_ACTIVE")) {
            var secure = this.configs.get("BOOSTER_MAIN_SECURE");
            if (this.configs.get("BOOSTER_DOWNLOAD_ADVANCED") && this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['booster_download_advanced'] === 'custom' && this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['DOWNLOAD_SECURE']) {
                secure = this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['DOWNLOAD_SECURE'];
            }
            var host = this.configs.get("BOOSTER_MAIN_HOST");
            if (this.configs.get("BOOSTER_DOWNLOAD_ADVANCED") && this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['booster_download_advanced'] === 'custom' && this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['DOWNLOAD_HOST']) {
                host = this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['DOWNLOAD_HOST'];
            }
            var port = this.configs.get("BOOSTER_MAIN_PORT");
            if (this.configs.get("BOOSTER_DOWNLOAD_ADVANCED") && this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['booster_download_advanced'] === 'custom' && this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['DOWNLOAD_PORT']) {
                port = this.configs.get("BOOSTER_DOWNLOAD_ADVANCED")['DOWNLOAD_PORT'];
            }

            url = 'http' + (secure ? "s" : "") + '://' + host + ':' + port + '/' + this.configs.get("DOWNLOAD_PATH") + '/' + pydio.user.activeRepository + '/';
        } else {
            url = pydio.Parameters.get('ajxpServerAccess');
        }

        return _react2['default'].createElement(
            'div',
            { style: { visibility: 'hidden', position: 'absolute', left: -10000 } },
            _react2['default'].createElement(
                'form',
                { ref: 'form', action: url, target: 'dl_form_iframe' },
                parameters && Object.keys(parameters).map(function (key) {
                    return _react2['default'].createElement('input', { type: 'hidden', name: key, key: key, value: parameters[key] });
                }),
                nodes && nodes.map(function (node) {
                    return _react2['default'].createElement('input', { type: 'hidden', name: 'nodes[]', key: node.getPath(), value: node.getPath() });
                })
            ),
            _react2['default'].createElement('iframe', { ref: function (iframe) {
                    return _this3.iframe = iframe;
                }, name: 'dl_form_iframe' })
        );
    };

    _createClass(HiddenDownloadForm, null, [{
        key: 'propTypes',
        get: function get() {
            return {
                pydio: _react2['default'].PropTypes.instanceOf(Pydio).isRequired
            };
        }
    }]);

    return HiddenDownloadForm;
})(_react2['default'].Component);

exports['default'] = HiddenDownloadForm;
module.exports = exports['default'];
