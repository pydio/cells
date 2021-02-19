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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9jcmVhdGVSZWFjdENsYXNzID0gcmVxdWlyZSgnY3JlYXRlLXJlYWN0LWNsYXNzJyk7XG5cbnZhciBfY3JlYXRlUmVhY3RDbGFzczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jcmVhdGVSZWFjdENsYXNzKTtcblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgX2NlbGxzU2RrID0gcmVxdWlyZSgnY2VsbHMtc2RrJyk7XG5cbnZhciBfcHlkaW9VdGlsUGF0aCA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvcGF0aCcpO1xuXG52YXIgX3B5ZGlvVXRpbFBhdGgyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsUGF0aCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKFwiaG9jXCIpO1xuXG52YXIgTW9kZXJuVGV4dEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuVGV4dEZpZWxkO1xudmFyIE1vZGVyblNlbGVjdEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuU2VsZWN0RmllbGQ7XG5cbnZhciBDb21wcmVzc2lvbkRpYWxvZyA9ICgwLCBfY3JlYXRlUmVhY3RDbGFzczJbJ2RlZmF1bHQnXSkoe1xuXG4gICAgbWl4aW5zOiBbUHlkaW9SZWFjdFVJLkFjdGlvbkRpYWxvZ01peGluLCBQeWRpb1JlYWN0VUkuQ2FuY2VsQnV0dG9uUHJvdmlkZXJNaXhpbiwgUHlkaW9SZWFjdFVJLlN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW5dLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHZhciBmb3JtYXRzID0gWyd6aXAnLCAndGFyJywgJ3Rhci5neiddO1xuICAgICAgICBpZiAoIXB5ZGlvLlBhcmFtZXRlcnMuZ2V0KCdtdWx0aXBsZUZpbGVzRG93bmxvYWRFbmFibGVkJykpIHtcbiAgICAgICAgICAgIGZvcm1hdHMucG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpYWxvZ1RpdGxlSWQ6IDMxMyxcbiAgICAgICAgICAgIGxlZ2VuZElkOiAzMTQsXG4gICAgICAgICAgICBkaWFsb2dJc01vZGFsOiB0cnVlLFxuICAgICAgICAgICAgZm9ybWF0czogZm9ybWF0c1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcblxuICAgICAgICB2YXIgYmFzZU5hbWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciB1c2VyU2VsZWN0aW9uID0gdGhpcy5wcm9wcy51c2VyU2VsZWN0aW9uO1xuXG4gICAgICAgIGlmICh1c2VyU2VsZWN0aW9uLmlzVW5pcXVlKCkpIHtcbiAgICAgICAgICAgIGJhc2VOYW1lID0gX3B5ZGlvVXRpbFBhdGgyWydkZWZhdWx0J10uZ2V0QmFzZW5hbWUodXNlclNlbGVjdGlvbi5nZXRVbmlxdWVGaWxlTmFtZSgpKTtcbiAgICAgICAgICAgIGlmICghdXNlclNlbGVjdGlvbi5oYXNEaXIoKSkgYmFzZU5hbWUgPSBiYXNlTmFtZS5zdWJzdHIoMCwgYmFzZU5hbWUubGFzdEluZGV4T2YoXCJcXC5cIikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmFzZU5hbWUgPSBfcHlkaW9VdGlsUGF0aDJbJ2RlZmF1bHQnXS5nZXRCYXNlbmFtZSh1c2VyU2VsZWN0aW9uLmdldENvbnRleHROb2RlKCkuZ2V0UGF0aCgpKTtcbiAgICAgICAgICAgIGlmIChiYXNlTmFtZSA9PT0gXCJcIikge1xuICAgICAgICAgICAgICAgIGJhc2VOYW1lID0gXCJBcmNoaXZlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRlZmF1bHRDb21wcmVzc2lvbiA9IHRoaXMucHJvcHMuZm9ybWF0c1swXTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYXJjaGl2ZUJhc2U6IGJhc2VOYW1lLFxuICAgICAgICAgICAgY29tcHJlc3Npb246IGRlZmF1bHRDb21wcmVzc2lvbixcbiAgICAgICAgICAgIGZpbGVOYW1lOiB0aGlzLmJ1aWxkVW5pcXVlRmlsZU5hbWUoYmFzZU5hbWUsIGRlZmF1bHRDb21wcmVzc2lvbilcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgYnVpbGRVbmlxdWVGaWxlTmFtZTogZnVuY3Rpb24gYnVpbGRVbmlxdWVGaWxlTmFtZShiYXNlLCBleHRlbnNpb24pIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGJhc2U7XG4gICAgICAgIHZhciBidWZmID0gYmFzZTtcbiAgICAgICAgd2hpbGUgKHRoaXMucHJvcHMudXNlclNlbGVjdGlvbi5maWxlTmFtZUV4aXN0cyhyZXN1bHQgKyAnLicgKyBleHRlbnNpb24sIHRydWUpKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gYnVmZiArIFwiLVwiICsgaW5kZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIHRleHRGaWVsZENoYW5nZTogZnVuY3Rpb24gdGV4dEZpZWxkQ2hhbmdlKGV2ZW50LCBuZXdWYWx1ZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGFyY2hpdmVCYXNlOiBuZXdWYWx1ZSxcbiAgICAgICAgICAgIGZpbGVOYW1lOiB0aGlzLmJ1aWxkVW5pcXVlRmlsZU5hbWUobmV3VmFsdWUsIHRoaXMuc3RhdGUuY29tcHJlc3Npb24pXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzZWxlY3RGaWVsZENoYW5nZTogZnVuY3Rpb24gc2VsZWN0RmllbGRDaGFuZ2UoZXZlbnQsIGluZGV4LCBwYXlsb2FkKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY29tcHJlc3Npb246IHBheWxvYWQsXG4gICAgICAgICAgICBmaWxlTmFtZTogdGhpcy5idWlsZFVuaXF1ZUZpbGVOYW1lKHRoaXMuc3RhdGUuYXJjaGl2ZUJhc2UsIHBheWxvYWQpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgZmlsZXMgPSB0aGlzLnByb3BzLnVzZXJTZWxlY3Rpb24uZ2V0RmlsZU5hbWVzKCk7XG4gICAgICAgIHZhciByZXBvU2x1ZyA9IHRoaXMucHJvcHMucHlkaW8udXNlci5nZXRBY3RpdmVSZXBvc2l0b3J5T2JqZWN0KCkuZ2V0U2x1ZygpO1xuICAgICAgICB2YXIgYXJjaGl2ZVBhdGggPSByZXBvU2x1ZyArIHRoaXMucHJvcHMudXNlclNlbGVjdGlvbi5nZXRDb250ZXh0Tm9kZSgpLmdldFBhdGgoKSArIFwiL1wiICsgdGhpcy5zdGF0ZS5maWxlTmFtZSArIFwiLlwiICsgdGhpcy5zdGF0ZS5jb21wcmVzc2lvbjtcbiAgICAgICAgYXJjaGl2ZVBhdGggPSBhcmNoaXZlUGF0aC5yZXBsYWNlKCcvLycsICcvJyk7XG4gICAgICAgIHZhciBqb2IgPSBfY2VsbHNTZGsuUmVzdFVzZXJKb2JSZXF1ZXN0LmNvbnN0cnVjdEZyb21PYmplY3Qoe1xuICAgICAgICAgICAgSm9iTmFtZTogXCJjb21wcmVzc1wiLFxuICAgICAgICAgICAgSnNvblBhcmFtZXRlcnM6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBhcmNoaXZlTmFtZTogYXJjaGl2ZVBhdGgsXG4gICAgICAgICAgICAgICAgZm9ybWF0OiB0aGlzLnN0YXRlLmNvbXByZXNzaW9uLFxuICAgICAgICAgICAgICAgIG5vZGVzOiBmaWxlcy5tYXAoZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcG9TbHVnICsgZjtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBhcGkgPSBuZXcgX2NlbGxzU2RrLkpvYnNTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1NlbmRpbmcgYmFja2dyb3VuZCBqb2InLCBqb2IpO1xuICAgICAgICBhcGkudXNlckNyZWF0ZUpvYihcImNvbXByZXNzXCIsIGpvYikudGhlbihmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgX3RoaXMuZGlzbWlzcygpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBmb3JtYXRNZW51cyA9IHRoaXMucHJvcHMuZm9ybWF0cy5tYXAoZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHZhbHVlOiBmLCBwcmltYXJ5VGV4dDogJy4nICsgZiB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHZhciBjb21wcmVzc2lvbiA9IF9zdGF0ZS5jb21wcmVzc2lvbjtcbiAgICAgICAgdmFyIGZpbGVOYW1lID0gX3N0YXRlLmZpbGVOYW1lO1xuXG4gICAgICAgIHZhciBmbFN0eWxlID0ge1xuICAgICAgICAgICAgd2hpdGVTcGFjZTogJ25vd3JhcCcsXG4gICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcydcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcgfSB9LFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNb2Rlcm5UZXh0RmllbGQsIHsgc3R5bGU6IHsgd2lkdGg6IDIxMCwgbWFyZ2luUmlnaHQ6IDEwIH0sIG9uQ2hhbmdlOiB0aGlzLnRleHRGaWVsZENoYW5nZSwgdmFsdWU6IGZpbGVOYW1lLCBmbG9hdGluZ0xhYmVsVGV4dDogbWVzc2FnZXNbJ2NvbXByZXNzaW9uLjQnXSwgZmxvYXRpbmdMYWJlbFN0eWxlOiBmbFN0eWxlIH0pLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBNb2Rlcm5TZWxlY3RGaWVsZCxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAxNjAgfSwgb25DaGFuZ2U6IHRoaXMuc2VsZWN0RmllbGRDaGFuZ2UsIHZhbHVlOiBjb21wcmVzc2lvbiwgZmxvYXRpbmdMYWJlbFRleHQ6IG1lc3NhZ2VzWydjb21wcmVzc2lvbi4zJ10sIGZsb2F0aW5nTGFiZWxTdHlsZTogZmxTdHlsZSB9LFxuICAgICAgICAgICAgICAgIGZvcm1hdE1lbnVzXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxudmFyIENhbGxiYWNrcyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2FsbGJhY2tzKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2FsbGJhY2tzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQ2FsbGJhY2tzLCBudWxsLCBbe1xuICAgICAgICBrZXk6ICdjb21wcmVzc1VJJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXByZXNzVUkoY29udHJvbGxlcikge1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gY29udHJvbGxlci5nZXRQeWRpbygpO1xuICAgICAgICAgICAgdmFyIHVzZXJTZWxlY3Rpb24gPSBweWRpby5nZXRVc2VyU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICBpZiAoIXB5ZGlvLlBhcmFtZXRlcnMuZ2V0KCdtdWx0aXBsZUZpbGVzRG93bmxvYWRFbmFibGVkJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBweWRpby5VSS5vcGVuQ29tcG9uZW50SW5Nb2RhbCgnQ29tcHJlc3Npb25BY3Rpb25zJywgJ0NvbXByZXNzaW9uRGlhbG9nJywgeyB1c2VyU2VsZWN0aW9uOiB1c2VyU2VsZWN0aW9uIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdleHRyYWN0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGV4dHJhY3QoY29udHJvbGxlcikge1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gY29udHJvbGxlci5nZXRQeWRpbygpO1xuICAgICAgICAgICAgdmFyIHVzZXJTZWxlY3Rpb24gPSBweWRpby5nZXRVc2VyU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICBpZiAoIXVzZXJTZWxlY3Rpb24uaXNFbXB0eSgpKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZmlsZSA9IHVzZXJTZWxlY3Rpb24uZ2V0VW5pcXVlRmlsZU5hbWUoKTtcbiAgICAgICAgICAgICAgICB2YXIgZXh0ID0gX3B5ZGlvVXRpbFBhdGgyWydkZWZhdWx0J10uZ2V0RmlsZUV4dGVuc2lvbihmaWxlKTtcbiAgICAgICAgICAgICAgICBpZiAoZXh0ID09PSAnZ3onKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dCA9ICd0YXIuZ3onO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgcmVwb1NsdWcgPSBweWRpby51c2VyLmdldEFjdGl2ZVJlcG9zaXRvcnlPYmplY3QoKS5nZXRTbHVnKCk7XG4gICAgICAgICAgICAgICAgdmFyIGpvYiA9IF9jZWxsc1Nkay5SZXN0VXNlckpvYlJlcXVlc3QuY29uc3RydWN0RnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIEpvYk5hbWU6IFwiZXh0cmFjdFwiLFxuICAgICAgICAgICAgICAgICAgICBKc29uUGFyYW1ldGVyczogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogcmVwb1NsdWcgKyBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiBleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IFwiXCIgfSlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyB3aWxsIGJlIGNvbXB1dGVkIGF1dG9tYXRpY2FsbHlcbiAgICAgICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9jZWxsc1Nkay5Kb2JzU2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICAgICAgYXBpLnVzZXJDcmVhdGVKb2IoXCJleHRyYWN0XCIsIGpvYik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ2FsbGJhY2tzO1xufSkoKTtcblxuZXhwb3J0cy5Db21wcmVzc2lvbkRpYWxvZyA9IENvbXByZXNzaW9uRGlhbG9nO1xuZXhwb3J0cy5DYWxsYmFja3MgPSBDYWxsYmFja3M7XG4iXX0=
