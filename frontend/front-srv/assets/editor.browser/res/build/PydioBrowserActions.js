(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioHttpRestApi = require("pydio/http/rest-api");

var React = require('react');

var _require = require('material-ui');

var TextField = _require.TextField;

var _require$requireLib = require('pydio').requireLib('boot');

var ActionDialogMixin = _require$requireLib.ActionDialogMixin;
var CancelButtonProviderMixin = _require$requireLib.CancelButtonProviderMixin;
var SubmitButtonProviderMixin = _require$requireLib.SubmitButtonProviderMixin;

var PydioApi = require('pydio/http/api');

var Callbacks = (function () {
    function Callbacks() {
        _classCallCheck(this, Callbacks);
    }

    _createClass(Callbacks, null, [{
        key: 'createLink',
        value: function createLink() {
            pydio.UI.openComponentInModal('PydioBrowserActions', 'CreateLinkDialog');
        }
    }]);

    return Callbacks;
})();

var CreateLinkDialog = React.createClass({
    displayName: 'CreateLinkDialog',

    mixins: [ActionDialogMixin, CancelButtonProviderMixin, SubmitButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogSize: 'sm',
            dialogTitleId: 'openbrowser.4'
        };
    },

    submit: function submit() {
        var _this = this;

        var name = this.refs.name.getValue();
        var url = this.refs.url.getValue();
        if (!name || !url) {
            return;
        }
        var pydio = this.props.pydio;

        var api = new _pydioHttpRestApi.TreeServiceApi(PydioApi.getRestClient());
        var request = new _pydioHttpRestApi.RestCreateNodesRequest();
        var slug = pydio.user.getActiveRepositoryObject().getSlug();
        var path = slug + _pydioUtilLang2['default'].trimRight(pydio.getContextNode().getPath(), '/') + '/' + name + '.url';
        var node = new _pydioHttpRestApi.TreeNode();
        node.Path = path;
        node.Type = _pydioHttpRestApi.TreeNodeType.constructFromObject('LEAF');
        node.MetaStore = { "Contents": JSON.stringify(url) };
        request.Nodes = [node];
        api.createNodes(request).then(function (collection) {
            _this.dismiss();
        });
    },

    render: function render() {
        var _this2 = this;

        var mess = this.props.pydio.MessageHash;
        return React.createElement(
            'div',
            null,
            React.createElement(TextField, { ref: 'url', floatingLabelText: mess['openbrowser.6'], fullWidth: true, hintText: 'https://...', onKeyDown: function (e) {
                    _this2.submitOnEnterKey(e);
                } }),
            React.createElement(TextField, { ref: 'name', floatingLabelText: mess['openbrowser.8'], fullWidth: true, onKeyDown: function (e) {
                    _this2.submitOnEnterKey(e);
                } })
        );
    }

});

