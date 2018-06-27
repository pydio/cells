(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FSActions = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
var FuncUtils = require('pydio/util/func');
var DOMUtils = require('pydio/util/dom');
var LangUtils = require('pydio/util/lang');

exports['default'] = function (pydio) {

    return function () {
        var link = undefined;
        var url = DOMUtils.getUrlFromBase();

        var repoId = pydio.repositoryId || (pydio.user ? pydio.user.activeRepository : null);
        if (pydio.user) {
            var slug = pydio.user.repositories.get(repoId).getSlug();
            if (slug) {
                repoId = 'ws-' + slug;
            }
        }

        link = LangUtils.trimRight(url, '/') + '/' + repoId + pydio.getUserSelection().getUniqueNode().getPath();

        pydio.UI.openComponentInModal('PydioReactUI', 'PromptDialog', {
            dialogTitleId: 369,
            fieldLabelId: 296,
            defaultValue: link,
            submitValue: FuncUtils.Empty
        });
    };
};

module.exports = exports['default'];

},{"pydio/util/dom":"pydio/util/dom","pydio/util/func":"pydio/util/func","pydio/util/lang":"pydio/util/lang"}],2:[function(require,module,exports){
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
var PydioApi = require('pydio/http/api');

exports['default'] = function (pydio) {
    /**
     * @param type string
     * @param selection {PydioDataModel}
     * @param path string
     * @param wsId string
     */
    return function (type, selection, path, wsId) {
        var action = undefined,
            params = { dest: path };
        if (wsId) {
            action = 'cross_copy';
            params['dest_repository_id'] = wsId;
            if (type === 'move') {
                params['moving_files'] = 'true';
            }
            PydioApi.getClient().postSelectionWithAction(action, null, selection, params);
            return;
        }

        var slug = pydio.user.getActiveRepositoryObject().getSlug();
        var paths = selection.getSelectedNodes().map(function (n) {
            return slug + n.getPath();
        });
        var jobParams = {
            nodes: paths,
            target: slug + path,
            targetParent: true
        };
        PydioApi.getRestClient().userJob(type, jobParams).then(function (r) {
            pydio.UI.displayMessage('SUCCESS', type === 'move' ? 'Move operation in background' : 'Copy operation in background');
            pydio.getContextHolder().setSelectedNodes([]);
        });
    };
};

module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api"}],3:[function(require,module,exports){
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

exports['default'] = function (pydio) {

    return function () {
        pydio.UI.openComponentInModal('FSActions', 'PermissionsDialog', {
            dialogTitleId: 287,
            selection: pydio.getUserSelection()
        });
    };
};

module.exports = exports['default'];

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

Object.defineProperty(exports, '__esModule', {
    value: true
});
var PydioApi = require('pydio/http/api');
var PathUtils = require('pydio/util/path');

exports['default'] = function (pydio) {

    return function () {
        var userSelection = pydio.getUserSelection();
        if (!pydio.Parameters.get('multipleFilesDownloadEnabled')) {
            return;
        }

        var zipName = undefined;
        if (userSelection.isUnique()) {
            zipName = PathUtils.getBasename(userSelection.getUniqueFileName());
            if (!userSelection.hasDir()) zipName = zipName.substr(0, zipName.lastIndexOf("\."));
        } else {
            zipName = PathUtils.getBasename(userSelection.getContextNode().getPath());
            if (zipName == "") zipName = "Archive";
        }
        var index = 1,
            buff = zipName;
        while (userSelection.fileNameExists(zipName + ".zip")) {
            zipName = buff + "-" + index;index++;
        }

        pydio.UI.openComponentInModal('PydioReactUI', 'PromptDialog', {
            dialogTitleId: 313,
            legendId: 314,
            fieldLabelId: 315,
            defaultValue: zipName + '.zip',
            defaultInputSelection: zipName,
            submitValue: function submitValue(value) {
                PydioApi.getClient().postSelectionWithAction('compress', null, null, { archive_name: value });
            }
        });
    };
};

module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api","pydio/util/path":"pydio/util/path"}],5:[function(require,module,exports){
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

exports['default'] = function (pydio) {
    var MessageHash = pydio.MessageHash;

    return function () {
        // + Handle copy in same folder, move in same folder
        var selection = pydio.getUserSelection();
        var submit = function submit(path) {
            var wsId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            require('./applyCopyOrMove')(pydio)('copy', selection, path, wsId);
        };

        pydio.UI.openComponentInModal('FSActions', 'TreeDialog', {
            isMove: false,
            dialogTitle: MessageHash[159],
            submitValue: submit
        });
    };
};

module.exports = exports['default'];

},{"./applyCopyOrMove":2}],6:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

exports['default'] = function (pydio) {
    var MessageHash = pydio.MessageHash;

    return function () {
        var move = false;
        var message = MessageHash[177];

        var repoHasRecycle = pydio.getContextHolder().getRootNode().getMetadata().get("repo_has_recycle") || pydio.getContextHolder().getRootNode().getChildren().has('/recycle_bin');
        if (repoHasRecycle && pydio.getContextNode().getAjxpMime() !== "ajxp_recycle") {
            move = true;
            message = MessageHash[176];
        }
        // Detect shared node
        if (pydio.getPluginConfigs('action.share').size) {
            (function () {
                var shared = [];
                pydio.getContextHolder().getSelectedNodes().forEach(function (n) {
                    if (n.getMetadata().get('ajxp_shared')) {
                        shared.push(n);
                    }
                });
                if (shared.length) {
                    var n = shared[0];
                    message = React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'div',
                            null,
                            message
                        ),
                        React.createElement(
                            'div',
                            { style: { color: '#D32F2F', marginTop: 10 } },
                            React.createElement('span', { className: 'mdi mdi-alert' }),
                            MessageHash['share_center.' + (n.isLeaf() ? '158' : '157')]
                        )
                    );
                }
            })();
        }
        pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
            message: message,
            dialogTitleId: 7,
            validCallback: function validCallback() {
                var nodes = pydio.getContextHolder().getSelectedNodes();
                var slug = pydio.user.getActiveRepositoryObject().getSlug();
                var paths = nodes.map(function (n) {
                    return slug + n.getPath();
                });
                var jobName = undefined,
                    jobParams = undefined,
                    success = undefined;

                if (move) {
                    var target = slug + '/recycle_bin';
                    jobName = "move";
                    jobParams = { nodes: paths, target: target, targetParent: true };
                    success = "Moving to recycle bin in background";
                } else {
                    jobName = "delete";
                    jobParams = { nodes: paths };
                    success = "Deletion job sent to background";
                }

                _pydioHttpApi2['default'].getRestClient().userJob(jobName, jobParams).then(function (r) {
                    pydio.UI.displayMessage('SUCCESS', success);
                    pydio.getContextHolder().setSelectedNodes([]);
                });
            }
        });
    };
};

