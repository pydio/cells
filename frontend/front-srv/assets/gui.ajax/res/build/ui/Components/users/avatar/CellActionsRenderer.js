'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _materialUi = require('material-ui');

var _pydioModelIdmObjectHelper = require('pydio/model/idm-object-helper');

var _pydioModelIdmObjectHelper2 = _interopRequireDefault(_pydioModelIdmObjectHelper);

var _pydioModelCell = require('pydio/model/cell');

var _pydioModelCell2 = _interopRequireDefault(_pydioModelCell);

var CellActionsRenderer = (function () {
    function CellActionsRenderer(pydio, cellModel, acl) {
        var addressBookItem = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

        _classCallCheck(this, CellActionsRenderer);

        this.props = { pydio: pydio, cellModel: cellModel, acl: acl, addressBookItem: addressBookItem };
    }

    CellActionsRenderer.prototype.createCell = function createCell() {
        var _props = this.props;
        var addressBookItem = _props.addressBookItem;
        var pydio = _props.pydio;

        var m = pydio.MessageHash;

        var idmObject = undefined;
        if (addressBookItem.IdmUser) {
            idmObject = addressBookItem.IdmUser;
        } else if (addressBookItem.IdmRole) {
            idmObject = addressBookItem.IdmRole;
        }
        if (idmObject) {
            pydio.user.getIdmUser().then(function (loggedUser) {

                var loggedLabel = _pydioModelIdmObjectHelper2['default'].extractLabelFromIdmObject(loggedUser);
                var targetLabel = _pydioModelIdmObjectHelper2['default'].extractLabelFromIdmObject(addressBookItem.IdmUser || addressBookItem.IdmRole);

                var model = new _pydioModelCell2['default']();
                model.setLabel(loggedLabel + ", " + targetLabel);
                model.setDescription("Created by " + loggedLabel);
                model.addUser(idmObject);
                model.save().then(function (res) {
                    pydio.UI.displayMessage('SUCCESS', m['643'].replace('%s', targetLabel));
                })['catch'](function (reason) {
                    pydio.UI.displayMessage('ERROR', m['644'].replace('%s', reason.message));
                });
            });
        }
    };

    CellActionsRenderer.prototype.addToCell = function addToCell() {
        var idmObject = undefined;
        var _props2 = this.props;
        var addressBookItem = _props2.addressBookItem;
        var cellModel = _props2.cellModel;

        if (addressBookItem.IdmUser) {
            idmObject = addressBookItem.IdmUser;
        } else if (addressBookItem.IdmRole) {
            idmObject = addressBookItem.IdmRole;
        }
        if (idmObject) {
            cellModel.addUser(idmObject);
            cellModel.save();
        }
    };

    CellActionsRenderer.prototype.removeFromCell = function removeFromCell() {
        var _props3 = this.props;
        var acl = _props3.acl;
        var cellModel = _props3.cellModel;

        cellModel.removeUser(acl.RoleId);
        cellModel.save();
    };

    CellActionsRenderer.prototype.renderItems = function renderItems() {
        var _props4 = this.props;
        var pydio = _props4.pydio;
        var cellModel = _props4.cellModel;
        var acl = _props4.acl;
        var addressBookItem = _props4.addressBookItem;

        var m = pydio.MessageHash;

        // Check if current user it the logged one
        var isLogged = undefined;
        if (acl) {
            isLogged = acl.User && acl.User.Login === pydio.user.id;
        } else {
            isLogged = userType === 'user' && pydio.user.id === userId;
        }
        var items = [];
        if (isLogged) {
            return items;
        }
        var userId = undefined,
            userType = undefined;
        if (addressBookItem) {
            userId = addressBookItem.id;
            userType = addressBookItem.type;
            if (userType === 'group' && addressBookItem.IdmRole) {
                userId = addressBookItem.IdmRole.Uuid;userType = 'team';
            }
        }
        var label = undefined;
        if (acl) {
            label = _pydioModelIdmObjectHelper2['default'].extractLabel(pydio, acl);
        } else {
            label = addressBookItem.label;
        }
        // Special case cellModel is "TRUE", not a real cell model
        if (cellModel === true) {
            if (pydio.getPluginConfigs("auth").get("USER_CREATE_CELLS")) {
                return [React.createElement(_materialUi.MenuItem, { primaryText: m['640'].replace('%s', label), onClick: this.createCell.bind(this) })];
            } else {
                return [];
            }
        }

        var canWrite = cellModel.isEditable();
        // Check if current acl or userId/userType is in cell
        var acls = cellModel.getAcls();
        // Check if user is already in the current cell
        var isInCurrent = undefined;
        Object.keys(acls).map(function (k) {
            var cellAcl = acls[k];
            var crt = undefined;
            if (acl) {
                crt = acl.RoleId === cellAcl.RoleId;
            } else {
                crt = userType === 'user' && cellAcl.User && cellAcl.User.Login === userId || userType === 'group' && cellAcl.Group && cellAcl.Group.Uuid === userId || userType === 'team' && cellAcl.Role && cellAcl.Role.Uuid === userId;
            }
            if (crt) {
                isInCurrent = true;
            }
        });

        if (isInCurrent) {
            items.push(React.createElement(_materialUi.MenuItem, { primaryText: m['641'], disabled: !canWrite, onClick: this.removeFromCell.bind(this) }));
        } else {
            items.push(React.createElement(_materialUi.MenuItem, { primaryText: m['642'], disabled: !canWrite, onClick: this.addToCell.bind(this) }));
        }
        if (pydio.getPluginConfigs("auth").get("USER_CREATE_CELLS")) {
            items.push(React.createElement(_materialUi.Divider, null), React.createElement(_materialUi.MenuItem, { primaryText: m['640'].replace('%s', label), onClick: this.createCell.bind(this) }));
        }

        return items;
    };

    return CellActionsRenderer;
})();

exports['default'] = CellActionsRenderer;
module.exports = exports['default'];
