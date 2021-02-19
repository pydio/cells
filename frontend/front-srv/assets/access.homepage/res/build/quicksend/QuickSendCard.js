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

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _boardColorPaper = require('../board/ColorPaper');

var _boardColorPaper2 = _interopRequireDefault(_boardColorPaper);

var React = require('react');

var _require = require('material-ui');

var CardTitle = _require.CardTitle;
var CircularProgress = _require.CircularProgress;

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var _require$requireLib2 = require('pydio').requireLib('form');

var FileDropZone = _require$requireLib2.FileDropZone;

var _require$requireLib3 = require('pydio').requireLib('hoc');

var NativeFileDropProvider = _require$requireLib3.NativeFileDropProvider;

var BinaryDropZone = NativeFileDropProvider(FileDropZone, function (items, files, props) {});

var QuickSendCard = (function (_React$Component) {
    _inherits(QuickSendCard, _React$Component);

    function QuickSendCard() {
        var _this = this;

        _classCallCheck(this, QuickSendCard);

        _get(Object.getPrototypeOf(QuickSendCard.prototype), 'constructor', this).apply(this, arguments);

        this.fileDroppedOrPicked = function (event) {
            var monitor = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            var items = undefined,
                files = undefined;
            if (monitor) {
                var dataTransfer = monitor.getItem().dataTransfer;
                if (dataTransfer.items.length && dataTransfer.items[0] && (dataTransfer.items[0].getAsEntry || dataTransfer.items[0].webkitGetAsEntry)) {
                    items = dataTransfer.items;
                }
            } else if (event.dataTransfer) {
                items = event.dataTransfer.items || [];
                files = event.dataTransfer.files;
            } else if (event.target) {
                files = event.target.files;
            }

            var uploadItems = [];
            if (window['UploaderModel'] && global.pydio.getController().getActionByName('upload')) {
                UploaderModel.Store.getInstance().handleDropEventResults(items, files, new AjxpNode('/'), uploadItems);
            }
            return uploadItems;
        };

        this.onDrop = function (files, event, source) {
            var items = _this.fileDroppedOrPicked(event);
            _this.setState({ uploadItems: items });
            _this.props.pydio.UI.openComponentInModal('WelcomeComponents', 'WorkspacePickerDialog', {
                onWorkspaceTouchTap: _this.targetWorkspaceSelected.bind(_this),
                legend: files && files[0] ? React.createElement(
                    'div',
                    { style: { fontSize: 13, padding: 16, backgroundColor: '#FFEBEE' } },
                    _this.props.pydio.MessageHash['user_home.89'],
                    ': ',
                    files[0].name
                ) : undefined
            });
        };

        this.targetWorkspaceSelected = function (wsId) {
            var contextNode = new AjxpNode('/');
            contextNode.getMetadata().set('repository_id', wsId);
            var uploadItems = _this.state.uploadItems;

            if (window['UploaderModel'] && global.pydio.getController().getActionByName('upload')) {
                (function () {
                    var instance = UploaderModel.Store.getInstance();
                    uploadItems.forEach(function (item) {
                        item.updateRepositoryId(wsId);
                        item.observe('status', function () {
                            _this.setState({ working: item.getStatus() === 'loading' });
                        });
                        instance.pushFile(item);
                    });
                    instance.processNext();
                })();
            }
        };
    }

    _createClass(QuickSendCard, [{
        key: 'render',
        value: function render() {
            var title = React.createElement(CardTitle, { title: 'Quick Upload' });
            var working = this.state && this.state.working;

            return React.createElement(
                _boardColorPaper2['default'],
                _extends({ zDepth: 1 }, this.props, { paletteIndex: 0, closeButton: this.props.closeButton }),
                React.createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', height: '100%' } },
                    React.createElement(
                        'div',
                        { style: { padding: 16, fontSize: 16, width: 100 } },
                        this.props.pydio.MessageHash['user_home.88']
                    ),
                    React.createElement(
                        'div',
                        { style: { textAlign: 'center', padding: 18, flex: 1 } },
                        working && React.createElement(CircularProgress, { size: 80, thickness: 4, color: 'white' }),
                        !working && React.createElement(
                            BinaryDropZone,
                            {
                                ref: 'dropzone',
                                multiple: true,
                                enableFolders: false,
                                supportClick: true,
                                onDrop: this.onDrop,
                                style: { width: '100%', borderWidth: 0, height: 'auto', borderRadius: '50%', border: '4px solid white', fontSize: 56, padding: 20 },
                                dragActiveStyle: { border: '4px dashed white' }
                            },
                            React.createElement('span', { className: 'mdi mdi-cloud-upload' })
                        )
                    )
                )
            );
        }
    }]);

    return QuickSendCard;
})(React.Component);

exports['default'] = QuickSendCard = asGridItem(QuickSendCard, global.pydio.MessageHash['user_home.93'], { gridWidth: 2, gridHeight: 10 }, []);
exports['default'] = QuickSendCard;
module.exports = exports['default'];