module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api"}],7:[function(require,module,exports){
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
var PydioApi = require('pydio/http/api');

exports['default'] = function (pydio) {

    return function () {
        var userSelection = pydio.getUserSelection();
        if (userSelection.isUnique() && !userSelection.hasDir() || pydio.Parameters.get('multipleFilesDownloadEnabled')) {
            PydioApi.getClient().downloadSelection(userSelection, 'download');
        } else {
            pydio.UI.openComponentInModal('FSActions', 'MultiDownloadDialog', {
                actionName: 'download',
                selection: userSelection,
                dialogTitleId: 88
            });
        }
    };
};

module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api"}],8:[function(require,module,exports){
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

exports['default'] = function (pydio) {

    return function () {
        var dm = pydio.getContextHolder();
        dm.setSelectedNodes([dm.getRootNode()]);
        require('./download')(pydio)();
    };
};

module.exports = exports['default'];

},{"./download":7}],9:[function(require,module,exports){
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

exports['default'] = function (pydio) {

    return function () {

        var userSelection = pydio.getUserSelection();
        pydio.UI.openComponentInModal('FSActions', 'MultiDownloadDialog', {
            buildChunks: true,
            actionName: 'download_chunk',
            chunkAction: 'prepare_chunk_dl',
            selection: userSelection
        });
    };
};

module.exports = exports['default'];

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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

exports['default'] = function (pydio) {

    return function () {
        var userSelection = pydio.getUserSelection();
        var folderNode = userSelection.getUniqueNode();
        var parentPath = folderNode.getParent().getPath();
        var basename = folderNode.getLabel();
        var newNode = new _pydioModelNode2['default'](parentPath + "/" + basename + ".zip", true);
        var newSelection = new PydioDataMode();
        newSelection.setSelectedNodes([newNode]);
        _pydioHttpApi2['default'].getClient().downloadSelection(newSelection, 'download');
    };
};

module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api","pydio/model/node":"pydio/model/node"}],11:[function(require,module,exports){
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
var PydioApi = require('pydio/http/api');

exports['default'] = function (pydio) {
    var MessageHash = pydio.MessageHash;

    return function () {

        pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
            message: MessageHash[177],
            dialogTitleId: 220,
            validCallback: function validCallback() {
                var slug = pydio.user.getActiveRepositoryObject().getSlug();
                PydioApi.getRestClient().userJob("delete", { nodes: [slug + '/recycle_bin'], childrenOnly: true }).then(function (r) {
                    pydio.UI.displayMessage('SUCCESS', 'Emptying recycle bin in background');
                });
            }
        });
    };
};

