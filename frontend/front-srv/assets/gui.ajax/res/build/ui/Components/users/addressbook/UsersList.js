'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _avatarUserAvatar = require('../avatar/UserAvatar');

var _avatarUserAvatar2 = _interopRequireDefault(_avatarUserAvatar);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _viewsEmptyStateView = require('../../views/EmptyStateView');

var _viewsEmptyStateView2 = _interopRequireDefault(_viewsEmptyStateView);

var _AlphaPaginator = require('./AlphaPaginator');

var _AlphaPaginator2 = _interopRequireDefault(_AlphaPaginator);

var _SearchForm = require('./SearchForm');

var _SearchForm2 = _interopRequireDefault(_SearchForm);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var _avatarCellActionsRenderer = require('../avatar/CellActionsRenderer');

var _avatarCellActionsRenderer2 = _interopRequireDefault(_avatarCellActionsRenderer);

var _require$requireLib = require('pydio').requireLib('boot');

var Loader = _require$requireLib.Loader;
var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

var UsersList = (function (_React$Component) {
    _inherits(UsersList, _React$Component);

    function UsersList(props, context) {
        _classCallCheck(this, UsersList);

        _React$Component.call(this, props, context);
        this.state = { select: false, selection: [], editLabel: false };
    }

    UsersList.prototype.onLabelKeyEnter = function onLabelKeyEnter(e) {
        if (e.key === 'Enter') {
            this.updateLabel();
        }
    };

    UsersList.prototype.onLabelChange = function onLabelChange(e, value) {
        this.setState({ label: value });
    };

    UsersList.prototype.updateLabel = function updateLabel() {
        if (this.state.label !== this.props.item.label) {
            this.props.onEditLabel(this.props.item, this.state.label);
        }
        this.setState({ editLabel: false });
    };

    UsersList.prototype.render = function render() {
        var _this = this;

        var _props = this.props;
        var item = _props.item;
        var mode = _props.mode;
        var paginatorType = _props.paginatorType;
        var loading = _props.loading;
        var enableSearch = _props.enableSearch;
        var showSubheaders = _props.showSubheaders;
        var getMessage = _props.getMessage;
        var actionsPanel = _props.actionsPanel;
        var muiTheme = _props.muiTheme;
        var bookColumn = _props.bookColumn;
        var pydio = _props.pydio;
        var reloadAction = _props.reloadAction;

        var folders = item.collections || [];
        var leafs = item.leafs || [];
        var foldersSubHeader = folders.length && (leafs.length || showSubheaders) ? [{ subheader: getMessage('532') }] : [];
        var usersSubHeader = [];
        if (showSubheaders || paginatorType) {
            usersSubHeader = [{ subheader: paginatorType ? _react2['default'].createElement(_AlphaPaginator2['default'], _extends({}, this.props, { style: { lineHeight: '20px', padding: '14px 0' } })) : getMessage('249') }];
        }
        var items = [].concat(foldersSubHeader, folders, usersSubHeader, leafs);
        var total = items.length;
        var elements = [];
        var toggleSelect = function toggleSelect() {
            _this.setState({ select: !_this.state.select, selection: [] });
        };
        var createAction = function createAction() {
            _this.props.onCreateAction(item);
        };
        var deleteAction = function deleteAction() {
            _this.props.onDeleteAction(item, _this.state.selection);_this.setState({ select: false, selection: [] });
        };

        var accentColor = muiTheme.palette.accent2Color;
        var appBar = muiTheme.appBar;
        var stylesProps = {
            toolbarHeight: mode === 'book' ? 56 : 48,
            toolbarBgColor: mode === 'book' ? this.state.select ? accentColor : '#fafafa' : appBar.color,
            titleFontsize: mode === 'book' ? 20 : 16,
            titleFontWeight: 400,
            titleColor: mode === 'book' ? this.state.select ? 'white' : 'rgba(0,0,0,0.87)' : appBar.textColor,
            titlePadding: 10,
            button: {
                border: '1px solid ' + accentColor,
                borderRadius: '50%',
                margin: '0 4px',
                width: 36,
                height: 36,
                padding: 6
            },
            icon: {
                fontSize: 22,
                color: accentColor
            }
        };
        if (bookColumn) {
            stylesProps.toolbarBgColor = 'transparent';
            stylesProps.titleColor = 'rgba(0,0,0,0.54)';
            stylesProps.titleFontsize = 14;
            stylesProps.titleFontWeight = 500;
            stylesProps.titlePadding = '10px 6px 10px 16px';
            stylesProps.button.border = '0';
            stylesProps.icon.color = muiTheme.palette.primary1Color;
            stylesProps.icon.opacity = 0.73;
        }
        var searchProps = {
            style: { flex: 1, minWidth: 110 }
        };
        if (mode === 'selector') {
            searchProps.inputStyle = { color: 'white' };
            searchProps.hintStyle = { color: 'rgba(255,255,255,.5)' };
            searchProps.underlineStyle = { borderColor: 'rgba(255,255,255,.5)' };
            searchProps.underlineFocusStyle = { borderColor: 'white' };
        }

        var label = item.label;
        if (this.props.onEditLabel && !this.state.select) {
            if (this.state.editLabel) {
                label = _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', flex: 1 } },
                    _react2['default'].createElement(_materialUi.TextField, { style: { fontSize: 20 }, value: this.state.label, onChange: this.onLabelChange.bind(this), onKeyDown: this.onLabelKeyEnter.bind(this) }),
                    _react2['default'].createElement(_materialUi.IconButton, { iconStyle: { color: '#e0e0e0' }, secondary: true, iconClassName: "mdi mdi-content-save", tooltip: getMessage(48), onTouchTap: function () {
                            _this.updateLabel();
                        } })
                );
            } else {
                label = _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', flex: 1 } },
                    label,
                    _react2['default'].createElement(_materialUi.IconButton, { iconStyle: { color: '#e0e0e0' }, iconClassName: "mdi mdi-pencil", tooltip: getMessage(48), onTouchTap: function () {
                            _this.setState({ editLabel: true, label: item.label });
                        } })
                );
            }
        }
        var createIcon = 'mdi mdi-account-plus';
        if (item.actions && item.actions.type === 'teams') {
            createIcon = 'mdi mdi-account-multiple-plus';
        }
        var ellipsis = {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
        };
        var toolbar = _react2['default'].createElement(
            'div',
            { style: { padding: stylesProps.titlePadding, height: stylesProps.toolbarHeight, minHeight: stylesProps.toolbarHeight, backgroundColor: stylesProps.toolbarBgColor, borderRadius: '2px 2px 0 0', display: 'flex', alignItems: 'center', transition: _pydioUtilDom2['default'].getBeziersTransition() } },
            mode === "selector" && item._parent && _react2['default'].createElement(_materialUi.IconButton, { style: { marginLeft: -10 }, iconStyle: { color: stylesProps.titleColor }, iconClassName: 'mdi mdi-chevron-left', onTouchTap: function () {
                    _this.props.onFolderClicked(item._parent);
                } }),
            mode === 'book' && total > 0 && item.actions && item.actions.multiple && _react2['default'].createElement(_materialUi.Checkbox, { style: { width: 'initial', marginLeft: this.state.select ? 7 : 14 }, checked: this.state.select, onCheck: toggleSelect }),
            _react2['default'].createElement(
                'div',
                { style: _extends({ flex: 2, fontSize: stylesProps.titleFontsize, color: stylesProps.titleColor, fontWeight: stylesProps.titleFontWeight }, ellipsis) },
                label
            ),
            (mode === 'book' || mode === 'selector' && bookColumn) && item.actions && item.actions.create && !this.state.select && _react2['default'].createElement(_materialUi.IconButton, { style: stylesProps.button, iconStyle: stylesProps.icon, iconClassName: createIcon, tooltipPosition: "bottom-left", tooltip: getMessage(item.actions.create), onTouchTap: createAction }),
            bookColumn && !item._parent && _react2['default'].createElement(_materialUi.IconButton, { style: stylesProps.button, iconStyle: stylesProps.icon, iconClassName: "mdi mdi-window-restore", tooltipPosition: "bottom-left", tooltip: pydio.MessageHash['411'], onTouchTap: function () {
                    pydio.Controller.fireAction('open_address_book');
                } }),
            mode === 'book' && item.actions && item.actions.remove && this.state.select && _react2['default'].createElement(_materialUi.RaisedButton, { secondary: true, label: getMessage(item.actions.remove), disabled: !this.state.selection.length, onTouchTap: deleteAction }),
            !this.state.select && actionsPanel,
            enableSearch && !bookColumn && _react2['default'].createElement(_SearchForm2['default'], _extends({ searchLabel: this.props.searchLabel, onSearch: this.props.onSearch }, searchProps)),
            reloadAction && (mode === 'book' || mode === 'selector' && bookColumn) && _react2['default'].createElement(_materialUi.IconButton, { style: stylesProps.button, iconStyle: stylesProps.icon, iconClassName: "mdi mdi-refresh", tooltipPosition: "bottom-left", tooltip: pydio.MessageHash['149'], onTouchTap: reloadAction, disabled: loading })
        );
        // PARENT NODE
        if (item._parent && mode === 'book' && item._parent._parent && item._parent.id !== 'teams') {
            elements.push(_react2['default'].createElement(_materialUi.ListItem, {
                key: '__parent__',
                primaryText: "..",
                onTouchTap: function (e) {
                    e.stopPropagation();_this.props.onFolderClicked(item._parent);
                },
                leftAvatar: _react2['default'].createElement(_materialUi.Avatar, { icon: _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-arrow-up' }), size: 36 })
            }));
            if (total) {
                elements.push(_react2['default'].createElement(_materialUi.Divider, { inset: true, key: 'parent-divider' }));
            }
        }
        // ITEMS
        items.forEach((function (item, index) {
            var _this2 = this;

            if (item.subheader) {
                elements.push(_react2['default'].createElement(
                    _materialUi.Subheader,
                    { key: item.subheader },
                    item.subheader
                ));
                return;
            }
            var fontIcon = _react2['default'].createElement(_avatarUserAvatar2['default'], { avatarSize: 36, pydio: this.props.pydio || pydio,
                userId: item.id,
                userLabel: item.label,
                avatar: item.avatar,
                icon: item.icon,
                idmUser: item.IdmUser,
                userType: item.type || 'group',
                avatarOnly: true,
                useDefaultAvatar: true
            });
            var rightIconButton = undefined;
            var touchTap = function touchTap(e) {
                e.stopPropagation();_this2.props.onItemClicked(item);
            };
            if (folders.indexOf(item) > -1 && this.props.onFolderClicked) {
                touchTap = function (e) {
                    e.stopPropagation();_this2.props.onFolderClicked(item);
                };
                if (mode === 'selector' && !item._notSelectable && !this.props.usersOnly) {
                    rightIconButton = _react2['default'].createElement(_materialUi.IconButton, {
                        iconClassName: "mdi mdi-account-multiple-plus",
                        tooltip: getMessage('addressbook.pick.group'),
                        tooltipPosition: 'top-left',
                        iconStyle: { color: 'rgba(0,0,0,0.33)' },
                        onTouchTap: function () {
                            _this2.props.onItemClicked(item);
                        }
                    });
                }
            } else if (mode === 'inner' && this.props.onDeleteAction) {
                rightIconButton = _react2['default'].createElement(_materialUi.IconButton, {
                    iconClassName: "mdi mdi-delete",
                    tooltip: getMessage(257),
                    tooltipPosition: 'top-left',
                    iconStyle: { color: 'rgba(0,0,0,0.13)', hoverColor: 'rgba(0,0,0,0.53)' },
                    onTouchTap: function () {
                        _this2.props.onDeleteAction(_this2.props.item, [item]);
                    }
                });
            }
            if (bookColumn && this.props.actionsForCell && item.type) {
                var menuItems = new _avatarCellActionsRenderer2['default'](pydio, this.props.actionsForCell, null, item).renderItems();
                if (menuItems.length) {
                    rightIconButton = _react2['default'].createElement(
                        _materialUi.IconMenu,
                        {
                            iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: 'mdi mdi-dots-vertical', iconStyle: { color: 'rgba(0,0,0,.33)' } }),
                            targetOrigin: { horizontal: 'right', vertical: 'top' },
                            anchorOrigin: { horizontal: 'right', vertical: 'top' }
                        },
                        menuItems
                    );
                } else {
                    rightIconButton = null;
                }
            }
            var select = function select(e, checked) {
                if (checked) {
                    _this2.setState({ selection: [].concat(_this2.state.selection, [item]) });
                } else {
                    var stateSel = _this2.state.selection;
                    var selection = [].concat(stateSel.slice(0, stateSel.indexOf(item)), stateSel.slice(stateSel.indexOf(item) + 1));
                    _this2.setState({ selection: selection });
                }
            };
            elements.push(_react2['default'].createElement(_materialUi.ListItem, {
                key: item.id,
                primaryText: _react2['default'].createElement(
                    'div',
                    { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                    item.label
                ),
                onTouchTap: touchTap,
                disabled: mode === 'inner',
                leftAvatar: !this.state.select && fontIcon,
                rightIconButton: rightIconButton,
                leftCheckbox: this.state.select && _react2['default'].createElement(_materialUi.Checkbox, { checked: this.state.selection.indexOf(item) > -1, onCheck: select })
            }));
            if (mode !== 'inner' && index < total - 1) {
                elements.push(_react2['default'].createElement(_materialUi.Divider, { inset: true, key: item.id + '-divider' }));
            }
        }).bind(this));

        var emptyState = undefined;
        if (!elements.length) {
            var emptyStateProps = {
                style: { backgroundColor: 'transparent', minHeight: 300 },
                iconClassName: 'mdi mdi-account-off',
                primaryTextId: this.props.emptyStatePrimaryText || getMessage(629),
                secondaryTextId: mode === 'book' ? this.props.emptyStateSecondaryText || null : null
            };
            if (mode === 'book' && item.actions && item.actions.create) {
                emptyStateProps = _extends({}, emptyStateProps, {
                    actionLabelId: getMessage(item.actions.create),
                    actionCallback: createAction
                });
            }
            emptyState = _react2['default'].createElement(_viewsEmptyStateView2['default'], emptyStateProps);
        }

        return _react2['default'].createElement(
            'div',
            { style: { flex: 1, flexDirection: 'column', display: 'flex', width: '100%', overflowX: 'hidden' }, onTouchTap: this.props.onTouchTap },
            mode !== 'inner' && !this.props.noToolbar && toolbar,
            !emptyState && !loading && _react2['default'].createElement(
                _materialUi.List,
                { style: { flex: 1, overflowY: mode !== 'inner' ? 'auto' : 'initial' } },
                this.props.subHeader && _react2['default'].createElement(
                    _materialUi.Subheader,
                    null,
                    this.props.subHeader
                ),
                elements
            ),
            loading && _react2['default'].createElement(Loader, { style: { flex: 1 } }),
            !loading && emptyState,
            mode === 'selector' && enableSearch && bookColumn && _react2['default'].createElement(_SearchForm2['default'], {
                searchLabel: this.props.searchLabel,
                onSearch: this.props.onSearch,
                style: { padding: '0 20px', minWidth: null, borderTop: '1px solid #e0e0e0', backgroundColor: 'white' },
                underlineShow: false
            })
        );
    };

    return UsersList;
})(_react2['default'].Component);

UsersList.propTypes = {
    item: _propTypes2['default'].object,
    onCreateAction: _propTypes2['default'].func,
    onDeleteAction: _propTypes2['default'].func,
    onItemClicked: _propTypes2['default'].func,
    onFolderClicked: _propTypes2['default'].func,
    onEditLabel: _propTypes2['default'].func,
    mode: _propTypes2['default'].oneOf(['book', 'selector', 'inner']),
    bookColumn: _propTypes2['default'].bool
};

exports['default'] = UsersList = PydioContextConsumer(UsersList);
exports['default'] = UsersList = _materialUiStyles.muiThemeable()(UsersList);

exports['default'] = UsersList;
module.exports = exports['default'];
