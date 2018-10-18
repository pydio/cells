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

        var slug = pydio.user.getActiveRepositoryObject().getSlug();
        var targetSlug = slug;
        if (wsId) {
            var target = pydio.user.getRepositoriesList().get(wsId);
            if (target) {
                targetSlug = target.getSlug();
            }
        }
        var nodes = selection.getSelectedNodes();
        var paths = nodes.map(function (n) {
            return slug + n.getPath();
        });
        var jobParams = {
            nodes: paths,
            target: targetSlug + path,
            targetParent: true
        };
        PydioApi.getRestClient().userJob(type, jobParams).then(function (r) {
            if (type === 'move') {
                nodes.forEach(function (n) {
                    var m = pydio.MessageHash['background.move.' + (n.isLeaf() ? 'file' : 'folder')];
                    n.getMetadata().set('pending_operation', m);
                    n.notify('meta_replaced', n);
                });
            } else {
                pydio.UI.displayMessage('SUCCESS', pydio.MessageHash['background.copy.selection']);
            }
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

},{"./applyCopyOrMove":2}],4:[function(require,module,exports){
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
    var MessageHash = pydio.MessageHash;

    return function () {
        var message = MessageHash[176];
        if (pydio.getContextHolder().getContextNode().getPath().indexOf('/recycle_bin') === 0) {
            message = MessageHash[177];
        }
        // Detect shared node - Disabled for now as this is NOT disabled by the delete action
        /*
        if(pydio.getPluginConfigs('action.share').size){
            let shared = [];
            pydio.getContextHolder().getSelectedNodes().forEach((n) => {
                if(n.getMetadata().get('pydio_is_shared')){
                    shared.push(n);
                }
            });
            if(shared.length){
                const n = shared[0];
                message = (
                    <div>
                        <div>{message}</div>
                        <div style={{color:'#D32F2F', marginTop: 10}}><span className="mdi mdi-alert"/>{MessageHash['share_center.' + (n.isLeaf()?'158':'157')]}</div>
                    </div>
                );
            }
        }
        */
        pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
            message: message,
            dialogTitleId: 7,
            validCallback: function validCallback() {
                var nodes = pydio.getContextHolder().getSelectedNodes();
                var slug = pydio.user.getActiveRepositoryObject().getSlug();
                var deleteRequest = new _pydioHttpRestApi.RestDeleteNodesRequest();
                var api = new _pydioHttpRestApi.TreeServiceApi(_pydioHttpApi2['default'].getRestClient());
                deleteRequest.Nodes = nodes.map(function (n) {
                    var t = new _pydioHttpRestApi.TreeNode();
                    t.Path = slug + n.getPath();
                    return t;
                });
                api.deleteNodes(deleteRequest).then(function (r) {
                    if (r.DeleteJobs && r.DeleteJobs.length) {
                        nodes.forEach(function (n) {
                            n.getMetadata().set('pending_operation', r.DeleteJobs[0].Label);
                            n.notify('meta_replaced', n);
                        });
                    }
                    pydio.getContextHolder().setSelectedNodes([]);
                });
            }
        });
    };
};

module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api"}],5:[function(require,module,exports){
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

},{"pydio/http/api":"pydio/http/api"}],6:[function(require,module,exports){
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

},{"./download":5}],7:[function(require,module,exports){
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

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

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
        var newSelection = new _pydioModelDataModel2['default']();
        newSelection.setSelectedNodes([newNode]);
        _pydioHttpApi2['default'].getClient().downloadSelection(newSelection, 'download');
    };
};

module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api","pydio/model/data-model":"pydio/model/data-model","pydio/model/node":"pydio/model/node"}],8:[function(require,module,exports){
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

var _pydioHttpApi = require("pydio/http/api");

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

