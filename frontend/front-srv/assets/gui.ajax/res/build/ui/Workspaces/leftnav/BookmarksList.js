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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _viewsFilePreview = require('../views/FilePreview');

var _viewsFilePreview2 = _interopRequireDefault(_viewsFilePreview);

var _materialUiStyles = require('material-ui/styles');

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _Pydio$requireLib = _pydio2['default'].requireLib("components");

var EmptyStateView = _Pydio$requireLib.EmptyStateView;

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

    BookmarksList.prototype.renderIcon = function renderIcon(node) {
        return _react2['default'].createElement(_viewsFilePreview2['default'], {
            loadThumbnail: true,
            node: node,
            pydio: this.props.pydio,
            rounded: true
        });
    };

    BookmarksList.prototype.renderSecondLine = function renderSecondLine(node) {
        return node.getPath();
    };

    BookmarksList.prototype.entryClicked = function entryClicked(node) {
        this.handleRequestClose();
        this.props.pydio.goTo(node);
    };

    BookmarksList.prototype.render = function render() {
        var _props = this.props;
        var pydio = _props.pydio;
        var muiTheme = _props.muiTheme;
        var iconStyle = _props.iconStyle;
        var _state = this.state;
        var loading = _state.loading;
        var open = _state.open;
        var anchorEl = _state.anchorEl;
        var bookmarks = _state.bookmarks;

        if (!pydio.user.activeRepository) {
            return null;
        }
        var mainColor = _color2['default'](muiTheme.palette.primary1Color);
        var items = undefined;
        if (bookmarks) {
            items = bookmarks.map(function (n) {
                return _react2['default'].createElement(_materialUi.ListItem, {
                    primaryText: _pydioUtilPath2['default'].getBasename(n.Path),
                    secondaryText: "Appears in:" + n.AppearsIn.map(function (ws) {
                        return ws.WsLabel;
                    }).join(', '),
                    onTouchTap: function () {
                        var path = n.AppearsIn[0].Path;
                        if (!path) {
                            path = '/';
                        }
                        var fakeNode = new _pydioModelNode2['default'](path, n.Type === 'LEAF');
                        fakeNode.getMetadata().set('repository_id', n.AppearsIn[0].WsUuid);
                        pydio.goTo(fakeNode);
                    }
                });
            });
        }

        return _react2['default'].createElement(
            'span',
            null,
            _react2['default'].createElement(_materialUi.IconButton, {
                onTouchTap: this.handleTouchTap.bind(this),
                iconClassName: "userActionIcon mdi mdi-bookmark-check",
                tooltip: pydio.MessageHash['147'],
                className: 'userActionButton',
                iconStyle: iconStyle
            }),
            _react2['default'].createElement(
                _materialUi.Popover,
                {
                    open: open,
                    anchorEl: anchorEl,
                    anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
                    targetOrigin: { horizontal: 'left', vertical: 'top' },
                    onRequestClose: this.handleRequestClose.bind(this),
                    style: { width: 320 },
                    zDepth: 2

                },
                loading && _react2['default'].createElement(
                    'div',
                    { style: { height: 200, backgroundColor: mainColor.lightness(97).rgb().toString() } },
                    _react2['default'].createElement(_materialUi.RefreshIndicator, {
                        size: 40,
                        left: 140,
                        top: 40,
                        status: 'loading',
                        style: {}
                    })
                ),
                !loading && items && items.length && _react2['default'].createElement(
                    _materialUi.List,
                    null,
                    items
                ),
                !loading && (!items || !items.length) && _react2['default'].createElement(EmptyStateView, {
                    pydio: pydio,
                    iconClassName: 'mdi mdi-bookmark-outline',
                    primaryTextId: '145',
                    secondaryTextId: "482",
                    style: { minHeight: 260 }
                })
            )
        );
    };

    return BookmarksList;
})(_react2['default'].Component);

exports['default'] = BookmarksList = _materialUiStyles.muiThemeable()(BookmarksList);
exports['default'] = BookmarksList;
module.exports = exports['default'];
