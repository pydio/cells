(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioCoreActions = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _toggleBmNode = require("./toggleBmNode");

var _toggleBmNode2 = _interopRequireDefault(_toggleBmNode);

var BookmarkButton = (function (_React$Component) {
    _inherits(BookmarkButton, _React$Component);

    function BookmarkButton(props) {
        _classCallCheck(this, BookmarkButton);

        _React$Component.call(this, props);
        this.state = this.valueFromNodes(props.nodes);
    }

    BookmarkButton.prototype.valueFromNodes = function valueFromNodes() {
        var nodes = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        var mixed = undefined,
            value = undefined;
        nodes.forEach(function (n) {
            var nVal = n.getMetadata().get('bookmark') === 'true';
            if (value !== undefined && nVal !== value) {
                mixed = true;
            }
            value = nVal;
        });
        return { value: value, mixed: mixed };
    };

    BookmarkButton.prototype.updateValue = function updateValue(value) {
        var _this = this;

        var nodes = this.props.nodes;

        this.setState({ saving: true });
        var proms = [];
        nodes.forEach(function (n) {
            var isBookmarked = n.getMetadata().get('bookmark') === 'true';
            if (value !== isBookmarked) {
                proms.push(_toggleBmNode2['default'](n));
                var overlay = n.getMetadata().get('overlay_class') || '';
                if (value) {
                    n.getMetadata().set('bookmark', 'true');
                    var overlays = overlay.replace('mdi mdi-star', '').split(',');
                    overlays.push('mdi mdi-star');
                    n.getMetadata().set('overlay_class', overlays.join(','));
                } else {
                    n.getMetadata()['delete']('bookmark');
                    n.getMetadata().set('overlay_class', overlay.replace('mdi mdi-star', ''));
                }
                n.notify('node_replaced');
            }
        });
        Promise.all(proms).then(function () {
            window.setTimeout(function () {
                _this.setState({ saving: false });
            }, 250);
            _this.setState(_this.valueFromNodes(nodes));
        })['catch'](function () {
            _this.setState({ saving: false });
        });
    };

    BookmarkButton.prototype.render = function render() {
        var _this2 = this;

        var styles = this.props.styles;
        var _state = this.state;
        var value = _state.value;
        var mixed = _state.mixed;
        var saving = _state.saving;

        var icon = undefined,
            touchValue = undefined,
            tt = undefined,
            disabled = undefined;
        var mm = _pydio2['default'].getInstance().MessageHash;
        if (mixed) {
            icon = 'star-half';
            touchValue = true;
            tt = mm['bookmark.button.tip.mixed'];
        } else if (value) {
            icon = 'star';
            touchValue = false;
            tt = mm['bookmark.button.tip.remove'];
        } else {
            icon = 'star-outline';
            touchValue = true;
            tt = mm['bookmark.button.tip.add'];
        }

        if (saving) {
            icon = 'star-circle';
            tt = mm['bookmark.button.tip.saving'];
            disabled = true;
        }

        return _react2['default'].createElement(_materialUi.IconButton, _extends({ disabled: disabled, iconClassName: 'mdi mdi-' + icon, tooltip: tt, onTouchTap: function () {
                return _this2.updateValue(touchValue);
            } }, styles));
    };

    return BookmarkButton;
})(_react2['default'].Component);

exports['default'] = BookmarkButton;
module.exports = exports['default'];

},{"./toggleBmNode":5,"material-ui":"material-ui","pydio":"pydio","react":"react"}],2:[function(require,module,exports){
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

exports.__esModule = true;

var _globals = require('../globals');

exports['default'] = function () {

    if (_globals.global.Notification) {
        alert(_globals.MessageHash["notification_center.12"]);
        _globals.global.Notification.requestPermission(function (grant) {
            ['default', 'granted', 'denied'].indexOf(grant) === true;
        });
    } else {
        _globals.global.alert(_globals.MessageHash["notification_center.13"]);
    }
};

module.exports = exports['default'];

},{"../globals":9}],3:[function(require,module,exports){
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

exports.__esModule = true;

var _globals = require('../globals');

exports['default'] = function () {

    _globals.pydio.UI.openComponentInModal('PydioCoreActions', 'PasswordDialog', {
        locked: _globals.pydio.user && _globals.pydio.user.lock === 'pass_change'
    });
};

module.exports = exports['default'];

},{"../globals":9}],4:[function(require,module,exports){
"use strict";

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

},{}],5:[function(require,module,exports){
/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

exports.__esModule = true;
exports['default'] = toggleBookmarkNode;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _globals = require("../globals");

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

function toggleBookmarkNode(node, selection) {

    var isBookmarked = node.getMetadata().get('bookmark') === 'true';
    var nodeUuid = node.getMetadata().get('uuid');
    var userId = _globals.pydio.user.id;

    var api = new _pydioHttpRestApi.UserMetaServiceApi(_pydioHttpApi2['default'].getRestClient());
    var request = new _pydioHttpRestApi.IdmUpdateUserMetaRequest();
    if (isBookmarked) {
        var searchRequest = new _pydioHttpRestApi.IdmSearchUserMetaRequest();
        searchRequest.NodeUuids = [nodeUuid];
        searchRequest.Namespace = "bookmark";
        return api.searchUserMeta(searchRequest).then(function (res) {
            if (res.Metadatas && res.Metadatas.length) {
                request.Operation = _pydioHttpRestApi.UpdateUserMetaRequestUserMetaOp.constructFromObject('DELETE');
                request.MetaDatas = res.Metadatas;
                api.updateUserMeta(request).then(function () {
                    if (selection) {
                        selection.requireNodeReload(node);
                    }
                    _globals.pydio.notify("reload-bookmarks");
                });
            }
        });
    } else {
        request.Operation = _pydioHttpRestApi.UpdateUserMetaRequestUserMetaOp.constructFromObject('PUT');
        var userMeta = new _pydioHttpRestApi.IdmUserMeta();
        userMeta.NodeUuid = nodeUuid;
        userMeta.Namespace = "bookmark";
        userMeta.JsonValue = "\"true\"";
        userMeta.Policies = [_pydioHttpRestApi.ServiceResourcePolicy.constructFromObject({ Resource: nodeUuid, Action: 'OWNER', Subject: 'user:' + userId, Effect: 'allow' }), _pydioHttpRestApi.ServiceResourcePolicy.constructFromObject({ Resource: nodeUuid, Action: 'READ', Subject: 'user:' + userId, Effect: 'allow' }), _pydioHttpRestApi.ServiceResourcePolicy.constructFromObject({ Resource: nodeUuid, Action: 'WRITE', Subject: 'user:' + userId, Effect: 'allow' })];
        request.MetaDatas = [userMeta];
        return api.updateUserMeta(request).then(function () {
            if (selection) {
                selection.requireNodeReload(node);
            }
            _globals.pydio.notify("reload-bookmarks");
        });
    }
}

module.exports = exports['default'];

},{"../globals":9,"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api"}],6:[function(require,module,exports){
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

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _globals = require('../globals');

var _toggleBmNode = require('./toggleBmNode');

var _toggleBmNode2 = _interopRequireDefault(_toggleBmNode);

exports['default'] = function () {
    var selection = _globals.pydio.getContextHolder();
    if (selection.isEmpty() || !selection.isUnique()) {
        return;
    }
    _toggleBmNode2['default'](selection.getUniqueNode(), selection);
};

module.exports = exports['default'];

},{"../globals":9,"./toggleBmNode":5}],7:[function(require,module,exports){
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

exports.__esModule = true;

var _globals = require('../globals');

var _materialUi = require('material-ui');

var React = require('react');
var PydioApi = require('pydio/http/api');
var BootUI = require('pydio/http/resources-manager').requireLib('boot');
var ActionDialogMixin = BootUI.ActionDialogMixin;
var SubmitButtonProviderMixin = BootUI.SubmitButtonProviderMixin;
var CancelButtonProviderMixin = BootUI.CancelButtonProviderMixin;
var AsyncComponent = BootUI.AsyncComponent;

var PasswordDialog = React.createClass({
    displayName: 'PasswordDialog',

    mixins: [ActionDialogMixin],
    getInitialState: function getInitialState() {
        return { passValid: false };
    },
    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: _globals.pydio.MessageHash[194],
            dialogIsModal: true,
            dialogSize: 'sm'
        };
    },
    getButtons: function getButtons() {
        var _this = this;

        var updater = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        if (updater) this._updater = updater;
        var buttons = [];
        if (!this.props.locked) {
            buttons.push(React.createElement(_materialUi.FlatButton, { label: this.props.pydio.MessageHash[49], onTouchTap: function () {
                    return _this.dismiss();
                } }));
        }
        buttons.push(React.createElement(_materialUi.FlatButton, { label: this.props.pydio.MessageHash[48], onTouchTap: this.submit.bind(this), disabled: !this.state.passValid }));
        return buttons;
    },

    submit: function submit() {
        if (!this.state.passValid) {
            return false;
        }
        this.refs.passwordForm.instance.post((function (value) {
            if (value) this.dismiss();
        }).bind(this));
    },
    passValidStatusChange: function passValidStatusChange(status) {
        var _this2 = this;

        this.setState({ passValid: status }, function () {
            _this2._updater(_this2.getButtons());
        });
    },

    render: function render() {

        return React.createElement(AsyncComponent, {
            namespace: 'UserAccount',
            componentName: 'PasswordForm',
            pydio: this.props.pydio,
            ref: 'passwordForm',
            onValidStatusChange: this.passValidStatusChange
        });
    }

});