window.PydioBrowserActions = {
    Callbacks: Callbacks,
    CreateLinkDialog: CreateLinkDialog
};

},{"material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/lang":"pydio/util/lang","react":"react"}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvUHlkaW9Ccm93c2VyQWN0aW9ucy5iYWJlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBfcHlkaW9VdGlsTGFuZyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvbGFuZycpO1xuXG52YXIgX3B5ZGlvVXRpbExhbmcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsTGFuZyk7XG5cbnZhciBfcHlkaW9IdHRwUmVzdEFwaSA9IHJlcXVpcmUoXCJweWRpby9odHRwL3Jlc3QtYXBpXCIpO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgVGV4dEZpZWxkID0gX3JlcXVpcmUuVGV4dEZpZWxkO1xuXG52YXIgX3JlcXVpcmUkcmVxdWlyZUxpYiA9IHJlcXVpcmUoJ3B5ZGlvJykucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgQWN0aW9uRGlhbG9nTWl4aW4gPSBfcmVxdWlyZSRyZXF1aXJlTGliLkFjdGlvbkRpYWxvZ01peGluO1xudmFyIENhbmNlbEJ1dHRvblByb3ZpZGVyTWl4aW4gPSBfcmVxdWlyZSRyZXF1aXJlTGliLkNhbmNlbEJ1dHRvblByb3ZpZGVyTWl4aW47XG52YXIgU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbiA9IF9yZXF1aXJlJHJlcXVpcmVMaWIuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbjtcblxudmFyIFB5ZGlvQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIENhbGxiYWNrcyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2FsbGJhY2tzKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2FsbGJhY2tzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQ2FsbGJhY2tzLCBudWxsLCBbe1xuICAgICAgICBrZXk6ICdjcmVhdGVMaW5rJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNyZWF0ZUxpbmsoKSB7XG4gICAgICAgICAgICBweWRpby5VSS5vcGVuQ29tcG9uZW50SW5Nb2RhbCgnUHlkaW9Ccm93c2VyQWN0aW9ucycsICdDcmVhdGVMaW5rRGlhbG9nJyk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ2FsbGJhY2tzO1xufSkoKTtcblxudmFyIENyZWF0ZUxpbmtEaWFsb2cgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdDcmVhdGVMaW5rRGlhbG9nJyxcblxuICAgIG1peGluczogW0FjdGlvbkRpYWxvZ01peGluLCBDYW5jZWxCdXR0b25Qcm92aWRlck1peGluLCBTdWJtaXRCdXR0b25Qcm92aWRlck1peGluXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ3NtJyxcbiAgICAgICAgICAgIGRpYWxvZ1RpdGxlSWQ6ICdvcGVuYnJvd3Nlci40J1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMucmVmcy5uYW1lLmdldFZhbHVlKCk7XG4gICAgICAgIHZhciB1cmwgPSB0aGlzLnJlZnMudXJsLmdldFZhbHVlKCk7XG4gICAgICAgIGlmICghbmFtZSB8fCAhdXJsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcblxuICAgICAgICB2YXIgYXBpID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlRyZWVTZXJ2aWNlQXBpKFB5ZGlvQXBpLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlJlc3RDcmVhdGVOb2Rlc1JlcXVlc3QoKTtcbiAgICAgICAgdmFyIHNsdWcgPSBweWRpby51c2VyLmdldEFjdGl2ZVJlcG9zaXRvcnlPYmplY3QoKS5nZXRTbHVnKCk7XG4gICAgICAgIHZhciBwYXRoID0gc2x1ZyArIF9weWRpb1V0aWxMYW5nMlsnZGVmYXVsdCddLnRyaW1SaWdodChweWRpby5nZXRDb250ZXh0Tm9kZSgpLmdldFBhdGgoKSwgJy8nKSArICcvJyArIG5hbWUgKyAnLnVybCc7XG4gICAgICAgIHZhciBub2RlID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlRyZWVOb2RlKCk7XG4gICAgICAgIG5vZGUuUGF0aCA9IHBhdGg7XG4gICAgICAgIG5vZGUuVHlwZSA9IF9weWRpb0h0dHBSZXN0QXBpLlRyZWVOb2RlVHlwZS5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdMRUFGJyk7XG4gICAgICAgIG5vZGUuTWV0YVN0b3JlID0geyBcIkNvbnRlbnRzXCI6IEpTT04uc3RyaW5naWZ5KHVybCkgfTtcbiAgICAgICAgcmVxdWVzdC5Ob2RlcyA9IFtub2RlXTtcbiAgICAgICAgYXBpLmNyZWF0ZU5vZGVzKHJlcXVlc3QpLnRoZW4oZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIF90aGlzLmRpc21pc3MoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB2YXIgbWVzcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUZXh0RmllbGQsIHsgcmVmOiAndXJsJywgZmxvYXRpbmdMYWJlbFRleHQ6IG1lc3NbJ29wZW5icm93c2VyLjYnXSwgZnVsbFdpZHRoOiB0cnVlLCBoaW50VGV4dDogJ2h0dHBzOi8vLi4uJywgb25LZXlEb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuc3VibWl0T25FbnRlcktleShlKTtcbiAgICAgICAgICAgICAgICB9IH0pLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUZXh0RmllbGQsIHsgcmVmOiAnbmFtZScsIGZsb2F0aW5nTGFiZWxUZXh0OiBtZXNzWydvcGVuYnJvd3Nlci44J10sIGZ1bGxXaWR0aDogdHJ1ZSwgb25LZXlEb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuc3VibWl0T25FbnRlcktleShlKTtcbiAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxud2luZG93LlB5ZGlvQnJvd3NlckFjdGlvbnMgPSB7XG4gICAgQ2FsbGJhY2tzOiBDYWxsYmFja3MsXG4gICAgQ3JlYXRlTGlua0RpYWxvZzogQ3JlYXRlTGlua0RpYWxvZ1xufTtcbiJdfQ==
