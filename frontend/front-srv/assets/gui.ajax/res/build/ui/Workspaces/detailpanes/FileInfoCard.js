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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _InfoPanelCard = require('./InfoPanelCard');

var _InfoPanelCard2 = _interopRequireDefault(_InfoPanelCard);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;

var FileInfoCard = (function (_React$Component) {
    _inherits(FileInfoCard, _React$Component);

    function FileInfoCard(props) {
        var _this = this;

        _classCallCheck(this, FileInfoCard);

        _React$Component.call(this, props);
        this._observer = function () {
            _this.forceUpdate();
        };
        if (props.node) {
            props.node.observe('node_replaced', this._observer);
        }
    }

    FileInfoCard.prototype.componentWillReceiveProps = function componentWillReceiveProps(newProps) {
        if (this.props.node) {
            this.props.node.stopObserving('node_replaced', this._observer);
        }
        if (newProps.node) {
            newProps.node.observe('node_replaced', this._observer);
        }
    };

    FileInfoCard.prototype.componentWillUnmount = function componentWillUnmount() {
        if (this.props.node) {
            this.props.node.stopObserving('node_replaced', this._observer);
        }
    };

    FileInfoCard.prototype.render = function render() {
        var _props = this.props;
        var node = _props.node;
        var getMessage = _props.getMessage;

        var meta = node.getMetadata();

        var size = meta.get('bytesize');
        var hSize = _pydioUtilPath2['default'].roundFileSize(parseInt(size));
        var unit = _pydio2['default'].getMessages()['byte_unit_symbol'] || 'B';
        var date = new Date();
        date.setTime(parseInt(meta.get('ajxp_modiftime')) * 1000);
        var formattedDate = _pydioUtilPath2['default'].formatModifDate(date);

        var data = [{ key: 'size', label: getMessage('2'), value: hSize, hoverValue: size + ' ' + unit }, { key: 'date', label: getMessage('4'), value: formattedDate }];

        var w = meta.get('image_width');
        var h = meta.get('image_height');
        if (w && h) {
            data = [].concat(data, [{ key: 'image', label: getMessage('135'), value: w + 'px X ' + h + 'px' }]);
        }

        return _react2['default'].createElement(_InfoPanelCard2['default'], _extends({}, this.props, {
            identifier: "file-info",
            title: getMessage('341'),
            standardData: data,
            contentStyle: { paddingBottom: 10 },
            icon: 'information-outline',
            iconColor: '#2196f3'
        }));
    };

    return FileInfoCard;
})(_react2['default'].Component);

exports['default'] = FileInfoCard = PydioContextConsumer(FileInfoCard);
exports['default'] = FileInfoCard;
module.exports = exports['default'];
