(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CompressionActions = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _cellsSdk = require('cells-sdk');

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib("hoc");

var ModernTextField = _Pydio$requireLib.ModernTextField;
var ModernSelectField = _Pydio$requireLib.ModernSelectField;

var CompressionDialog = (0, _createReactClass2['default'])({

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
        var job = _cellsSdk.RestUserJobRequest.constructFromObject({
            JobName: "compress",
            JsonParameters: JSON.stringify({
                archiveName: archivePath,
                format: this.state.compression,
                nodes: files.map(function (f) {
                    return repoSlug + f;
                })
            })
        });
        var api = new _cellsSdk.JobsServiceApi(_pydioHttpApi2['default'].getRestClient());
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
            React.createElement(ModernTextField, { style: { width: 210, marginRight: 10 }, onChange: this.textFieldChange, value: fileName, floatingLabelText: messages['compression.4'], floatingLabelStyle: flStyle }),
            React.createElement(
                ModernSelectField,
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
                var job = _cellsSdk.RestUserJobRequest.constructFromObject({
                    JobName: "extract",
                    JsonParameters: JSON.stringify({
                        node: repoSlug + file,
                        format: ext,
                        target: "" })
                });
                // will be computed automatically
                var api = new _cellsSdk.JobsServiceApi(_pydioHttpApi2['default'].getRestClient());
                api.userCreateJob("extract", job);
            }
        }
    }]);

    return Callbacks;
})();

