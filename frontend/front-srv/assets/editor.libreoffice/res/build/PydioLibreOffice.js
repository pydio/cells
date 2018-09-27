(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioLibreOffice = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _require = require('pydio/http/rest-api'),
    TreeServiceApi = _require.TreeServiceApi,
    RestCreateNodesRequest = _require.RestCreateNodesRequest,
    TreeNode = _require.TreeNode,
    TreeNodeType = _require.TreeNodeType;

var dynamicBuilder = exports.dynamicBuilder = function dynamicBuilder(controller) {

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
            callback: async function (e) {
                var repoList = pydio.user.getRepositoriesList();
                var api = new TreeServiceApi(PydioApi.getRestClient());
                var request = new RestCreateNodesRequest();
                var node = new TreeNode();

                var slug = repoList.get(pydio.user.activeRepository).getSlug();

                var path = slug + dir + (dir ? "/" : "") + "Untitled Document." + k;
                path = await file_newpath(path);

                console.log("New path is ", path);
                node.Path = path;
                node.Type = TreeNodeType.constructFromObject('LEAF');
                request.Nodes = [node];

                api.createNodes(request).then(function (leaf) {
                    // Success - We should probably select the nodes
                    // pydio.getContextHolder().setSelectedNodes([node])
                });
            }.bind(undefined)
        });
    });

    return builderMenuItems;
};

function file_newpath(fullpath) {
    return new Promise(async function (resolve) {
        var lastSlash = fullpath.lastIndexOf('/');
        var pos = fullpath.lastIndexOf('.');
        var path = fullpath;
        var ext = '';

        // NOTE: the position lastSlash + 1 corresponds to hidden files (ex: .DS_STORE)
        if (pos > -1 && lastSlash < pos && pos > lastSlash + 1) {
            path = fullpath.substring(0, pos);
            ext = fullpath.substring(pos);
        }

        var newPath = fullpath;
        var counter = 1;

        var exists = await file_exists(newPath);

        console.log("Exists ? ", exists);

        while (exists) {
            newPath = path + '-' + counter + ext;
            counter++;
            exists = await file_exists(newPath);
        }

        resolve(newPath);
    }.bind(this));
}

