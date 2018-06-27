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

Object.defineProperty(exports, '__esModule', {
    value: true
});
var React = require('react');

var _require$requireLib = require('pydio').requireLib('boot');

var ActionDialogMixin = _require$requireLib.ActionDialogMixin;
var SubmitButtonProviderMixin = _require$requireLib.SubmitButtonProviderMixin;

var UploadDialog = React.createClass({
    displayName: 'UploadDialog',

    mixins: [ActionDialogMixin, SubmitButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        var mobile = pydio.UI.MOBILE_EXTENSIONS;
        return {
            dialogTitle: '',
            dialogSize: mobile ? 'md' : 'lg',
            dialogPadding: false,
            dialogIsModal: true
        };
    },

    submit: function submit() {
        this.dismiss();
    },

    render: function render() {
        var _this = this;

        var tabs = [];
        var uploaders = this.props.pydio.Registry.getActiveExtensionByType("uploader");
        var dismiss = function dismiss() {
            _this.dismiss();
        };

        uploaders.sort(function (objA, objB) {
            return objA.order - objB.order;
        });

        uploaders.map(function (uploader) {
            if (uploader.moduleName) {
                var parts = uploader.moduleName.split('.');
                tabs.push(React.createElement(
                    MaterialUI.Tab,
                    { label: uploader.xmlNode.getAttribute('label'), key: uploader.id },
                    React.createElement(PydioReactUI.AsyncComponent, {
                        pydio: _this.props.pydio,
                        namespace: parts[0],
                        componentName: parts[1],
                        onDismiss: dismiss
                    })
                ));
            }
        });

        return React.createElement(
            MaterialUI.Tabs,
            { style: { width: '100%' } },
            tabs
        );
    }

});

exports['default'] = UploadDialog;
module.exports = exports['default'];