exports.CompressionDialog = CompressionDialog;
exports.Callbacks = Callbacks;

},{"cells-sdk":"cells-sdk","create-react-class":"create-react-class","material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/util/path":"pydio/util/path"}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy8ucG5wbS9icm93c2VyLXBhY2tANi4xLjAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInJlcy9idWlsZC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX2NyZWF0ZVJlYWN0Q2xhc3MgPSByZXF1aXJlKCdjcmVhdGUtcmVhY3QtY2xhc3MnKTtcblxudmFyIF9jcmVhdGVSZWFjdENsYXNzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NyZWF0ZVJlYWN0Q2xhc3MpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfY2VsbHNTZGsgPSByZXF1aXJlKCdjZWxscy1zZGsnKTtcblxudmFyIF9weWRpb1V0aWxQYXRoID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXRoJyk7XG5cbnZhciBfcHlkaW9VdGlsUGF0aDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxQYXRoKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoXCJob2NcIik7XG5cbnZhciBNb2Rlcm5UZXh0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5UZXh0RmllbGQ7XG52YXIgTW9kZXJuU2VsZWN0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5TZWxlY3RGaWVsZDtcblxudmFyIENvbXByZXNzaW9uRGlhbG9nID0gKDAsIF9jcmVhdGVSZWFjdENsYXNzMlsnZGVmYXVsdCddKSh7XG5cbiAgICBtaXhpbnM6IFtQeWRpb1JlYWN0VUkuQWN0aW9uRGlhbG9nTWl4aW4sIFB5ZGlvUmVhY3RVSS5DYW5jZWxCdXR0b25Qcm92aWRlck1peGluLCBQeWRpb1JlYWN0VUkuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbl0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgdmFyIGZvcm1hdHMgPSBbJ3ppcCcsICd0YXInLCAndGFyLmd6J107XG4gICAgICAgIGlmICghcHlkaW8uUGFyYW1ldGVycy5nZXQoJ211bHRpcGxlRmlsZXNEb3dubG9hZEVuYWJsZWQnKSkge1xuICAgICAgICAgICAgZm9ybWF0cy5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGVJZDogMzEzLFxuICAgICAgICAgICAgbGVnZW5kSWQ6IDMxNCxcbiAgICAgICAgICAgIGRpYWxvZ0lzTW9kYWw6IHRydWUsXG4gICAgICAgICAgICBmb3JtYXRzOiBmb3JtYXRzXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuXG4gICAgICAgIHZhciBiYXNlTmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIHVzZXJTZWxlY3Rpb24gPSB0aGlzLnByb3BzLnVzZXJTZWxlY3Rpb247XG5cbiAgICAgICAgaWYgKHVzZXJTZWxlY3Rpb24uaXNVbmlxdWUoKSkge1xuICAgICAgICAgICAgYmFzZU5hbWUgPSBfcHlkaW9VdGlsUGF0aDJbJ2RlZmF1bHQnXS5nZXRCYXNlbmFtZSh1c2VyU2VsZWN0aW9uLmdldFVuaXF1ZUZpbGVOYW1lKCkpO1xuICAgICAgICAgICAgaWYgKCF1c2VyU2VsZWN0aW9uLmhhc0RpcigpKSBiYXNlTmFtZSA9IGJhc2VOYW1lLnN1YnN0cigwLCBiYXNlTmFtZS5sYXN0SW5kZXhPZihcIlxcLlwiKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiYXNlTmFtZSA9IF9weWRpb1V0aWxQYXRoMlsnZGVmYXVsdCddLmdldEJhc2VuYW1lKHVzZXJTZWxlY3Rpb24uZ2V0Q29udGV4dE5vZGUoKS5nZXRQYXRoKCkpO1xuICAgICAgICAgICAgaWYgKGJhc2VOYW1lID09PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZU5hbWUgPSBcIkFyY2hpdmVcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZGVmYXVsdENvbXByZXNzaW9uID0gdGhpcy5wcm9wcy5mb3JtYXRzWzBdO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhcmNoaXZlQmFzZTogYmFzZU5hbWUsXG4gICAgICAgICAgICBjb21wcmVzc2lvbjogZGVmYXVsdENvbXByZXNzaW9uLFxuICAgICAgICAgICAgZmlsZU5hbWU6IHRoaXMuYnVpbGRVbmlxdWVGaWxlTmFtZShiYXNlTmFtZSwgZGVmYXVsdENvbXByZXNzaW9uKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBidWlsZFVuaXF1ZUZpbGVOYW1lOiBmdW5jdGlvbiBidWlsZFVuaXF1ZUZpbGVOYW1lKGJhc2UsIGV4dGVuc2lvbikge1xuICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICB2YXIgcmVzdWx0ID0gYmFzZTtcbiAgICAgICAgdmFyIGJ1ZmYgPSBiYXNlO1xuICAgICAgICB3aGlsZSAodGhpcy5wcm9wcy51c2VyU2VsZWN0aW9uLmZpbGVOYW1lRXhpc3RzKHJlc3VsdCArICcuJyArIGV4dGVuc2lvbiwgdHJ1ZSkpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBidWZmICsgXCItXCIgKyBpbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgdGV4dEZpZWxkQ2hhbmdlOiBmdW5jdGlvbiB0ZXh0RmllbGRDaGFuZ2UoZXZlbnQsIG5ld1ZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYXJjaGl2ZUJhc2U6IG5ld1ZhbHVlLFxuICAgICAgICAgICAgZmlsZU5hbWU6IHRoaXMuYnVpbGRVbmlxdWVGaWxlTmFtZShuZXdWYWx1ZSwgdGhpcy5zdGF0ZS5jb21wcmVzc2lvbilcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHNlbGVjdEZpZWxkQ2hhbmdlOiBmdW5jdGlvbiBzZWxlY3RGaWVsZENoYW5nZShldmVudCwgaW5kZXgsIHBheWxvYWQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjb21wcmVzc2lvbjogcGF5bG9hZCxcbiAgICAgICAgICAgIGZpbGVOYW1lOiB0aGlzLmJ1aWxkVW5pcXVlRmlsZU5hbWUodGhpcy5zdGF0ZS5hcmNoaXZlQmFzZSwgcGF5bG9hZClcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBmaWxlcyA9IHRoaXMucHJvcHMudXNlclNlbGVjdGlvbi5nZXRGaWxlTmFtZXMoKTtcbiAgICAgICAgdmFyIHJlcG9TbHVnID0gdGhpcy5wcm9wcy5weWRpby51c2VyLmdldEFjdGl2ZVJlcG9zaXRvcnlPYmplY3QoKS5nZXRTbHVnKCk7XG4gICAgICAgIHZhciBhcmNoaXZlUGF0aCA9IHJlcG9TbHVnICsgdGhpcy5wcm9wcy51c2VyU2VsZWN0aW9uLmdldENvbnRleHROb2RlKCkuZ2V0UGF0aCgpICsgXCIvXCIgKyB0aGlzLnN0YXRlLmZpbGVOYW1lICsgXCIuXCIgKyB0aGlzLnN0YXRlLmNvbXByZXNzaW9uO1xuICAgICAgICBhcmNoaXZlUGF0aCA9IGFyY2hpdmVQYXRoLnJlcGxhY2UoJy8vJywgJy8nKTtcbiAgICAgICAgdmFyIGpvYiA9IF9jZWxsc1Nkay5SZXN0VXNlckpvYlJlcXVlc3QuY29uc3RydWN0RnJvbU9iamVjdCh7XG4gICAgICAgICAgICBKb2JOYW1lOiBcImNvbXByZXNzXCIsXG4gICAgICAgICAgICBKc29uUGFyYW1ldGVyczogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIGFyY2hpdmVOYW1lOiBhcmNoaXZlUGF0aCxcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IHRoaXMuc3RhdGUuY29tcHJlc3Npb24sXG4gICAgICAgICAgICAgICAgbm9kZXM6IGZpbGVzLm1hcChmdW5jdGlvbiAoZikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVwb1NsdWcgKyBmO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGFwaSA9IG5ldyBfY2VsbHNTZGsuSm9ic1NlcnZpY2VBcGkoX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICBjb25zb2xlLmxvZygnU2VuZGluZyBiYWNrZ3JvdW5kIGpvYicsIGpvYik7XG4gICAgICAgIGFwaS51c2VyQ3JlYXRlSm9iKFwiY29tcHJlc3NcIiwgam9iKS50aGVuKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICBfdGhpcy5kaXNtaXNzKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGZvcm1hdE1lbnVzID0gdGhpcy5wcm9wcy5mb3JtYXRzLm1hcChmdW5jdGlvbiAoZikge1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgdmFsdWU6IGYsIHByaW1hcnlUZXh0OiAnLicgKyBmIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgbWVzc2FnZXMgPSB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoO1xuICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgdmFyIGNvbXByZXNzaW9uID0gX3N0YXRlLmNvbXByZXNzaW9uO1xuICAgICAgICB2YXIgZmlsZU5hbWUgPSBfc3RhdGUuZmlsZU5hbWU7XG5cbiAgICAgICAgdmFyIGZsU3R5bGUgPSB7XG4gICAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcbiAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgICAgIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJ1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JyB9IH0sXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KE1vZGVyblRleHRGaWVsZCwgeyBzdHlsZTogeyB3aWR0aDogMjEwLCBtYXJnaW5SaWdodDogMTAgfSwgb25DaGFuZ2U6IHRoaXMudGV4dEZpZWxkQ2hhbmdlLCB2YWx1ZTogZmlsZU5hbWUsIGZsb2F0aW5nTGFiZWxUZXh0OiBtZXNzYWdlc1snY29tcHJlc3Npb24uNCddLCBmbG9hdGluZ0xhYmVsU3R5bGU6IGZsU3R5bGUgfSksXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIE1vZGVyblNlbGVjdEZpZWxkLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDE2MCB9LCBvbkNoYW5nZTogdGhpcy5zZWxlY3RGaWVsZENoYW5nZSwgdmFsdWU6IGNvbXByZXNzaW9uLCBmbG9hdGluZ0xhYmVsVGV4dDogbWVzc2FnZXNbJ2NvbXByZXNzaW9uLjMnXSwgZmxvYXRpbmdMYWJlbFN0eWxlOiBmbFN0eWxlIH0sXG4gICAgICAgICAgICAgICAgZm9ybWF0TWVudXNcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgQ2FsbGJhY2tzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYWxsYmFja3MoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDYWxsYmFja3MpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDYWxsYmFja3MsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ2NvbXByZXNzVUknLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcHJlc3NVSShjb250cm9sbGVyKSB7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBjb250cm9sbGVyLmdldFB5ZGlvKCk7XG4gICAgICAgICAgICB2YXIgdXNlclNlbGVjdGlvbiA9IHB5ZGlvLmdldFVzZXJTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgIGlmICghcHlkaW8uUGFyYW1ldGVycy5nZXQoJ211bHRpcGxlRmlsZXNEb3dubG9hZEVuYWJsZWQnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHB5ZGlvLlVJLm9wZW5Db21wb25lbnRJbk1vZGFsKCdDb21wcmVzc2lvbkFjdGlvbnMnLCAnQ29tcHJlc3Npb25EaWFsb2cnLCB7IHVzZXJTZWxlY3Rpb246IHVzZXJTZWxlY3Rpb24gfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2V4dHJhY3QnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZXh0cmFjdChjb250cm9sbGVyKSB7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBjb250cm9sbGVyLmdldFB5ZGlvKCk7XG4gICAgICAgICAgICB2YXIgdXNlclNlbGVjdGlvbiA9IHB5ZGlvLmdldFVzZXJTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgIGlmICghdXNlclNlbGVjdGlvbi5pc0VtcHR5KCkpIHtcblxuICAgICAgICAgICAgICAgIHZhciBmaWxlID0gdXNlclNlbGVjdGlvbi5nZXRVbmlxdWVGaWxlTmFtZSgpO1xuICAgICAgICAgICAgICAgIHZhciBleHQgPSBfcHlkaW9VdGlsUGF0aDJbJ2RlZmF1bHQnXS5nZXRGaWxlRXh0ZW5zaW9uKGZpbGUpO1xuICAgICAgICAgICAgICAgIGlmIChleHQgPT09ICdneicpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0ID0gJ3Rhci5neic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciByZXBvU2x1ZyA9IHB5ZGlvLnVzZXIuZ2V0QWN0aXZlUmVwb3NpdG9yeU9iamVjdCgpLmdldFNsdWcoKTtcbiAgICAgICAgICAgICAgICB2YXIgam9iID0gX2NlbGxzU2RrLlJlc3RVc2VySm9iUmVxdWVzdC5jb25zdHJ1Y3RGcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgSm9iTmFtZTogXCJleHRyYWN0XCIsXG4gICAgICAgICAgICAgICAgICAgIEpzb25QYXJhbWV0ZXJzOiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlOiByZXBvU2x1ZyArIGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogXCJcIiB9KVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIHdpbGwgYmUgY29tcHV0ZWQgYXV0b21hdGljYWxseVxuICAgICAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX2NlbGxzU2RrLkpvYnNTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgICAgICBhcGkudXNlckNyZWF0ZUpvYihcImV4dHJhY3RcIiwgam9iKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBDYWxsYmFja3M7XG59KSgpO1xuXG5leHBvcnRzLkNvbXByZXNzaW9uRGlhbG9nID0gQ29tcHJlc3Npb25EaWFsb2c7XG5leHBvcnRzLkNhbGxiYWNrcyA9IENhbGxiYWNrcztcbiJdfQ==
