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
                result = buff + "-" + index;index++;
            }
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
                console.log('Sending background job', job);
                api.userCreateJob("compress", job);
            }
        }
    }]);

    return Callbacks;
})();

exports.CompressionDialog = CompressionDialog;
exports.Callbacks = Callbacks;

},{"material-ui":"material-ui","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/path":"pydio/util/path"}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG52YXIgX3B5ZGlvVXRpbFBhdGggPSByZXF1aXJlKCdweWRpby91dGlsL3BhdGgnKTtcblxudmFyIF9weWRpb1V0aWxQYXRoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvVXRpbFBhdGgpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgQ29tcHJlc3Npb25EaWFsb2cgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdDb21wcmVzc2lvbkRpYWxvZycsXG5cbiAgICBtaXhpbnM6IFtQeWRpb1JlYWN0VUkuQWN0aW9uRGlhbG9nTWl4aW4sIFB5ZGlvUmVhY3RVSS5DYW5jZWxCdXR0b25Qcm92aWRlck1peGluLCBQeWRpb1JlYWN0VUkuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbl0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgdmFyIGZvcm1hdHMgPSBbJ3ppcCcsICd0YXInLCAndGFyLmd6J107XG4gICAgICAgIGlmICghcHlkaW8uUGFyYW1ldGVycy5nZXQoJ211bHRpcGxlRmlsZXNEb3dubG9hZEVuYWJsZWQnKSkge1xuICAgICAgICAgICAgZm9ybWF0cy5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGVJZDogMzEzLFxuICAgICAgICAgICAgbGVnZW5kSWQ6IDMxNCxcbiAgICAgICAgICAgIGRpYWxvZ0lzTW9kYWw6IHRydWUsXG4gICAgICAgICAgICBmb3JtYXRzOiBmb3JtYXRzXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuXG4gICAgICAgIHZhciBiYXNlTmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIHVzZXJTZWxlY3Rpb24gPSB0aGlzLnByb3BzLnVzZXJTZWxlY3Rpb247XG5cbiAgICAgICAgaWYgKHVzZXJTZWxlY3Rpb24uaXNVbmlxdWUoKSkge1xuICAgICAgICAgICAgYmFzZU5hbWUgPSBfcHlkaW9VdGlsUGF0aDJbJ2RlZmF1bHQnXS5nZXRCYXNlbmFtZSh1c2VyU2VsZWN0aW9uLmdldFVuaXF1ZUZpbGVOYW1lKCkpO1xuICAgICAgICAgICAgaWYgKCF1c2VyU2VsZWN0aW9uLmhhc0RpcigpKSBiYXNlTmFtZSA9IGJhc2VOYW1lLnN1YnN0cigwLCBiYXNlTmFtZS5sYXN0SW5kZXhPZihcIlxcLlwiKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiYXNlTmFtZSA9IF9weWRpb1V0aWxQYXRoMlsnZGVmYXVsdCddLmdldEJhc2VuYW1lKHVzZXJTZWxlY3Rpb24uZ2V0Q29udGV4dE5vZGUoKS5nZXRQYXRoKCkpO1xuICAgICAgICAgICAgaWYgKGJhc2VOYW1lID09PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZU5hbWUgPSBcIkFyY2hpdmVcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZGVmYXVsdENvbXByZXNzaW9uID0gdGhpcy5wcm9wcy5mb3JtYXRzWzBdO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhcmNoaXZlQmFzZTogYmFzZU5hbWUsXG4gICAgICAgICAgICBjb21wcmVzc2lvbjogZGVmYXVsdENvbXByZXNzaW9uLFxuICAgICAgICAgICAgZmlsZU5hbWU6IHRoaXMuYnVpbGRVbmlxdWVGaWxlTmFtZShiYXNlTmFtZSwgZGVmYXVsdENvbXByZXNzaW9uKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBidWlsZFVuaXF1ZUZpbGVOYW1lOiBmdW5jdGlvbiBidWlsZFVuaXF1ZUZpbGVOYW1lKGJhc2UsIGV4dGVuc2lvbikge1xuICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICB2YXIgcmVzdWx0ID0gYmFzZTtcbiAgICAgICAgdmFyIGJ1ZmYgPSBiYXNlO1xuICAgICAgICB3aGlsZSAodGhpcy5wcm9wcy51c2VyU2VsZWN0aW9uLmZpbGVOYW1lRXhpc3RzKHJlc3VsdCArICcuJyArIGV4dGVuc2lvbiwgdHJ1ZSkpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBidWZmICsgXCItXCIgKyBpbmRleDtpbmRleCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIHRleHRGaWVsZENoYW5nZTogZnVuY3Rpb24gdGV4dEZpZWxkQ2hhbmdlKGV2ZW50LCBuZXdWYWx1ZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGFyY2hpdmVCYXNlOiBuZXdWYWx1ZSxcbiAgICAgICAgICAgIGZpbGVOYW1lOiB0aGlzLmJ1aWxkVW5pcXVlRmlsZU5hbWUobmV3VmFsdWUsIHRoaXMuc3RhdGUuY29tcHJlc3Npb24pXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzZWxlY3RGaWVsZENoYW5nZTogZnVuY3Rpb24gc2VsZWN0RmllbGRDaGFuZ2UoZXZlbnQsIGluZGV4LCBwYXlsb2FkKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY29tcHJlc3Npb246IHBheWxvYWQsXG4gICAgICAgICAgICBmaWxlTmFtZTogdGhpcy5idWlsZFVuaXF1ZUZpbGVOYW1lKHRoaXMuc3RhdGUuYXJjaGl2ZUJhc2UsIHBheWxvYWQpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgZmlsZXMgPSB0aGlzLnByb3BzLnVzZXJTZWxlY3Rpb24uZ2V0RmlsZU5hbWVzKCk7XG4gICAgICAgIHZhciByZXBvU2x1ZyA9IHRoaXMucHJvcHMucHlkaW8udXNlci5nZXRBY3RpdmVSZXBvc2l0b3J5T2JqZWN0KCkuZ2V0U2x1ZygpO1xuICAgICAgICB2YXIgYXJjaGl2ZVBhdGggPSByZXBvU2x1ZyArIHRoaXMucHJvcHMudXNlclNlbGVjdGlvbi5nZXRDb250ZXh0Tm9kZSgpLmdldFBhdGgoKSArIFwiL1wiICsgdGhpcy5zdGF0ZS5maWxlTmFtZSArIFwiLlwiICsgdGhpcy5zdGF0ZS5jb21wcmVzc2lvbjtcbiAgICAgICAgYXJjaGl2ZVBhdGggPSBhcmNoaXZlUGF0aC5yZXBsYWNlKCcvLycsICcvJyk7XG4gICAgICAgIHZhciBqb2IgPSBfcHlkaW9IdHRwUmVzdEFwaS5SZXN0VXNlckpvYlJlcXVlc3QuY29uc3RydWN0RnJvbU9iamVjdCh7XG4gICAgICAgICAgICBKb2JOYW1lOiBcImNvbXByZXNzXCIsXG4gICAgICAgICAgICBKc29uUGFyYW1ldGVyczogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIGFyY2hpdmVOYW1lOiBhcmNoaXZlUGF0aCxcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IHRoaXMuc3RhdGUuY29tcHJlc3Npb24sXG4gICAgICAgICAgICAgICAgbm9kZXM6IGZpbGVzLm1hcChmdW5jdGlvbiAoZikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVwb1NsdWcgKyBmO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5Kb2JzU2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTZW5kaW5nIGJhY2tncm91bmQgam9iJywgam9iKTtcbiAgICAgICAgYXBpLnVzZXJDcmVhdGVKb2IoXCJjb21wcmVzc1wiLCBqb2IpLnRoZW4oZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgIF90aGlzLmRpc21pc3MoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgZm9ybWF0TWVudXMgPSB0aGlzLnByb3BzLmZvcm1hdHMubWFwKGZ1bmN0aW9uIChmKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZTogZiwgcHJpbWFyeVRleHQ6ICcuJyArIGYgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBtZXNzYWdlcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgY29tcHJlc3Npb24gPSBfc3RhdGUuY29tcHJlc3Npb247XG4gICAgICAgIHZhciBmaWxlTmFtZSA9IF9zdGF0ZS5maWxlTmFtZTtcblxuICAgICAgICB2YXIgZmxTdHlsZSA9IHtcbiAgICAgICAgICAgIHdoaXRlU3BhY2U6ICdub3dyYXAnLFxuICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgICAgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnIH0gfSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7IHN0eWxlOiB7IHdpZHRoOiAyMTAsIG1hcmdpblJpZ2h0OiAxMCB9LCBvbkNoYW5nZTogdGhpcy50ZXh0RmllbGRDaGFuZ2UsIHZhbHVlOiBmaWxlTmFtZSwgZmxvYXRpbmdMYWJlbFRleHQ6IG1lc3NhZ2VzWydjb21wcmVzc2lvbi40J10sIGZsb2F0aW5nTGFiZWxTdHlsZTogZmxTdHlsZSB9KSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuU2VsZWN0RmllbGQsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogMTYwIH0sIG9uQ2hhbmdlOiB0aGlzLnNlbGVjdEZpZWxkQ2hhbmdlLCB2YWx1ZTogY29tcHJlc3Npb24sIGZsb2F0aW5nTGFiZWxUZXh0OiBtZXNzYWdlc1snY29tcHJlc3Npb24uMyddLCBmbG9hdGluZ0xhYmVsU3R5bGU6IGZsU3R5bGUgfSxcbiAgICAgICAgICAgICAgICBmb3JtYXRNZW51c1xuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbnZhciBDYWxsYmFja3MgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhbGxiYWNrcygpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENhbGxiYWNrcyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKENhbGxiYWNrcywgbnVsbCwgW3tcbiAgICAgICAga2V5OiAnY29tcHJlc3NVSScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wcmVzc1VJKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IGNvbnRyb2xsZXIuZ2V0UHlkaW8oKTtcbiAgICAgICAgICAgIHZhciB1c2VyU2VsZWN0aW9uID0gcHlkaW8uZ2V0VXNlclNlbGVjdGlvbigpO1xuICAgICAgICAgICAgaWYgKCFweWRpby5QYXJhbWV0ZXJzLmdldCgnbXVsdGlwbGVGaWxlc0Rvd25sb2FkRW5hYmxlZCcpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHlkaW8uVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ0NvbXByZXNzaW9uQWN0aW9ucycsICdDb21wcmVzc2lvbkRpYWxvZycsIHsgdXNlclNlbGVjdGlvbjogdXNlclNlbGVjdGlvbiB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZXh0cmFjdCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBleHRyYWN0KGNvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IGNvbnRyb2xsZXIuZ2V0UHlkaW8oKTtcbiAgICAgICAgICAgIHZhciB1c2VyU2VsZWN0aW9uID0gcHlkaW8uZ2V0VXNlclNlbGVjdGlvbigpO1xuICAgICAgICAgICAgaWYgKCF1c2VyU2VsZWN0aW9uLmlzRW1wdHkoKSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGZpbGUgPSB1c2VyU2VsZWN0aW9uLmdldFVuaXF1ZUZpbGVOYW1lKCk7XG4gICAgICAgICAgICAgICAgdmFyIGV4dCA9IF9weWRpb1V0aWxQYXRoMlsnZGVmYXVsdCddLmdldEZpbGVFeHRlbnNpb24oZmlsZSk7XG4gICAgICAgICAgICAgICAgaWYgKGV4dCA9PT0gJ2d6Jykge1xuICAgICAgICAgICAgICAgICAgICBleHQgPSAndGFyLmd6JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHJlcG9TbHVnID0gcHlkaW8udXNlci5nZXRBY3RpdmVSZXBvc2l0b3J5T2JqZWN0KCkuZ2V0U2x1ZygpO1xuICAgICAgICAgICAgICAgIHZhciBqb2IgPSBfcHlkaW9IdHRwUmVzdEFwaS5SZXN0VXNlckpvYlJlcXVlc3QuY29uc3RydWN0RnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIEpvYk5hbWU6IFwiZXh0cmFjdFwiLFxuICAgICAgICAgICAgICAgICAgICBKc29uUGFyYW1ldGVyczogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogcmVwb1NsdWcgKyBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiBleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IFwiXCIgfSlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyB3aWxsIGJlIGNvbXB1dGVkIGF1dG9tYXRpY2FsbHlcbiAgICAgICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLkpvYnNTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2VuZGluZyBiYWNrZ3JvdW5kIGpvYicsIGpvYik7XG4gICAgICAgICAgICAgICAgYXBpLnVzZXJDcmVhdGVKb2IoXCJjb21wcmVzc1wiLCBqb2IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENhbGxiYWNrcztcbn0pKCk7XG5cbmV4cG9ydHMuQ29tcHJlc3Npb25EaWFsb2cgPSBDb21wcmVzc2lvbkRpYWxvZztcbmV4cG9ydHMuQ2FsbGJhY2tzID0gQ2FsbGJhY2tzO1xuIl19