exports['default'] = PasswordDialog;
module.exports = exports['default'];

},{"../globals":9,"material-ui":"material-ui","pydio/http/api":"pydio/http/api","pydio/http/resources-manager":"pydio/http/resources-manager","react":"react"}],8:[function(require,module,exports){
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

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require("pydio");

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _reactMarkdown = require("react-markdown");

var _reactMarkdown2 = _interopRequireDefault(_reactMarkdown);

var _Pydio$requireLib = _pydio2["default"].requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var SubmitButtonProviderMixin = _Pydio$requireLib.SubmitButtonProviderMixin;
var Loader = _Pydio$requireLib.Loader;

var mdStyle = "\n.credits-md h4 {\n    padding-top: 0;\n}\n\n.credits-md h5 {\n    font-weight: 500;\n}\n\n.credits-md ul {\n    padding-left: 20px;\n    padding-bottom: 20px;\n}\n\n.credits-md li {\n    list-style-type: square;\n    line-height: 1.6em;\n}\n\n.credits-md a {\n    color: #607D8B;\n    font-weight: 500;\n}\n";

var SplashDialog = _react2["default"].createClass({
    displayName: "SplashDialog",

    mixins: [ActionDialogMixin, SubmitButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogSize: 'lg',
            dialogIsModal: false,
            dialogPadding: false,
            dialogScrollBody: true
        };
    },
    submit: function submit() {
        this.dismiss();
    },

    openDocs: function openDocs() {
        open("https://pydio.com/en/docs");
    },

    openForum: function openForum() {
        open("https://forum.pydio.com");
    },

    openGithub: function openGithub() {
        open("https://github.com/pydio/cells/issues");
    },

    getInitialState: function getInitialState() {
        return { aboutContent: null };
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        var url = pydio.Parameters.get('FRONTEND_URL') + '/plug/gui.ajax/credits.md';
        window.fetch(url, {
            method: 'GET',
            credentials: 'same-origin'
        }).then(function (response) {
            response.text().then(function (data) {
                _this.setState({ aboutContent: data });
            });
        });
    },

    render: function render() {
        var credit = undefined;
        if (this.state.aboutContent) {
            credit = _react2["default"].createElement(_reactMarkdown2["default"], { source: this.state.aboutContent });
        } else {
            credit = _react2["default"].createElement(Loader, { style: { minHeight: 200 } });
        }
        credit = _react2["default"].createElement(
            _materialUi.Card,
            null,
            _react2["default"].createElement(_materialUi.CardTitle, {
                title: pydio.Parameters.get('backend')['PackageLabel'],
                subtitle: "Details about version, licensing and how to get help"
            }),
            _react2["default"].createElement(_materialUi.Divider, null),
            _react2["default"].createElement(
                _materialUi.CardActions,
                { style: { display: 'flex', alignItems: 'center' } },
                _react2["default"].createElement(_materialUi.FlatButton, { primary: true, icon: _react2["default"].createElement(_materialUi.FontIcon, { className: "mdi mdi-book-variant" }), label: "Docs", onTouchTap: this.openDocs }),
                _react2["default"].createElement(_materialUi.FlatButton, { primary: true, icon: _react2["default"].createElement(_materialUi.FontIcon, { className: "mdi mdi-slack" }), label: "Forums", onTouchTap: this.openForum }),
                _react2["default"].createElement(_materialUi.FlatButton, { primary: true, icon: _react2["default"].createElement(_materialUi.FontIcon, { className: "mdi mdi-github-box" }), label: "Issues", onTouchTap: this.openGithub }),
                _react2["default"].createElement("span", { style: { flex: 1 } }),
                _react2["default"].createElement(_materialUi.IconButton, { style: { width: 40, height: 40, padding: 8 }, iconStyle: { color: '#FF786A' }, iconClassName: "icomoon-cells", onTouchTap: function () {
                        open('https://pydio.com/?from=cells');
                    }, tooltip: "Pydio.com" }),
                _react2["default"].createElement(_materialUi.IconButton, { style: { width: 40, height: 40, padding: 8 }, iconStyle: { color: '#3b5998' }, iconClassName: "mdi mdi-facebook-box", onTouchTap: function () {
                        open('https://facebook.com/Pydio');
                    }, tooltip: "@Pydio" }),
                _react2["default"].createElement(_materialUi.IconButton, { style: { width: 40, height: 40, padding: 8 }, iconStyle: { color: '#00acee' }, iconClassName: "mdi mdi-twitter-box", onTouchTap: function () {
                        open('https://twitter.com/pydio');
                    }, tooltip: "@pydio" })
            ),
            _react2["default"].createElement(_materialUi.Divider, null),
            _react2["default"].createElement(
                _materialUi.CardText,
                { className: "credits-md" },
                credit
            ),
            _react2["default"].createElement("style", { type: "text/css", dangerouslySetInnerHTML: { __html: mdStyle } })
        );
        return _react2["default"].createElement(
            "div",
            { style: { height: '100%', backgroundColor: '#CFD8DC' } },
            credit
        );
    }

});

exports["default"] = SplashDialog;
module.exports = exports["default"];

},{"material-ui":"material-ui","pydio":"pydio","react":"react","react-markdown":"react-markdown"}],9:[function(require,module,exports){
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

exports.__esModule = true;
var global = window;
var pydio = global.pydio;
var MessageHash = pydio.MessageHash;
exports.global = global;
exports.pydio = pydio;
exports.MessageHash = MessageHash;

},{}],10:[function(require,module,exports){
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

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _dialogSplashDialog = require('./dialog/SplashDialog');

var _dialogSplashDialog2 = _interopRequireDefault(_dialogSplashDialog);

var _dialogPasswordDialog = require('./dialog/PasswordDialog');

var _dialogPasswordDialog2 = _interopRequireDefault(_dialogPasswordDialog);

var _callbacksBookmarkButton = require('./callbacks/BookmarkButton');

var _callbacksBookmarkButton2 = _interopRequireDefault(_callbacksBookmarkButton);

var Callbacks = {
    switchLanguage: require('./callbacks/switchLanguage'),
    changePass: require('./callbacks/changePass'),
    toggleBookmark: require('./callbacks/toggleBookmark'),
    activateDesktopNotifications: require('./callbacks/activateDesktopNotifications')
};

var Navigation = {
    splash: require('./navigation/splash'),
    up: require('./navigation/up'),
    refresh: require('./navigation/refresh'),
    externalSelection: require('./navigation/externalSelection'),
    openGoPro: require('./navigation/openGoPro'),
    switchToSettings: require('./navigation/switchToSettings'),
    switchToHomepage: require('./navigation/switchToHomepage')
};

exports.Callbacks = Callbacks;
exports.Navigation = Navigation;
exports.SplashDialog = _dialogSplashDialog2['default'];
exports.PasswordDialog = _dialogPasswordDialog2['default'];
exports.BookmarkButton = _callbacksBookmarkButton2['default'];

},{"./callbacks/BookmarkButton":1,"./callbacks/activateDesktopNotifications":2,"./callbacks/changePass":3,"./callbacks/switchLanguage":4,"./callbacks/toggleBookmark":6,"./dialog/PasswordDialog":7,"./dialog/SplashDialog":8,"./navigation/externalSelection":11,"./navigation/openGoPro":12,"./navigation/refresh":13,"./navigation/splash":14,"./navigation/switchToHomepage":15,"./navigation/switchToSettings":16,"./navigation/up":17}],11:[function(require,module,exports){
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

exports.__esModule = true;

var _globals = require('../globals');

exports['default'] = function () {

    var userSelection = _globals.pydio.getUserSelection();
    if (userSelection.isUnique() && !userSelection.hasDir()) {
        var fileName = userSelection.getUniqueFileName();
        var selectorData = _globals.pydio.getController().selectorData;
        if (selectorData.get('type') == "ckeditor") {
            var ckData = selectorData.get('data');
            if (ckData['CKEditorFuncNum']) {
                var imagePath = fileName;
                if (ckData['relative_path']) {
                    imagePath = ckData['relative_path'] + fileName;
                }
                _globals.global.opener.CKEDITOR.tools.callFunction(ckData['CKEditorFuncNum'], imagePath);
                _globals.global.close();
            }
        }
    }
};

module.exports = exports['default'];

},{"../globals":9}],12:[function(require,module,exports){
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

exports.__esModule = true;

var _globals = require('../globals');

exports['default'] = function () {
  _globals.global.open('https://pydio.com/en/go-pro?referrer=settings');
};

module.exports = exports['default'];

},{"../globals":9}],13:[function(require,module,exports){
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

exports.__esModule = true;

var _globals = require('../globals');

exports['default'] = function () {

  _globals.pydio.fireContextRefresh();
};

module.exports = exports['default'];

},{"../globals":9}],14:[function(require,module,exports){
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

exports.__esModule = true;

var _globals = require('../globals');

exports['default'] = function () {

  _globals.pydio.UI.openComponentInModal('PydioCoreActions', 'SplashDialog');
};

module.exports = exports['default'];

},{"../globals":9}],15:[function(require,module,exports){
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

exports.__esModule = true;

var _globals = require('../globals');

exports['default'] = function () {

    if (!_globals.pydio.repositoryId || _globals.pydio.repositoryId !== "homepage") {
        _globals.pydio.triggerRepositoryChange('homepage');
    }
};

module.exports = exports['default'];

},{"../globals":9}],16:[function(require,module,exports){
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

exports.__esModule = true;

var _globals = require('../globals');

exports['default'] = function () {

    if (!_globals.pydio.repositoryId || _globals.pydio.repositoryId !== "settings") {
        _globals.pydio.triggerRepositoryChange('settings');
    }
};

module.exports = exports['default'];

},{"../globals":9}],17:[function(require,module,exports){
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

exports.__esModule = true;

var _globals = require('../globals');

exports['default'] = function () {

  _globals.pydio.fireContextUp();
};

module.exports = exports['default'];

},{"../globals":9}]},{},[10])(10)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvdWkvQ29yZUFjdGlvbnMvY2FsbGJhY2tzL0Jvb2ttYXJrQnV0dG9uLmpzIiwicmVzL2J1aWxkL3VpL0NvcmVBY3Rpb25zL2NhbGxiYWNrcy9hY3RpdmF0ZURlc2t0b3BOb3RpZmljYXRpb25zLmpzIiwicmVzL2J1aWxkL3VpL0NvcmVBY3Rpb25zL2NhbGxiYWNrcy9jaGFuZ2VQYXNzLmpzIiwicmVzL2J1aWxkL3VpL0NvcmVBY3Rpb25zL2NhbGxiYWNrcy9zd2l0Y2hMYW5ndWFnZS5qcyIsInJlcy9idWlsZC91aS9Db3JlQWN0aW9ucy9jYWxsYmFja3MvdG9nZ2xlQm1Ob2RlLmpzIiwicmVzL2J1aWxkL3VpL0NvcmVBY3Rpb25zL2NhbGxiYWNrcy90b2dnbGVCb29rbWFyay5qcyIsInJlcy9idWlsZC91aS9Db3JlQWN0aW9ucy9kaWFsb2cvUGFzc3dvcmREaWFsb2cuanMiLCJyZXMvYnVpbGQvdWkvQ29yZUFjdGlvbnMvZGlhbG9nL1NwbGFzaERpYWxvZy5qcyIsInJlcy9idWlsZC91aS9Db3JlQWN0aW9ucy9nbG9iYWxzLmpzIiwicmVzL2J1aWxkL3VpL0NvcmVBY3Rpb25zL2luZGV4LmpzIiwicmVzL2J1aWxkL3VpL0NvcmVBY3Rpb25zL25hdmlnYXRpb24vZXh0ZXJuYWxTZWxlY3Rpb24uanMiLCJyZXMvYnVpbGQvdWkvQ29yZUFjdGlvbnMvbmF2aWdhdGlvbi9vcGVuR29Qcm8uanMiLCJyZXMvYnVpbGQvdWkvQ29yZUFjdGlvbnMvbmF2aWdhdGlvbi9yZWZyZXNoLmpzIiwicmVzL2J1aWxkL3VpL0NvcmVBY3Rpb25zL25hdmlnYXRpb24vc3BsYXNoLmpzIiwicmVzL2J1aWxkL3VpL0NvcmVBY3Rpb25zL25hdmlnYXRpb24vc3dpdGNoVG9Ib21lcGFnZS5qcyIsInJlcy9idWlsZC91aS9Db3JlQWN0aW9ucy9uYXZpZ2F0aW9uL3N3aXRjaFRvU2V0dGluZ3MuanMiLCJyZXMvYnVpbGQvdWkvQ29yZUFjdGlvbnMvbmF2aWdhdGlvbi91cC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAyMCBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX3RvZ2dsZUJtTm9kZSA9IHJlcXVpcmUoXCIuL3RvZ2dsZUJtTm9kZVwiKTtcblxudmFyIF90b2dnbGVCbU5vZGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdG9nZ2xlQm1Ob2RlKTtcblxudmFyIEJvb2ttYXJrQnV0dG9uID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEJvb2ttYXJrQnV0dG9uLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEJvb2ttYXJrQnV0dG9uKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBCb29rbWFya0J1dHRvbik7XG5cbiAgICAgICAgX1JlYWN0JENvbXBvbmVudC5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMudmFsdWVGcm9tTm9kZXMocHJvcHMubm9kZXMpO1xuICAgIH1cblxuICAgIEJvb2ttYXJrQnV0dG9uLnByb3RvdHlwZS52YWx1ZUZyb21Ob2RlcyA9IGZ1bmN0aW9uIHZhbHVlRnJvbU5vZGVzKCkge1xuICAgICAgICB2YXIgbm9kZXMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBbXSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgICB2YXIgbWl4ZWQgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgdmFyIG5WYWwgPSBuLmdldE1ldGFkYXRhKCkuZ2V0KCdib29rbWFyaycpID09PSAndHJ1ZSc7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiBuVmFsICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIG1peGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0gblZhbDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7IHZhbHVlOiB2YWx1ZSwgbWl4ZWQ6IG1peGVkIH07XG4gICAgfTtcblxuICAgIEJvb2ttYXJrQnV0dG9uLnByb3RvdHlwZS51cGRhdGVWYWx1ZSA9IGZ1bmN0aW9uIHVwZGF0ZVZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIG5vZGVzID0gdGhpcy5wcm9wcy5ub2RlcztcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2F2aW5nOiB0cnVlIH0pO1xuICAgICAgICB2YXIgcHJvbXMgPSBbXTtcbiAgICAgICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgdmFyIGlzQm9va21hcmtlZCA9IG4uZ2V0TWV0YWRhdGEoKS5nZXQoJ2Jvb2ttYXJrJykgPT09ICd0cnVlJztcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gaXNCb29rbWFya2VkKSB7XG4gICAgICAgICAgICAgICAgcHJvbXMucHVzaChfdG9nZ2xlQm1Ob2RlMlsnZGVmYXVsdCddKG4pKTtcbiAgICAgICAgICAgICAgICB2YXIgb3ZlcmxheSA9IG4uZ2V0TWV0YWRhdGEoKS5nZXQoJ292ZXJsYXlfY2xhc3MnKSB8fCAnJztcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbi5nZXRNZXRhZGF0YSgpLnNldCgnYm9va21hcmsnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgb3ZlcmxheXMgPSBvdmVybGF5LnJlcGxhY2UoJ21kaSBtZGktc3RhcicsICcnKS5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICBvdmVybGF5cy5wdXNoKCdtZGkgbWRpLXN0YXInKTtcbiAgICAgICAgICAgICAgICAgICAgbi5nZXRNZXRhZGF0YSgpLnNldCgnb3ZlcmxheV9jbGFzcycsIG92ZXJsYXlzLmpvaW4oJywnKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbi5nZXRNZXRhZGF0YSgpWydkZWxldGUnXSgnYm9va21hcmsnKTtcbiAgICAgICAgICAgICAgICAgICAgbi5nZXRNZXRhZGF0YSgpLnNldCgnb3ZlcmxheV9jbGFzcycsIG92ZXJsYXkucmVwbGFjZSgnbWRpIG1kaS1zdGFyJywgJycpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbi5ub3RpZnkoJ25vZGVfcmVwbGFjZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFByb21pc2UuYWxsKHByb21zKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHNhdmluZzogZmFsc2UgfSk7XG4gICAgICAgICAgICB9LCAyNTApO1xuICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoX3RoaXMudmFsdWVGcm9tTm9kZXMobm9kZXMpKTtcbiAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBzYXZpbmc6IGZhbHNlIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgQm9va21hcmtCdXR0b24ucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHN0eWxlcyA9IHRoaXMucHJvcHMuc3R5bGVzO1xuICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgdmFyIHZhbHVlID0gX3N0YXRlLnZhbHVlO1xuICAgICAgICB2YXIgbWl4ZWQgPSBfc3RhdGUubWl4ZWQ7XG4gICAgICAgIHZhciBzYXZpbmcgPSBfc3RhdGUuc2F2aW5nO1xuXG4gICAgICAgIHZhciBpY29uID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgdG91Y2hWYWx1ZSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHR0ID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgZGlzYWJsZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBtbSA9IF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpLk1lc3NhZ2VIYXNoO1xuICAgICAgICBpZiAobWl4ZWQpIHtcbiAgICAgICAgICAgIGljb24gPSAnc3Rhci1oYWxmJztcbiAgICAgICAgICAgIHRvdWNoVmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgdHQgPSBtbVsnYm9va21hcmsuYnV0dG9uLnRpcC5taXhlZCddO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICBpY29uID0gJ3N0YXInO1xuICAgICAgICAgICAgdG91Y2hWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdHQgPSBtbVsnYm9va21hcmsuYnV0dG9uLnRpcC5yZW1vdmUnXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGljb24gPSAnc3Rhci1vdXRsaW5lJztcbiAgICAgICAgICAgIHRvdWNoVmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgdHQgPSBtbVsnYm9va21hcmsuYnV0dG9uLnRpcC5hZGQnXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzYXZpbmcpIHtcbiAgICAgICAgICAgIGljb24gPSAnc3Rhci1jaXJjbGUnO1xuICAgICAgICAgICAgdHQgPSBtbVsnYm9va21hcmsuYnV0dG9uLnRpcC5zYXZpbmcnXTtcbiAgICAgICAgICAgIGRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCBfZXh0ZW5kcyh7IGRpc2FibGVkOiBkaXNhYmxlZCwgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktJyArIGljb24sIHRvb2x0aXA6IHR0LCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMi51cGRhdGVWYWx1ZSh0b3VjaFZhbHVlKTtcbiAgICAgICAgICAgIH0gfSwgc3R5bGVzKSk7XG4gICAgfTtcblxuICAgIHJldHVybiBCb29rbWFya0J1dHRvbjtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBCb29rbWFya0J1dHRvbjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKF9nbG9iYWxzLmdsb2JhbC5Ob3RpZmljYXRpb24pIHtcbiAgICAgICAgYWxlcnQoX2dsb2JhbHMuTWVzc2FnZUhhc2hbXCJub3RpZmljYXRpb25fY2VudGVyLjEyXCJdKTtcbiAgICAgICAgX2dsb2JhbHMuZ2xvYmFsLk5vdGlmaWNhdGlvbi5yZXF1ZXN0UGVybWlzc2lvbihmdW5jdGlvbiAoZ3JhbnQpIHtcbiAgICAgICAgICAgIFsnZGVmYXVsdCcsICdncmFudGVkJywgJ2RlbmllZCddLmluZGV4T2YoZ3JhbnQpID09PSB0cnVlO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBfZ2xvYmFscy5nbG9iYWwuYWxlcnQoX2dsb2JhbHMuTWVzc2FnZUhhc2hbXCJub3RpZmljYXRpb25fY2VudGVyLjEzXCJdKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2dsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIF9nbG9iYWxzLnB5ZGlvLlVJLm9wZW5Db21wb25lbnRJbk1vZGFsKCdQeWRpb0NvcmVBY3Rpb25zJywgJ1Bhc3N3b3JkRGlhbG9nJywge1xuICAgICAgICBsb2NrZWQ6IF9nbG9iYWxzLnB5ZGlvLnVzZXIgJiYgX2dsb2JhbHMucHlkaW8udXNlci5sb2NrID09PSAncGFzc19jaGFuZ2UnXG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAyMCBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzWydkZWZhdWx0J10gPSB0b2dnbGVCb29rbWFya05vZGU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9nbG9iYWxzID0gcmVxdWlyZShcIi4uL2dsb2JhbHNcIik7XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG5mdW5jdGlvbiB0b2dnbGVCb29rbWFya05vZGUobm9kZSwgc2VsZWN0aW9uKSB7XG5cbiAgICB2YXIgaXNCb29rbWFya2VkID0gbm9kZS5nZXRNZXRhZGF0YSgpLmdldCgnYm9va21hcmsnKSA9PT0gJ3RydWUnO1xuICAgIHZhciBub2RlVXVpZCA9IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3V1aWQnKTtcbiAgICB2YXIgdXNlcklkID0gX2dsb2JhbHMucHlkaW8udXNlci5pZDtcblxuICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuVXNlck1ldGFTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5JZG1VcGRhdGVVc2VyTWV0YVJlcXVlc3QoKTtcbiAgICBpZiAoaXNCb29rbWFya2VkKSB7XG4gICAgICAgIHZhciBzZWFyY2hSZXF1ZXN0ID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLklkbVNlYXJjaFVzZXJNZXRhUmVxdWVzdCgpO1xuICAgICAgICBzZWFyY2hSZXF1ZXN0Lk5vZGVVdWlkcyA9IFtub2RlVXVpZF07XG4gICAgICAgIHNlYXJjaFJlcXVlc3QuTmFtZXNwYWNlID0gXCJib29rbWFya1wiO1xuICAgICAgICByZXR1cm4gYXBpLnNlYXJjaFVzZXJNZXRhKHNlYXJjaFJlcXVlc3QpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgaWYgKHJlcy5NZXRhZGF0YXMgJiYgcmVzLk1ldGFkYXRhcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0Lk9wZXJhdGlvbiA9IF9weWRpb0h0dHBSZXN0QXBpLlVwZGF0ZVVzZXJNZXRhUmVxdWVzdFVzZXJNZXRhT3AuY29uc3RydWN0RnJvbU9iamVjdCgnREVMRVRFJyk7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5NZXRhRGF0YXMgPSByZXMuTWV0YWRhdGFzO1xuICAgICAgICAgICAgICAgIGFwaS51cGRhdGVVc2VyTWV0YShyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uLnJlcXVpcmVOb2RlUmVsb2FkKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF9nbG9iYWxzLnB5ZGlvLm5vdGlmeShcInJlbG9hZC1ib29rbWFya3NcIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcXVlc3QuT3BlcmF0aW9uID0gX3B5ZGlvSHR0cFJlc3RBcGkuVXBkYXRlVXNlck1ldGFSZXF1ZXN0VXNlck1ldGFPcC5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdQVVQnKTtcbiAgICAgICAgdmFyIHVzZXJNZXRhID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLklkbVVzZXJNZXRhKCk7XG4gICAgICAgIHVzZXJNZXRhLk5vZGVVdWlkID0gbm9kZVV1aWQ7XG4gICAgICAgIHVzZXJNZXRhLk5hbWVzcGFjZSA9IFwiYm9va21hcmtcIjtcbiAgICAgICAgdXNlck1ldGEuSnNvblZhbHVlID0gXCJcXFwidHJ1ZVxcXCJcIjtcbiAgICAgICAgdXNlck1ldGEuUG9saWNpZXMgPSBbX3B5ZGlvSHR0cFJlc3RBcGkuU2VydmljZVJlc291cmNlUG9saWN5LmNvbnN0cnVjdEZyb21PYmplY3QoeyBSZXNvdXJjZTogbm9kZVV1aWQsIEFjdGlvbjogJ09XTkVSJywgU3ViamVjdDogJ3VzZXI6JyArIHVzZXJJZCwgRWZmZWN0OiAnYWxsb3cnIH0pLCBfcHlkaW9IdHRwUmVzdEFwaS5TZXJ2aWNlUmVzb3VyY2VQb2xpY3kuY29uc3RydWN0RnJvbU9iamVjdCh7IFJlc291cmNlOiBub2RlVXVpZCwgQWN0aW9uOiAnUkVBRCcsIFN1YmplY3Q6ICd1c2VyOicgKyB1c2VySWQsIEVmZmVjdDogJ2FsbG93JyB9KSwgX3B5ZGlvSHR0cFJlc3RBcGkuU2VydmljZVJlc291cmNlUG9saWN5LmNvbnN0cnVjdEZyb21PYmplY3QoeyBSZXNvdXJjZTogbm9kZVV1aWQsIEFjdGlvbjogJ1dSSVRFJywgU3ViamVjdDogJ3VzZXI6JyArIHVzZXJJZCwgRWZmZWN0OiAnYWxsb3cnIH0pXTtcbiAgICAgICAgcmVxdWVzdC5NZXRhRGF0YXMgPSBbdXNlck1ldGFdO1xuICAgICAgICByZXR1cm4gYXBpLnVwZGF0ZVVzZXJNZXRhKHJlcXVlc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHNlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5yZXF1aXJlTm9kZVJlbG9hZChub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9nbG9iYWxzLnB5ZGlvLm5vdGlmeShcInJlbG9hZC1ib29rbWFya3NcIik7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9nbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG52YXIgX3RvZ2dsZUJtTm9kZSA9IHJlcXVpcmUoJy4vdG9nZ2xlQm1Ob2RlJyk7XG5cbnZhciBfdG9nZ2xlQm1Ob2RlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3RvZ2dsZUJtTm9kZSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZWN0aW9uID0gX2dsb2JhbHMucHlkaW8uZ2V0Q29udGV4dEhvbGRlcigpO1xuICAgIGlmIChzZWxlY3Rpb24uaXNFbXB0eSgpIHx8ICFzZWxlY3Rpb24uaXNVbmlxdWUoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIF90b2dnbGVCbU5vZGUyWydkZWZhdWx0J10oc2VsZWN0aW9uLmdldFVuaXF1ZU5vZGUoKSwgc2VsZWN0aW9uKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQeWRpb0FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG52YXIgQm9vdFVJID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXNvdXJjZXMtbWFuYWdlcicpLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcbnZhciBBY3Rpb25EaWFsb2dNaXhpbiA9IEJvb3RVSS5BY3Rpb25EaWFsb2dNaXhpbjtcbnZhciBTdWJtaXRCdXR0b25Qcm92aWRlck1peGluID0gQm9vdFVJLlN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW47XG52YXIgQ2FuY2VsQnV0dG9uUHJvdmlkZXJNaXhpbiA9IEJvb3RVSS5DYW5jZWxCdXR0b25Qcm92aWRlck1peGluO1xudmFyIEFzeW5jQ29tcG9uZW50ID0gQm9vdFVJLkFzeW5jQ29tcG9uZW50O1xuXG52YXIgUGFzc3dvcmREaWFsb2cgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdQYXNzd29yZERpYWxvZycsXG5cbiAgICBtaXhpbnM6IFtBY3Rpb25EaWFsb2dNaXhpbl0sXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IHBhc3NWYWxpZDogZmFsc2UgfTtcbiAgICB9LFxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6IF9nbG9iYWxzLnB5ZGlvLk1lc3NhZ2VIYXNoWzE5NF0sXG4gICAgICAgICAgICBkaWFsb2dJc01vZGFsOiB0cnVlLFxuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ3NtJ1xuICAgICAgICB9O1xuICAgIH0sXG4gICAgZ2V0QnV0dG9uczogZnVuY3Rpb24gZ2V0QnV0dG9ucygpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgdXBkYXRlciA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgaWYgKHVwZGF0ZXIpIHRoaXMuX3VwZGF0ZXIgPSB1cGRhdGVyO1xuICAgICAgICB2YXIgYnV0dG9ucyA9IFtdO1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMubG9ja2VkKSB7XG4gICAgICAgICAgICBidXR0b25zLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGxhYmVsOiB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoWzQ5XSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZGlzbWlzcygpO1xuICAgICAgICAgICAgICAgIH0gfSkpO1xuICAgICAgICB9XG4gICAgICAgIGJ1dHRvbnMucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgbGFiZWw6IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbNDhdLCBvblRvdWNoVGFwOiB0aGlzLnN1Ym1pdC5iaW5kKHRoaXMpLCBkaXNhYmxlZDogIXRoaXMuc3RhdGUucGFzc1ZhbGlkIH0pKTtcbiAgICAgICAgcmV0dXJuIGJ1dHRvbnM7XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUucGFzc1ZhbGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWZzLnBhc3N3b3JkRm9ybS5pbnN0YW5jZS5wb3N0KChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgdGhpcy5kaXNtaXNzKCk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgIH0sXG4gICAgcGFzc1ZhbGlkU3RhdHVzQ2hhbmdlOiBmdW5jdGlvbiBwYXNzVmFsaWRTdGF0dXNDaGFuZ2Uoc3RhdHVzKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwYXNzVmFsaWQ6IHN0YXR1cyB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpczIuX3VwZGF0ZXIoX3RoaXMyLmdldEJ1dHRvbnMoKSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChBc3luY0NvbXBvbmVudCwge1xuICAgICAgICAgICAgbmFtZXNwYWNlOiAnVXNlckFjY291bnQnLFxuICAgICAgICAgICAgY29tcG9uZW50TmFtZTogJ1Bhc3N3b3JkRm9ybScsXG4gICAgICAgICAgICBweWRpbzogdGhpcy5wcm9wcy5weWRpbyxcbiAgICAgICAgICAgIHJlZjogJ3Bhc3N3b3JkRm9ybScsXG4gICAgICAgICAgICBvblZhbGlkU3RhdHVzQ2hhbmdlOiB0aGlzLnBhc3NWYWxpZFN0YXR1c0NoYW5nZVxuICAgICAgICB9KTtcbiAgICB9XG5cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBQYXNzd29yZERpYWxvZztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZShcInB5ZGlvXCIpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9yZWFjdE1hcmtkb3duID0gcmVxdWlyZShcInJlYWN0LW1hcmtkb3duXCIpO1xuXG52YXIgX3JlYWN0TWFya2Rvd24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3RNYXJrZG93bik7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbXCJkZWZhdWx0XCJdLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcblxudmFyIEFjdGlvbkRpYWxvZ01peGluID0gX1B5ZGlvJHJlcXVpcmVMaWIuQWN0aW9uRGlhbG9nTWl4aW47XG52YXIgU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbiA9IF9QeWRpbyRyZXF1aXJlTGliLlN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW47XG52YXIgTG9hZGVyID0gX1B5ZGlvJHJlcXVpcmVMaWIuTG9hZGVyO1xuXG52YXIgbWRTdHlsZSA9IFwiXFxuLmNyZWRpdHMtbWQgaDQge1xcbiAgICBwYWRkaW5nLXRvcDogMDtcXG59XFxuXFxuLmNyZWRpdHMtbWQgaDUge1xcbiAgICBmb250LXdlaWdodDogNTAwO1xcbn1cXG5cXG4uY3JlZGl0cy1tZCB1bCB7XFxuICAgIHBhZGRpbmctbGVmdDogMjBweDtcXG4gICAgcGFkZGluZy1ib3R0b206IDIwcHg7XFxufVxcblxcbi5jcmVkaXRzLW1kIGxpIHtcXG4gICAgbGlzdC1zdHlsZS10eXBlOiBzcXVhcmU7XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjZlbTtcXG59XFxuXFxuLmNyZWRpdHMtbWQgYSB7XFxuICAgIGNvbG9yOiAjNjA3RDhCO1xcbiAgICBmb250LXdlaWdodDogNTAwO1xcbn1cXG5cIjtcblxudmFyIFNwbGFzaERpYWxvZyA9IF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogXCJTcGxhc2hEaWFsb2dcIixcblxuICAgIG1peGluczogW0FjdGlvbkRpYWxvZ01peGluLCBTdWJtaXRCdXR0b25Qcm92aWRlck1peGluXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6ICcnLFxuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ2xnJyxcbiAgICAgICAgICAgIGRpYWxvZ0lzTW9kYWw6IGZhbHNlLFxuICAgICAgICAgICAgZGlhbG9nUGFkZGluZzogZmFsc2UsXG4gICAgICAgICAgICBkaWFsb2dTY3JvbGxCb2R5OiB0cnVlXG4gICAgICAgIH07XG4gICAgfSxcbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdGhpcy5kaXNtaXNzKCk7XG4gICAgfSxcblxuICAgIG9wZW5Eb2NzOiBmdW5jdGlvbiBvcGVuRG9jcygpIHtcbiAgICAgICAgb3BlbihcImh0dHBzOi8vcHlkaW8uY29tL2VuL2RvY3NcIik7XG4gICAgfSxcblxuICAgIG9wZW5Gb3J1bTogZnVuY3Rpb24gb3BlbkZvcnVtKCkge1xuICAgICAgICBvcGVuKFwiaHR0cHM6Ly9mb3J1bS5weWRpby5jb21cIik7XG4gICAgfSxcblxuICAgIG9wZW5HaXRodWI6IGZ1bmN0aW9uIG9wZW5HaXRodWIoKSB7XG4gICAgICAgIG9wZW4oXCJodHRwczovL2dpdGh1Yi5jb20vcHlkaW8vY2VsbHMvaXNzdWVzXCIpO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgYWJvdXRDb250ZW50OiBudWxsIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgdXJsID0gcHlkaW8uUGFyYW1ldGVycy5nZXQoJ0ZST05URU5EX1VSTCcpICsgJy9wbHVnL2d1aS5hamF4L2NyZWRpdHMubWQnO1xuICAgICAgICB3aW5kb3cuZmV0Y2godXJsLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbidcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlLnRleHQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBhYm91dENvbnRlbnQ6IGRhdGEgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgY3JlZGl0ID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5hYm91dENvbnRlbnQpIHtcbiAgICAgICAgICAgIGNyZWRpdCA9IF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX3JlYWN0TWFya2Rvd24yW1wiZGVmYXVsdFwiXSwgeyBzb3VyY2U6IHRoaXMuc3RhdGUuYWJvdXRDb250ZW50IH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3JlZGl0ID0gX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChMb2FkZXIsIHsgc3R5bGU6IHsgbWluSGVpZ2h0OiAyMDAgfSB9KTtcbiAgICAgICAgfVxuICAgICAgICBjcmVkaXQgPSBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgX21hdGVyaWFsVWkuQ2FyZCxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkNhcmRUaXRsZSwge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBweWRpby5QYXJhbWV0ZXJzLmdldCgnYmFja2VuZCcpWydQYWNrYWdlTGFiZWwnXSxcbiAgICAgICAgICAgICAgICBzdWJ0aXRsZTogXCJEZXRhaWxzIGFib3V0IHZlcnNpb24sIGxpY2Vuc2luZyBhbmQgaG93IHRvIGdldCBoZWxwXCJcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKSxcbiAgICAgICAgICAgIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuQ2FyZEFjdGlvbnMsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgcHJpbWFyeTogdHJ1ZSwgaWNvbjogX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6IFwibWRpIG1kaS1ib29rLXZhcmlhbnRcIiB9KSwgbGFiZWw6IFwiRG9jc1wiLCBvblRvdWNoVGFwOiB0aGlzLm9wZW5Eb2NzIH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBwcmltYXJ5OiB0cnVlLCBpY29uOiBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogXCJtZGkgbWRpLXNsYWNrXCIgfSksIGxhYmVsOiBcIkZvcnVtc1wiLCBvblRvdWNoVGFwOiB0aGlzLm9wZW5Gb3J1bSB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgcHJpbWFyeTogdHJ1ZSwgaWNvbjogX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6IFwibWRpIG1kaS1naXRodWItYm94XCIgfSksIGxhYmVsOiBcIklzc3Vlc1wiLCBvblRvdWNoVGFwOiB0aGlzLm9wZW5HaXRodWIgfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcInNwYW5cIiwgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IHN0eWxlOiB7IHdpZHRoOiA0MCwgaGVpZ2h0OiA0MCwgcGFkZGluZzogOCB9LCBpY29uU3R5bGU6IHsgY29sb3I6ICcjRkY3ODZBJyB9LCBpY29uQ2xhc3NOYW1lOiBcImljb21vb24tY2VsbHNcIiwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbignaHR0cHM6Ly9weWRpby5jb20vP2Zyb209Y2VsbHMnKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdG9vbHRpcDogXCJQeWRpby5jb21cIiB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgc3R5bGU6IHsgd2lkdGg6IDQwLCBoZWlnaHQ6IDQwLCBwYWRkaW5nOiA4IH0sIGljb25TdHlsZTogeyBjb2xvcjogJyMzYjU5OTgnIH0sIGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1mYWNlYm9vay1ib3hcIiwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbignaHR0cHM6Ly9mYWNlYm9vay5jb20vUHlkaW8nKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdG9vbHRpcDogXCJAUHlkaW9cIiB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgc3R5bGU6IHsgd2lkdGg6IDQwLCBoZWlnaHQ6IDQwLCBwYWRkaW5nOiA4IH0sIGljb25TdHlsZTogeyBjb2xvcjogJyMwMGFjZWUnIH0sIGljb25DbGFzc05hbWU6IFwibWRpIG1kaS10d2l0dGVyLWJveFwiLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuKCdodHRwczovL3R3aXR0ZXIuY29tL3B5ZGlvJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRvb2x0aXA6IFwiQHB5ZGlvXCIgfSlcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpLFxuICAgICAgICAgICAgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5DYXJkVGV4dCxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJjcmVkaXRzLW1kXCIgfSxcbiAgICAgICAgICAgICAgICBjcmVkaXRcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwic3R5bGVcIiwgeyB0eXBlOiBcInRleHQvY3NzXCIsIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MOiB7IF9faHRtbDogbWRTdHlsZSB9IH0pXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgIHsgc3R5bGU6IHsgaGVpZ2h0OiAnMTAwJScsIGJhY2tncm91bmRDb2xvcjogJyNDRkQ4REMnIH0gfSxcbiAgICAgICAgICAgIGNyZWRpdFxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gU3BsYXNoRGlhbG9nO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG52YXIgZ2xvYmFsID0gd2luZG93O1xudmFyIHB5ZGlvID0gZ2xvYmFsLnB5ZGlvO1xudmFyIE1lc3NhZ2VIYXNoID0gcHlkaW8uTWVzc2FnZUhhc2g7XG5leHBvcnRzLmdsb2JhbCA9IGdsb2JhbDtcbmV4cG9ydHMucHlkaW8gPSBweWRpbztcbmV4cG9ydHMuTWVzc2FnZUhhc2ggPSBNZXNzYWdlSGFzaDtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfZGlhbG9nU3BsYXNoRGlhbG9nID0gcmVxdWlyZSgnLi9kaWFsb2cvU3BsYXNoRGlhbG9nJyk7XG5cbnZhciBfZGlhbG9nU3BsYXNoRGlhbG9nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2RpYWxvZ1NwbGFzaERpYWxvZyk7XG5cbnZhciBfZGlhbG9nUGFzc3dvcmREaWFsb2cgPSByZXF1aXJlKCcuL2RpYWxvZy9QYXNzd29yZERpYWxvZycpO1xuXG52YXIgX2RpYWxvZ1Bhc3N3b3JkRGlhbG9nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2RpYWxvZ1Bhc3N3b3JkRGlhbG9nKTtcblxudmFyIF9jYWxsYmFja3NCb29rbWFya0J1dHRvbiA9IHJlcXVpcmUoJy4vY2FsbGJhY2tzL0Jvb2ttYXJrQnV0dG9uJyk7XG5cbnZhciBfY2FsbGJhY2tzQm9va21hcmtCdXR0b24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2FsbGJhY2tzQm9va21hcmtCdXR0b24pO1xuXG52YXIgQ2FsbGJhY2tzID0ge1xuICAgIHN3aXRjaExhbmd1YWdlOiByZXF1aXJlKCcuL2NhbGxiYWNrcy9zd2l0Y2hMYW5ndWFnZScpLFxuICAgIGNoYW5nZVBhc3M6IHJlcXVpcmUoJy4vY2FsbGJhY2tzL2NoYW5nZVBhc3MnKSxcbiAgICB0b2dnbGVCb29rbWFyazogcmVxdWlyZSgnLi9jYWxsYmFja3MvdG9nZ2xlQm9va21hcmsnKSxcbiAgICBhY3RpdmF0ZURlc2t0b3BOb3RpZmljYXRpb25zOiByZXF1aXJlKCcuL2NhbGxiYWNrcy9hY3RpdmF0ZURlc2t0b3BOb3RpZmljYXRpb25zJylcbn07XG5cbnZhciBOYXZpZ2F0aW9uID0ge1xuICAgIHNwbGFzaDogcmVxdWlyZSgnLi9uYXZpZ2F0aW9uL3NwbGFzaCcpLFxuICAgIHVwOiByZXF1aXJlKCcuL25hdmlnYXRpb24vdXAnKSxcbiAgICByZWZyZXNoOiByZXF1aXJlKCcuL25hdmlnYXRpb24vcmVmcmVzaCcpLFxuICAgIGV4dGVybmFsU2VsZWN0aW9uOiByZXF1aXJlKCcuL25hdmlnYXRpb24vZXh0ZXJuYWxTZWxlY3Rpb24nKSxcbiAgICBvcGVuR29Qcm86IHJlcXVpcmUoJy4vbmF2aWdhdGlvbi9vcGVuR29Qcm8nKSxcbiAgICBzd2l0Y2hUb1NldHRpbmdzOiByZXF1aXJlKCcuL25hdmlnYXRpb24vc3dpdGNoVG9TZXR0aW5ncycpLFxuICAgIHN3aXRjaFRvSG9tZXBhZ2U6IHJlcXVpcmUoJy4vbmF2aWdhdGlvbi9zd2l0Y2hUb0hvbWVwYWdlJylcbn07XG5cbmV4cG9ydHMuQ2FsbGJhY2tzID0gQ2FsbGJhY2tzO1xuZXhwb3J0cy5OYXZpZ2F0aW9uID0gTmF2aWdhdGlvbjtcbmV4cG9ydHMuU3BsYXNoRGlhbG9nID0gX2RpYWxvZ1NwbGFzaERpYWxvZzJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuUGFzc3dvcmREaWFsb2cgPSBfZGlhbG9nUGFzc3dvcmREaWFsb2cyWydkZWZhdWx0J107XG5leHBvcnRzLkJvb2ttYXJrQnV0dG9uID0gX2NhbGxiYWNrc0Jvb2ttYXJrQnV0dG9uMlsnZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHVzZXJTZWxlY3Rpb24gPSBfZ2xvYmFscy5weWRpby5nZXRVc2VyU2VsZWN0aW9uKCk7XG4gICAgaWYgKHVzZXJTZWxlY3Rpb24uaXNVbmlxdWUoKSAmJiAhdXNlclNlbGVjdGlvbi5oYXNEaXIoKSkge1xuICAgICAgICB2YXIgZmlsZU5hbWUgPSB1c2VyU2VsZWN0aW9uLmdldFVuaXF1ZUZpbGVOYW1lKCk7XG4gICAgICAgIHZhciBzZWxlY3RvckRhdGEgPSBfZ2xvYmFscy5weWRpby5nZXRDb250cm9sbGVyKCkuc2VsZWN0b3JEYXRhO1xuICAgICAgICBpZiAoc2VsZWN0b3JEYXRhLmdldCgndHlwZScpID09IFwiY2tlZGl0b3JcIikge1xuICAgICAgICAgICAgdmFyIGNrRGF0YSA9IHNlbGVjdG9yRGF0YS5nZXQoJ2RhdGEnKTtcbiAgICAgICAgICAgIGlmIChja0RhdGFbJ0NLRWRpdG9yRnVuY051bSddKSB7XG4gICAgICAgICAgICAgICAgdmFyIGltYWdlUGF0aCA9IGZpbGVOYW1lO1xuICAgICAgICAgICAgICAgIGlmIChja0RhdGFbJ3JlbGF0aXZlX3BhdGgnXSkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZVBhdGggPSBja0RhdGFbJ3JlbGF0aXZlX3BhdGgnXSArIGZpbGVOYW1lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfZ2xvYmFscy5nbG9iYWwub3BlbmVyLkNLRURJVE9SLnRvb2xzLmNhbGxGdW5jdGlvbihja0RhdGFbJ0NLRWRpdG9yRnVuY051bSddLCBpbWFnZVBhdGgpO1xuICAgICAgICAgICAgICAgIF9nbG9iYWxzLmdsb2JhbC5jbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9nbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoKSB7XG4gIF9nbG9iYWxzLmdsb2JhbC5vcGVuKCdodHRwczovL3B5ZGlvLmNvbS9lbi9nby1wcm8/cmVmZXJyZXI9c2V0dGluZ3MnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gZnVuY3Rpb24gKCkge1xuXG4gIF9nbG9iYWxzLnB5ZGlvLmZpcmVDb250ZXh0UmVmcmVzaCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9nbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoKSB7XG5cbiAgX2dsb2JhbHMucHlkaW8uVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ1B5ZGlvQ29yZUFjdGlvbnMnLCAnU3BsYXNoRGlhbG9nJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2dsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICghX2dsb2JhbHMucHlkaW8ucmVwb3NpdG9yeUlkIHx8IF9nbG9iYWxzLnB5ZGlvLnJlcG9zaXRvcnlJZCAhPT0gXCJob21lcGFnZVwiKSB7XG4gICAgICAgIF9nbG9iYWxzLnB5ZGlvLnRyaWdnZXJSZXBvc2l0b3J5Q2hhbmdlKCdob21lcGFnZScpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKCFfZ2xvYmFscy5weWRpby5yZXBvc2l0b3J5SWQgfHwgX2dsb2JhbHMucHlkaW8ucmVwb3NpdG9yeUlkICE9PSBcInNldHRpbmdzXCIpIHtcbiAgICAgICAgX2dsb2JhbHMucHlkaW8udHJpZ2dlclJlcG9zaXRvcnlDaGFuZ2UoJ3NldHRpbmdzJyk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9nbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoKSB7XG5cbiAgX2dsb2JhbHMucHlkaW8uZmlyZUNvbnRleHRVcCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iXX0=