exports['default'] = function (pydio) {
    var MessageHash = pydio.MessageHash;

    return function () {

        pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
            message: MessageHash[177],
            dialogTitleId: 220,
            validCallback: function validCallback() {
                var slug = pydio.user.getActiveRepositoryObject().getSlug();
                var deleteRequest = new _pydioHttpRestApi.RestDeleteNodesRequest();
                var api = new _pydioHttpRestApi.TreeServiceApi(_pydioHttpApi2['default'].getRestClient());
                var n = new _pydioHttpRestApi.TreeNode();
                n.Path = slug + '/recycle_bin';
                deleteRequest.Nodes = [n];
                api.deleteNodes(deleteRequest).then(function (r) {
                    if (r.DeleteJobs) {
                        r.DeleteJobs.forEach(function (j) {
                            pydio.UI.displayMessage('SUCCESS', j.Label);
                        });
                    }
                    pydio.getContextHolder().requireContextChange(pydio.getContextHolder().getRootNode());
                });
            }
        });
    };
};

module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api"}],9:[function(require,module,exports){
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
  emptyRecycle: require('./emptyRecycle')(pydio),
  restore: require('./restore')(pydio),
  openInEditor: require('./openInEditor')(pydio),
  ajxpLink: require('./ajxpLink')(pydio),
  openOtherEditorPicker: require('./openOtherEditorPicker')(pydio),
  lock: require('./lock')(pydio)
};

exports['default'] = Callbacks;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ajxpLink":1,"./applyCopyOrMove":2,"./copy":3,"./deleteAction":4,"./download":5,"./downloadAll":6,"./downloadFolder":7,"./emptyRecycle":8,"./lock":10,"./ls":11,"./mkdir":12,"./mkfile":13,"./move":14,"./openInEditor":15,"./openOtherEditorPicker":16,"./rename":17,"./restore":18,"./upload":19}],10:[function(require,module,exports){
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
        var api = new _pydioHttpRestApi.UserMetaServiceApi(_pydioHttpApi2['default'].getRestClient());
        var req = new _pydioHttpRestApi.IdmUpdateUserMetaRequest();
        var node = pydio.getContextHolder().getUniqueNode();
        var meta = new _pydioHttpRestApi.IdmUserMeta();
        meta.NodeUuid = node.getMetadata().get('uuid');
        meta.Namespace = "content_lock";
        meta.JsonValue = pydio.user.id;
        var p = undefined;
        var wasLocked = node.getMetadata().get("sl_locked");
        if (wasLocked) {
            req.Operation = 'DELETE';
        } else {
            req.Operation = 'PUT';
        }
        req.MetaDatas = [meta];
        api.updateUserMeta(req).then(function (res) {
            pydio.getContextHolder().requireNodeReload(node);
        });
    };
};

module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api"}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _pydioHttpApi = require("pydio/http/api");

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioHttpRestApi = require("pydio/http/rest-api");