module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api"}],12:[function(require,module,exports){
(function (global){
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
var pydio = global.pydio;

var Callbacks = {
    ls: require('./ls')(pydio),
    mkdir: require('./mkdir')(pydio),
    mkfile: require('./mkfile')(pydio),
    deleteAction: require('./deleteAction')(pydio),
    rename: require('./rename')(pydio),
    applyCopyOrMove: require('./applyCopyOrMove')(pydio),
    copy: require('./copy')(pydio),
    move: require('./move')(pydio),
    upload: require('./upload')(pydio),
    download: require('./download')(pydio),
    downloadFolder: require('./downloadFolder')(pydio),
    downloadAll: require('./downloadAll')(pydio),
    downloadChunked: require('./downloadChunked')(pydio),
    emptyRecycle: require('./emptyRecycle')(pydio),
    restore: require('./restore')(pydio),
    compressUI: require('./compressUI')(pydio),
    openInEditor: require('./openInEditor')(pydio),
    ajxpLink: require('./ajxpLink')(pydio),
    chmod: require('./chmod')(pydio),
    openOtherEditorPicker: require('./openOtherEditorPicker')(pydio),
    lock: require('./lock')(pydio)
};

exports['default'] = Callbacks;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ajxpLink":1,"./applyCopyOrMove":2,"./chmod":3,"./compressUI":4,"./copy":5,"./deleteAction":6,"./download":7,"./downloadAll":8,"./downloadChunked":9,"./downloadFolder":10,"./emptyRecycle":11,"./lock":13,"./ls":14,"./mkdir":15,"./mkfile":16,"./move":17,"./openInEditor":18,"./openOtherEditorPicker":19,"./rename":20,"./restore":21,"./upload":22}],13:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

exports['default'] = function (pydio) {
    return function () {
        var api = new _pydioHttpRestApi.ACLServiceApi(_pydioHttpApi2['default'].getRestClient());
        var acl = new _pydioHttpRestApi.IdmACL();
        var node = pydio.getContextHolder().getUniqueNode();
        acl.NodeID = node.getMetadata().get('uuid');
        acl.Action = _pydioHttpRestApi.IdmACLAction.constructFromObject({ Name: "content_lock", Value: pydio.user.id });
        var p = undefined;
        var wasLocked = node.getMetadata().get("sl_locked");
        if (wasLocked) {
            p = api.deleteAcl(acl);
        } else {
            p = api.putAcl(acl);
        }
        p.then(function (res) {
            pydio.getContextHolder().requireNodeReload(node);
        });
    };
};

module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api"}],14:[function(require,module,exports){
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

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = function (pydio) {

    return function () {
        pydio.goTo(pydio.getUserSelection().getUniqueNode());
    };
};

module.exports = exports["default"];

},{}],15:[function(require,module,exports){
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

exports['default'] = function (pydio) {

    return function () {

        var submit = function submit(value) {
            PydioApi.getClient().request({
                get_action: 'mkdir',
                dir: pydio.getContextNode().getPath(),
                dirname: value
            });
        };
        pydio.UI.openComponentInModal('PydioReactUI', 'PromptDialog', {
            dialogTitleId: 154,
            legendId: 155,
            fieldLabelId: 173,
            dialogSize: 'sm',
            submitValue: submit
        });
    };
};

module.exports = exports['default'];

},{}],16:[function(require,module,exports){
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

exports['default'] = function (pydio) {

    return function () {
        var submit = function submit(value) {
            PydioApi.getClient().request({
                get_action: 'mkfile',
                dir: pydio.getContextNode().getPath(),
                filename: value
            });
        };
        pydio.UI.openComponentInModal('PydioReactUI', 'PromptDialog', {
            dialogTitleId: 156,
            legendId: 157,
            fieldLabelId: 174,
            dialogSize: 'sm',
            submitValue: submit
        });
    };
};

module.exports = exports['default'];

},{}],17:[function(require,module,exports){
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

var _require$requireLib = require('pydio').requireLib('components');

var DNDActionParameter = _require$requireLib.DNDActionParameter;

exports['default'] = function (pydio) {
    var MessageHash = pydio.MessageHash;

    return function (controller) {
        var dndActionParameter = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        if (dndActionParameter && dndActionParameter instanceof DNDActionParameter) {

            if (dndActionParameter.getStep() === DNDActionParameter.STEP_CAN_DROP) {

                if (dndActionParameter.getTarget().isLeaf() || dndActionParameter.getTarget().getPath() === dndActionParameter.getSource().getPath()) {
                    throw new Error('Cannot drop');
                } else {
                    return false;
                }
            } else if (dndActionParameter.getStep() === DNDActionParameter.STEP_END_DRAG) {
                var _selection = controller.getDataModel();
                var targetPath = dndActionParameter.getTarget().getPath();
                var moveFunction = require('./applyCopyOrMove')(pydio);
                var sourceNode = dndActionParameter.getSource();
                var selectedNodes = _selection.getSelectedNodes();
                if (selectedNodes.indexOf(sourceNode) === -1) {
                    // Use source node instead of current datamodel selection
                    var newSel = new PydioDataModel();
                    newSel.setContextNode(_selection.getContextNode());
                    newSel.setSelectedNodes([dndActionParameter.getSource()]);
                    _selection = newSel;
                    moveFunction('move', newSel, targetPath);
                } else {
                    moveFunction('move', _selection, targetPath);
                }
            }

            return;
        }

        var selection = pydio.getUserSelection();
        var submit = function submit(path) {
            var wsId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            require('./applyCopyOrMove')(pydio)('move', selection, path, wsId);
        };

        pydio.UI.openComponentInModal('FSActions', 'TreeDialog', {
            isMove: true,
            dialogTitle: MessageHash[160],
            submitValue: submit
        });
    };
};

module.exports = exports['default'];

},{"./applyCopyOrMove":2,"pydio":"pydio"}],18:[function(require,module,exports){
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

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = function (pydio) {

    return function (manager, otherArguments) {
        var editorData = otherArguments && otherArguments.length ? otherArguments[0] : null;
        pydio.UI.openCurrentSelectionInEditor(editorData);
    };
};

module.exports = exports["default"];

},{}],19:[function(require,module,exports){
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

exports['default'] = function (pydio) {

    return function () {
        pydio.UI.openComponentInModal('FSActions', 'OtherEditorPickerDialog', {
            selection: pydio.getUserSelection(),
            pydio: pydio
        });
    };
};

module.exports = exports['default'];

},{}],20:[function(require,module,exports){
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
var PydioApi = require('pydio/http/api');

exports['default'] = function (pydio) {

    return function () {
        var _callback = function _callback(node, newValue) {
            if (!node) node = pydio.getUserSelection().getUniqueNode();
            PydioApi.getClient().request({
                get_action: 'rename',
                file: node.getPath(),
                filename_new: newValue
            });
        };
        var n = pydio.getUserSelection().getSelectedNodes()[0];
        if (n) {
            var res = n.notify("node_action", { type: "prompt-rename", callback: function callback(value) {
                    _callback(n, value);
                } });
            if ((!res || res[0] !== true) && n.getParent()) {
                n.getParent().notify("child_node_action", { type: "prompt-rename", child: n, callback: function callback(value) {
                        _callback(n, value);
                    } });
            }
        }
    };
};

module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api"}],21:[function(require,module,exports){
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
var PydioApi = require('pydio/http/api');

exports['default'] = function (pydio) {

    return function () {

        if (pydio.getContextHolder().isMultiple()) {
            (function () {
                var ctxNode = pydio.getContextHolder().getContextNode();
                pydio.getContextHolder().getSelectedNodes().forEach(function (n) {
                    var tmpModel = new PydioDataModel();
                    tmpModel.setContextNode(ctxNode);
                    tmpModel.setSelectedNodes([n]);
                    PydioApi.getClient().postSelectionWithAction('restore', null, tmpModel);
                });
            })();
        } else {
            PydioApi.getClient().postSelectionWithAction('restore');
        }
    };
};

module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api"}],22:[function(require,module,exports){
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

exports['default'] = function (pydio) {

    return function (manager, uploaderArguments) {

        pydio.UI.openComponentInModal('FSActions', 'UploadDialog');
    };
};

module.exports = exports['default'];

},{}],23:[function(require,module,exports){
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
var React = require('react');

var MultiDownloadDialog = React.createClass({
    displayName: 'MultiDownloadDialog',

    propTypes: {
        actionName: React.PropTypes.string,
        selection: React.PropTypes.instanceOf(PydioDataModel),
        buildChunks: React.PropTypes.bool
    },

    mixins: [PydioReactUI.ActionDialogMixin, PydioReactUI.CancelButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitleId: 88,
            dialogIsModal: true
        };
    },
    getInitialState: function getInitialState() {
        var _this = this;

        if (!this.props.buildChunks) {
            var _ret = (function () {
                var nodes = new Map();
                _this.props.selection.getSelectedNodes().map(function (node) {
                    nodes.set(node.getPath(), node.getLabel());
                });
                return {
                    v: { nodes: nodes }
                };
            })();

            if (typeof _ret === 'object') return _ret.v;
        } else {
            return { uniqueChunkNode: this.props.selection.getUniqueNode() };
        }
    },
    removeNode: function removeNode(nodePath, event) {
        var nodes = this.state.nodes;
        nodes['delete'](nodePath);
        if (!nodes.size) {
            this.dismiss();
        } else {
            this.setState({ nodes: nodes });
        }
    },
    performChunking: function performChunking() {
        PydioApi.getClient().request({
            get_action: this.props.chunkAction,
            chunk_count: this.refs.chunkCount.getValue(),
            file: this.state.uniqueChunkNode.getPath()
        }, (function (transport) {
            this.setState({ chunkData: transport.responseJSON });
        }).bind(this));
    },
    render: function render() {
        var _this2 = this;

        var rows = [];
        var chunkAction = undefined;
        if (!this.props.buildChunks) {
            (function () {
                var baseUrl = _this2.props.pydio.Parameters.get('ajxpServerAccess') + '&get_action=' + _this2.props.actionName + '&file=';
                _this2.state.nodes.forEach((function (nodeLabel, nodePath) {
                    rows.push(React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'a',
                            { key: nodePath, href: baseUrl + nodePath, onClick: this.removeNode.bind(this, nodePath) },
                            nodeLabel
                        )
                    ));
                }).bind(_this2));
            })();
        } else if (!this.state.chunkData) {
            chunkAction = React.createElement(
                'div',
                null,
                React.createElement(MaterialUI.TextField, { type: 'number', min: '2', step: '1', defaultValue: '2', floatingLabelText: 'Chunk Count', ref: 'chunkCount' }),
                React.createElement(MaterialUI.RaisedButton, { label: 'Chunk', onClick: this.performChunking })
            );
        } else {
            var chunkData = this.state.chunkData;
            var baseUrl = this.props.pydio.Parameters.get('ajxpServerAccess') + '&get_action=' + this.props.actionName + '&file_id=' + chunkData.file_id;
            for (var i = 0; i < chunkData.chunk_count; i++) {
                rows.push(React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'a',
                        { href: baseUrl + "&chunk_index=" + i },
                        chunkData.localname + " (part " + (i + 1) + ")"
                    )
                ));
            }
        }
        return React.createElement(
            'div',
            null,
            chunkAction,
            React.createElement(
                'div',
                null,
                rows
            )
        );
    }

});

