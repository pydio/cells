/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _GenericCard = require('./GenericCard');

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var QuotaUsageLine = (function (_React$Component) {
    _inherits(QuotaUsageLine, _React$Component);

    function QuotaUsageLine() {
        _classCallCheck(this, QuotaUsageLine);

        _React$Component.apply(this, arguments);
    }

    QuotaUsageLine.prototype.render = function render() {
        var node = this.props.node;

        var usage = parseInt(node.getMetadata().get("ws_quota_usage"));
        var quota = parseInt(node.getMetadata().get("ws_quota"));
        usage = Math.min(usage, quota);
        var percent = Math.round(usage / quota * 100);
        var color = '#4caf50';
        if (percent > 90) {
            color = '#e53935';
        } else if (percent > 60) {
            color = '#ff9800';
        }
        var label = _pydio2['default'].getMessages()['workspace.quota-usage'] + " (" + _pydioUtilPath2['default'].roundFileSize(quota) + ")";
        var data = _react2['default'].createElement(
            'div',
            { style: { borderRadius: 4, display: 'flex', marginRight: 25, alignItems: 'center', marginTop: 5, backgroundColor: '#f5f5f5', padding: '7px 8px' } },
            _react2['default'].createElement(
                'div',
                { style: { flex: 1, paddingRight: 12 } },
                _react2['default'].createElement(_materialUi.LinearProgress, { mode: "determinate", min: 0, max: quota, value: usage, color: color })
            ),
            _react2['default'].createElement(
                'div',
                { style: { color: '#bdbdbd', fontWeight: 500, fontSize: 18 } },
                percent,
                '%'
            )
        );
        return _react2['default'].createElement(_GenericCard.GenericLine, { iconClassName: "mdi mdi-gauge", legend: label, data: data, iconStyle: { marginTop: 30 } });
    };

    return QuotaUsageLine;
})(_react2['default'].Component);

exports['default'] = QuotaUsageLine;
module.exports = exports['default'];
