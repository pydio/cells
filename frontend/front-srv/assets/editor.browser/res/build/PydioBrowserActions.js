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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _cellsSdk = require('cells-sdk');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var CancelButtonProviderMixin = _Pydio$requireLib.CancelButtonProviderMixin;
var SubmitButtonProviderMixin = _Pydio$requireLib.SubmitButtonProviderMixin;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib2.ModernTextField;

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

var CreateLinkDialog = _react2['default'].createClass({
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

        var api = new _cellsSdk.TreeServiceApi(PydioApi.getRestClient());
        var request = new _cellsSdk.RestCreateNodesRequest();
        var slug = pydio.user.getActiveRepositoryObject().getSlug();
        var path = slug + _pydioUtilLang2['default'].trimRight(pydio.getContextNode().getPath(), '/') + '/' + name + '.url';
        var node = new _cellsSdk.TreeNode();
        node.Path = path;
        node.Type = _cellsSdk.TreeNodeType.constructFromObject('LEAF');
        node.MetaStore = { "Contents": JSON.stringify(url) };
        request.Nodes = [node];
        api.createNodes(request).then(function (collection) {
            _this.dismiss();
        });
    },

    render: function render() {
        var _this2 = this;

        var mess = this.props.pydio.MessageHash;
        return _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement(ModernTextField, { ref: 'url', floatingLabelText: mess['openbrowser.6'], fullWidth: true, hintText: 'https://...', onKeyDown: function (e) {
                    _this2.submitOnEnterKey(e);
                } }),
            _react2['default'].createElement(ModernTextField, { ref: 'name', floatingLabelText: mess['openbrowser.8'], fullWidth: true, onKeyDown: function (e) {
                    _this2.submitOnEnterKey(e);
                } })
        );
    }

});

