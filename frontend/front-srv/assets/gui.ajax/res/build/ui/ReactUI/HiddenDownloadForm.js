/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

    function HiddenDownloadForm() {
        _classCallCheck(this, HiddenDownloadForm);

        _React$Component.apply(this, arguments);
    }

    HiddenDownloadForm.prototype.componentDidMount = function componentDidMount() {
        this.props.pydio.UI.registerHiddenDownloadForm(this);
    };

    HiddenDownloadForm.prototype.componentWillUnmount = function componentWillUnmount() {
        this.props.pydio.UI.unRegisterHiddenDownloadForm(this);
    };

    HiddenDownloadForm.prototype.triggerDownload = function triggerDownload(userSelection, parameters) {
        if (parameters['presignedUrl']) {
            this.iframe.src = parameters['presignedUrl'];
            return;
        }
    };

    HiddenDownloadForm.prototype.render = function render() {
        var _this = this;

        return _react2['default'].createElement(
            'div',
            { style: { visibility: 'hidden', position: 'absolute', left: -10000 } },
            _react2['default'].createElement('iframe', { ref: function (iframe) {
                    return _this.iframe = iframe;
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
