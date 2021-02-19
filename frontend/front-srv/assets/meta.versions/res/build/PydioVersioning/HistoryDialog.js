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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _HistoryApi = require('./HistoryApi');

var _HistoryApi2 = _interopRequireDefault(_HistoryApi);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _reactMarkdown = require('react-markdown');

var _reactMarkdown2 = _interopRequireDefault(_reactMarkdown);

var _materialUi = require('material-ui');

var Node = require('pydio/model/node');
var PydioReactUi = _pydio2['default'].requireLib('boot');

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var UserAvatar = _Pydio$requireLib.UserAvatar;
var NodeListCustomProvider = _Pydio$requireLib.NodeListCustomProvider;
var SimpleList = _Pydio$requireLib.SimpleList;

var UserLinkWrapper = function UserLinkWrapper(_ref) {
    var href = _ref.href;
    var children = _ref.children;

    if (href.startsWith('user://')) {
        var userId = href.replace('user://', '');
        return _react2['default'].createElement(UserAvatar, {
            userId: userId,
            displayAvatar: false,
            richOnClick: false,
            style: { cursor: 'pointer', display: 'inline-block', color: 'rgb(66, 140, 179)' },
            pydio: _pydio2['default'].getInstance()
        });
    }
    return _react2['default'].createElement(
        'span',
        null,
        children
    );
};

var Paragraph = function Paragraph(_ref2) {
    var children = _ref2.children;
    return _react2['default'].createElement(
        'span',
        null,
        children
    );
};

var HistoryBrowser = (0, _createReactClass2['default'])({

    propTypes: {
        node: _react2['default'].PropTypes.instanceOf(Node).isRequired,
        onRequestClose: _react2['default'].PropTypes.func
    },

    propsToState: function propsToState(node) {
        if (this.state && this.state.api) {
            this.state.api.stopObserving('selection_changed');
        }
        var api = new _HistoryApi2['default'](node);
        this._selectionObserver = (function () {
            if (api.getDataModel().isEmpty()) {
                this.setState({ selectedNode: null });
            } else {
                this.setState({ selectedNode: api.getDataModel().getUniqueNode() });
            }
        }).bind(this);
        api.getDataModel().observe('selection_changed', this._selectionObserver);
        return { api: api };
    },

    getInitialState: function getInitialState() {
        return this.propsToState(this.props.node);
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        if (nextProps.node !== this.props.node) {
            this.setState(this.propsToState(nextProps.node));
        }
    },

    nodeClicked: function nodeClicked(node) {
        this.state.api.getDataModel().setSelectedNodes([node]);
    },

    applyAction: function applyAction(action) {
        var _state = this.state;
        var api = _state.api;
        var selectedNode = _state.selectedNode;

        switch (action) {
            case 'dl':
                api.openVersion(selectedNode);
                break;
            case 'revert':
                api.revertToVersion(selectedNode, (function () {
                    if (this.props.onRequestClose) {
                        this.props.onRequestClose();
                    }
                }).bind(this));
                break;
            default:
                break;
        }
    },

    render: function render() {

        var mess = window.pydio.MessageHash;
        var tableKeys = {
            index: { label: mess['meta.versions.9'], sortType: 'string', width: '10%', renderCell: function renderCell(data) {
                    return "#" + data.getMetadata().get('versionId').substr(0, 6);
                } },
            Size: { label: mess['2'], sortType: 'number', width: '10%', renderCell: function renderCell(data) {
                    var s = parseInt(data.getMetadata().get('bytesize'));
                    return _pydioUtilPath2['default'].roundFileSize(s);
                } },
            ajxp_modiftime: { label: mess['meta.versions.10'], sortType: 'string', width: '25%' },
            versionDescription: { label: mess['meta.versions.11'], sortType: 'string', width: '55%', renderCell: function renderCell(data) {
                    return _react2['default'].createElement(
                        'span',
                        { title: mess['meta.versions.11'] },
                        _react2['default'].createElement(_reactMarkdown2['default'], { source: data.getMetadata().get('versionDescription'), renderers: { 'link': UserLinkWrapper, 'paragraph': Paragraph } })
                    );
                } }
        };

        var disabled = !this.state.selectedNode;
        return _react2['default'].createElement(
            'div',
            { style: { display: 'flex', flexDirection: 'column' } },
            _react2['default'].createElement(
                _materialUi.Toolbar,
                null,
                _react2['default'].createElement(
                    _materialUi.ToolbarGroup,
                    { firstChild: true },
                    _react2['default'].createElement(
                        'div',
                        { style: { paddingLeft: 20, color: 'white', fontSize: 18 } },
                        mess['meta.versions.16'].replace('%s', this.props.node.getLabel())
                    )
                ),
                _react2['default'].createElement(
                    _materialUi.ToolbarGroup,
                    { lastChild: true, style: { paddingRight: 7 } },
                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-download", tooltipPosition: "bottom-left", iconStyle: disabled ? {} : { color: 'white' }, disabled: disabled, label: mess['meta.versions.3'], tooltip: mess['meta.versions.4'], onClick: this.applyAction.bind(this, 'dl') }),
                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-backup-restore", tooltipPosition: "bottom-left", iconStyle: disabled ? {} : { color: 'white' }, disabled: disabled, label: mess['meta.versions.7'], tooltip: mess['meta.versions.8'], onClick: this.applyAction.bind(this, 'revert') })
                )
            ),
            _react2['default'].createElement(NodeListCustomProvider, {
                style: { flex: 1 },
                presetDataModel: this.state.api.getDataModel(),
                actionBarGroups: [],
                elementHeight: SimpleList.HEIGHT_ONE_LINE,
                tableKeys: tableKeys,
                entryHandleClicks: this.nodeClicked,
                emptyStateProps: {
                    iconClassName: "mdi mdi-backup-restore",
                    primaryTextId: "meta.versions.14",
                    style: {
                        backgroundColor: 'transparent',
                        padding: 40
                    },
                    secondaryTextId: "meta.versions.15"
                }

            }),
            _react2['default'].createElement(_materialUi.Divider, null)
        );
    }

});

if (window.ReactDND) {
    var FakeDndBackend = function FakeDndBackend() {
        return {
            setup: function setup() {},
            teardown: function teardown() {},
            connectDragSource: function connectDragSource() {},
            connectDragPreview: function connectDragPreview() {},
            connectDropTarget: function connectDropTarget() {}
        };
    };
    HistoryBrowser = window.ReactDND.DragDropContext(FakeDndBackend)(HistoryBrowser);
}

var HistoryDialog = (0, _createReactClass2['default'])({

    mixins: [PydioReactUi.ActionDialogMixin, PydioReactUi.SubmitButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogIsModal: false,
            dialogSize: 'lg',
            dialogPadding: false
        };
    },
    submit: function submit() {
        this.dismiss();
    },
    render: function render() {
        return _react2['default'].createElement(
            'div',
            { style: { width: '100%' }, className: 'layout-fill vertical-layout' },
            _react2['default'].createElement(HistoryBrowser, { node: this.props.node, onRequestClose: this.dismiss })
        );
    }

});

exports['default'] = HistoryDialog;
module.exports = exports['default'];
