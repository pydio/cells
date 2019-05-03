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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _materialUi = require('material-ui');

var CompressionDialog = React.createClass({
    displayName: 'CompressionDialog',

    mixins: [PydioReactUI.ActionDialogMixin, PydioReactUI.CancelButtonProviderMixin, PydioReactUI.SubmitButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        var formats = ['zip', 'tar', 'tar.gz'];
        if (!pydio.Parameters.get('multipleFilesDownloadEnabled')) {
            formats.pop();
        }
        return {
            dialogTitleId: 313,
            legendId: 314,
            dialogIsModal: true,
            formats: formats
        };
    },

    getInitialState: function getInitialState() {

        var baseName = undefined;
        var userSelection = this.props.userSelection;

        if (userSelection.isUnique()) {
            baseName = _pydioUtilPath2['default'].getBasename(userSelection.getUniqueFileName());
            if (!userSelection.hasDir()) baseName = baseName.substr(0, baseName.lastIndexOf("\."));
        } else {
            baseName = _pydioUtilPath2['default'].getBasename(userSelection.getContextNode().getPath());
            if (baseName === "") {
                baseName = "Archive";
            }
        }
        var defaultCompression = this.props.formats[0];

        return {
            archiveBase: baseName,
            compression: defaultCompression,
            fileName: this.buildUniqueFileName(baseName, defaultCompression)
        };
    },

    buildUniqueFileName: function buildUniqueFileName(base, extension) {
        var index = 0;
        var result = base;
        var buff = base;
        while (this.props.userSelection.fileNameExists(result + '.' + extension, true)) {
            if (index > 0) {
                result = buff + "-" + index;
            }
            index++;
        }
        return result;
    },

    textFieldChange: function textFieldChange(event, newValue) {
        this.setState({
            archiveBase: newValue,
            fileName: this.buildUniqueFileName(newValue, this.state.compression)
        });
    },

    selectFieldChange: function selectFieldChange(event, index, payload) {
        this.setState({
            compression: payload,
            fileName: this.buildUniqueFileName(this.state.archiveBase, payload)
        });
    },

    submit: function submit() {
        var _this = this;

        var files = this.props.userSelection.getFileNames();
        var repoSlug = this.props.pydio.user.getActiveRepositoryObject().getSlug();
        var archivePath = repoSlug + this.props.userSelection.getContextNode().getPath() + "/" + this.state.fileName + "." + this.state.compression;
        archivePath = archivePath.replace('//', '/');
        var job = _pydioHttpRestApi.RestUserJobRequest.constructFromObject({
            JobName: "compress",
            JsonParameters: JSON.stringify({
                archiveName: archivePath,
                format: this.state.compression,
                nodes: files.map(function (f) {
                    return repoSlug + f;
                })
            })
        });
        var api = new _pydioHttpRestApi.JobsServiceApi(_pydioHttpApi2['default'].getRestClient());
        console.log('Sending background job', job);
        api.userCreateJob("compress", job).then(function (r) {
            _this.dismiss();
        });
    },

    render: function render() {
        var formatMenus = this.props.formats.map(function (f) {
            return React.createElement(_materialUi.MenuItem, { value: f, primaryText: '.' + f });
        });

        var messages = this.props.pydio.MessageHash;
        var _state = this.state;
        var compression = _state.compression;
        var fileName = _state.fileName;

        var flStyle = {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        };

        return React.createElement(
            'div',
            { style: { display: 'flex' } },
            React.createElement(_materialUi.TextField, { style: { width: 210, marginRight: 10 }, onChange: this.textFieldChange, value: fileName, floatingLabelText: messages['compression.4'], floatingLabelStyle: flStyle }),
            React.createElement(
                _materialUi.SelectField,
                { style: { width: 160 }, onChange: this.selectFieldChange, value: compression, floatingLabelText: messages['compression.3'], floatingLabelStyle: flStyle },
                formatMenus
            )
        );
    }

});

var Callbacks = (function () {
    function Callbacks() {
        _classCallCheck(this, Callbacks);
    }

    _createClass(Callbacks, null, [{
        key: 'compressUI',
        value: function compressUI(controller) {
            var pydio = controller.getPydio();
            var userSelection = pydio.getUserSelection();
            if (!pydio.Parameters.get('multipleFilesDownloadEnabled')) {
                return;
            }
            pydio.UI.openComponentInModal('CompressionActions', 'CompressionDialog', { userSelection: userSelection });
        }
    }, {
        key: 'extract',
        value: function extract(controller) {
            var pydio = controller.getPydio();
            var userSelection = pydio.getUserSelection();
            if (!userSelection.isEmpty()) {

                var file = userSelection.getUniqueFileName();
                var ext = _pydioUtilPath2['default'].getFileExtension(file);
                if (ext === 'gz') {
                    ext = 'tar.gz';
                }
                var repoSlug = pydio.user.getActiveRepositoryObject().getSlug();
                var job = _pydioHttpRestApi.RestUserJobRequest.constructFromObject({
                    JobName: "extract",
                    JsonParameters: JSON.stringify({
                        node: repoSlug + file,
                        format: ext,
                        target: "" })
                });
                // will be computed automatically
                var api = new _pydioHttpRestApi.JobsServiceApi(_pydioHttpApi2['default'].getRestClient());
                api.userCreateJob("extract", job);
            }
        }
    }]);

    return Callbacks;
})();

exports.CompressionDialog = CompressionDialog;
exports.Callbacks = Callbacks;
