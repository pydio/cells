(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioCoreActions = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"../globals":7}],2:[function(require,module,exports){
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

},{"../globals":7}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

exports['default'] = function () {
    var selection = _globals.pydio.getContextHolder();
    if (selection.isEmpty() || !selection.isUnique()) {
        return;
    }
    var node = selection.getUniqueNode();
    var isBookmarked = node.getMetadata().get('bookmark') === 'true';
    var nodeUuid = node.getMetadata().get('uuid');
    var userId = _globals.pydio.user.id;

    var api = new _pydioHttpRestApi.UserMetaServiceApi(_pydioHttpApi2['default'].getRestClient());
    var request = new _pydioHttpRestApi.IdmUpdateUserMetaRequest();
    if (isBookmarked) {
        var searchRequest = new _pydioHttpRestApi.IdmSearchUserMetaRequest();
        searchRequest.NodeUuids = [nodeUuid];
        searchRequest.Namespace = "bookmark";
        api.searchUserMeta(searchRequest).then(function (res) {
            if (res.Metadatas && res.Metadatas.length) {
                request.Operation = _pydioHttpRestApi.UpdateUserMetaRequestUserMetaOp.constructFromObject('DELETE');
                request.MetaDatas = res.Metadatas;
                api.updateUserMeta(request).then(function () {
                    selection.requireNodeReload(node);
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
        api.updateUserMeta(request).then(function () {
            selection.requireNodeReload(node);
        });
    }
};

module.exports = exports['default'];

},{"../globals":7,"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api"}],5:[function(require,module,exports){
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

},{"../globals":7,"material-ui":"material-ui","pydio/http/api":"pydio/http/api","pydio/http/resources-manager":"pydio/http/resources-manager","react":"react"}],6:[function(require,module,exports){
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
            { style: { margin: 10 } },
            _react2["default"].createElement(_materialUi.CardTitle, {
                title: pydio.Parameters.get('backend')['PackageLabel'],
                subtitle: "Details about version, licensing and how to get help"
            }),
            _react2["default"].createElement(_materialUi.Divider, null),
            _react2["default"].createElement(
                _materialUi.CardActions,
                null,
                _react2["default"].createElement(_materialUi.FlatButton, { primary: true, icon: _react2["default"].createElement(_materialUi.FontIcon, { className: "mdi mdi-book-variant" }), label: "Docs", onTouchTap: this.openDocs }),
                _react2["default"].createElement(_materialUi.FlatButton, { primary: true, icon: _react2["default"].createElement(_materialUi.FontIcon, { className: "mdi mdi-slack" }), label: "Forums", onTouchTap: this.openForum }),
                _react2["default"].createElement(_materialUi.FlatButton, { primary: true, icon: _react2["default"].createElement(_materialUi.FontIcon, { className: "mdi mdi-github-box" }), label: "Issues", onTouchTap: this.openGithub })
            ),
            _react2["default"].createElement(_materialUi.Divider, null),
            _react2["default"].createElement(
                _materialUi.CardText,
                null,
                credit
            )
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

},{"material-ui":"material-ui","pydio":"pydio","react":"react","react-markdown":"react-markdown"}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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
    switchToSettings: require('./navigation/switchToSettings')
};

exports.Callbacks = Callbacks;
exports.Navigation = Navigation;
exports.SplashDialog = _dialogSplashDialog2['default'];
exports.PasswordDialog = _dialogPasswordDialog2['default'];

},{"./callbacks/activateDesktopNotifications":1,"./callbacks/changePass":2,"./callbacks/switchLanguage":3,"./callbacks/toggleBookmark":4,"./dialog/PasswordDialog":5,"./dialog/SplashDialog":6,"./navigation/externalSelection":9,"./navigation/openGoPro":10,"./navigation/refresh":11,"./navigation/splash":12,"./navigation/switchToSettings":13,"./navigation/up":14}],9:[function(require,module,exports){
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

},{"../globals":7}],10:[function(require,module,exports){
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

},{"../globals":7}],11:[function(require,module,exports){
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

},{"../globals":7}],12:[function(require,module,exports){
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

},{"../globals":7}],13:[function(require,module,exports){
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

    if (!_globals.pydio.repositoryId || _globals.pydio.repositoryId != "settings") {
        _globals.pydio.triggerRepositoryChange('settings');
    }
};

module.exports = exports['default'];

},{"../globals":7}],14:[function(require,module,exports){
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

},{"../globals":7}]},{},[8])(8)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvdWkvQ29yZUFjdGlvbnMvY2FsbGJhY2tzL2FjdGl2YXRlRGVza3RvcE5vdGlmaWNhdGlvbnMuanMiLCJyZXMvYnVpbGQvdWkvQ29yZUFjdGlvbnMvY2FsbGJhY2tzL2NoYW5nZVBhc3MuanMiLCJyZXMvYnVpbGQvdWkvQ29yZUFjdGlvbnMvY2FsbGJhY2tzL3N3aXRjaExhbmd1YWdlLmpzIiwicmVzL2J1aWxkL3VpL0NvcmVBY3Rpb25zL2NhbGxiYWNrcy90b2dnbGVCb29rbWFyay5qcyIsInJlcy9idWlsZC91aS9Db3JlQWN0aW9ucy9kaWFsb2cvUGFzc3dvcmREaWFsb2cuanMiLCJyZXMvYnVpbGQvdWkvQ29yZUFjdGlvbnMvZGlhbG9nL1NwbGFzaERpYWxvZy5qcyIsInJlcy9idWlsZC91aS9Db3JlQWN0aW9ucy9nbG9iYWxzLmpzIiwicmVzL2J1aWxkL3VpL0NvcmVBY3Rpb25zL2luZGV4LmpzIiwicmVzL2J1aWxkL3VpL0NvcmVBY3Rpb25zL25hdmlnYXRpb24vZXh0ZXJuYWxTZWxlY3Rpb24uanMiLCJyZXMvYnVpbGQvdWkvQ29yZUFjdGlvbnMvbmF2aWdhdGlvbi9vcGVuR29Qcm8uanMiLCJyZXMvYnVpbGQvdWkvQ29yZUFjdGlvbnMvbmF2aWdhdGlvbi9yZWZyZXNoLmpzIiwicmVzL2J1aWxkL3VpL0NvcmVBY3Rpb25zL25hdmlnYXRpb24vc3BsYXNoLmpzIiwicmVzL2J1aWxkL3VpL0NvcmVBY3Rpb25zL25hdmlnYXRpb24vc3dpdGNoVG9TZXR0aW5ncy5qcyIsInJlcy9idWlsZC91aS9Db3JlQWN0aW9ucy9uYXZpZ2F0aW9uL3VwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2dsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmIChfZ2xvYmFscy5nbG9iYWwuTm90aWZpY2F0aW9uKSB7XG4gICAgICAgIGFsZXJ0KF9nbG9iYWxzLk1lc3NhZ2VIYXNoW1wibm90aWZpY2F0aW9uX2NlbnRlci4xMlwiXSk7XG4gICAgICAgIF9nbG9iYWxzLmdsb2JhbC5Ob3RpZmljYXRpb24ucmVxdWVzdFBlcm1pc3Npb24oZnVuY3Rpb24gKGdyYW50KSB7XG4gICAgICAgICAgICBbJ2RlZmF1bHQnLCAnZ3JhbnRlZCcsICdkZW5pZWQnXS5pbmRleE9mKGdyYW50KSA9PT0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgX2dsb2JhbHMuZ2xvYmFsLmFsZXJ0KF9nbG9iYWxzLk1lc3NhZ2VIYXNoW1wibm90aWZpY2F0aW9uX2NlbnRlci4xM1wiXSk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9nbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICBfZ2xvYmFscy5weWRpby5VSS5vcGVuQ29tcG9uZW50SW5Nb2RhbCgnUHlkaW9Db3JlQWN0aW9ucycsICdQYXNzd29yZERpYWxvZycsIHtcbiAgICAgICAgbG9ja2VkOiBfZ2xvYmFscy5weWRpby51c2VyICYmIF9nbG9iYWxzLnB5ZGlvLnVzZXIubG9jayA9PT0gJ3Bhc3NfY2hhbmdlJ1xuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9nbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfcHlkaW9IdHRwUmVzdEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvcmVzdC1hcGknKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxlY3Rpb24gPSBfZ2xvYmFscy5weWRpby5nZXRDb250ZXh0SG9sZGVyKCk7XG4gICAgaWYgKHNlbGVjdGlvbi5pc0VtcHR5KCkgfHwgIXNlbGVjdGlvbi5pc1VuaXF1ZSgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIG5vZGUgPSBzZWxlY3Rpb24uZ2V0VW5pcXVlTm9kZSgpO1xuICAgIHZhciBpc0Jvb2ttYXJrZWQgPSBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCdib29rbWFyaycpID09PSAndHJ1ZSc7XG4gICAgdmFyIG5vZGVVdWlkID0gbm9kZS5nZXRNZXRhZGF0YSgpLmdldCgndXVpZCcpO1xuICAgIHZhciB1c2VySWQgPSBfZ2xvYmFscy5weWRpby51c2VyLmlkO1xuXG4gICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5Vc2VyTWV0YVNlcnZpY2VBcGkoX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkpO1xuICAgIHZhciByZXF1ZXN0ID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLklkbVVwZGF0ZVVzZXJNZXRhUmVxdWVzdCgpO1xuICAgIGlmIChpc0Jvb2ttYXJrZWQpIHtcbiAgICAgICAgdmFyIHNlYXJjaFJlcXVlc3QgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuSWRtU2VhcmNoVXNlck1ldGFSZXF1ZXN0KCk7XG4gICAgICAgIHNlYXJjaFJlcXVlc3QuTm9kZVV1aWRzID0gW25vZGVVdWlkXTtcbiAgICAgICAgc2VhcmNoUmVxdWVzdC5OYW1lc3BhY2UgPSBcImJvb2ttYXJrXCI7XG4gICAgICAgIGFwaS5zZWFyY2hVc2VyTWV0YShzZWFyY2hSZXF1ZXN0KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgIGlmIChyZXMuTWV0YWRhdGFzICYmIHJlcy5NZXRhZGF0YXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5PcGVyYXRpb24gPSBfcHlkaW9IdHRwUmVzdEFwaS5VcGRhdGVVc2VyTWV0YVJlcXVlc3RVc2VyTWV0YU9wLmNvbnN0cnVjdEZyb21PYmplY3QoJ0RFTEVURScpO1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuTWV0YURhdGFzID0gcmVzLk1ldGFkYXRhcztcbiAgICAgICAgICAgICAgICBhcGkudXBkYXRlVXNlck1ldGEocmVxdWVzdCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5yZXF1aXJlTm9kZVJlbG9hZChub2RlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdC5PcGVyYXRpb24gPSBfcHlkaW9IdHRwUmVzdEFwaS5VcGRhdGVVc2VyTWV0YVJlcXVlc3RVc2VyTWV0YU9wLmNvbnN0cnVjdEZyb21PYmplY3QoJ1BVVCcpO1xuICAgICAgICB2YXIgdXNlck1ldGEgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuSWRtVXNlck1ldGEoKTtcbiAgICAgICAgdXNlck1ldGEuTm9kZVV1aWQgPSBub2RlVXVpZDtcbiAgICAgICAgdXNlck1ldGEuTmFtZXNwYWNlID0gXCJib29rbWFya1wiO1xuICAgICAgICB1c2VyTWV0YS5Kc29uVmFsdWUgPSBcIlxcXCJ0cnVlXFxcIlwiO1xuICAgICAgICB1c2VyTWV0YS5Qb2xpY2llcyA9IFtfcHlkaW9IdHRwUmVzdEFwaS5TZXJ2aWNlUmVzb3VyY2VQb2xpY3kuY29uc3RydWN0RnJvbU9iamVjdCh7IFJlc291cmNlOiBub2RlVXVpZCwgQWN0aW9uOiAnT1dORVInLCBTdWJqZWN0OiAndXNlcjonICsgdXNlcklkLCBFZmZlY3Q6ICdhbGxvdycgfSksIF9weWRpb0h0dHBSZXN0QXBpLlNlcnZpY2VSZXNvdXJjZVBvbGljeS5jb25zdHJ1Y3RGcm9tT2JqZWN0KHsgUmVzb3VyY2U6IG5vZGVVdWlkLCBBY3Rpb246ICdSRUFEJywgU3ViamVjdDogJ3VzZXI6JyArIHVzZXJJZCwgRWZmZWN0OiAnYWxsb3cnIH0pLCBfcHlkaW9IdHRwUmVzdEFwaS5TZXJ2aWNlUmVzb3VyY2VQb2xpY3kuY29uc3RydWN0RnJvbU9iamVjdCh7IFJlc291cmNlOiBub2RlVXVpZCwgQWN0aW9uOiAnV1JJVEUnLCBTdWJqZWN0OiAndXNlcjonICsgdXNlcklkLCBFZmZlY3Q6ICdhbGxvdycgfSldO1xuICAgICAgICByZXF1ZXN0Lk1ldGFEYXRhcyA9IFt1c2VyTWV0YV07XG4gICAgICAgIGFwaS51cGRhdGVVc2VyTWV0YShyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbi5yZXF1aXJlTm9kZVJlbG9hZChub2RlKTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9nbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFB5ZGlvQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcbnZhciBCb290VUkgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc291cmNlcy1tYW5hZ2VyJykucmVxdWlyZUxpYignYm9vdCcpO1xudmFyIEFjdGlvbkRpYWxvZ01peGluID0gQm9vdFVJLkFjdGlvbkRpYWxvZ01peGluO1xudmFyIFN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW4gPSBCb290VUkuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbjtcbnZhciBDYW5jZWxCdXR0b25Qcm92aWRlck1peGluID0gQm9vdFVJLkNhbmNlbEJ1dHRvblByb3ZpZGVyTWl4aW47XG52YXIgQXN5bmNDb21wb25lbnQgPSBCb290VUkuQXN5bmNDb21wb25lbnQ7XG5cbnZhciBQYXNzd29yZERpYWxvZyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1Bhc3N3b3JkRGlhbG9nJyxcblxuICAgIG1peGluczogW0FjdGlvbkRpYWxvZ01peGluXSxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgcGFzc1ZhbGlkOiBmYWxzZSB9O1xuICAgIH0sXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaWFsb2dUaXRsZTogX2dsb2JhbHMucHlkaW8uTWVzc2FnZUhhc2hbMTk0XSxcbiAgICAgICAgICAgIGRpYWxvZ0lzTW9kYWw6IHRydWUsXG4gICAgICAgICAgICBkaWFsb2dTaXplOiAnc20nXG4gICAgICAgIH07XG4gICAgfSxcbiAgICBnZXRCdXR0b25zOiBmdW5jdGlvbiBnZXRCdXR0b25zKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciB1cGRhdGVyID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgICBpZiAodXBkYXRlcikgdGhpcy5fdXBkYXRlciA9IHVwZGF0ZXI7XG4gICAgICAgIHZhciBidXR0b25zID0gW107XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5sb2NrZWQpIHtcbiAgICAgICAgICAgIGJ1dHRvbnMucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgbGFiZWw6IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbNDldLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5kaXNtaXNzKCk7XG4gICAgICAgICAgICAgICAgfSB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgYnV0dG9ucy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBsYWJlbDogdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFs0OF0sIG9uVG91Y2hUYXA6IHRoaXMuc3VibWl0LmJpbmQodGhpcyksIGRpc2FibGVkOiAhdGhpcy5zdGF0ZS5wYXNzVmFsaWQgfSkpO1xuICAgICAgICByZXR1cm4gYnV0dG9ucztcbiAgICB9LFxuXG4gICAgc3VibWl0OiBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5wYXNzVmFsaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlZnMucGFzc3dvcmRGb3JtLmluc3RhbmNlLnBvc3QoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB0aGlzLmRpc21pc3MoKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICBwYXNzVmFsaWRTdGF0dXNDaGFuZ2U6IGZ1bmN0aW9uIHBhc3NWYWxpZFN0YXR1c0NoYW5nZShzdGF0dXMpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBhc3NWYWxpZDogc3RhdHVzIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzMi5fdXBkYXRlcihfdGhpczIuZ2V0QnV0dG9ucygpKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KEFzeW5jQ29tcG9uZW50LCB7XG4gICAgICAgICAgICBuYW1lc3BhY2U6ICdVc2VyQWNjb3VudCcsXG4gICAgICAgICAgICBjb21wb25lbnROYW1lOiAnUGFzc3dvcmRGb3JtJyxcbiAgICAgICAgICAgIHB5ZGlvOiB0aGlzLnByb3BzLnB5ZGlvLFxuICAgICAgICAgICAgcmVmOiAncGFzc3dvcmRGb3JtJyxcbiAgICAgICAgICAgIG9uVmFsaWRTdGF0dXNDaGFuZ2U6IHRoaXMucGFzc1ZhbGlkU3RhdHVzQ2hhbmdlXG4gICAgICAgIH0pO1xuICAgIH1cblxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFBhc3N3b3JkRGlhbG9nO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKFwicHlkaW9cIik7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX3JlYWN0TWFya2Rvd24gPSByZXF1aXJlKFwicmVhY3QtbWFya2Rvd25cIik7XG5cbnZhciBfcmVhY3RNYXJrZG93bjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdE1hcmtkb3duKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMltcImRlZmF1bHRcIl0ucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgQWN0aW9uRGlhbG9nTWl4aW4gPSBfUHlkaW8kcmVxdWlyZUxpYi5BY3Rpb25EaWFsb2dNaXhpbjtcbnZhciBTdWJtaXRCdXR0b25Qcm92aWRlck1peGluID0gX1B5ZGlvJHJlcXVpcmVMaWIuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbjtcbnZhciBMb2FkZXIgPSBfUHlkaW8kcmVxdWlyZUxpYi5Mb2FkZXI7XG5cbnZhciBTcGxhc2hEaWFsb2cgPSBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6IFwiU3BsYXNoRGlhbG9nXCIsXG5cbiAgICBtaXhpbnM6IFtBY3Rpb25EaWFsb2dNaXhpbiwgU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbl0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpYWxvZ1RpdGxlOiAnJyxcbiAgICAgICAgICAgIGRpYWxvZ1NpemU6ICdsZycsXG4gICAgICAgICAgICBkaWFsb2dJc01vZGFsOiBmYWxzZSxcbiAgICAgICAgICAgIGRpYWxvZ1BhZGRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgZGlhbG9nU2Nyb2xsQm9keTogdHJ1ZVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgc3VibWl0OiBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgIHRoaXMuZGlzbWlzcygpO1xuICAgIH0sXG5cbiAgICBvcGVuRG9jczogZnVuY3Rpb24gb3BlbkRvY3MoKSB7XG4gICAgICAgIG9wZW4oXCJodHRwczovL3B5ZGlvLmNvbS9lbi9kb2NzXCIpO1xuICAgIH0sXG5cbiAgICBvcGVuRm9ydW06IGZ1bmN0aW9uIG9wZW5Gb3J1bSgpIHtcbiAgICAgICAgb3BlbihcImh0dHBzOi8vZm9ydW0ucHlkaW8uY29tXCIpO1xuICAgIH0sXG5cbiAgICBvcGVuR2l0aHViOiBmdW5jdGlvbiBvcGVuR2l0aHViKCkge1xuICAgICAgICBvcGVuKFwiaHR0cHM6Ly9naXRodWIuY29tL3B5ZGlvL2NlbGxzL2lzc3Vlc1wiKTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IGFib3V0Q29udGVudDogbnVsbCB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHVybCA9IHB5ZGlvLlBhcmFtZXRlcnMuZ2V0KCdGUk9OVEVORF9VUkwnKSArICcvcGx1Zy9ndWkuYWpheC9jcmVkaXRzLm1kJztcbiAgICAgICAgd2luZG93LmZldGNoKHVybCwge1xuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXNwb25zZS50ZXh0KCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgYWJvdXRDb250ZW50OiBkYXRhIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGNyZWRpdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYWJvdXRDb250ZW50KSB7XG4gICAgICAgICAgICBjcmVkaXQgPSBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9yZWFjdE1hcmtkb3duMltcImRlZmF1bHRcIl0sIHsgc291cmNlOiB0aGlzLnN0YXRlLmFib3V0Q29udGVudCB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNyZWRpdCA9IF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoTG9hZGVyLCB7IHN0eWxlOiB7IG1pbkhlaWdodDogMjAwIH0gfSk7XG4gICAgICAgIH1cbiAgICAgICAgY3JlZGl0ID0gX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIF9tYXRlcmlhbFVpLkNhcmQsXG4gICAgICAgICAgICB7IHN0eWxlOiB7IG1hcmdpbjogMTAgfSB9LFxuICAgICAgICAgICAgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5DYXJkVGl0bGUsIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogcHlkaW8uUGFyYW1ldGVycy5nZXQoJ2JhY2tlbmQnKVsnUGFja2FnZUxhYmVsJ10sXG4gICAgICAgICAgICAgICAgc3VidGl0bGU6IFwiRGV0YWlscyBhYm91dCB2ZXJzaW9uLCBsaWNlbnNpbmcgYW5kIGhvdyB0byBnZXQgaGVscFwiXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbCksXG4gICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkNhcmRBY3Rpb25zLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IHByaW1hcnk6IHRydWUsIGljb246IF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgY2xhc3NOYW1lOiBcIm1kaSBtZGktYm9vay12YXJpYW50XCIgfSksIGxhYmVsOiBcIkRvY3NcIiwgb25Ub3VjaFRhcDogdGhpcy5vcGVuRG9jcyB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgcHJpbWFyeTogdHJ1ZSwgaWNvbjogX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6IFwibWRpIG1kaS1zbGFja1wiIH0pLCBsYWJlbDogXCJGb3J1bXNcIiwgb25Ub3VjaFRhcDogdGhpcy5vcGVuRm9ydW0gfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IHByaW1hcnk6IHRydWUsIGljb246IF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgY2xhc3NOYW1lOiBcIm1kaSBtZGktZ2l0aHViLWJveFwiIH0pLCBsYWJlbDogXCJJc3N1ZXNcIiwgb25Ub3VjaFRhcDogdGhpcy5vcGVuR2l0aHViIH0pXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKSxcbiAgICAgICAgICAgIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuQ2FyZFRleHQsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBjcmVkaXRcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgeyBzdHlsZTogeyBoZWlnaHQ6ICcxMDAlJywgYmFja2dyb3VuZENvbG9yOiAnI0NGRDhEQycgfSB9LFxuICAgICAgICAgICAgY3JlZGl0XG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBTcGxhc2hEaWFsb2c7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciBnbG9iYWwgPSB3aW5kb3c7XG52YXIgcHlkaW8gPSBnbG9iYWwucHlkaW87XG52YXIgTWVzc2FnZUhhc2ggPSBweWRpby5NZXNzYWdlSGFzaDtcbmV4cG9ydHMuZ2xvYmFsID0gZ2xvYmFsO1xuZXhwb3J0cy5weWRpbyA9IHB5ZGlvO1xuZXhwb3J0cy5NZXNzYWdlSGFzaCA9IE1lc3NhZ2VIYXNoO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9kaWFsb2dTcGxhc2hEaWFsb2cgPSByZXF1aXJlKCcuL2RpYWxvZy9TcGxhc2hEaWFsb2cnKTtcblxudmFyIF9kaWFsb2dTcGxhc2hEaWFsb2cyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZGlhbG9nU3BsYXNoRGlhbG9nKTtcblxudmFyIF9kaWFsb2dQYXNzd29yZERpYWxvZyA9IHJlcXVpcmUoJy4vZGlhbG9nL1Bhc3N3b3JkRGlhbG9nJyk7XG5cbnZhciBfZGlhbG9nUGFzc3dvcmREaWFsb2cyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZGlhbG9nUGFzc3dvcmREaWFsb2cpO1xuXG52YXIgQ2FsbGJhY2tzID0ge1xuICAgIHN3aXRjaExhbmd1YWdlOiByZXF1aXJlKCcuL2NhbGxiYWNrcy9zd2l0Y2hMYW5ndWFnZScpLFxuICAgIGNoYW5nZVBhc3M6IHJlcXVpcmUoJy4vY2FsbGJhY2tzL2NoYW5nZVBhc3MnKSxcbiAgICB0b2dnbGVCb29rbWFyazogcmVxdWlyZSgnLi9jYWxsYmFja3MvdG9nZ2xlQm9va21hcmsnKSxcbiAgICBhY3RpdmF0ZURlc2t0b3BOb3RpZmljYXRpb25zOiByZXF1aXJlKCcuL2NhbGxiYWNrcy9hY3RpdmF0ZURlc2t0b3BOb3RpZmljYXRpb25zJylcbn07XG5cbnZhciBOYXZpZ2F0aW9uID0ge1xuICAgIHNwbGFzaDogcmVxdWlyZSgnLi9uYXZpZ2F0aW9uL3NwbGFzaCcpLFxuICAgIHVwOiByZXF1aXJlKCcuL25hdmlnYXRpb24vdXAnKSxcbiAgICByZWZyZXNoOiByZXF1aXJlKCcuL25hdmlnYXRpb24vcmVmcmVzaCcpLFxuICAgIGV4dGVybmFsU2VsZWN0aW9uOiByZXF1aXJlKCcuL25hdmlnYXRpb24vZXh0ZXJuYWxTZWxlY3Rpb24nKSxcbiAgICBvcGVuR29Qcm86IHJlcXVpcmUoJy4vbmF2aWdhdGlvbi9vcGVuR29Qcm8nKSxcbiAgICBzd2l0Y2hUb1NldHRpbmdzOiByZXF1aXJlKCcuL25hdmlnYXRpb24vc3dpdGNoVG9TZXR0aW5ncycpXG59O1xuXG5leHBvcnRzLkNhbGxiYWNrcyA9IENhbGxiYWNrcztcbmV4cG9ydHMuTmF2aWdhdGlvbiA9IE5hdmlnYXRpb247XG5leHBvcnRzLlNwbGFzaERpYWxvZyA9IF9kaWFsb2dTcGxhc2hEaWFsb2cyWydkZWZhdWx0J107XG5leHBvcnRzLlBhc3N3b3JkRGlhbG9nID0gX2RpYWxvZ1Bhc3N3b3JkRGlhbG9nMlsnZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHVzZXJTZWxlY3Rpb24gPSBfZ2xvYmFscy5weWRpby5nZXRVc2VyU2VsZWN0aW9uKCk7XG4gICAgaWYgKHVzZXJTZWxlY3Rpb24uaXNVbmlxdWUoKSAmJiAhdXNlclNlbGVjdGlvbi5oYXNEaXIoKSkge1xuICAgICAgICB2YXIgZmlsZU5hbWUgPSB1c2VyU2VsZWN0aW9uLmdldFVuaXF1ZUZpbGVOYW1lKCk7XG4gICAgICAgIHZhciBzZWxlY3RvckRhdGEgPSBfZ2xvYmFscy5weWRpby5nZXRDb250cm9sbGVyKCkuc2VsZWN0b3JEYXRhO1xuICAgICAgICBpZiAoc2VsZWN0b3JEYXRhLmdldCgndHlwZScpID09IFwiY2tlZGl0b3JcIikge1xuICAgICAgICAgICAgdmFyIGNrRGF0YSA9IHNlbGVjdG9yRGF0YS5nZXQoJ2RhdGEnKTtcbiAgICAgICAgICAgIGlmIChja0RhdGFbJ0NLRWRpdG9yRnVuY051bSddKSB7XG4gICAgICAgICAgICAgICAgdmFyIGltYWdlUGF0aCA9IGZpbGVOYW1lO1xuICAgICAgICAgICAgICAgIGlmIChja0RhdGFbJ3JlbGF0aXZlX3BhdGgnXSkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZVBhdGggPSBja0RhdGFbJ3JlbGF0aXZlX3BhdGgnXSArIGZpbGVOYW1lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfZ2xvYmFscy5nbG9iYWwub3BlbmVyLkNLRURJVE9SLnRvb2xzLmNhbGxGdW5jdGlvbihja0RhdGFbJ0NLRWRpdG9yRnVuY051bSddLCBpbWFnZVBhdGgpO1xuICAgICAgICAgICAgICAgIF9nbG9iYWxzLmdsb2JhbC5jbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9nbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoKSB7XG4gIF9nbG9iYWxzLmdsb2JhbC5vcGVuKCdodHRwczovL3B5ZGlvLmNvbS9lbi9nby1wcm8/cmVmZXJyZXI9c2V0dGluZ3MnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gZnVuY3Rpb24gKCkge1xuXG4gIF9nbG9iYWxzLnB5ZGlvLmZpcmVDb250ZXh0UmVmcmVzaCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9nbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoKSB7XG5cbiAgX2dsb2JhbHMucHlkaW8uVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ1B5ZGlvQ29yZUFjdGlvbnMnLCAnU3BsYXNoRGlhbG9nJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2dsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICghX2dsb2JhbHMucHlkaW8ucmVwb3NpdG9yeUlkIHx8IF9nbG9iYWxzLnB5ZGlvLnJlcG9zaXRvcnlJZCAhPSBcInNldHRpbmdzXCIpIHtcbiAgICAgICAgX2dsb2JhbHMucHlkaW8udHJpZ2dlclJlcG9zaXRvcnlDaGFuZ2UoJ3NldHRpbmdzJyk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9nbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoKSB7XG5cbiAgX2dsb2JhbHMucHlkaW8uZmlyZUNvbnRleHRVcCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iXX0=
