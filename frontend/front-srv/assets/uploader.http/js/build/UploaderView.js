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

(function (global) {

    var Uploader = React.createClass({
        displayName: "Uploader",

        getInitialState: function getInitialState() {
            return {
                dir: pydio.getContextNode().getPath(),
                submitting: false,
                currentURL: "",
                urls: []
            };
        },

        _handleChangeURL: function _handleChangeURL(id) {
            return (function (e, newValue) {

                if (this.state.submitting) {
                    return;
                }

                if (newValue === "") {
                    this._handleDeleteURL(id)();
                    return;
                }

                var urls = this.state.urls;

                urls[id] = newValue;
                this.setState({
                    urls: urls
                });
            }).bind(this);
        },

        _handleDeleteURL: function _handleDeleteURL(id) {
            return (function () {
                if (this.state.submitting) {
                    return;
                }

                var urls = this.state.urls;

                urls.splice(id, 1);

                this.setState({
                    urls: urls
                });
            }).bind(this);
        },

        _handleChangeCurrentURL: function _handleChangeCurrentURL(e, value) {
            this.setState({
                currentURL: value
            });
        },

        _handleAddURL: function _handleAddURL(e) {

            if (this.state.submitting) {
                return;
            }

            if (e.type === "keydown" && e.keyCode !== 13) {
                return;
            }

            var _state = this.state;
            var currentURL = _state.currentURL;
            var urls = _state.urls;

            if (currentURL === "") {
                return;
            }

            urls.push(currentURL);

            this.setState({
                currentURL: "",
                urls: urls
            });
        },

        _handleSubmit: function _handleSubmit(e) {

            e.preventDefault();
            e.stopPropagation();

            var _state2 = this.state;
            var dir = _state2.dir;
            var urls = _state2.urls;

            this.setState({
                urls: urls.filter(function (item, id) {
                    pydio.UI.displayMessage('ERROR', 'This feature is not implemented yet!');
                    return false;
                })
            });
        },

        render: function render() {

            var messages = global.pydio.MessageHash;

            var style = {
                marginLeft: 24
            };

            var urls = this.state.urls;

            var items = urls.map((function (item, id) {
                return React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "div",
                        { style: { display: 'flex', justifyContent: 'space-between', padding: '0px 24px', width: '100%', height: '100%' } },
                        React.createElement(MaterialUI.TextField, { disabled: this.state.submitting, style: { display: 'flex', alignItems: 'center' }, value: item, underlineShow: false, fullWidth: true, onChange: this._handleChangeURL(id) }),
                        React.createElement(MaterialUI.FontIcon, { style: { display: 'flex', alignItems: 'center', fontSize: '1em' }, className: "icon-remove", onClick: this._handleDeleteURL(id) })
                    ),
                    React.createElement(MaterialUI.Divider, null)
                );
            }).bind(this));

            return React.createElement(
                "div",
                { style: { position: 'relative', padding: '10px' } },
                React.createElement(
                    "div",
                    { style: { position: 'relative', margin: '10px' }, className: "dialoglegend" },
                    messages['httpdownloader.4']
                ),
                React.createElement(
                    MaterialUI.Paper,
                    { zDepth: 1 },
                    items,
                    React.createElement(MaterialUI.TextField, { disabled: this.state.submitting, hintText: messages['httpdownloader.5'], style: style, value: this.state.currentURL, underlineShow: false, fullWidth: true, onChange: this._handleChangeCurrentURL, onKeyDown: this._handleAddURL, onBlur: this._handleAddURL }),
                    React.createElement(MaterialUI.Divider, null)
                ),
                urls.length > 0 && React.createElement(
                    MaterialUI.Toolbar,
                    { style: { backgroundColor: '#fff' } },
                    React.createElement(
                        "div",
                        { style: { display: 'flex', justifyContent: 'space-between', padding: '0px 24px', width: '100%', height: '100%' } },
                        React.createElement(
                            "div",
                            { style: { display: 'flex', alignItems: 'center', marginLeft: '-48px' } },
                            React.createElement(MaterialUI.RaisedButton, { primary: true, label: "Start", onClick: this._handleSubmit })
                        )
                    )
                )
            );
        }
    });

    var ns = global.HTTPUploaderView || {};
    ns.Uploader = Uploader;
    global.HTTPUploaderView = ns;
})(window);
