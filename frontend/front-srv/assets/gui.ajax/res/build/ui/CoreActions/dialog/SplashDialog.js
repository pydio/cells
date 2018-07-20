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

var _AboutCellsCard = require('./AboutCellsCard');

var _AboutCellsCard2 = _interopRequireDefault(_AboutCellsCard);

var _materialUi = require('material-ui');

var React = require('react');
var PydioApi = require('pydio/http/api');
var BootUI = require('pydio/http/resources-manager').requireLib('boot');
var ActionDialogMixin = BootUI.ActionDialogMixin;
var SubmitButtonProviderMixin = BootUI.SubmitButtonProviderMixin;
var Loader = BootUI.Loader;

var SplashDialog = React.createClass({
    displayName: 'SplashDialog',

    mixins: [ActionDialogMixin, SubmitButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogSize: 'lg',
            dialogIsModal: false,
            dialogPadding: false,
            dialogScrollBody: true
        };
    },
    submit: function submit() {
        this.dismiss();
    },

    openDocs: function openDocs() {
        open("https://pydio.com/en/docs");
    },

    openForum: function openForum() {
        open("https://forum.pydio.com");
    },

    openGithub: function openGithub() {
        open("https://github.com/pydio/cells/issues");
    },

    getInitialState: function getInitialState() {
        return { aboutContent: null };
    },

    componentDidMount: function componentDidMount() {

        PydioApi.getClient().request({
            get_action: 'display_doc',
            doc_file: 'CREDITS'
        }, (function (transport) {
            this.setState({
                aboutContent: transport.responseText
            });
        }).bind(this));
    },

    render: function render() {
        var _this = this;

        var credit = undefined;
        if (this.state.aboutContent) {
            var ct = function ct() {
                return { __html: _this.state.aboutContent };
            };
            credit = React.createElement('div', { dangerouslySetInnerHTML: ct() });
        } else {
            credit = React.createElement(Loader, { style: { minHeight: 200 } });
        }
        credit = React.createElement(
            _materialUi.Card,
            { style: { margin: 10 } },
            React.createElement(_materialUi.CardTitle, {
                title: pydio.Parameters.get('backend')['PackageLabel'],
                subtitle: 'Details about version, licensing and how to get help'
            }),
            React.createElement(_materialUi.Divider, null),
            React.createElement(
                _materialUi.CardActions,
                null,
                React.createElement(_materialUi.FlatButton, { primary: true, icon: React.createElement(_materialUi.FontIcon, { className: 'mdi mdi-book-variant' }), label: 'Docs', onTouchTap: this.openDocs }),
                React.createElement(_materialUi.FlatButton, { primary: true, icon: React.createElement(_materialUi.FontIcon, { className: 'mdi mdi-slack' }), label: 'Forums', onTouchTap: this.openForum }),
                React.createElement(_materialUi.FlatButton, { primary: true, icon: React.createElement(_materialUi.FontIcon, { className: 'mdi mdi-github-box' }), label: 'Issues', onTouchTap: this.openGithub })
            ),
            React.createElement(_materialUi.Divider, null),
            React.createElement(
                _materialUi.CardText,
                null,
                credit
            )
        );
        return React.createElement(
            'div',
            { style: { height: '100%', backgroundColor: '#CFD8DC' } },
            credit
        );
    }

});

exports['default'] = SplashDialog;
module.exports = exports['default'];