exports['default'] = MultiDownloadDialog;
module.exports = exports['default'];

},{"react":"react"}],24:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _callbackOpenInEditor = require('../callback/openInEditor');

var _callbackOpenInEditor2 = _interopRequireDefault(_callbackOpenInEditor);

var React = require('react');

var _require = require('material-ui');

var FontIcon = _require.FontIcon;
var ListItem = _require.ListItem;
var List = _require.List;
var FlatButton = _require.FlatButton;

var Pydio = require('pydio');
var PydioDataModel = require('pydio/model/data-model');
var LangUtils = require('pydio/util/lang');

var _Pydio$requireLib = Pydio.requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;

var OtherEditorPickerDialog = React.createClass({
    displayName: 'OtherEditorPickerDialog',

    propTypes: {
        pydio: React.PropTypes.instanceOf(Pydio),
        selection: React.PropTypes.instanceOf(PydioDataModel)
    },

    mixins: [ActionDialogMixin],

    getButtons: function getButtons(updater) {
        var actions = [];
        var mess = this.props.pydio.MessageHash;
        actions.push(React.createElement(FlatButton, {
            key: 'clear',
            label: MessageHash['openother.5'],
            primary: false,
            onTouchTap: this.clearAssociations
        }));
        actions.push(React.createElement(FlatButton, {
            label: mess['49'],
            primary: true,
            keyboardFocused: true,
            onTouchTap: this.props.onDismiss
        }));
        return actions;
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitleId: 'openother.2',
            dialogIsModal: false,
            dialogSize: 'sm',
            dialogPadding: 0
        };
    },
    findActiveEditors: function findActiveEditors(mime) {
        var editors = [];
        var checkWrite = false;
        var pydio = this.props.pydio;

        if (this.user != null && !this.user.canWrite()) {
            checkWrite = true;
        }
        pydio.Registry.getActiveExtensionByType('editor').forEach(function (el) {
            if (checkWrite && el.write) return;
            if (!el.openable) return;
            editors.push(el);
        });
        return editors;
    },

    clearAssociations: function clearAssociations() {
        var _this = this;

        var mime = this.props.selection.getUniqueNode().getAjxpMime();
        var guiPrefs = undefined,
            assoc = undefined;
        try {
            guiPrefs = this.props.pydio.user.getPreference("gui_preferences", true);
            assoc = guiPrefs["other_editor_extensions"];
        } catch (e) {}
        if (assoc && assoc[mime]) {
            (function () {
                var editorClassName = assoc[mime];
                var editor = undefined;
                _this.props.pydio.Registry.getActiveExtensionByType("editor").forEach(function (ed) {
                    if (ed.editorClass === editorClassName) editor = ed;
                });
                if (editor && editor.mimes.indexOf(mime) !== -1) {
                    editor.mimes = LangUtils.arrayWithout(editor.mimes, editor.mimes.indexOf(mime));
                }
                delete assoc[mime];
                guiPrefs["other_editor_extensions"] = assoc;
                _this.props.pydio.user.setPreference("gui_preferences", guiPrefs, true);
                _this.props.pydio.user.savePreference("gui_preferences");
            })();
        }
        this.props.onDismiss();
    },

    selectEditor: function selectEditor(editor, event) {
        var _props = this.props;
        var pydio = _props.pydio;
        var selection = _props.selection;

        var mime = selection.getUniqueNode().getAjxpMime();
        editor.mimes.push(mime);
        var user = pydio.user;
        if (!user) return;

        var guiPrefs = user.getPreference("gui_preferences", true) || {};
        var exts = guiPrefs["other_editor_extensions"] || {};
        exts[mime] = editor.editorClass;
        guiPrefs["other_editor_extensions"] = exts;
        user.setPreference("gui_preferences", guiPrefs, true);
        user.savePreference("gui_preferences");
        (0, _callbackOpenInEditor2['default'])(pydio)(null, [editor]);
        this.dismiss();
    },

    render: function render() {
        var _this2 = this;

        //let items = [];
        var items = this.findActiveEditors('*').map(function (e) {
            var icon = React.createElement(FontIcon, { className: e.icon_class });
            return React.createElement(ListItem, { onTouchTap: _this2.selectEditor.bind(_this2, e), primaryText: e.text, secondaryText: e.title, leftIcon: icon });
        });
        return React.createElement(
            List,
            { style: { maxHeight: 320, overflowY: 'scroll', width: '100%', borderTop: '1px solid #e0e0e0' } },
            items
        );
    }

});

