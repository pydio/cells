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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _langLogger = require('../lang/Logger');

var _langLogger2 = _interopRequireDefault(_langLogger);

var _httpPydioApi = require('../http/PydioApi');

var _httpPydioApi2 = _interopRequireDefault(_httpPydioApi);

var _Repository = require('./Repository');

var _Repository2 = _interopRequireDefault(_Repository);

var _cellsSdk = require('cells-sdk');

var _utilHasherUtils = require("../util/HasherUtils");

var _utilHasherUtils2 = _interopRequireDefault(_utilHasherUtils);

/**
 * Abstraction of the currently logged user. Can be a "fake" user when users management
 * system is disabled
 */

var User = (function () {

  /**
   * Constructor
   * @param id String The user unique id
   * @param xmlDef XMLNode Registry Fragment
      * @param pydioObject Pydio
   */

  function User(id, xmlDef, pydioObject) {
    _classCallCheck(this, User);

    /**
     * @var String
     */
    this.id = id;
    /**
     * @var Pydio
     */
    this._pydioObject = pydioObject;
    /**
     * @var String
     */
    this.activeRepository = undefined;
    /**
     * @var Boolean
     */
    this.crossRepositoryCopy = false;
    /**
     * @var Map()
     */
    this.preferences = new Map();
    /**
     * @var Map()
     */
    this.repositories = new Map();
    /**
     * @var Map()
     */
    this.crossRepositories = new Map();
    /**
     * @var Boolean
     */
    this.isAdmin = false;
    /**
     * @var String
     */
    this.lock = false;
    /**
     *
     * @type Map
     * @private
     */
    this._parsedJSONCache = new Map();

    if (xmlDef) {
      this.loadFromXml(xmlDef);
    }
  }

  /**
   * Set current repository
   * @param id String
   */

  User.prototype.setActiveRepository = function setActiveRepository(id) {
    this.activeRepository = id;
    if (this.repositories.has(id)) {
      this.crossRepositoryCopy = this.repositories.get(id).allowCrossRepositoryCopy;
    }
    if (this.crossRepositories.has(id)) {
      this.crossRepositories['delete'](id);
    }
  };

  /**
   * Gets the current active repository
   * @returns String
   */

  User.prototype.getActiveRepository = function getActiveRepository() {
    return this.activeRepository;
  };

  /**
   * Whether current repo is allowed to be read
   * @returns Boolean
   */

  User.prototype.canRead = function canRead() {
    /*
    try{
           // TODO: get "read" property from root node metadata
        const metaRoot = this._pydioObject.getContextHolder().getRootNode().getMetadata();
       } catch(e){
        }
       //return this.read;
       */
    return true;
  };

  /**
   * Whether current repo is allowed to be written
      * @param node {AjxpNode}
   * @returns Boolean
   */

  User.prototype.canWrite = function canWrite() {
    var node = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

    try {
      var meta = undefined;
      if (node) {
        meta = node.getMetadata();
      } else {
        meta = this._pydioObject.getContextHolder().getRootNode().getMetadata();
      }
      return !meta.has("node_readonly") || !meta.get("node_readonly");
    } catch (e) {
      return false;
    }
  };

  /**
   * Whether current repo is allowed to be cross-copied
   * @returns Boolean
   */

  User.prototype.canCrossRepositoryCopy = function canCrossRepositoryCopy() {
    return this.crossRepositoryCopy;
  };

  /**
   * Get a user preference by its name
   * @returns Mixed
   */

  User.prototype.getPreference = function getPreference(prefName, fromJSON) {
    if (fromJSON) {
      var test = this._parsedJSONCache.get(prefName);
      if (test) {
        return test;
      }
    }
    var value = this.preferences.get(prefName);
    if (fromJSON) {
      if (value) {
        try {
          if (typeof value === "object") {
            return value;
          }
          var parsed = JSON.parse(value);
          this._parsedJSONCache.set(prefName, parsed);
          if (!parsed) {
            return {};
          }
          return parsed;
        } catch (e) {
          if (window.console) {
            _langLogger2['default'].log("Error parsing JSON in preferences (" + prefName + "). You should contact system admin and clear user preferences.");
          } else {
            alert("Error parsing JSON in preferences. You should contact system admin and clear user preferences.");
          }
        }
      }
      return {};
    }
    return value;
  };

  /**
   * Get all repositories 
   * @returns {Map}
   */

  User.prototype.getRepositoriesList = function getRepositoriesList() {
    return this.repositories;
  };

  /**
   * Set a preference value
   * @param prefName String
   * @param prefValue Mixed
   * @param toJSON Boolean Whether to convert the value to JSON representation
   */

  User.prototype.setPreference = function setPreference(prefName, prefValue) {
    var toJSON = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    if (toJSON) {
      this._parsedJSONCache['delete'](prefName);
      try {
        prefValue = JSON.stringify(prefValue);
      } catch (e) {
        if (console) {
          var isCyclic = function isCyclic(obj) {
            var seenObjects = [];

            function detect(obj) {
              if (obj && typeof obj === 'object') {
                if (seenObjects.indexOf(obj) !== -1) {
                  return true;
                }
                seenObjects.push(obj);
                for (var key in obj) {
                  if (obj.hasOwnProperty(key) && detect(obj[key])) {
                    console.log(obj, 'cycle at ' + key);
                    return true;
                  }
                }
              }
              return false;
            }
            return detect(obj);
          };

          console.log("Caught toJSON error " + e.message, prefValue, isCyclic(prefValue));
        }
        return;
      }
    }
    this.preferences.set(prefName, prefValue);
  };

  /**
   * Set the repositories as a bunch
   * @param repoHash Map
   */

  User.prototype.setRepositoriesList = function setRepositoriesList(repoHash) {
    var _this = this;

    this.repositories = repoHash;
    // filter repositories once for all
    this.crossRepositories = new Map();
    this.repositories.forEach(function (value, key) {
      if (value.allowCrossRepositoryCopy) {
        _this.crossRepositories.set(key, value);
      }
    });
  };

  /**
   * Whether there are any repositories allowing crossCopy
   * @returns Boolean
   */

  User.prototype.hasCrossRepositories = function hasCrossRepositories() {
    return this.crossRepositories.size;
  };

  /**
   * Get repositories allowing cross copy
   * @returns {Map}
   */

  User.prototype.getCrossRepositories = function getCrossRepositories() {
    return this.crossRepositories;
  };

  /**
   * Get the current repository Icon
   * @param repoId String
   * @returns String
   */

  User.prototype.getRepositoryIcon = function getRepositoryIcon(repoId) {
    return this.repoIcon.get(repoId);
  };

  /**
   * Send the preference to the server for saving
   */

  User.prototype.savePreference = function savePreference() {
    var _this2 = this;

    if (!this.preferences.has('gui_preferences')) {
      return;
    }
    var guiPrefs = this.preferences.get('gui_preferences');
    var stringPref = _utilHasherUtils2['default'].base64_encode(guiPrefs);
    this.getIdmUser().then(function (idmUser) {
      idmUser.Attributes['preferences'] = JSON.stringify({ gui_preferences: stringPref });
      // Use a silent client to avoid displaying errors
      var api = new _cellsSdk.UserServiceApi(_httpPydioApi2['default'].getRestClient({ silent: true }));
      api.putUser(idmUser.Login, idmUser).then(function (ok) {
        _this2.idmUser = idmUser;
      });
    });
  };

  /**
   * @return {Promise<IdmUser>}
   */

  User.prototype.getIdmUser = function getIdmUser() {
    var _this3 = this;

    if (this.idmUser) {

      return Promise.resolve(this.idmUser);
    } else {
      var _ret = (function () {

        var api = new _cellsSdk.UserServiceApi(_httpPydioApi2['default'].getRestClient());
        var request = new _cellsSdk.RestSearchUserRequest();
        var query = new _cellsSdk.IdmUserSingleQuery();
        query.Login = _this3.id;
        request.Queries = [query];
        return {
          v: new Promise(function (resolve, reject) {
            api.searchUsers(request).then(function (result) {
              if (result.Total === 0 || !result.Users) {
                reject(new Error('Cannot find user'));
              }
              _this3.idmUser = result.Users[0];
              resolve(result.Users[0]);
            })['catch'](function (error) {
              reject(error);
            });
          })
        };
      })();

      if (typeof _ret === 'object') return _ret.v;
    }
  };

  /**
   * @return {Promise<CellModel>}
   */

  User.prototype.getActiveRepositoryAsCell = function getActiveRepositoryAsCell() {
    return this.repositories.get(this.activeRepository).asCell();
  };

  /**
   * Return active repository object
   * @return {Repository}
   */

  User.prototype.getActiveRepositoryObject = function getActiveRepositoryObject() {
    return this.repositories.get(this.activeRepository);
  };

  /**
   * Parse the registry fragment to load this user
   * @param userNodes DOMNode
   */

  User.prototype.loadFromXml = function loadFromXml(userNodes) {

    var repositories = new Map(),
        activeNode = undefined;
    var i = undefined,
        j = undefined;
    for (i = 0; i < userNodes.length; i++) {
      if (userNodes[i].nodeName === "active_repo") {
        activeNode = userNodes[i];
      } else if (userNodes[i].nodeName === "repositories") {
        for (j = 0; j < userNodes[i].childNodes.length; j++) {
          var repoChild = userNodes[i].childNodes[j];
          if (repoChild.nodeName === "repo") {
            var repository = new _Repository2['default'](repoChild.getAttribute("id"), repoChild);
            repositories.set(repoChild.getAttribute("id"), repository);
          }
        }
        this.setRepositoriesList(repositories);
      } else if (userNodes[i].nodeName === "preferences") {
        for (j = 0; j < userNodes[i].childNodes.length; j++) {
          var prefChild = userNodes[i].childNodes[j];
          if (prefChild.nodeName === "pref") {
            var value = prefChild.getAttribute("value");
            if (!value && prefChild.firstChild) {
              // Retrieve value from CDATA
              value = prefChild.firstChild.nodeValue;
            }
            this.setPreference(prefChild.getAttribute("name"), value);
          }
        }
      } else if (userNodes[i].nodeName === "special_rights") {
        var attr = userNodes[i].getAttribute("is_admin");
        if (attr && attr === "1") {
          this.isAdmin = true;
        }
        if (userNodes[i].getAttribute("lock")) {
          this.lock = userNodes[i].getAttribute("lock");
        }
      }
    }
    // Make sure it happens at the end
    if (activeNode) {
      this.setActiveRepository(activeNode.getAttribute('id'));
    }
  };

  return User;
})();

exports['default'] = User;
module.exports = exports['default'];
