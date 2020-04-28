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

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelMetaNodeProvider = require('pydio/model/meta-node-provider');

var _pydioModelMetaNodeProvider2 = _interopRequireDefault(_pydioModelMetaNodeProvider);

var _viewsFilePreview = require('../views/FilePreview');

var _viewsFilePreview2 = _interopRequireDefault(_viewsFilePreview);

var _materialUiStyles = require('material-ui/styles');

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _Pydio$requireLib = _pydio2['default'].requireLib("components");

var EmptyStateView = _Pydio$requireLib.EmptyStateView;

var listCss = '\n.bmListEntry{\n    border-bottom: 1px solid rgba(0,0,0,0.025);\n    padding: 2px 0;\n}\n.bmListEntry:hover{\n    background-color:#FAFAFA;\n    border-bottom-color: #FAFAFA;\n}\n.bmListEntryWs:hover{\n    text-decoration:underline;\n}\n';

var BookmarksList = (function (_React$Component) {
    _inherits(BookmarksList, _React$Component);

    function BookmarksList(props) {
        _classCallCheck(this, BookmarksList);

        _React$Component.call(this, props);
        this.state = {
            open: false,
            loading: false,
            bookmarks: null
        };
    }

    BookmarksList.prototype.load = function load() {
        var _this = this;

        this.setState({ loading: true });
        var api = new _pydioHttpRestApi.UserMetaServiceApi(_pydioHttpApi2['default'].getRestClient());
        return api.userBookmarks(new _pydioHttpRestApi.RestUserBookmarksRequest()).then(function (collection) {
            _this.setState({ bookmarks: collection.Nodes, loading: false });
        })['catch'](function (reason) {
            _this.setState({ loading: false });
        });
    };

    BookmarksList.prototype.handleTouchTap = function handleTouchTap(event) {
        // This prevents ghost click.
        event.preventDefault();
        this.load();
        this.setState({
            open: true,
            anchorEl: event.currentTarget
        });
    };

    BookmarksList.prototype.handleRequestClose = function handleRequestClose() {
        this.setState({
            open: false
        });
    };

    BookmarksList.prototype.entryClicked = function entryClicked(node) {
        this.handleRequestClose();
        this.props.pydio.goTo(node);
    };

    BookmarksList.prototype.removeBookmark = function removeBookmark(node) {
        var _this2 = this;

        var nodeUuid = node.getMetadata().get("uuid");
        var api = new _pydioHttpRestApi.UserMetaServiceApi(_pydioHttpApi2['default'].getRestClient());
        var searchRequest = new _pydioHttpRestApi.IdmSearchUserMetaRequest();
        searchRequest.NodeUuids = [nodeUuid];
        searchRequest.Namespace = "bookmark";
        var request = new _pydioHttpRestApi.IdmUpdateUserMetaRequest();
        return api.searchUserMeta(searchRequest).then(function (res) {
            if (res.Metadatas && res.Metadatas.length) {
                request.Operation = _pydioHttpRestApi.UpdateUserMetaRequestUserMetaOp.constructFromObject('DELETE');
                request.MetaDatas = res.Metadatas;
                api.updateUserMeta(request).then(function () {
                    _this2.load();
                });
            }
        });
    };

    BookmarksList.prototype.bmToNodes = function bmToNodes(bm) {

        return bm.AppearsIn.map(function (ws) {
            var copy = _extends({}, bm);
            copy.Path = ws.WsSlug + '/' + ws.Path;
            var node = _pydioModelMetaNodeProvider2['default'].parseTreeNode(copy, ws.WsSlug);
            node.getMetadata().set('repository_id', ws.WsUuid);
            node.getMetadata().set('WsLabel', ws.WsLabel);
            return node;
        });
    };

    BookmarksList.prototype.render = function render() {
        var _this3 = this;

        var _props = this.props;
        var pydio = _props.pydio;
        var muiTheme = _props.muiTheme;
        var iconStyle = _props.iconStyle;
        var _state = this.state;
        var loading = _state.loading;
        var open = _state.open;
        var anchorEl = _state.anchorEl;
        var bookmarks = _state.bookmarks;

        var previewStyles = {
            style: {
                height: 40,
                width: 40,
                borderRadius: '50%'
            },
            mimeFontStyle: {
                fontSize: 24,
                lineHeight: '40px',
                textAlign: 'center'
            }
        };

        if (!pydio.user.activeRepository) {
            return null;
        }
        var items = undefined;
        if (bookmarks) {
            items = bookmarks.map(function (n) {
                var nodes = _this3.bmToNodes(n);
                return _react2['default'].createElement(
                    'div',
                    { className: "bmListEntry", style: { display: 'flex', alignItems: 'center', width: '100%' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: '12px 16px', cursor: 'pointer' }, onClick: function () {
                                _this3.entryClicked(nodes[0]);
                            } },
                        _react2['default'].createElement(_viewsFilePreview2['default'], _extends({ pydio: pydio, node: nodes[0], loadThumbnail: true }, previewStyles))
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1, overflow: 'hidden', cursor: 'pointer' }, onClick: function () {
                                _this3.entryClicked(nodes[0]);
                            } },
                        _react2['default'].createElement(
                            'div',
                            { style: { fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                            nodes[0].getLabel() || nodes[0].getMetadata().get('WsLabel')
                        ),
                        _react2['default'].createElement(
                            'div',
                            { style: { opacity: .33 } },
                            pydio.MessageHash['bookmark.secondary.inside'],
                            ' ',
                            nodes.map(function (n, i) {
                                var click = function click(e) {
                                    e.stopPropagation();
                                    _this3.entryClicked(n);
                                };
                                var link = _react2['default'].createElement(
                                    'a',
                                    { className: "bmListEntryWs", onClick: click, style: { fontWeight: 500 } },
                                    n.getMetadata().get('WsLabel')
                                );
                                if (i === nodes.length - 1) {
                                    return link;
                                } else {
                                    return _react2['default'].createElement(
                                        'span',
                                        null,
                                        link,
                                        ', '
                                    );
                                }
                            })
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        null,
                        _react2['default'].createElement(_materialUi.IconButton, {
                            iconClassName: "mdi mdi-delete",
                            iconStyle: { opacity: .33, fontSize: 18 },
                            onTouchTap: function () {
                                _this3.removeBookmark(nodes[0]);
                            },
                            tooltip: pydio.MessageHash['bookmark.button.tip.remove'],
                            tooltipPosition: "bottom-left"
                        })
                    )
                );
            });
        }

        var buttonStyle = { borderRadius: '50%' };
        if (open && iconStyle && iconStyle.color) {
            var c = _color2['default'](iconStyle.color);
            buttonStyle = _extends({}, buttonStyle, { backgroundColor: c.fade(0.9).toString() });
        }

        return _react2['default'].createElement(
            'span',
            null,
            _react2['default'].createElement(_materialUi.IconButton, {
                onTouchTap: this.handleTouchTap.bind(this),
                iconClassName: "userActionIcon mdi mdi-star",
                tooltip: pydio.MessageHash['147'],
                tooltipPosition: "bottom-left",
                className: 'userActionButton',
                iconStyle: iconStyle,
                style: buttonStyle
            }),
            _react2['default'].createElement(
                _materialUi.Popover,
                {
                    open: open,
                    anchorEl: anchorEl,
                    anchorOrigin: { horizontal: 'left', vertical: 'top' },
                    targetOrigin: { horizontal: 'left', vertical: 'top' },
                    onRequestClose: this.handleRequestClose.bind(this),
                    style: { width: 320 },
                    zDepth: 3

                },
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', borderRadius: '2px 2px 0 0', width: '100%',
                            backgroundColor: '#f8fafc', borderBottom: '1px solid #ECEFF1', color: muiTheme.palette.primary1Color } },
                    _react2['default'].createElement('span', { className: "mdi mdi-star", style: { fontSize: 18, margin: '12px 8px 14px 16px' } }),
                    _react2['default'].createElement(
                        'span',
                        { style: { fontSize: 15, fontWeight: 500 } },
                        pydio.MessageHash[147]
                    )
                ),
                loading && _react2['default'].createElement(
                    'div',
                    { style: { height: 260, backgroundColor: 'white' } },
                    _react2['default'].createElement(_materialUi.RefreshIndicator, {
                        size: 40,
                        left: 140,
                        top: 120,
                        status: 'loading',
                        style: {}
                    })
                ),
                !loading && items && items.length && _react2['default'].createElement(
                    'div',
                    { style: { maxHeight: 330, overflowY: 'auto', overflowX: 'hidden', padding: 0 } },
                    items
                ),
                !loading && (!items || !items.length) && _react2['default'].createElement(EmptyStateView, {
                    pydio: pydio,
                    iconClassName: 'mdi mdi-star-outline',
                    primaryTextId: '145',
                    secondaryTextId: "482",
                    style: { minHeight: 260, backgroundColor: 'white' }
                }),
                _react2['default'].createElement('style', { type: "text/css", dangerouslySetInnerHTML: { __html: listCss } })
            )
        );
    };

    return BookmarksList;
})(_react2['default'].Component);

exports['default'] = BookmarksList = _materialUiStyles.muiThemeable()(BookmarksList);
exports['default'] = BookmarksList;
module.exports = exports['default'];
