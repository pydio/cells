'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioLangObservable = require('pydio/lang/observable');

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _uuid4 = require('uuid4');

var _Role = require('./Role');

var _Role2 = _interopRequireDefault(_Role);

var User = (function (_Observable) {
    _inherits(User, _Observable);

    /**
     *
     * @param idmUser {IdmUser}
     */

    function User(idmUser) {
        var _this = this;

        _classCallCheck(this, User);

        _get(Object.getPrototypeOf(User.prototype), 'constructor', this).call(this);
        this.acls = [];
        var parentRoles = [];
        if (idmUser) {
            this.idmUser = idmUser;
            if (this.idmUser.Roles) {
                this.idmRole = this.idmUser.Roles.filter(function (r) {
                    return r.Uuid === _this.idmUser.Uuid;
                })[0];
                if (!this.idmUser.IsGroup) {
                    parentRoles = this.idmUser.Roles.filter(function (r) {
                        return r.Uuid !== _this.idmUser.Uuid;
                    });
                }
            }
            if (!this.idmUser.Attributes) {
                this.idmUser.Attributes = {};
            }
        } else {
            this.idmUser = new _pydioHttpRestApi.IdmUser();
            this.idmUser.Uuid = (0, _uuid4.sync)();
            this.idmRole = _pydioHttpRestApi.IdmRole.constructFromObject({ Uuid: this.idmUser.Uuid });
            this.idmUser.Roles = [this.idmRole];
            this.idmUser.Attributes = {};
        }
        this.role = new _Role2['default'](this.idmRole, parentRoles);
        this.role.observe('update', function () {
            _this.dirty |= _this.role.isDirty();
            _this.notify('update');
        });
        this.makeSnapshot();
    }

    _createClass(User, [{
        key: 'load',
        value: function load() {
            var _this2 = this;

            this.role.load().then(function () {
                _this2.notify('update');
            });
        }
    }, {
        key: 'isDirty',
        value: function isDirty() {
            return this.dirty;
        }
    }, {
        key: 'save',
        value: function save() {
            var _this3 = this;

            return PydioApi.getRestClient().getIdmApi().updateIdmUser(this.idmUser).then(function (newUser) {
                _this3.idmUser = newUser;
                if (_this3.role.isDirty()) {
                    return _this3.role.save().then(function () {
                        _this3.makeSnapshot();
                        _this3.dirty = false;
                        _this3.notify('update');
                    });
                } else {
                    _this3.makeSnapshot();
                    _this3.dirty = false;
                    _this3.notify('update');
                    return Promise.resolve(_this3);
                }
            });
        }
    }, {
        key: 'revert',
        value: function revert() {
            this.idmUser = this.snapshot;
            this.makeSnapshot();
            this.dirty = false;
            this.notify('update');
            this.role.revert();
        }
    }, {
        key: 'makeSnapshot',
        value: function makeSnapshot() {
            this.snapshot = _pydioHttpRestApi.IdmUser.constructFromObject(JSON.parse(JSON.stringify(this.idmUser)));
        }

        /**
         * @return {Role}
         */
    }, {
        key: 'getRole',
        value: function getRole() {
            return this.role;
        }
    }, {
        key: 'addRole',
        value: function addRole(role) {
            var _this4 = this;

            var parentRoles = this.idmUser.Roles.filter(function (r) {
                return r.Uuid !== _this4.idmUser.Uuid;
            });
            parentRoles = [].concat(_toConsumableArray(parentRoles.filter(function (r) {
                return r.Uuid !== role.Uuid;
            })), [role]);
            this.idmUser.Roles = [].concat(_toConsumableArray(parentRoles), [this.idmRole]);
            this.dirty = true;
            this.role.updateParentRoles(parentRoles);
        }
    }, {
        key: 'removeRole',
        value: function removeRole(role) {
            var _this5 = this;

            var parentRoles = this.idmUser.Roles.filter(function (r) {
                return r.Uuid !== _this5.idmUser.Uuid && r.Uuid !== role.Uuid;
            });
            this.idmUser.Roles = [].concat(_toConsumableArray(parentRoles), [this.idmRole]);
            this.dirty = true;
            this.role.updateParentRoles(parentRoles);
        }
    }, {
        key: 'switchRoles',
        value: function switchRoles(roleId1, roleId2) {
            var _this6 = this;

            var parentRoles = this.idmUser.Roles.filter(function (r) {
                return r.Uuid !== _this6.idmUser.Uuid;
            });
            var pos1 = undefined,
                pos2 = undefined,
                b = undefined;
            for (var i = 0; i < parentRoles.length; i++) {
                if (parentRoles[i].Uuid === roleId1) {
                    pos1 = i;
                    b = parentRoles[i];
                } else if (parentRoles[i].Uuid === roleId2) {
                    pos2 = i;
                }
            }
            parentRoles[pos1] = parentRoles[pos2];
            parentRoles[pos2] = b;
            this.idmUser.Roles = [].concat(_toConsumableArray(parentRoles), [this.idmRole]);
            this.dirty = true;
            this.role.updateParentRoles(parentRoles);
        }

        /**
         *
         * @return {IdmUser}
         */
    }, {
        key: 'getIdmUser',
        value: function getIdmUser() {
            return this.buildProxy(this.idmUser);
        }

        /**
         * @param object {IdmUser}
         * @return {IdmUser}
         */
    }, {
        key: 'buildProxy',
        value: function buildProxy(object) {
            var _this7 = this;

            return new Proxy(object, {
                set: function set(target, p, value) {
                    target[p] = value;
                    _this7.dirty = true;
                    _this7.notify('update');
                    return true;
                },
                get: function get(target, p) {
                    var out = target[p];
                    if (out instanceof Array) {
                        return out;
                    } else if (out instanceof Object) {
                        return _this7.buildProxy(out);
                    } else {
                        return out;
                    }
                }
            });
        }
    }]);

    return User;
})(_pydioLangObservable2['default']);

exports['default'] = User;
module.exports = exports['default'];
