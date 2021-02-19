'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _UsersList = require('./UsersList');

var _UsersList2 = _interopRequireDefault(_UsersList);

var _Loaders = require('./Loaders');

var _Loaders2 = _interopRequireDefault(_Loaders);

var _avatarActionsPanel = require('../avatar/ActionsPanel');

var _avatarActionsPanel2 = _interopRequireDefault(_avatarActionsPanel);

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

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var React = require('react');

var _require = require('material-ui');

var TextField = _require.TextField;
var FlatButton = _require.FlatButton;
var CardTitle = _require.CardTitle;
var Divider = _require.Divider;

var _require$requireLib = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

/**
 * Display info about a Team inside a popover-able card
 */

var TeamCard = (function (_React$Component) {
    _inherits(TeamCard, _React$Component);

    function TeamCard(props, context) {
        _classCallCheck(this, TeamCard);

        _React$Component.call(this, props, context);
        this.state = { label: this.props.item.label };
    }

    /**
     * Use loader to get team participants
     * @param item
     */

    TeamCard.prototype.loadMembers = function loadMembers(item) {
        var _this = this;

        this.setState({ loading: true });
        _Loaders2['default'].childrenAsPromise(item, false).then(function (children) {
            _Loaders2['default'].childrenAsPromise(item, true).then(function (children) {
                _this.setState({ members: item.leafs, loading: false });
            });
        });
    };

    TeamCard.prototype.componentWillMount = function componentWillMount() {
        this.loadMembers(this.props.item);
    };

    TeamCard.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        this.loadMembers(nextProps.item);
        this.setState({ label: nextProps.item.label });
    };

    TeamCard.prototype.onLabelChange = function onLabelChange(e, value) {
        this.setState({ label: value });
    };

    TeamCard.prototype.updateLabel = function updateLabel() {
        var _this2 = this;

        if (this.state.label !== this.props.item.label) {
            _pydioHttpApi2['default'].getRestClient().getIdmApi().updateTeamLabel(this.props.item.IdmRole.Uuid, this.state.label, function () {
                _this2.props.onUpdateAction(_this2.props.item);
            });
        }
        this.setState({ editMode: false });
    };

    TeamCard.prototype.render = function render() {
        var _this3 = this;

        var _props = this.props;
        var item = _props.item;
        var onDeleteAction = _props.onDeleteAction;
        var onCreateAction = _props.onCreateAction;
        var getMessage = _props.getMessage;

        var editProps = {
            team: item,
            userEditable: this.props.item.IdmRole.PoliciesContextEditable,
            onDeleteAction: function onDeleteAction() {
                _this3.props.onDeleteAction(item._parent, [item]);
            },
            onEditAction: function onEditAction() {
                _this3.setState({ editMode: !_this3.state.editMode });
            },
            reloadAction: function reloadAction() {
                _this3.props.onUpdateAction(item);
            }
        };

        var title = undefined;
        if (this.state.editMode) {
            title = React.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', margin: 16 } },
                React.createElement(TextField, { style: { flex: 1, fontSize: 24 }, fullWidth: true, disabled: false, underlineShow: false, value: this.state.label, onChange: this.onLabelChange.bind(this) }),
                React.createElement(FlatButton, { secondary: true, label: getMessage(48), onClick: function () {
                        _this3.updateLabel();
                    } })
            );
        } else {
            title = React.createElement(CardTitle, { title: this.state.label, subtitle: item.leafs && item.leafs.length ? getMessage(576).replace('%s', item.leafs.length) : getMessage(577) });
        }
        var _props2 = this.props;
        var style = _props2.style;

        var otherProps = _objectWithoutProperties(_props2, ['style']);

        return React.createElement(
            'div',
            null,
            title,
            React.createElement(_avatarActionsPanel2['default'], _extends({}, otherProps, editProps)),
            React.createElement(Divider, null),
            React.createElement(_UsersList2['default'], { subHeader: getMessage(575), onItemClicked: function () {}, item: item, mode: 'inner', onDeleteAction: onDeleteAction })
        );
    };

    return TeamCard;
})(React.Component);

TeamCard.propTypes = {
    /**
     * Pydio instance
     */
    pydio: _propTypes2['default'].instanceOf(Pydio),
    /**
     * Team data object
     */
    item: _propTypes2['default'].object,
    /**
     * Applied to root container
     */
    style: _propTypes2['default'].object,
    /**
     * Called to dismiss the popover
     */
    onRequestClose: _propTypes2['default'].func,
    /**
     * Delete current team
     */
    onDeleteAction: _propTypes2['default'].func,
    /**
     * Update current team
     */
    onUpdateAction: _propTypes2['default'].func
};

exports['default'] = TeamCard = PydioContextConsumer(TeamCard);

exports['default'] = TeamCard;
module.exports = exports['default'];