function file_exists(fullpath) {
    return new Promise(function (resolve) {
        var api = new TreeServiceApi(PydioApi.getRestClient());

        api.headNode(fullpath).then(function (node) {
            console.log(node);
            if (node.Node) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch(function () {
            return resolve(false);
        });
    });
}

},{"pydio/http/rest-api":"pydio/http/rest-api"}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class; /*
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _api = require('pydio/http/api');

var _api2 = _interopRequireDefault(_api);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _redux = require('redux');

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var configs = _pydio2.default.getInstance().getPluginConfigs("editor.libreoffice");

var _Pydio$requireLib = _pydio2.default.requireLib('hoc'),
    withMenu = _Pydio$requireLib.withMenu,
    withLoader = _Pydio$requireLib.withLoader,
    withErrors = _Pydio$requireLib.withErrors,
    EditorActions = _Pydio$requireLib.EditorActions;

// const Viewer = compose(
//     withMenu,
//     withLoader,
//     withErrors
// )(({url, style}) => <iframe src={url} style={{...style, width: "100%", height: "100%", border: 0, flex: 1}}></iframe>)

var Editor = (_dec = (0, _reactRedux.connect)(null, EditorActions), _dec(_class = function (_React$Component) {
    _inherits(Editor, _React$Component);

    function Editor(props) {
        _classCallCheck(this, Editor);

        var _this = _possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this, props));

        _this.state = {};
        return _this;
    }

    _createClass(Editor, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var editorModify = this.props.editorModify;

            if (nextProps.isActive) {
                editorModify({ fixedToolbar: true });
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var editorModify = this.props.editorModify;

            if (this.props.isActive) {
                editorModify({ fixedToolbar: true });
            }

            var iframeUrl = configs.get('LIBREOFFICE_IFRAME_URL'),
                webSocketSecure = configs.get('LIBREOFFICE_WEBSOCKET_SECURE'),
                webSocketHost = configs.get('LIBREOFFICE_WEBSOCKET_HOST'),
                webSocketPort = configs.get('LIBREOFFICE_WEBSOCKET_PORT');

            // FIXME: was retrieved from the response JSON before, we manually add the prefix otherwise collabora cannot get the doc.
            var host = 'http://' + webSocketHost;
            // TODO also manage backend port when we have found a solution for the collabora container
            // to call the backend on a specific port. For the time being, all request that are sent to:
            // mypydiohost.example.com/wopi/... must be proxied to the correct host, f.i. mypydiohost.example.com:5014/wopi
            // via a reverse proxy.

            var webSocketProtocol = webSocketSecure ? 'wss' : 'ws',
                webSocketUrl = encodeURIComponent(webSocketProtocol + '://' + webSocketHost + ':' + webSocketPort);

            // Check current action state for permission
            var readonly = _pydio2.default.getInstance().getController().getActionByName("move").deny;
            var permission = readonly ? "readonly" : "edit";
            var uri = "/wopi/files/" + this.props.node.getMetadata().get("uuid");
            var fileSrcUrl = encodeURIComponent('' + host + uri);

            _api2.default.getRestClient().getOrUpdateJwt().then(function (jwt) {
                _this2.setState({ url: iframeUrl + '?host=' + webSocketUrl + '&WOPISrc=' + fileSrcUrl + '&access_token=' + jwt + '&permission=' + permission });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var url = this.state.url;

            return _react2.default.createElement('iframe', { src: url, style: { backgroundColor: "white", width: "100%", height: "100%", border: 0, flex: 1 } });
        }
    }]);

    return Editor;
}(_react2.default.Component)) || _class);
exports.default = Editor;

},{"pydio":"pydio","pydio/http/api":"pydio/http/api","react":"react","react-redux":"react-redux","redux":"redux"}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Actions = exports.Editor = undefined;

var _editor = require('./editor');

Object.defineProperty(exports, 'Editor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_editor).default;
  }
});

var _actions = require('./actions');

var Actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Actions = Actions;

},{"./actions":1,"./editor":2}]},{},[3])(3)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvUHlkaW9MaWJyZU9mZmljZS9hY3Rpb25zLmpzIiwicmVzL2J1aWxkL1B5ZGlvTGlicmVPZmZpY2UvZWRpdG9yLmpzIiwicmVzL2J1aWxkL1B5ZGlvTGlicmVPZmZpY2UvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvcmVzdC1hcGknKSxcbiAgICBUcmVlU2VydmljZUFwaSA9IF9yZXF1aXJlLlRyZWVTZXJ2aWNlQXBpLFxuICAgIFJlc3RDcmVhdGVOb2Rlc1JlcXVlc3QgPSBfcmVxdWlyZS5SZXN0Q3JlYXRlTm9kZXNSZXF1ZXN0LFxuICAgIFRyZWVOb2RlID0gX3JlcXVpcmUuVHJlZU5vZGUsXG4gICAgVHJlZU5vZGVUeXBlID0gX3JlcXVpcmUuVHJlZU5vZGVUeXBlO1xuXG52YXIgZHluYW1pY0J1aWxkZXIgPSBleHBvcnRzLmR5bmFtaWNCdWlsZGVyID0gZnVuY3Rpb24gZHluYW1pY0J1aWxkZXIoY29udHJvbGxlcikge1xuXG4gICAgdmFyIHB5ZGlvID0gd2luZG93LnB5ZGlvO1xuICAgIHZhciBNZXNzYWdlSGFzaCA9IHB5ZGlvLk1lc3NhZ2VIYXNoO1xuICAgIHZhciBleHRzID0ge1xuICAgICAgICBkb2M6ICdmaWxlLXdvcmQnLFxuICAgICAgICBkb2N4OiAnZmlsZS13b3JkJyxcbiAgICAgICAgb2R0OiAnZmlsZS13b3JkJyxcbiAgICAgICAgb2RnOiAnZmlsZS1jaGFydCcsXG4gICAgICAgIG9kcDogJ2ZpbGUtcG93ZXJwb2ludCcsXG4gICAgICAgIG9kczogJ2ZpbGUtZXhjZWwnLFxuICAgICAgICBwb3Q6ICdmaWxlLXBvd2VycG9pbnQnLFxuICAgICAgICBwcHR4OiAnZmlsZS1wb3dlcnBvaW50JyxcbiAgICAgICAgcnRmOiAnZmlsZS13b3JkJyxcbiAgICAgICAgeGxzOiAnZmlsZS1leGNlbCcsXG4gICAgICAgIHhsc3g6ICdmaWxlLWV4Y2VsJ1xuICAgIH07XG5cbiAgICB2YXIgZGlyID0gcHlkaW8uZ2V0Q29udGV4dEhvbGRlcigpLmdldENvbnRleHROb2RlKCkuZ2V0UGF0aCgpO1xuXG4gICAgdmFyIGJ1aWxkZXJNZW51SXRlbXMgPSBbXTtcblxuICAgIE9iamVjdC5rZXlzKGV4dHMpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcblxuICAgICAgICBpZiAoIU1lc3NhZ2VIYXNoWydsaWJyZW9mZmljZS5leHQuJyArIGtdKSByZXR1cm47XG5cbiAgICAgICAgYnVpbGRlck1lbnVJdGVtcy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6IE1lc3NhZ2VIYXNoWydsaWJyZW9mZmljZS5leHQuJyArIGtdLFxuICAgICAgICAgICAgYWx0OiBNZXNzYWdlSGFzaFsnbGlicmVvZmZpY2UuZXh0LicgKyBrXSxcbiAgICAgICAgICAgIGljb25fY2xhc3M6ICdtZGkgbWRpLScgKyBleHRzW2tdLFxuICAgICAgICAgICAgY2FsbGJhY2s6IGFzeW5jIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlcG9MaXN0ID0gcHlkaW8udXNlci5nZXRSZXBvc2l0b3JpZXNMaXN0KCk7XG4gICAgICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBUcmVlU2VydmljZUFwaShQeWRpb0FwaS5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICAgICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFJlc3RDcmVhdGVOb2Rlc1JlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IG5ldyBUcmVlTm9kZSgpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHNsdWcgPSByZXBvTGlzdC5nZXQocHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5KS5nZXRTbHVnKCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcGF0aCA9IHNsdWcgKyBkaXIgKyAoZGlyID8gXCIvXCIgOiBcIlwiKSArIFwiVW50aXRsZWQgRG9jdW1lbnQuXCIgKyBrO1xuICAgICAgICAgICAgICAgIHBhdGggPSBhd2FpdCBmaWxlX25ld3BhdGgocGF0aCk7XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIk5ldyBwYXRoIGlzIFwiLCBwYXRoKTtcbiAgICAgICAgICAgICAgICBub2RlLlBhdGggPSBwYXRoO1xuICAgICAgICAgICAgICAgIG5vZGUuVHlwZSA9IFRyZWVOb2RlVHlwZS5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdMRUFGJyk7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5Ob2RlcyA9IFtub2RlXTtcblxuICAgICAgICAgICAgICAgIGFwaS5jcmVhdGVOb2RlcyhyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uIChsZWFmKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFN1Y2Nlc3MgLSBXZSBzaG91bGQgcHJvYmFibHkgc2VsZWN0IHRoZSBub2Rlc1xuICAgICAgICAgICAgICAgICAgICAvLyBweWRpby5nZXRDb250ZXh0SG9sZGVyKCkuc2V0U2VsZWN0ZWROb2Rlcyhbbm9kZV0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LmJpbmQodW5kZWZpbmVkKVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBidWlsZGVyTWVudUl0ZW1zO1xufTtcblxuZnVuY3Rpb24gZmlsZV9uZXdwYXRoKGZ1bGxwYXRoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgIHZhciBsYXN0U2xhc2ggPSBmdWxscGF0aC5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICB2YXIgcG9zID0gZnVsbHBhdGgubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgICAgdmFyIHBhdGggPSBmdWxscGF0aDtcbiAgICAgICAgdmFyIGV4dCA9ICcnO1xuXG4gICAgICAgIC8vIE5PVEU6IHRoZSBwb3NpdGlvbiBsYXN0U2xhc2ggKyAxIGNvcnJlc3BvbmRzIHRvIGhpZGRlbiBmaWxlcyAoZXg6IC5EU19TVE9SRSlcbiAgICAgICAgaWYgKHBvcyA+IC0xICYmIGxhc3RTbGFzaCA8IHBvcyAmJiBwb3MgPiBsYXN0U2xhc2ggKyAxKSB7XG4gICAgICAgICAgICBwYXRoID0gZnVsbHBhdGguc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgICAgICAgICBleHQgPSBmdWxscGF0aC5zdWJzdHJpbmcocG9zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBuZXdQYXRoID0gZnVsbHBhdGg7XG4gICAgICAgIHZhciBjb3VudGVyID0gMTtcblxuICAgICAgICB2YXIgZXhpc3RzID0gYXdhaXQgZmlsZV9leGlzdHMobmV3UGF0aCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJFeGlzdHMgPyBcIiwgZXhpc3RzKTtcblxuICAgICAgICB3aGlsZSAoZXhpc3RzKSB7XG4gICAgICAgICAgICBuZXdQYXRoID0gcGF0aCArICctJyArIGNvdW50ZXIgKyBleHQ7XG4gICAgICAgICAgICBjb3VudGVyKys7XG4gICAgICAgICAgICBleGlzdHMgPSBhd2FpdCBmaWxlX2V4aXN0cyhuZXdQYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUobmV3UGF0aCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbn1cblxuZnVuY3Rpb24gZmlsZV9leGlzdHMoZnVsbHBhdGgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgdmFyIGFwaSA9IG5ldyBUcmVlU2VydmljZUFwaShQeWRpb0FwaS5nZXRSZXN0Q2xpZW50KCkpO1xuXG4gICAgICAgIGFwaS5oZWFkTm9kZShmdWxscGF0aCkudGhlbihmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2cobm9kZSk7XG4gICAgICAgICAgICBpZiAobm9kZS5Ob2RlKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9kZWMsIF9jbGFzczsgLypcbiAgICAgICAgICAgICAgICAgICAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gICAgICAgICAgICAgICAgICAgKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gICAgICAgICAgICAgICAgICAgKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAgICAgICAgICAgICAgICAgICAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gICAgICAgICAgICAgICAgICAgKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gICAgICAgICAgICAgICAgICAgKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICAgICAgICAgICAgICAgICAgICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICAgICAgICAgICAgICAgICAgICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gICAgICAgICAgICAgICAgICAgKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAgICAgICAgICAgICAgICAgICAqL1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfYXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9hcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYXBpKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3JlZHV4ID0gcmVxdWlyZSgncmVkdXgnKTtcblxudmFyIF9yZWFjdFJlZHV4ID0gcmVxdWlyZSgncmVhY3QtcmVkdXgnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgY29uZmlncyA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLmdldFBsdWdpbkNvbmZpZ3MoXCJlZGl0b3IubGlicmVvZmZpY2VcIik7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzIuZGVmYXVsdC5yZXF1aXJlTGliKCdob2MnKSxcbiAgICB3aXRoTWVudSA9IF9QeWRpbyRyZXF1aXJlTGliLndpdGhNZW51LFxuICAgIHdpdGhMb2FkZXIgPSBfUHlkaW8kcmVxdWlyZUxpYi53aXRoTG9hZGVyLFxuICAgIHdpdGhFcnJvcnMgPSBfUHlkaW8kcmVxdWlyZUxpYi53aXRoRXJyb3JzLFxuICAgIEVkaXRvckFjdGlvbnMgPSBfUHlkaW8kcmVxdWlyZUxpYi5FZGl0b3JBY3Rpb25zO1xuXG4vLyBjb25zdCBWaWV3ZXIgPSBjb21wb3NlKFxuLy8gICAgIHdpdGhNZW51LFxuLy8gICAgIHdpdGhMb2FkZXIsXG4vLyAgICAgd2l0aEVycm9yc1xuLy8gKSgoe3VybCwgc3R5bGV9KSA9PiA8aWZyYW1lIHNyYz17dXJsfSBzdHlsZT17ey4uLnN0eWxlLCB3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogXCIxMDAlXCIsIGJvcmRlcjogMCwgZmxleDogMX19PjwvaWZyYW1lPilcblxudmFyIEVkaXRvciA9IChfZGVjID0gKDAsIF9yZWFjdFJlZHV4LmNvbm5lY3QpKG51bGwsIEVkaXRvckFjdGlvbnMpLCBfZGVjKF9jbGFzcyA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEVkaXRvciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBFZGl0b3IocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEVkaXRvcik7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKEVkaXRvci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKEVkaXRvcikpLmNhbGwodGhpcywgcHJvcHMpKTtcblxuICAgICAgICBfdGhpcy5zdGF0ZSA9IHt9O1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEVkaXRvciwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICAgICAgdmFyIGVkaXRvck1vZGlmeSA9IHRoaXMucHJvcHMuZWRpdG9yTW9kaWZ5O1xuXG4gICAgICAgICAgICBpZiAobmV4dFByb3BzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgZWRpdG9yTW9kaWZ5KHsgZml4ZWRUb29sYmFyOiB0cnVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgZWRpdG9yTW9kaWZ5ID0gdGhpcy5wcm9wcy5lZGl0b3JNb2RpZnk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgZWRpdG9yTW9kaWZ5KHsgZml4ZWRUb29sYmFyOiB0cnVlIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaWZyYW1lVXJsID0gY29uZmlncy5nZXQoJ0xJQlJFT0ZGSUNFX0lGUkFNRV9VUkwnKSxcbiAgICAgICAgICAgICAgICB3ZWJTb2NrZXRTZWN1cmUgPSBjb25maWdzLmdldCgnTElCUkVPRkZJQ0VfV0VCU09DS0VUX1NFQ1VSRScpLFxuICAgICAgICAgICAgICAgIHdlYlNvY2tldEhvc3QgPSBjb25maWdzLmdldCgnTElCUkVPRkZJQ0VfV0VCU09DS0VUX0hPU1QnKSxcbiAgICAgICAgICAgICAgICB3ZWJTb2NrZXRQb3J0ID0gY29uZmlncy5nZXQoJ0xJQlJFT0ZGSUNFX1dFQlNPQ0tFVF9QT1JUJyk7XG5cbiAgICAgICAgICAgIC8vIEZJWE1FOiB3YXMgcmV0cmlldmVkIGZyb20gdGhlIHJlc3BvbnNlIEpTT04gYmVmb3JlLCB3ZSBtYW51YWxseSBhZGQgdGhlIHByZWZpeCBvdGhlcndpc2UgY29sbGFib3JhIGNhbm5vdCBnZXQgdGhlIGRvYy5cbiAgICAgICAgICAgIHZhciBob3N0ID0gJ2h0dHA6Ly8nICsgd2ViU29ja2V0SG9zdDtcbiAgICAgICAgICAgIC8vIFRPRE8gYWxzbyBtYW5hZ2UgYmFja2VuZCBwb3J0IHdoZW4gd2UgaGF2ZSBmb3VuZCBhIHNvbHV0aW9uIGZvciB0aGUgY29sbGFib3JhIGNvbnRhaW5lclxuICAgICAgICAgICAgLy8gdG8gY2FsbCB0aGUgYmFja2VuZCBvbiBhIHNwZWNpZmljIHBvcnQuIEZvciB0aGUgdGltZSBiZWluZywgYWxsIHJlcXVlc3QgdGhhdCBhcmUgc2VudCB0bzpcbiAgICAgICAgICAgIC8vIG15cHlkaW9ob3N0LmV4YW1wbGUuY29tL3dvcGkvLi4uIG11c3QgYmUgcHJveGllZCB0byB0aGUgY29ycmVjdCBob3N0LCBmLmkuIG15cHlkaW9ob3N0LmV4YW1wbGUuY29tOjUwMTQvd29waVxuICAgICAgICAgICAgLy8gdmlhIGEgcmV2ZXJzZSBwcm94eS5cblxuICAgICAgICAgICAgdmFyIHdlYlNvY2tldFByb3RvY29sID0gd2ViU29ja2V0U2VjdXJlID8gJ3dzcycgOiAnd3MnLFxuICAgICAgICAgICAgICAgIHdlYlNvY2tldFVybCA9IGVuY29kZVVSSUNvbXBvbmVudCh3ZWJTb2NrZXRQcm90b2NvbCArICc6Ly8nICsgd2ViU29ja2V0SG9zdCArICc6JyArIHdlYlNvY2tldFBvcnQpO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBjdXJyZW50IGFjdGlvbiBzdGF0ZSBmb3IgcGVybWlzc2lvblxuICAgICAgICAgICAgdmFyIHJlYWRvbmx5ID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0Q29udHJvbGxlcigpLmdldEFjdGlvbkJ5TmFtZShcIm1vdmVcIikuZGVueTtcbiAgICAgICAgICAgIHZhciBwZXJtaXNzaW9uID0gcmVhZG9ubHkgPyBcInJlYWRvbmx5XCIgOiBcImVkaXRcIjtcbiAgICAgICAgICAgIHZhciB1cmkgPSBcIi93b3BpL2ZpbGVzL1wiICsgdGhpcy5wcm9wcy5ub2RlLmdldE1ldGFkYXRhKCkuZ2V0KFwidXVpZFwiKTtcbiAgICAgICAgICAgIHZhciBmaWxlU3JjVXJsID0gZW5jb2RlVVJJQ29tcG9uZW50KCcnICsgaG9zdCArIHVyaSk7XG5cbiAgICAgICAgICAgIF9hcGkyLmRlZmF1bHQuZ2V0UmVzdENsaWVudCgpLmdldE9yVXBkYXRlSnd0KCkudGhlbihmdW5jdGlvbiAoand0KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgdXJsOiBpZnJhbWVVcmwgKyAnP2hvc3Q9JyArIHdlYlNvY2tldFVybCArICcmV09QSVNyYz0nICsgZmlsZVNyY1VybCArICcmYWNjZXNzX3Rva2VuPScgKyBqd3QgKyAnJnBlcm1pc3Npb249JyArIHBlcm1pc3Npb24gfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSB0aGlzLnN0YXRlLnVybDtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnLCB7IHNyYzogdXJsLCBzdHlsZTogeyBiYWNrZ3JvdW5kQ29sb3I6IFwid2hpdGVcIiwgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IFwiMTAwJVwiLCBib3JkZXI6IDAsIGZsZXg6IDEgfSB9KTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBFZGl0b3I7XG59KF9yZWFjdDIuZGVmYXVsdC5Db21wb25lbnQpKSB8fCBfY2xhc3MpO1xuZXhwb3J0cy5kZWZhdWx0ID0gRWRpdG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5BY3Rpb25zID0gZXhwb3J0cy5FZGl0b3IgPSB1bmRlZmluZWQ7XG5cbnZhciBfZWRpdG9yID0gcmVxdWlyZSgnLi9lZGl0b3InKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdFZGl0b3InLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9lZGl0b3IpLmRlZmF1bHQ7XG4gIH1cbn0pO1xuXG52YXIgX2FjdGlvbnMgPSByZXF1aXJlKCcuL2FjdGlvbnMnKTtcblxudmFyIEFjdGlvbnMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfYWN0aW9ucyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKG9iaikgeyBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7IHJldHVybiBvYmo7IH0gZWxzZSB7IHZhciBuZXdPYmogPSB7fTsgaWYgKG9iaiAhPSBudWxsKSB7IGZvciAodmFyIGtleSBpbiBvYmopIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIG5ld09ialtrZXldID0gb2JqW2tleV07IH0gfSBuZXdPYmouZGVmYXVsdCA9IG9iajsgcmV0dXJuIG5ld09iajsgfSB9XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuQWN0aW9ucyA9IEFjdGlvbnM7XG4iXX0=
