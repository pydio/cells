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

var _materialUi = require('material-ui');

var _pydioModelIdmObjectHelper = require('pydio/model/idm-object-helper');

var _pydioModelIdmObjectHelper2 = _interopRequireDefault(_pydioModelIdmObjectHelper);

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var AddressBook = _Pydio$requireLib.AddressBook;
var UserAvatar = _Pydio$requireLib.UserAvatar;
var CellActionsRenderer = _Pydio$requireLib.CellActionsRenderer;

var AddressBookPanel = (function (_React$Component) {
    _inherits(AddressBookPanel, _React$Component);

    function AddressBookPanel(props) {
        var _this = this;

        _classCallCheck(this, AddressBookPanel);

        _React$Component.call(this, props);
        this.state = { noCell: false, cellModel: null };
        this._observer = function () {
            _this.forceUpdate();
        };
    }

    AddressBookPanel.prototype.componentDidMount = function componentDidMount() {
        this.loadCell();
    };

    AddressBookPanel.prototype.componentWillUnmount = function componentWillUnmount() {
        if (this.state.cellModel) {
            this.state.cellModel.stopObserving('update', this._observer);
        }
    };

    AddressBookPanel.prototype.loadCell = function loadCell() {
        var _this2 = this;

        var pydio = this.props.pydio;

        pydio.user.getActiveRepositoryAsCell().then(function (cell) {
            if (cell) {
                cell.observe('update', _this2._observer);
                _this2.setState({ cellModel: cell, noCell: false, cellId: pydio.user.activeRepository });
            } else {
                _this2.setState({ noCell: true, cellId: pydio.user.activeRepository });
            }
        });
    };

    AddressBookPanel.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        if (nextProps.pydio.user.activeRepository !== this.state.cellId) {
            if (this.state.cellModel) {
                this.state.cellModel.stopObserving('update', this._observer);
            }
            this.loadCell();
        }
    };

    AddressBookPanel.prototype.renderListItem = function renderListItem(acl) {
        var pydio = this.props.pydio;
        var cellModel = this.state.cellModel;

        var label = _pydioModelIdmObjectHelper2['default'].extractLabel(pydio, acl);
        var userAvatar = undefined,
            avatarIcon = undefined,
            userType = undefined,
            userId = undefined;
        if (acl.User && acl.User.Attributes && acl.User.Attributes['avatar']) {
            userAvatar = acl.User.Attributes['avatar'];
        }
        if (acl.User) {
            userType = 'user';
            userId = acl.User.Login;
        } else if (acl.Group) {
            userType = 'group';
            userId = acl.Group.Uuid;
        } else {
            userId = acl.Role.Uuid;
            userType = 'team';
        }

        var avatar = _react2['default'].createElement(UserAvatar, {
            avatarSize: 36,
            pydio: pydio,
            userType: userType,
            userId: userId,
            userLabel: label,
            avatar: userAvatar,
            avatarOnly: true,
            useDefaultAvatar: true
        });

        var rightMenu = undefined;
        var menuItems = new CellActionsRenderer(pydio, cellModel, acl).renderItems();
        if (menuItems.length) {
            rightMenu = _react2['default'].createElement(
                _materialUi.IconMenu,
                {
                    iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: 'mdi mdi-dots-vertical', iconStyle: { color: 'rgba(0,0,0,.33)' } }),
                    targetOrigin: { horizontal: 'right', vertical: 'top' },
                    anchorOrigin: { horizontal: 'right', vertical: 'top' }
                },
                menuItems
            );
        }

        return _react2['default'].createElement(_materialUi.ListItem, { primaryText: label, leftAvatar: avatar, rightIconButton: rightMenu });
    };

    AddressBookPanel.prototype.render = function render() {
        var _this3 = this;

        var pydio = this.props.pydio;
        var _state = this.state;
        var cellModel = _state.cellModel;
        var noCell = _state.noCell;

        var cellInfo = undefined;
        if (!noCell && cellModel) {
            (function () {
                var acls = cellModel.getAcls();
                var items = [];
                Object.keys(acls).map(function (roleId) {
                    items.push(_this3.renderListItem(acls[roleId]));
                    items.push(_react2['default'].createElement(_materialUi.Divider, { inset: true }));
                });
                items.pop();
                cellInfo = _react2['default'].createElement(
                    'div',
                    { style: { borderBottom: '1px solid #e0e0e0' } },
                    _react2['default'].createElement(
                        _materialUi.List,
                        null,
                        _react2['default'].createElement(
                            _materialUi.Subheader,
                            null,
                            pydio.MessageHash['639']
                        ),
                        items
                    )
                );
            })();
        }
        var columnStyle = {
            position: 'absolute',
            width: 270,
            top: 100,
            bottom: 0,
            backgroundColor: '#fafafa',
            borderLeft: '1px solid #e0e0e0',
            transition: _pydioUtilDom2['default'].getBeziersTransition()
        };

        return _react2['default'].createElement(
            'div',
            { id: "info_panel", style: _extends({}, columnStyle, { display: 'flex', flexDirection: 'column' }) },
            cellInfo,
            pydio.Controller.getActionByName("open_address_book") && _react2['default'].createElement(AddressBook, {
                mode: 'selector',
                bookColumn: true,
                pydio: pydio,
                disableSearch: false,
                style: { height: null, flex: 1 },
                actionsForCell: !noCell && cellModel ? cellModel : true
            })
        );
    };

    return AddressBookPanel;
})(_react2['default'].Component);

exports['default'] = AddressBookPanel;
module.exports = exports['default'];
