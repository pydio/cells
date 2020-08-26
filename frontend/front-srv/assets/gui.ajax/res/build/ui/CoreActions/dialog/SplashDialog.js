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

"use strict";

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require("pydio");

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _reactMarkdown = require("react-markdown");

var _reactMarkdown2 = _interopRequireDefault(_reactMarkdown);

var _Pydio$requireLib = _pydio2["default"].requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var SubmitButtonProviderMixin = _Pydio$requireLib.SubmitButtonProviderMixin;
var Loader = _Pydio$requireLib.Loader;

var mdStyle = "\n.credits-md h4 {\n    padding-top: 0;\n}\n\n.credits-md h5 {\n    font-weight: 500;\n}\n\n.credits-md ul {\n    padding-left: 20px;\n    padding-bottom: 20px;\n}\n\n.credits-md li {\n    list-style-type: square;\n    line-height: 1.6em;\n}\n\n.credits-md a {\n    color: #607D8B;\n    font-weight: 500;\n}\n";

var SplashDialog = _react2["default"].createClass({
    displayName: "SplashDialog",

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
        var _this = this;

        var url = pydio.Parameters.get('FRONTEND_URL') + '/plug/gui.ajax/credits.md';
        window.fetch(url, {
            method: 'GET',
            credentials: 'same-origin'
        }).then(function (response) {
            response.text().then(function (data) {
                _this.setState({ aboutContent: data });
            });
        });
    },

    render: function render() {
        var credit = undefined;
        if (this.state.aboutContent) {
            credit = _react2["default"].createElement(_reactMarkdown2["default"], { source: this.state.aboutContent });
        } else {
            credit = _react2["default"].createElement(Loader, { style: { minHeight: 200 } });
        }
        credit = _react2["default"].createElement(
            _materialUi.Card,
            null,
            _react2["default"].createElement(_materialUi.CardTitle, {
                title: pydio.Parameters.get('backend')['PackageLabel'],
                subtitle: "Details about version, licensing and how to get help"
            }),
            _react2["default"].createElement(_materialUi.Divider, null),
            _react2["default"].createElement(
                _materialUi.CardActions,
                { style: { display: 'flex', alignItems: 'center' } },
                _react2["default"].createElement(_materialUi.FlatButton, { primary: true, icon: _react2["default"].createElement(_materialUi.FontIcon, { className: "mdi mdi-book-variant" }), label: "Docs", onTouchTap: this.openDocs }),
                _react2["default"].createElement(_materialUi.FlatButton, { primary: true, icon: _react2["default"].createElement(_materialUi.FontIcon, { className: "mdi mdi-slack" }), label: "Forums", onTouchTap: this.openForum }),
                _react2["default"].createElement(_materialUi.FlatButton, { primary: true, icon: _react2["default"].createElement(_materialUi.FontIcon, { className: "mdi mdi-github-box" }), label: "Issues", onTouchTap: this.openGithub }),
                _react2["default"].createElement("span", { style: { flex: 1 } }),
                _react2["default"].createElement(_materialUi.IconButton, { style: { width: 40, height: 40, padding: 8 }, iconStyle: { color: '#FF786A' }, iconClassName: "icomoon-cells", onTouchTap: function () {
                        open('https://pydio.com/?from=cells');
                    }, tooltip: "Pydio.com" }),
                _react2["default"].createElement(_materialUi.IconButton, { style: { width: 40, height: 40, padding: 8 }, iconStyle: { color: '#3b5998' }, iconClassName: "mdi mdi-facebook-box", onTouchTap: function () {
                        open('https://facebook.com/Pydio');
                    }, tooltip: "@Pydio" }),
                _react2["default"].createElement(_materialUi.IconButton, { style: { width: 40, height: 40, padding: 8 }, iconStyle: { color: '#00acee' }, iconClassName: "mdi mdi-twitter-box", onTouchTap: function () {
                        open('https://twitter.com/pydio');
                    }, tooltip: "@pydio" })
            ),
            _react2["default"].createElement(_materialUi.Divider, null),
            _react2["default"].createElement(
                _materialUi.CardText,
                { className: "credits-md" },
                credit
            ),
            _react2["default"].createElement("style", { type: "text/css", dangerouslySetInnerHTML: { __html: mdStyle } })
        );
        return _react2["default"].createElement(
            "div",
            { style: { height: '100%', backgroundColor: '#CFD8DC' } },
            credit
        );
    }

});

exports["default"] = SplashDialog;
module.exports = exports["default"];