exports['default'] = OtherEditorPickerDialog;
module.exports = exports['default'];

},{"../callback/openInEditor":18,"material-ui":"material-ui","pydio":"pydio","pydio/model/data-model":"pydio/model/data-model","pydio/util/lang":"pydio/util/lang","react":"react"}],25:[function(require,module,exports){
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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var React = require('react');

var PermissionsDialog = React.createClass({
    displayName: 'PermissionsDialog',

    propsTypes: {
        selection: React.PropTypes.instanceOf(PydioDataModel)
    },

    mixins: [PydioReactUI.ActionDialogMixin, PydioReactUI.CancelButtonProviderMixin, PydioReactUI.SubmitButtonProviderMixin],

    componentWillMount: function componentWillMount() {
        var _this = this;

        var nodes = this.props.selection;
        this.setState({
            permissions: this.props.selection.getUniqueNode().getMetadata().get('file_perms'),
            uPermissions: [false, false, false], // USER
            gPermissions: [false, false, false], // GROUP
            aPermissions: [false, false, false], // ALL

            dropDownValue: 1,
            recursive: false,
            recursiveRange: 'both'
        }, function () {
            _this.getPermissionsMasks();
        });
    },
    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitleId: 88,
            dialogIsModal: true
        };
    },
    getPermissionValue: function getPermissionValue(byteMask) {
        var value = 0;
        value += byteMask[2] ? 4 : 0;
        value += byteMask[1] ? 2 : 0;
        value += byteMask[0] ? 1 : 0;
        return value;
    },
    getChmodValue: function getChmodValue() {
        var value = 0;
        value += this.getPermissionValue(this.state.uPermissions) * 100;
        value += this.getPermissionValue(this.state.gPermissions) * 10;
        value += this.getPermissionValue(this.state.aPermissions);
        return value;
    },
    getByteMask: function getByteMask(nMask) {
        if (nMask > 0x7fffffff || nMask < -0x80000000) {
            throw new TypeError("tableauMasque - intervalle de valeur dépassé");
        }
        for (var nShifted = nMask, aFromMask = []; nShifted; aFromMask.push(Boolean(nShifted & 1)), nShifted >>>= 1);
        return aFromMask;
    },
    getPermissionsMasks: function getPermissionsMasks() {
        this.setState({
            uPermissions: this.getByteMask(Math.floor(this.state.permissions / 100 % 10)), // USER
            gPermissions: this.getByteMask(Math.floor(this.state.permissions / 10 % 10)), // GROUP
            aPermissions: this.getByteMask(Math.floor(this.state.permissions % 10)) // ALL
        });
    },
    onTextFieldChange: function onTextFieldChange(event, value) {
        var _this2 = this;

        this.setState({
            permissions: value
        }, function () {
            _this2.getPermissionsMasks();
        });
    },
    onCheck: function onCheck(row, column, event) {
        var _this3 = this;

        var perm = [].concat(_toConsumableArray(this.state[row]));
        perm[column] = !perm[column];
        var newState = {};
        newState[row] = perm;
        this.setState(newState, function () {
            _this3.setState({ permissions: _this3.getChmodValue() });
        });
    },
    onDropDownMenuChange: function onDropDownMenuChange(event, index, value) {
        this.setState({ dropDownValue: value });
        switch (value) {
            case 1:
                this.setState({
                    recursiveRange: "",
                    recursive: false
                });
                break;
            case 2:
                this.setState({
                    recursiveRange: 'file',
                    recursive: true
                });
                break;
            case 3:
                this.setState({
                    recursiveRange: 'dir',
                    recursive: true
                });
                break;
            case 4:
                this.setState({
                    recursiveRange: 'both',
                    recursive: true
                });
                break;
            default:
                break;
        }
    },
    submit: function submit() {
        PydioApi.getClient().request({
            get_action: 'chmod',
            file: this.props.selection.getUniqueNode().getPath(),
            chmod_value: this.state.permissions,
            recursive: this.state.recursive ? 'on' : '',
            recur_apply_to: this.state.recursiveRange
        }, (function (transport) {
            this.dismiss();
        }).bind(this));
    },
    render: function render() {
        var MessageHash = this.props.pydio.MessageHash;

        return React.createElement(
            'div',
            null,
            React.createElement(
                MaterialUI.Table,
                {
                    selectable: false
                },
                React.createElement(
                    MaterialUI.TableHeader,
                    {
                        displaySelectAll: false,
                        adjustForCheckbox: false
                    },
                    React.createElement(
                        MaterialUI.TableRow,
                        null,
                        React.createElement(MaterialUI.TableHeaderColumn, null),
                        React.createElement(
                            MaterialUI.TableHeaderColumn,
                            { tooltip: 'R' },
                            MessageHash[361]
                        ),
                        React.createElement(
                            MaterialUI.TableHeaderColumn,
                            { tooltip: 'W' },
                            MessageHash[362]
                        ),
                        React.createElement(
                            MaterialUI.TableHeaderColumn,
                            { tooltip: 'X' },
                            MessageHash[615]
                        )
                    )
                ),
                React.createElement(
                    MaterialUI.TableBody,
                    {
                        displayRowCheckbox: false
                    },
                    React.createElement(
                        MaterialUI.TableRow,
                        null,
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            MessageHash[288]
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'uPermissions', 2), checked: this.state.uPermissions[2] })
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'uPermissions', 1), checked: this.state.uPermissions[1] })
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'uPermissions', 0), checked: this.state.uPermissions[0] })
                        )
                    ),
                    React.createElement(
                        MaterialUI.TableRow,
                        null,
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            MessageHash[289]
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'gPermissions', 2), checked: this.state.gPermissions[2] })
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'gPermissions', 1), checked: this.state.gPermissions[1] })
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'gPermissions', 0), checked: this.state.gPermissions[0] })
                        )
                    ),
                    React.createElement(
                        MaterialUI.TableRow,
                        null,
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            MessageHash[290]
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'aPermissions', 2), checked: this.state.aPermissions[2] })
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'aPermissions', 1), checked: this.state.aPermissions[1] })
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'aPermissions', 0), checked: this.state.aPermissions[0] })
                        )
                    )
                )
            ),
            React.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'baseline' } },
                React.createElement(
                    'p',
                    null,
                    MessageHash[616]
                ),
                React.createElement(MaterialUI.TextField, { value: this.state.permissions, onChange: this.onTextFieldChange, style: { marginLeft: 4, width: 50 }, type: 'number' }),
                React.createElement(
                    'p',
                    { style: { marginLeft: 20 } },
                    MessageHash[291]
                ),
                React.createElement(
                    MaterialUI.DropDownMenu,
                    { value: this.state.dropDownValue, onChange: this.onDropDownMenuChange, style: { marginLeft: -10 } },
                    React.createElement(MaterialUI.MenuItem, { value: 1, primaryText: MessageHash[441] }),
                    React.createElement(MaterialUI.MenuItem, { value: 2, primaryText: MessageHash[265] }),
                    React.createElement(MaterialUI.MenuItem, { value: 3, primaryText: MessageHash[130] }),
                    React.createElement(MaterialUI.MenuItem, { value: 4, primaryText: MessageHash[597] })
                )
            )
        );
    }

});

