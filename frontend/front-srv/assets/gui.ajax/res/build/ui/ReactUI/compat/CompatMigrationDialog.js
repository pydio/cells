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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _modalActionDialogMixin = require('../modal/ActionDialogMixin');

var _modalActionDialogMixin2 = _interopRequireDefault(_modalActionDialogMixin);

var _Loader = require('../Loader');

var _Loader2 = _interopRequireDefault(_Loader);

var CompatMigrationDialog = _react2['default'].createClass({
    displayName: 'CompatMigrationDialog',

    mixins: [_modalActionDialogMixin2['default']],

    getInitialState: function getInitialState() {
        return { loading: false };
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: 'Migration Required',
            dialogIsModal: true,
            dialogScrollBody: true
        };
    },

    performUpgrade: function performUpgrade() {
        var _this = this;

        this.setState({ loading: true });
        PydioApi.getClient().request({
            get_action: 'packages_upgrade_script'
        }, function (transport) {
            if (transport.responseJSON) {
                _this.setState({ response: transport.responseJSON, loading: false });
                if (transport.responseJSON.success) {
                    _this._buttonUpdater([_react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: 'Reload Page', onTouchTap: function () {
                            document.location.reload();
                        } })]);
                } else {
                    _this._buttonUpdater(null);
                }
            } else {
                _this.setState({ response: { error: 'Empty Response' }, loading: false });
                _this._buttonUpdater(null);
            }
        });
    },

    getButtons: function getButtons() {
        var updater = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        if (updater !== null) {
            this._buttonUpdater = updater;
        }
        return [_react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: 'Upgrade Now', onTouchTap: this.performUpgrade.bind(this) })];
    },

    render: function render() {
        var _state = this.state;
        var response = _state.response;
        var loading = _state.loading;

        return _react2['default'].createElement(
            'div',
            { style: { fontSize: 13, width: '100%' } },
            !loading && !response && _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'p',
                    null,
                    'Oops, it seems that your database version does not fit the current expected version, or that your are using a theme that is now deprecated! Don\'t worry, a couple of additional steps are required to upgrade your installation.'
                ),
                _react2['default'].createElement(
                    'p',
                    null,
                    'Pydio will try to apply all necessary changes to have you up and running quickly.'
                )
            ),
            loading && _react2['default'].createElement(_Loader2['default'], { style: { minHeight: 100 } }),
            response && response.success && _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: { fontSize: 14, fontWeight: 500, padding: '16px 0' } },
                    'Successfully applied upgrade'
                ),
                response.result.map(function (r) {
                    return _react2['default'].createElement(
                        'div',
                        { style: { padding: '4px 0', borderBottom: '1px rgba(0,0,0,0.1) solid', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' } },
                        r
                    );
                }),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '16px 0' } },
                    'You can now reload the page'
                )
            ),
            response && response.error && _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '16px 0' } },
                    response.error,
                    ': ',
                    _react2['default'].createElement('br', null),
                    _react2['default'].createElement(
                        'em',
                        null,
                        response.exception
                    )
                ),
                response.db_mismatch && _react2['default'].createElement(
                    'div',
                    { style: { padding: '16px 0' } },
                    'Expected version of the database is ',
                    response.db_mismatch.target,
                    ', but current is set to ',
                    response.db_mismatch.current,
                    '. If you are confident that your installation is already up-to-date, simply manually upgrade the database version by running the following query:',
                    _react2['default'].createElement('br', null),
                    _react2['default'].createElement(
                        'code',
                        null,
                        'UPDATE version SET db_build=',
                        response.db_mismatch.target,
                        ';'
                    )
                )
            )
        );
    }

});

exports['default'] = CompatMigrationDialog;
module.exports = exports['default'];
