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

var _avatarUserAvatar = require('../avatar/UserAvatar');

var _avatarUserAvatar2 = _interopRequireDefault(_avatarUserAvatar);

var _UserCreationForm = require('../UserCreationForm');

var _UserCreationForm2 = _interopRequireDefault(_UserCreationForm);

/**
 * Card presentation of a user. Relies on the UserAvatar object,
 * plus the PydioForm.UserCreationForm when in edit mode.
 */

var UserCard = (function (_React$Component) {
    _inherits(UserCard, _React$Component);

    function UserCard(props, context) {
        _classCallCheck(this, UserCard);

        _React$Component.call(this, props, context);
        this.state = { editForm: false };
    }

    UserCard.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        if (nextProps.item !== this.props.item) {
            this.setState({ editForm: false });
        }
    };

    UserCard.prototype.render = function render() {
        var _this = this;

        var item = this.props.item;

        var editableProps = {},
            editForm = undefined;
        if (item._parent && item._parent.id === 'ext') {
            editableProps = {
                userEditable: item.IdmUser.PoliciesContextEditable,
                onDeleteAction: function onDeleteAction() {
                    _this.props.onDeleteAction(item._parent, [item]);
                },
                onEditAction: function onEditAction() {
                    _this.setState({ editForm: true });
                },
                reloadAction: function reloadAction() {
                    _this.props.onUpdateAction(item);
                }
            };
        }

        if (this.state.editForm) {
            editForm = _react2['default'].createElement(_UserCreationForm2['default'], {
                pydio: this.props.pydio,
                zDepth: 0,
                style: { flex: 1 },
                newUserName: item.id,
                editMode: true,
                userData: item,
                onUserCreated: function () {
                    _this.props.onUpdateAction(item);_this.setState({ editForm: false });
                },
                onCancel: function () {
                    _this.setState({ editForm: false });
                }
            });
            editableProps = _extends({}, editableProps, {
                displayLabel: true,
                displayAvatar: true,
                useDefaultAvatar: true,
                style: { textAlign: 'center', borderBottom: '1px solid #e0e0e0', padding: 10, backgroundColor: '#fafafa' },
                avatarStyle: { marginBottom: 16 }
            });
        }

        return _react2['default'].createElement(
            'div',
            { style: editForm ? { height: '100%', display: 'flex', flexDirection: 'column' } : {} },
            _react2['default'].createElement(_avatarUserAvatar2['default'], _extends({
                userId: this.props.item.id,
                richCard: !editForm,
                pydio: this.props.pydio,
                cardSize: this.props.style.width
            }, editableProps)),
            editForm
        );
    };

    return UserCard;
})(_react2['default'].Component);

UserCard.propTypes = {
    /**
     * Pydio instance
     */
    pydio: _react2['default'].PropTypes.instanceOf(Pydio),
    /**
     * Team data object
     */
    item: _react2['default'].PropTypes.object,
    /**
     * Applied to root container
     */
    style: _react2['default'].PropTypes.object,
    /**
     * Called to dismiss the popover
     */
    onRequestClose: _react2['default'].PropTypes.func,
    /**
     * Delete current team
     */
    onDeleteAction: _react2['default'].PropTypes.func,
    /**
     * Update current team
     */
    onUpdateAction: _react2['default'].PropTypes.func
};

exports['default'] = UserCard;
module.exports = exports['default'];