exports['default'] = PermissionsDialog;
module.exports = exports['default'];

},{"react":"react"}],26:[function(require,module,exports){
(function (global){
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var PydioDataModel = require('pydio/model/data-model');
var AjxpNode = require('pydio/model/node');
var RemoteNodeProvider = require('pydio/model/remote-node-provider');

var _require = require('material-ui');

var MenuItem = _require.MenuItem;
var SelectField = _require.SelectField;
var TextField = _require.TextField;
var Paper = _require.Paper;
var RaisedButton = _require.RaisedButton;
var IconButton = _require.IconButton;
var FlatButton = _require.FlatButton;

var _require$requireLib = require('pydio').requireLib('components');

var FoldersTree = _require$requireLib.FoldersTree;

var TreeDialog = React.createClass({
    displayName: 'TreeDialog',

    propTypes: {
        isMove: React.PropTypes.bool.isRequired,
        submitValue: React.PropTypes.func.isRequired
    },

    mixins: [PydioReactUI.ActionDialogMixin, PydioReactUI.CancelButtonProviderMixin, PydioReactUI.SubmitButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: 'Copy/Move',
            dialogIsModal: true,
            dialogScrollBody: true
        };
    },

    submit: function submit() {
        this.props.submitValue(this.state.selectedNode.getPath(), this.state.wsId === '__CURRENT__' ? null : this.state.wsId);
        this.dismiss();
    },

    getInitialState: function getInitialState() {
        var dm = this.getCurrentDataModel();
        var root = dm.getRootNode();
        root.load();
        return {
            dataModel: dm,
            selectedNode: root,
            wsId: root.getMetadata().get('repository_id') || '__CURRENT__'
        };
    },

    getCurrentDataModel: function getCurrentDataModel() {
        var value = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
        var user = this.props.pydio.user;

        var repoId = undefined,
            repoLabel = user.getRepositoriesList().get(user.activeRepository).getLabel();
        if (value !== null && value !== '__CURRENT__') {
            repoId = value;
            repoLabel = user.getCrossRepositories().get(value).getLabel();
        } else if (value === null) {
            // Detect default value
            if (!user.canWrite() && user.canCrossRepositoryCopy() && user.hasCrossRepositories()) {
                repoId = user.getCrossRepositories().keys().next().value;
                repoLabel = user.getCrossRepositories().get(repoId).getLabel();
            }
        }
        var dm = PydioDataModel.RemoteDataModelFactory(repoId ? { tmp_repository_id: repoId } : {}, repoLabel);
        var root = dm.getRootNode();
        if (repoId) root.getMetadata().set('repository_id', repoId);
        return dm;
    },

    onNodeSelected: function onNodeSelected(n) {
        n.load();
        this.setState({
            selectedNode: n
        });
    },

    createNewFolder: function createNewFolder() {
        var parent = this.state.selectedNode;
        var nodeName = this.refs.newfolder_input.getValue();
        var oThis = this;
        var additional = this.state.wsId !== '__CURRENT__' ? { tmp_repository_id: this.state.wsId } : {};

        PydioApi.getClient().request(_extends({
            get_action: 'mkdir',
            dir: parent.getPath(),
            dirname: nodeName
        }, additional), function () {
            var fullpath = parent.getPath() + '/' + nodeName;
            parent.observeOnce('loaded', function () {
                var n = parent.getChildren().get(fullpath);
                if (n) oThis.setState({ selectedNode: n });
            });
            global.setTimeout(function () {
                parent.reload();
            }, 500);
            oThis.setState({ newFolderFormOpen: false });
        });
    },

    handleRepositoryChange: function handleRepositoryChange(event, index, value) {
        var dm = this.getCurrentDataModel(value);
        var root = dm.getRootNode();
        root.load();
        this.setState({ dataModel: dm, selectedNode: root, wsId: value });
    },

    render: function render() {
        var _this = this;

        var openNewFolderForm = (function () {
            this.setState({ newFolderFormOpen: !this.state.newFolderFormOpen });
        }).bind(this);

        var user = this.props.pydio.user;
        var wsSelector = undefined;
        if (user && user.canCrossRepositoryCopy() && user.hasCrossRepositories()) {
            (function () {
                var items = [];
                if (user.canWrite()) {
                    items.push(React.createElement(MenuItem, { key: 'current', value: '__CURRENT__', primaryText: _this.props.pydio.MessageHash[372] }));
                }
                user.getCrossRepositories().forEach(function (repo, key) {
                    items.push(React.createElement(MenuItem, { key: key, value: key, primaryText: repo.getLabel() }));
                });
                wsSelector = React.createElement(
                    'div',
                    null,
                    React.createElement(
                        SelectField,
                        {
                            style: { width: '100%' },
                            floatingLabelText: _this.props.pydio.MessageHash[373],
                            value: _this.state.wsId,
                            onChange: _this.handleRepositoryChange
                        },
                        items
                    )
                );
            })();
        }
        var openStyle = { flex: 1, width: '100%' };
        var closeStyle = { width: 0 };
        var newFolderFormOpen = this.state.newFolderFormOpen;

        return React.createElement(
            'div',
            { style: { width: '100%' } },
            wsSelector,
            React.createElement(
                Paper,
                { zDepth: 0, style: { height: 300, overflowX: 'auto', color: '#546E7A', fontSize: 14, padding: '6px 0px', backgroundColor: '#eceff1', marginTop: -6 } },
                React.createElement(
                    'div',
                    { style: { marginTop: -41, marginLeft: -21 } },
                    React.createElement(FoldersTree, {
                        pydio: this.props.pydio,
                        dataModel: this.state.dataModel,
                        onNodeSelected: this.onNodeSelected,
                        showRoot: true,
                        draggable: false
                    })
                )
            ),
            React.createElement(
                Paper,
                {
                    className: 'bezier-transitions',
                    zDepth: 0,
                    style: {
                        backgroundColor: '#eceff1',
                        display: 'flex',
                        alignItems: 'baseline',
                        height: newFolderFormOpen ? 80 : 0,
                        overflow: newFolderFormOpen ? 'visible' : 'hidden',
                        opacity: newFolderFormOpen ? 1 : 0,
                        padding: '0 10px',
                        marginTop: 6
                    }
                },
                React.createElement(TextField, { fullWidth: true, floatingLabelText: this.props.pydio.MessageHash[173], ref: 'newfolder_input', style: { flex: 1 } }),
                React.createElement(IconButton, { iconClassName: 'mdi mdi-undo', iconStyle: { color: '#546E7A' }, tooltip: this.props.pydio.MessageHash[49], onTouchTap: openNewFolderForm }),
                React.createElement(IconButton, { iconClassName: 'mdi mdi-check', iconStyle: { color: '#546E7A' }, tooltip: this.props.pydio.MessageHash[48], onTouchTap: function () {
                        _this.createNewFolder();
                    } })
            ),
            React.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'baseline' } },
                React.createElement(TextField, {
                    style: { flex: 1, width: '100%', marginRight: 10 },
                    floatingLabelText: this.props.pydio.MessageHash[373],
                    ref: 'input',
                    value: this.state.selectedNode.getPath(),
                    disabled: false,
                    onChange: function () {}
                }),
                !newFolderFormOpen && React.createElement(IconButton, { iconClassName: 'mdi mdi-folder-plus', style: { backgroundColor: '#eceff1', borderRadius: '50%' }, iconStyle: { color: '#546E7A' }, tooltip: this.props.pydio.MessageHash[154], onTouchTap: openNewFolderForm })
            )
        );
    }

});

