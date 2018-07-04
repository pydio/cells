(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioLibreOffice = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Callbacks = (function () {
    function Callbacks() {
        _classCallCheck(this, Callbacks);
    }

    _createClass(Callbacks, null, [{
        key: 'dynamicBuilder',
        value: function dynamicBuilder(controller) {
            var _this = this;

            var pydio = window.pydio;
            var MessageHash = pydio.MessageHash;
            var exts = {
                doc: 'file-word',
                docx: 'file-word',
                odt: 'file-word',
                odg: 'file-chart',
                odp: 'file-powerpoint',
                ods: 'file-excel',
                pot: 'file-powerpoint',
                pptx: 'file-powerpoint',
                rtf: 'file-word',
                xls: 'file-excel',
                xlsx: 'file-excel'
            };

            var dir = pydio.getContextHolder().getContextNode().getPath();

            var builderMenuItems = [];

            Object.keys(exts).forEach(function (k) {

                if (!MessageHash['libreoffice.ext.' + k]) return;

                builderMenuItems.push({
                    name: MessageHash['libreoffice.ext.' + k],
                    alt: MessageHash['libreoffice.ext.' + k],
                    icon_class: 'mdi mdi-' + exts[k],
                    callback: (function (e) {
                        PydioApi.getClient().request({
                            get_action: 'libreoffice_mkempty_file',
                            dir: dir,
                            format: k
                        });
                    }).bind(_this)
                });
            });

            return builderMenuItems;
        }
    }]);

    return Callbacks;
})();

window.PydioLibreOfficeActions = { Callbacks: Callbacks };

},{}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvUHlkaW9MaWJyZU9mZmljZS9hY3Rpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBDYWxsYmFja3MgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhbGxiYWNrcygpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENhbGxiYWNrcyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKENhbGxiYWNrcywgbnVsbCwgW3tcbiAgICAgICAga2V5OiAnZHluYW1pY0J1aWxkZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZHluYW1pY0J1aWxkZXIoY29udHJvbGxlcikge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIHB5ZGlvID0gd2luZG93LnB5ZGlvO1xuICAgICAgICAgICAgdmFyIE1lc3NhZ2VIYXNoID0gcHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgICAgICB2YXIgZXh0cyA9IHtcbiAgICAgICAgICAgICAgICBkb2M6ICdmaWxlLXdvcmQnLFxuICAgICAgICAgICAgICAgIGRvY3g6ICdmaWxlLXdvcmQnLFxuICAgICAgICAgICAgICAgIG9kdDogJ2ZpbGUtd29yZCcsXG4gICAgICAgICAgICAgICAgb2RnOiAnZmlsZS1jaGFydCcsXG4gICAgICAgICAgICAgICAgb2RwOiAnZmlsZS1wb3dlcnBvaW50JyxcbiAgICAgICAgICAgICAgICBvZHM6ICdmaWxlLWV4Y2VsJyxcbiAgICAgICAgICAgICAgICBwb3Q6ICdmaWxlLXBvd2VycG9pbnQnLFxuICAgICAgICAgICAgICAgIHBwdHg6ICdmaWxlLXBvd2VycG9pbnQnLFxuICAgICAgICAgICAgICAgIHJ0ZjogJ2ZpbGUtd29yZCcsXG4gICAgICAgICAgICAgICAgeGxzOiAnZmlsZS1leGNlbCcsXG4gICAgICAgICAgICAgICAgeGxzeDogJ2ZpbGUtZXhjZWwnXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgZGlyID0gcHlkaW8uZ2V0Q29udGV4dEhvbGRlcigpLmdldENvbnRleHROb2RlKCkuZ2V0UGF0aCgpO1xuXG4gICAgICAgICAgICB2YXIgYnVpbGRlck1lbnVJdGVtcyA9IFtdO1xuXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhleHRzKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIU1lc3NhZ2VIYXNoWydsaWJyZW9mZmljZS5leHQuJyArIGtdKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBidWlsZGVyTWVudUl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBNZXNzYWdlSGFzaFsnbGlicmVvZmZpY2UuZXh0LicgKyBrXSxcbiAgICAgICAgICAgICAgICAgICAgYWx0OiBNZXNzYWdlSGFzaFsnbGlicmVvZmZpY2UuZXh0LicgKyBrXSxcbiAgICAgICAgICAgICAgICAgICAgaWNvbl9jbGFzczogJ21kaSBtZGktJyArIGV4dHNba10sXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFB5ZGlvQXBpLmdldENsaWVudCgpLnJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldF9hY3Rpb246ICdsaWJyZW9mZmljZV9ta2VtcHR5X2ZpbGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcjogZGlyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDoga1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmJpbmQoX3RoaXMpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkZXJNZW51SXRlbXM7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ2FsbGJhY2tzO1xufSkoKTtcblxud2luZG93LlB5ZGlvTGlicmVPZmZpY2VBY3Rpb25zID0geyBDYWxsYmFja3M6IENhbGxiYWNrcyB9O1xuIl19
