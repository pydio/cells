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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _addressbookAddressBook = require('./addressbook/AddressBook');

var _addressbookAddressBook2 = _interopRequireDefault(_addressbookAddressBook);

var _materialUi = require('material-ui');

var _pydioUtilFunc = require('pydio/util/func');

var _pydioUtilFunc2 = _interopRequireDefault(_pydioUtilFunc);

var _UserCreationForm = require('./UserCreationForm');

var _UserCreationForm2 = _interopRequireDefault(_UserCreationForm);

/**
 * Ready to use autocomplete field that will load users/groups/roles from
 * the server (using user_list_authorized_users API).
 * Used for sharing, addressbooks, send email, etc.
 *
 * Can also open a "selector-style" adress book.
 */

var UsersLoader = (function (_React$Component) {
    _inherits(UsersLoader, _React$Component);

    function UsersLoader() {
        var _this = this;

        _classCallCheck(this, UsersLoader);

        _React$Component.apply(this, arguments);

        this.state = {
            dataSource: [],
            loading: false,
            searchText: '',
            minChars: parseInt(_pydio2['default'].getInstance().getPluginConfigs("core.auth").get("USERS_LIST_COMPLETE_MIN_CHARS")),
            hideGroups: _pydio2['default'].getInstance().getPluginConfigs("action.advanced_settings").get("DISABLE_SHARE_GROUPS") === true
        };

        this.suggestionLoader = function (input, callback) {
            var _props = _this.props;
            var excludes = _props.excludes;
            var usersOnly = _props.usersOnly;
            var hideGroups = _this.state.hideGroups;

            //const disallowTemporary = this.props.existingOnly && !this.props.freeValueAllowed;
            _this.setState({ loading: _this.state.loading + 1 });
            var api = _pydioHttpApi2['default'].getRestClient().getIdmApi();
            var proms = [];
            proms.push(api.listUsers('/', input, true, 0, 20));
            if (hideGroups || usersOnly) {
                proms.push(Promise.resolve({ Groups: [] }));
            } else {
                proms.push(api.listGroups('/', input, true, 0, 20));
            }
            if (usersOnly) {
                proms.push(Promise.resolve({ Teams: [] }));
            } else {
                proms.push(api.listTeams(input, 0, 20));
            }
            Promise.all(proms).then(function (results) {
                _this.setState({ loading: _this.state.loading - 1 });
                var users = results[0];
                var groups = results[1];
                var teams = results[2];

                users = users.Users;
                groups = groups.Groups;
                teams = teams.Teams;
                if (excludes && excludes.length) {
                    users = users.filter(function (user) {
                        return excludes.indexOf(user.Login) === -1;
                    });
                    groups = groups.filter(function (group) {
                        return excludes.indexOf(group.GroupLabel) === -1;
                    });
                    teams = teams.filter(function (team) {
                        return excludes.indexOf(team.Label === -1);
                    });
                }
                callback([].concat(groups.map(function (u) {
                    return { IdmUser: u };
                }), teams.map(function (u) {
                    return { IdmRole: u };
                }), users.map(function (u) {
                    return { IdmUser: u };
                })));
            });
        };

        this.textFieldUpdate = function (value) {

            _this.setState({ searchText: value });
            if (_this.state.minChars && value && value.length < _this.state.minChars) {
                return;
            }
            _this.loadBuffered(value, 350);
        };

        this.getPendingSearchText = function () {
            return _this.state.searchText || false;
        };

        this.loadBuffered = function (value, timeout) {

            if (!value && _this._emptyValueList) {
                _this.setState({ dataSource: _this._emptyValueList });
                return;
            }
            var _props2 = _this.props;
            var existingOnly = _props2.existingOnly;
            var freeValueAllowed = _props2.freeValueAllowed;
            var excludes = _props2.excludes;

            _pydioUtilFunc2['default'].bufferCallback('remote_users_search', timeout, (function () {
                this.setState({ loading: true });
                var excluded = [_pydio2['default'].getInstance().user.id, 'pydio.anon.user'];
                this.suggestionLoader(value, (function (users) {
                    var valueExists = false;
                    var values = users.filter(function (userObject) {
                        return !(userObject.IdmUser && !userObject.IdmUser.IsGroup && excluded.indexOf(userObject.IdmUser.Login) > -1);
                    }).filter(function (userObject) {
                        if (!excludes) {
                            return true;
                        }
                        if (userObject.IdmUser && userObject.IdmUser.IsGroup) {
                            return excludes.filter(function (e) {
                                return e === userObject.IdmUser.Uuid;
                            }).length === 0;
                        } else if (userObject.IdmUser) {
                            return excludes.filter(function (e) {
                                return e === userObject.IdmUser.Login;
                            }).length === 0;
                        } else {
                            return excludes.filter(function (e) {
                                return e === userObject.IdmRole.Uuid;
                            }).length === 0;
                        }
                    }).map(function (userObject) {
                        var identifier = undefined,
                            icon = undefined,
                            label = undefined;
                        if (userObject.IdmUser && userObject.IdmUser.IsGroup) {
                            identifier = userObject.IdmUser.GroupLabel;
                            label = userObject.IdmUser.Attributes && userObject.IdmUser.Attributes["displayName"] ? userObject.IdmUser.Attributes["displayName"] : identifier;
                            icon = "mdi mdi-folder-account";
                        } else if (userObject.IdmUser) {
                            identifier = userObject.IdmUser.Login;
                            label = userObject.IdmUser.Attributes && userObject.IdmUser.Attributes["displayName"] ? userObject.IdmUser.Attributes["displayName"] : identifier;
                            var shared = userObject.IdmUser.Attributes && userObject.IdmUser.Attributes["profile"] === "shared";
                            if (shared) {
                                icon = "mdi mdi-account";
                            } else {
                                icon = "mdi mdi-account-box-outline";
                            }
                        } else {
                            identifier = userObject.IdmRole.Uuid;
                            label = userObject.IdmRole.Label;
                            icon = "mdi mdi-account-multiple-outline";
                        }
                        valueExists |= label === value;
                        var component = _react2['default'].createElement(_materialUi.MenuItem, {
                            primaryText: label,
                            leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: icon, style: { margin: '0 12px' } })
                        });
                        return {
                            userObject: userObject,
                            text: identifier,
                            value: component
                        };
                    });
                    if (!value) {
                        this._emptyValueList = values;
                    }
                    // Append temporary create user
                    if (value && !valueExists && (!existingOnly || freeValueAllowed)) {
                        var m = _pydio2['default'].getMessages()["448"] || "create";
                        var createItem = _react2['default'].createElement(_materialUi.MenuItem, {
                            primaryText: value + (freeValueAllowed ? '' : ' (' + m + ')'),
                            leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-account-plus", style: { margin: '0 12px' } })
                        });
                        values = [{ text: value, value: createItem }].concat(values);
                    }
                    this.setState({ dataSource: values, loading: false });
                }).bind(this));
            }).bind(_this));
        };

        this.onCompleterRequest = function (value, index) {
            var freeValueAllowed = _this.props.freeValueAllowed;

            if (index === -1) {
                _this.state.dataSource.map(function (entry) {
                    if (entry.text === value) {
                        value = entry;
                    }
                });
                if (value && !value.userObject && _this.props.freeValueAllowed) {
                    _this.props.onValueSelected({ FreeValue: value.text });
                    _this.setState({ searchText: '', dataSource: [] });
                    return;
                }
            }
            if (value) {
                if (value.userObject) {
                    _this.props.onValueSelected(value.userObject);
                } else if (freeValueAllowed) {
                    _this.props.onValueSelected({ FreeValue: value.text });
                } else {
                    _this.setState({ createUser: value.text });
                }
                _this.setState({ searchText: '', dataSource: [] });
            }
        };

        this.onUserCreated = function (newUser) {
            _this.props.onValueSelected(newUser);
            _this.setState({ createUser: null });
        };

        this.onCreationCancelled = function () {
            _this.setState({ createUser: null });
        };

        this.openAddressBook = function (event) {
            _this.setState({
                addressBookOpen: true,
                addressBookAnchor: event.currentTarget
            });
        };

        this.closeAddressBook = function () {
            _this.setState({ addressBookOpen: false });
        };

        this.onAddressBookItemSelected = function (item) {
            _this.props.onValueSelected(item);
        };
    }

    UsersLoader.prototype.componentWillReceiveProps = function componentWillReceiveProps() {
        this._emptyValueList = null;
    };

    /**
     * Debounced call for rendering search
     * @param value {string}
     * @param timeout {int}
     */

    UsersLoader.prototype.render = function render() {
        var _this2 = this;

        var _state = this.state;
        var dataSource = _state.dataSource;
        var createUser = _state.createUser;

        var containerStyle = { position: 'relative', overflow: 'visible' };

        return _react2['default'].createElement(
            'div',
            { style: containerStyle, ref: function (el) {
                    _this2._popoverAnchor = el;
                } },
            !createUser && _react2['default'].createElement(_materialUi.AutoComplete, {
                filter: _materialUi.AutoComplete.noFilter,
                dataSource: dataSource,
                searchText: this.state.searchText,
                onUpdateInput: this.textFieldUpdate,
                className: this.props.className,
                openOnFocus: true,
                floatingLabelText: this.props.fieldLabel,
                underlineShow: !this.props.underlineHide,
                fullWidth: true,
                onNewRequest: this.onCompleterRequest,
                listStyle: { maxHeight: 350, overflowY: 'auto' },
                onFocus: function () {
                    _this2.loadBuffered(_this2.state.searchText, 100);
                }
            }),
            createUser && _react2['default'].createElement(_materialUi.TextField, {
                floatingLabelText: this.props.fieldLabel,
                value: global.pydio.MessageHash[485] + ' (' + this.state.createUser + ')',
                disabled: true,
                fullWidth: true,
                underlineShow: !this.props.underlineHide
            }),
            !createUser && _react2['default'].createElement(
                'div',
                { style: { position: 'absolute', right: 4, bottom: 14, height: 20, width: 20 } },
                _react2['default'].createElement(_materialUi.RefreshIndicator, {
                    size: 20,
                    left: 0,
                    top: 0,
                    status: this.state.loading ? 'loading' : 'hide'
                })
            ),
            this.props.showAddressBook && !createUser && _react2['default'].createElement(_addressbookAddressBook2['default'], {
                mode: 'popover',
                pydio: this.props.pydio,
                loaderStyle: { width: 320, height: 420 },
                onItemSelected: this.onAddressBookItemSelected,
                usersFrom: this.props.usersFrom,
                disableSearch: true
            }),
            _react2['default'].createElement(
                _materialUi.Popover,
                {
                    open: createUser,
                    anchorEl: this._popoverAnchor,
                    anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
                    targetOrigin: { horizontal: 'left', vertical: 'top' },
                    onRequestClose: this.onCreationCancelled,
                    canAutoPosition: false
                },
                createUser && _react2['default'].createElement(_UserCreationForm2['default'], {
                    onUserCreated: this.onUserCreated.bind(this),
                    onCancel: this.onCreationCancelled.bind(this),
                    style: { width: 350, height: 320 },
                    newUserName: this.state.createUser,
                    pydio: this.props.pydio
                })
            )
        );
    };

    _createClass(UsersLoader, null, [{
        key: 'propTypes',
        value: {

            /**
             * Method called to render a commponent, taking a UserObject as input
             */
            renderSuggestion: _react2['default'].PropTypes.func.isRequired,
            /**
             * Callback when a value is finally selected
             */
            onValueSelected: _react2['default'].PropTypes.func.isRequired,
            /**
             * Floating Label Text displayed on the field
             */
            fieldLabel: _react2['default'].PropTypes.string.isRequired,
            /**
             * Array of values to ignore
             */
            excludes: _react2['default'].PropTypes.array.isRequired,
            /**
             * Display only users, no groups nor roles
             */
            usersOnly: _react2['default'].PropTypes.bool,
            /**
             * Display users from local directory and/or from remote.
             */
            usersFrom: _react2['default'].PropTypes.oneOf(['local', 'remote', 'any']),
            /**
             * Do not propose a "Create user" option
             */
            existingOnly: _react2['default'].PropTypes.bool,
            /**
             * Allow free typing
             */
            freeValueAllowed: _react2['default'].PropTypes.bool,
            /**
             * Will be passed to the root component
             */
            className: _react2['default'].PropTypes.string
        },
        enumerable: true
    }]);

    return UsersLoader;
})(_react2['default'].Component);

exports['default'] = UsersLoader;
module.exports = exports['default'];

/**
 * Loads values from server
 * @param {string} input Currently searched text
 * @param {Function} callback Called with the values
 */

/**
 * Called when the field is updated
 * @param value
 */

/**
 * Called when user selects a value from the list
 * @param value
 * @param index
 */

/**
 * Triggers onValueSelected props callback
 * @param {Pydio.User} newUser
 */

/**
 * Close user creation form
 */

/**
 * Open address book inside a Popover
 * @param event
 */

/**
 * Close address book popover
 */

/**
 * Triggered when user clicks on an entry from adress book.
 * @param item
 */