exports['default'] = TreeDialog;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"material-ui":"material-ui","pydio":"pydio","pydio/model/data-model":"pydio/model/data-model","pydio/model/node":"pydio/model/node","pydio/model/remote-node-provider":"pydio/model/remote-node-provider","react":"react"}],27:[function(require,module,exports){
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
var React = require('react');

var _require$requireLib = require('pydio').requireLib('boot');

var ActionDialogMixin = _require$requireLib.ActionDialogMixin;
var SubmitButtonProviderMixin = _require$requireLib.SubmitButtonProviderMixin;

var UploadDialog = React.createClass({
    displayName: 'UploadDialog',

    mixins: [ActionDialogMixin, SubmitButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        var mobile = pydio.UI.MOBILE_EXTENSIONS;
        return {
            dialogTitle: '',
            dialogSize: mobile ? 'md' : 'lg',
            dialogPadding: false,
            dialogIsModal: true
        };
    },

    submit: function submit() {
        this.dismiss();
    },

    render: function render() {
        var _this = this;

        var tabs = [];
        var uploaders = this.props.pydio.Registry.getActiveExtensionByType("uploader");
        var dismiss = function dismiss() {
            _this.dismiss();
        };

        uploaders.sort(function (objA, objB) {
            return objA.order - objB.order;
        });

        uploaders.map(function (uploader) {
            if (uploader.moduleName) {
                var parts = uploader.moduleName.split('.');
                tabs.push(React.createElement(
                    MaterialUI.Tab,
                    { label: uploader.xmlNode.getAttribute('label'), key: uploader.id },
                    React.createElement(PydioReactUI.AsyncComponent, {
                        pydio: _this.props.pydio,
                        namespace: parts[0],
                        componentName: parts[1],
                        onDismiss: dismiss
                    })
                ));
            }
        });

        return React.createElement(
            MaterialUI.Tabs,
            { style: { width: '100%' } },
            tabs
        );
    }

});

exports['default'] = UploadDialog;
module.exports = exports['default'];

},{"pydio":"pydio","react":"react"}],28:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _dialogMultiDownloadDialog = require('./dialog/MultiDownloadDialog');

var _dialogMultiDownloadDialog2 = _interopRequireDefault(_dialogMultiDownloadDialog);

var _dialogOtherEditorPickerDialog = require('./dialog/OtherEditorPickerDialog');

var _dialogOtherEditorPickerDialog2 = _interopRequireDefault(_dialogOtherEditorPickerDialog);

var _dialogPermissionsDialog = require('./dialog/PermissionsDialog');

var _dialogPermissionsDialog2 = _interopRequireDefault(_dialogPermissionsDialog);

var _dialogTreeDialog = require('./dialog/TreeDialog');

var _dialogTreeDialog2 = _interopRequireDefault(_dialogTreeDialog);

var _dialogUploadDialog = require('./dialog/UploadDialog');

var _dialogUploadDialog2 = _interopRequireDefault(_dialogUploadDialog);

var _callbackIndex = require('./callback/index');

var _callbackIndex2 = _interopRequireDefault(_callbackIndex);

var _listenerIndex = require('./listener/index');

var _listenerIndex2 = _interopRequireDefault(_listenerIndex);