window.PydioBrowserActions = {
    Callbacks: Callbacks,
    CreateLinkDialog: CreateLinkDialog
};

},{"cells-sdk":"cells-sdk","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/util/lang":"pydio/util/lang","react":"react"}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvUHlkaW9Ccm93c2VyQWN0aW9ucy5iYWJlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpb1V0aWxMYW5nID0gcmVxdWlyZSgncHlkaW8vdXRpbC9sYW5nJyk7XG5cbnZhciBfcHlkaW9VdGlsTGFuZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxMYW5nKTtcblxudmFyIF9jZWxsc1NkayA9IHJlcXVpcmUoJ2NlbGxzLXNkaycpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgQWN0aW9uRGlhbG9nTWl4aW4gPSBfUHlkaW8kcmVxdWlyZUxpYi5BY3Rpb25EaWFsb2dNaXhpbjtcbnZhciBDYW5jZWxCdXR0b25Qcm92aWRlck1peGluID0gX1B5ZGlvJHJlcXVpcmVMaWIuQ2FuY2VsQnV0dG9uUHJvdmlkZXJNaXhpbjtcbnZhciBTdWJtaXRCdXR0b25Qcm92aWRlck1peGluID0gX1B5ZGlvJHJlcXVpcmVMaWIuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbjtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliMiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIE1vZGVyblRleHRGaWVsZCA9IF9QeWRpbyRyZXF1aXJlTGliMi5Nb2Rlcm5UZXh0RmllbGQ7XG5cbnZhciBQeWRpb0FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBDYWxsYmFja3MgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhbGxiYWNrcygpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENhbGxiYWNrcyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKENhbGxiYWNrcywgbnVsbCwgW3tcbiAgICAgICAga2V5OiAnY3JlYXRlTGluaycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVMaW5rKCkge1xuICAgICAgICAgICAgcHlkaW8uVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ1B5ZGlvQnJvd3NlckFjdGlvbnMnLCAnQ3JlYXRlTGlua0RpYWxvZycpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENhbGxiYWNrcztcbn0pKCk7XG5cbnZhciBDcmVhdGVMaW5rRGlhbG9nID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0NyZWF0ZUxpbmtEaWFsb2cnLFxuXG4gICAgbWl4aW5zOiBbQWN0aW9uRGlhbG9nTWl4aW4sIENhbmNlbEJ1dHRvblByb3ZpZGVyTWl4aW4sIFN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW5dLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaWFsb2dTaXplOiAnc20nLFxuICAgICAgICAgICAgZGlhbG9nVGl0bGVJZDogJ29wZW5icm93c2VyLjQnXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBuYW1lID0gdGhpcy5yZWZzLm5hbWUuZ2V0VmFsdWUoKTtcbiAgICAgICAgdmFyIHVybCA9IHRoaXMucmVmcy51cmwuZ2V0VmFsdWUoKTtcbiAgICAgICAgaWYgKCFuYW1lIHx8ICF1cmwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcHlkaW8gPSB0aGlzLnByb3BzLnB5ZGlvO1xuXG4gICAgICAgIHZhciBhcGkgPSBuZXcgX2NlbGxzU2RrLlRyZWVTZXJ2aWNlQXBpKFB5ZGlvQXBpLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IF9jZWxsc1Nkay5SZXN0Q3JlYXRlTm9kZXNSZXF1ZXN0KCk7XG4gICAgICAgIHZhciBzbHVnID0gcHlkaW8udXNlci5nZXRBY3RpdmVSZXBvc2l0b3J5T2JqZWN0KCkuZ2V0U2x1ZygpO1xuICAgICAgICB2YXIgcGF0aCA9IHNsdWcgKyBfcHlkaW9VdGlsTGFuZzJbJ2RlZmF1bHQnXS50cmltUmlnaHQocHlkaW8uZ2V0Q29udGV4dE5vZGUoKS5nZXRQYXRoKCksICcvJykgKyAnLycgKyBuYW1lICsgJy51cmwnO1xuICAgICAgICB2YXIgbm9kZSA9IG5ldyBfY2VsbHNTZGsuVHJlZU5vZGUoKTtcbiAgICAgICAgbm9kZS5QYXRoID0gcGF0aDtcbiAgICAgICAgbm9kZS5UeXBlID0gX2NlbGxzU2RrLlRyZWVOb2RlVHlwZS5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdMRUFGJyk7XG4gICAgICAgIG5vZGUuTWV0YVN0b3JlID0geyBcIkNvbnRlbnRzXCI6IEpTT04uc3RyaW5naWZ5KHVybCkgfTtcbiAgICAgICAgcmVxdWVzdC5Ob2RlcyA9IFtub2RlXTtcbiAgICAgICAgYXBpLmNyZWF0ZU5vZGVzKHJlcXVlc3QpLnRoZW4oZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIF90aGlzLmRpc21pc3MoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB2YXIgbWVzcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1vZGVyblRleHRGaWVsZCwgeyByZWY6ICd1cmwnLCBmbG9hdGluZ0xhYmVsVGV4dDogbWVzc1snb3BlbmJyb3dzZXIuNiddLCBmdWxsV2lkdGg6IHRydWUsIGhpbnRUZXh0OiAnaHR0cHM6Ly8uLi4nLCBvbktleURvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5zdWJtaXRPbkVudGVyS2V5KGUpO1xuICAgICAgICAgICAgICAgIH0gfSksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNb2Rlcm5UZXh0RmllbGQsIHsgcmVmOiAnbmFtZScsIGZsb2F0aW5nTGFiZWxUZXh0OiBtZXNzWydvcGVuYnJvd3Nlci44J10sIGZ1bGxXaWR0aDogdHJ1ZSwgb25LZXlEb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuc3VibWl0T25FbnRlcktleShlKTtcbiAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxud2luZG93LlB5ZGlvQnJvd3NlckFjdGlvbnMgPSB7XG4gICAgQ2FsbGJhY2tzOiBDYWxsYmFja3MsXG4gICAgQ3JlYXRlTGlua0RpYWxvZzogQ3JlYXRlTGlua0RpYWxvZ1xufTtcbiJdfQ==