exports["default"] = function (pydio) {

    return function () {

        var submit = function submit(value) {
            var api = new _pydioHttpRestApi.TreeServiceApi(_pydioHttpApi2["default"].getRestClient());
            var request = new _pydioHttpRestApi.RestCreateNodesRequest();
            var slug = pydio.user.getActiveRepositoryObject().getSlug();
            var path = slug + _pydioUtilLang2["default"].trimRight(pydio.getContextNode().getPath(), '/') + '/' + value;
            var node = new _pydioHttpRestApi.TreeNode();
            node.Path = path;
            node.Type = _pydioHttpRestApi.TreeNodeType.constructFromObject('COLLECTION');
            request.Nodes = [node];
            api.createNodes(request).then(function (collection) {
                console.log('Created nodes', collection.Children);
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

module.exports = exports["default"];

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/lang":"pydio/util/lang"}],13:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _pydioHttpApi = require("pydio/http/api");

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioHttpRestApi = require("pydio/http/rest-api");

exports["default"] = function (pydio) {

    return function () {
        var submit = function submit(value) {
            var api = new _pydioHttpRestApi.TreeServiceApi(_pydioHttpApi2["default"].getRestClient());
            var request = new _pydioHttpRestApi.RestCreateNodesRequest();
            var slug = pydio.user.getActiveRepositoryObject().getSlug();
            var path = slug + _pydioUtilLang2["default"].trimRight(pydio.getContextNode().getPath(), '/') + '/' + value;
            var node = new _pydioHttpRestApi.TreeNode();
            node.Path = path;
            node.Type = _pydioHttpRestApi.TreeNodeType.constructFromObject('LEAF');
            request.Nodes = [node];
            api.createNodes(request).then(function (collection) {
                console.log('Create files', collection.Children);
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

module.exports = exports["default"];

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/lang":"pydio/util/lang"}],14:[function(require,module,exports){
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

                var target = dndActionParameter.getTarget();
                var source = dndActionParameter.getSource();
                if (target.isLeaf() || target.getPath() === source.getPath()) {
                    throw new Error('Cannot drop on leaf or on same path');
                } else if (target.getMetadata().has("virtual_root")) {
                    throw new Error('Cannot drop on virtual root');
                } else if (source.getMetadata().has("ws_root")) {
                    throw new Error('Cannot move roots around');
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

},{"./applyCopyOrMove":2,"pydio":"pydio"}],15:[function(require,module,exports){
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
        pydio.UI.openComponentInModal('FSActions', 'OtherEditorPickerDialog', {
            selection: pydio.getUserSelection(),
            pydio: pydio
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

exports['default'] = function (pydio) {

    return function () {
        var _callback = function _callback(node, newValue) {
            if (!node) {
                node = pydio.getUserSelection().getUniqueNode();
            }
            var slug = pydio.user.getActiveRepositoryObject().getSlug();
            var path = slug + node.getPath();
            var target = _pydioUtilPath2['default'].getDirname(path) + '/' + newValue;
            var jobParams = {
                nodes: [path],
                target: target,
                targetParent: false
            };
            _pydioHttpApi2['default'].getRestClient().userJob('move', jobParams).then(function (r) {
                pydio.UI.displayMessage('SUCCESS', 'Renaming');
                pydio.getContextHolder().setSelectedNodes([]);
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

},{"pydio/http/api":"pydio/http/api","pydio/util/path":"pydio/util/path"}],18:[function(require,module,exports){
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

        var nodes = pydio.getContextHolder().getSelectedNodes();
        var slug = pydio.user.getActiveRepositoryObject().getSlug();
        var restoreRequest = new _pydioHttpRestApi.RestRestoreNodesRequest();
        var api = new _pydioHttpRestApi.TreeServiceApi(_pydioHttpApi2['default'].getRestClient());
        restoreRequest.Nodes = nodes.map(function (n) {
            var t = new _pydioHttpRestApi.TreeNode();
            t.Path = slug + n.getPath();
            return t;
        });
        api.restoreNodes(restoreRequest).then(function (r) {
            if (r.RestoreJobs && r.RestoreJobs.length) {
                nodes.forEach(function (n) {
                    n.getMetadata().set('pending_operation', r.RestoreJobs[0].Label);
                    n.notify('meta_replaced', n);
                });
            }
            pydio.getContextHolder().setSelectedNodes([]);
        });
    };
};

module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api"}],19:[function(require,module,exports){
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

},{"../callback/openInEditor":15,"material-ui":"material-ui","pydio":"pydio","pydio/model/data-model":"pydio/model/data-model","pydio/util/lang":"pydio/util/lang","react":"react"}],21:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioHttpRestApi = require("pydio/http/rest-api");

var _pydioModelDataModel = require("pydio/model/data-model");

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _materialUi = require("material-ui");

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2["default"].requireLib('components');

var FoldersTree = _Pydio$requireLib.FoldersTree;

var TreeDialog = _react2["default"].createClass({
    displayName: "TreeDialog",

    propTypes: {
        isMove: _react2["default"].PropTypes.bool.isRequired,
        submitValue: _react2["default"].PropTypes.func.isRequired
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
        root.load(dm.getAjxpNodeProvider());
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
        var dm = _pydioModelDataModel2["default"].RemoteDataModelFactory(repoId ? { tmp_repository_id: repoId } : {}, repoLabel);
        var root = dm.getRootNode();
        if (repoId) {
            root.getMetadata().set('repository_id', repoId);
        }
        return dm;
    },

    onNodeSelected: function onNodeSelected(n) {
        var dataModel = this.state.dataModel;

        n.load(dataModel.getAjxpNodeProvider());
        this.setState({
            selectedNode: n
        });
    },

    createNewFolder: function createNewFolder() {
        var _this = this;

        var pydio = this.props.pydio;

        var parent = this.state.selectedNode;
        var nodeName = this.refs.newfolder_input.getValue();
        var slug = pydio.user.getActiveRepositoryObject().getSlug();
        if (this.state.wsId !== '__CURRENT__') {
            var repo = pydio.user.getRepositoriesList().get(this.state.wsId);
            slug = repo.getSlug();
        }
        var api = new _pydioHttpRestApi.TreeServiceApi(PydioApi.getRestClient());
        var request = new _pydioHttpRestApi.RestCreateNodesRequest();

        var path = slug + _pydioUtilLang2["default"].trimRight(parent.getPath(), '/') + '/' + nodeName;
        var node = new _pydioHttpRestApi.TreeNode();
        node.Path = path;
        node.Type = _pydioHttpRestApi.TreeNodeType.constructFromObject('COLLECTION');
        request.Nodes = [node];
        api.createNodes(request).then(function (collection) {
            var fullpath = parent.getPath() + '/' + nodeName;
            parent.observeOnce('loaded', function () {
                var n = parent.getChildren().get(fullpath);
                if (n) {
                    _this.setState({ selectedNode: n });
                }
            });
            setTimeout(function () {
                return parent.reload();
            }, 1500);
            _this.setState({ newFolderFormOpen: false });
        });
    },

    handleRepositoryChange: function handleRepositoryChange(event, index, value) {
        var dm = this.getCurrentDataModel(value);
        var root = dm.getRootNode();
        root.load();
        this.setState({ dataModel: dm, selectedNode: root, wsId: value });
    },

    render: function render() {
        var _this2 = this;

        var openNewFolderForm = function openNewFolderForm() {
            _this2.setState({ newFolderFormOpen: !_this2.state.newFolderFormOpen });
        };

        var user = this.props.pydio.user;
        var wsSelector = undefined;
        if (user && user.canCrossRepositoryCopy() && user.hasCrossRepositories()) {
            (function () {
                var items = [];
                if (user.canWrite()) {
                    items.push(_react2["default"].createElement(_materialUi.MenuItem, { key: 'current', value: '__CURRENT__', primaryText: _this2.props.pydio.MessageHash[372] }));
                }
                user.getCrossRepositories().forEach(function (repo, key) {
                    items.push(_react2["default"].createElement(_materialUi.MenuItem, { key: key, value: key, primaryText: repo.getLabel() }));
                });
                wsSelector = _react2["default"].createElement(
                    "div",
                    null,
                    _react2["default"].createElement(
                        _materialUi.SelectField,
                        {
                            style: { width: '100%' },
                            floatingLabelText: _this2.props.pydio.MessageHash[373],
                            value: _this2.state.wsId,
                            onChange: _this2.handleRepositoryChange
                        },
                        items
                    )
                );
            })();
        }
        var openStyle = { flex: 1, width: '100%' };
        var closeStyle = { width: 0 };
        var newFolderFormOpen = this.state.newFolderFormOpen;

        return _react2["default"].createElement(
            "div",
            { style: { width: '100%' } },
            wsSelector,
            _react2["default"].createElement(
                _materialUi.Paper,
                { zDepth: 0, style: { height: 300, overflowX: 'auto', color: '#546E7A', fontSize: 14, padding: '6px 0px', backgroundColor: '#eceff1', marginTop: -6 } },
                _react2["default"].createElement(
                    "div",
                    { style: { marginTop: -41, marginLeft: -21 } },
                    _react2["default"].createElement(FoldersTree, {
                        pydio: this.props.pydio,
                        dataModel: this.state.dataModel,
                        onNodeSelected: this.onNodeSelected,
                        showRoot: true,
                        draggable: false
                    })
                )
            ),
            _react2["default"].createElement(
                _materialUi.Paper,
                {
                    className: "bezier-transitions",
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
                _react2["default"].createElement(_materialUi.TextField, { fullWidth: true, floatingLabelText: this.props.pydio.MessageHash[173], ref: "newfolder_input", style: { flex: 1 } }),
                _react2["default"].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-undo", iconStyle: { color: '#546E7A' }, tooltip: this.props.pydio.MessageHash[49], onTouchTap: openNewFolderForm }),
                _react2["default"].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-check", iconStyle: { color: '#546E7A' }, tooltip: this.props.pydio.MessageHash[48], onTouchTap: function () {
                        _this2.createNewFolder();
                    } })
            ),
            _react2["default"].createElement(
                "div",
                { style: { display: 'flex', alignItems: 'baseline' } },
                _react2["default"].createElement(_materialUi.TextField, {
                    style: { flex: 1, width: '100%', marginRight: 10 },
                    floatingLabelText: this.props.pydio.MessageHash[373],
                    ref: "input",
                    value: this.state.selectedNode.getPath(),
                    disabled: false,
                    onChange: function () {}
                }),
                !newFolderFormOpen && _react2["default"].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-folder-plus", style: { backgroundColor: '#eceff1', borderRadius: '50%' }, iconStyle: { color: '#546E7A' }, tooltip: this.props.pydio.MessageHash[154], onTouchTap: openNewFolderForm })
            )
        );
    }

});

exports["default"] = TreeDialog;
module.exports = exports["default"];

},{"material-ui":"material-ui","pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api","pydio/model/data-model":"pydio/model/data-model","pydio/util/lang":"pydio/util/lang","react":"react"}],22:[function(require,module,exports){
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

},{"pydio":"pydio","react":"react"}],23:[function(require,module,exports){
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

var _dialogOtherEditorPickerDialog = require('./dialog/OtherEditorPickerDialog');

var _dialogOtherEditorPickerDialog2 = _interopRequireDefault(_dialogOtherEditorPickerDialog);

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
exports.UploadDialog = _dialogUploadDialog2['default'];
exports.OtherEditorPickerDialog = _dialogOtherEditorPickerDialog2['default'];
exports.TreeDialog = _dialogTreeDialog2['default'];

},{"./callback/index":9,"./dialog/OtherEditorPickerDialog":20,"./dialog/TreeDialog":21,"./dialog/UploadDialog":22,"./listener/index":28}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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
},{"./compressUiSelectionChange":24,"./copyContextChange":25,"./downloadAllInit":26,"./downloadSelectionChange":27,"./lockSelectionChange":29,"./openWithDynamicBuilder":30}],29:[function(require,module,exports){
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
                action.setIconClassName('mdi mdi-lock-outline');
                action.setLabel('meta.simple_lock.3');
                if (!n.getMetadata().get("sl_mylock")) {
                    action.selectionContext.allowedMimes = ["fake_extension_that_never_exists"];
                }
            } else {
                action.setIconClassName('mdi mdi-lock-outline');
                action.setLabel('meta.simple_lock.1');
            }
        }
    };
};

module.exports = exports["default"];

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

},{"../callback/openOtherEditorPicker":16,"pydio/util/path":"pydio/util/path"}]},{},[23])(23)
});