exports.Callbacks = _callbackIndex2['default'];
exports.Listeners = _listenerIndex2['default'];
exports.MultiDownloadDialog = _dialogMultiDownloadDialog2['default'];
exports.UploadDialog = _dialogUploadDialog2['default'];
exports.OtherEditorPickerDialog = _dialogOtherEditorPickerDialog2['default'];
exports.PermissionsDialog = _dialogPermissionsDialog2['default'];
exports.TreeDialog = _dialogTreeDialog2['default'];

},{"./callback/index":12,"./dialog/MultiDownloadDialog":23,"./dialog/OtherEditorPickerDialog":24,"./dialog/PermissionsDialog":25,"./dialog/TreeDialog":26,"./dialog/UploadDialog":27,"./listener/index":33}],29:[function(require,module,exports){
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

exports['default'] = function (pydio) {

    return function () {
        var userSelection = pydio.getUserSelection();
        if (!pydio.Parameters.get('zipEnabled') || !pydio.Parameters.get('multipleFilesDownloadEnabled')) {
            if (userSelection.isUnique()) this.selectionContext.multipleOnly = true;else this.selectionContext.unique = true;
        }
    };
};

module.exports = exports['default'];

},{}],30:[function(require,module,exports){
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

exports['default'] = function (pydio) {

    return function () {

        this.rightsContext.write = true;
        var pydioUser = pydio.user;
        if (pydioUser && pydioUser.canRead() && pydioUser.canCrossRepositoryCopy() && pydioUser.hasCrossRepositories()) {
            this.rightsContext.write = false;
            if (!pydioUser.canWrite()) {
                pydio.getController().defaultActions['delete']('ctrldragndrop');
                pydio.getController().defaultActions['delete']('dragndrop');
            }
        }
        if (pydioUser && pydioUser.canWrite() && pydio.getContextNode().hasAjxpMimeInBranch("ajxp_browsable_archive")) {
            this.rightsContext.write = false;
        }
        if (pydio.getContextNode().hasAjxpMimeInBranch("ajxp_browsable_archive")) {
            this.setLabel(247, 248);
        } else {
            this.setLabel(66, 159);
        }
    };
};

module.exports = exports['default'];

},{}],31:[function(require,module,exports){
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

exports['default'] = function (pydio) {

    return function () {

        if (!pydio.Parameters.get('zipEnabled') || !pydio.Parameters.get('multipleFilesDownloadEnabled')) {
            this.hide();
            pydio.Controller.actions["delete"]("download_all");
        }
    };
};

module.exports = exports['default'];

},{}],32:[function(require,module,exports){
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

exports['default'] = function (pydio) {

    return function () {
        var userSelection = pydio.getUserSelection();
        if (pydio.Parameters.get('zipEnabled') && pydio.Parameters.get('multipleFilesDownloadEnabled')) {
            /*
            if ((userSelection.isUnique() && !userSelection.hasDir()) || userSelection.isEmpty()) {
                // Update icon class
            } else {
                 // Update icon class
            }
            */
        } else if (userSelection.hasDir()) {
                this.selectionContext.dir = false;
            }
    };
};

module.exports = exports['default'];

},{}],33:[function(require,module,exports){
(function (global){
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
var pydio = global.pydio;

var Listeners = {
  downloadSelectionChange: require('./downloadSelectionChange')(pydio),
  downloadAllInit: require('./downloadAllInit')(pydio),
  compressUiSelectionChange: require('./compressUiSelectionChange')(pydio),
  copyContextChange: require('./copyContextChange')(pydio),
  openWithDynamicBuilder: require('./openWithDynamicBuilder')(pydio),
  lockSelectionChange: require('./lockSelectionChange')(pydio)
};

exports['default'] = Listeners;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./compressUiSelectionChange":29,"./copyContextChange":30,"./downloadAllInit":31,"./downloadSelectionChange":32,"./lockSelectionChange":34,"./openWithDynamicBuilder":35}],34:[function(require,module,exports){
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

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = function (pydio) {
    return function () {

        var action = pydio.getController().getActionByName("sl_lock");
        var n = pydio.getUserSelection().getUniqueNode();
        if (action && n) {
            action.selectionContext.allowedMimes = [];
            if (n.getMetadata().get("sl_locked")) {
                action.setIconClassName('icon-unlock');
                action.setLabel('meta.simple_lock.3');
                if (!n.getMetadata().get("sl_mylock")) {
                    action.selectionContext.allowedMimes = ["fake_extension_that_never_exists"];
                }
            } else {
                action.setIconClassName('icon-lock');
                action.setLabel('meta.simple_lock.1');
            }
        }
    };
};

module.exports = exports["default"];

},{}],35:[function(require,module,exports){
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
var PathUtils = require('pydio/util/path');

exports['default'] = function (pydio) {

    var openOtherEditorPicker = require('../callback/openOtherEditorPicker')(pydio);
    var MessageHash = pydio.MessageHash;

    return function () {
        var _this = this;

        var builderMenuItems = [];
        if (pydio.getUserSelection().isEmpty()) {
            return builderMenuItems;
        }
        var node = pydio.getUserSelection().getUniqueNode();
        var selectedMime = PathUtils.getAjxpMimeType(node);
        var nodeHasReadonly = node.getMetadata().get("node_readonly") === "true";

        var user = pydio.user;
        // Patch editors list before looking for available ones
        if (user && user.getPreference("gui_preferences", true) && user.getPreference("gui_preferences", true)["other_editor_extensions"]) {
            (function () {
                var otherRegistered = user.getPreference("gui_preferences", true)["other_editor_extensions"];
                Object.keys(otherRegistered).forEach((function (key) {
                    var editor = undefined;
                    pydio.Registry.getActiveExtensionByType("editor").forEach(function (ed) {
                        if (ed.editorClass == otherRegistered[key]) {
                            editor = ed;
                        }
                    });
                    if (editor && editor.mimes.indexOf(key) === -1) {
                        editor.mimes.push(key);
                    }
                }).bind(_this));
            })();
        }

        var editors = pydio.Registry.findEditorsForMime(selectedMime);
        var index = 0,
            sepAdded = false;
        if (editors.length) {
            editors.forEach((function (el) {
                if (!el.openable) return;
                if (el.write && nodeHasReadonly) return;
                if (el.mimes.indexOf('*') > -1) {
                    if (!sepAdded && index > 0) {
                        builderMenuItems.push({ separator: true });
                    }
                    sepAdded = true;
                }
                builderMenuItems.push({
                    name: el.text,
                    alt: el.title,
                    isDefault: index == 0,
                    icon_class: el.icon_class,
                    callback: (function (e) {
                        this.apply([el]);
                    }).bind(this)
                });
                index++;
            }).bind(this));
            builderMenuItems.push({
                name: MessageHash['openother.1'],
                alt: MessageHash['openother.2'],
                isDefault: index === 0,
                icon_class: 'icon-list-alt',
                callback: openOtherEditorPicker
            });
        }
        if (!index) {
            builderMenuItems.push({
                name: MessageHash[324],
                alt: MessageHash[324],
                callback: function callback(e) {}
            });
        }
        return builderMenuItems;
    };
};

module.exports = exports['default'];

},{"../callback/openOtherEditorPicker":19,"pydio/util/path":"pydio/util/path"}]},{},[28])(28)
});
