'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var Callbacks = (function () {
    function Callbacks() {
        _classCallCheck(this, Callbacks);
    }

    _createClass(Callbacks, null, [{
        key: 'deleteAction',
        value: function deleteAction(manager, args) {

            var userSelection = undefined;
            if (args && args.length) {
                userSelection = args[0];
            } else {
                userSelection = pydio.getUserSelection();
            }

            var firstNode = userSelection.getUniqueNode();
            var meta = firstNode.getMetadata();
            var deleteMessageId = undefined;

            switch (meta.get('ajxp_mime')) {
                case 'user_editable':
                    deleteMessageId = 'settings.34';
                    break;
                case 'group':
                    deleteMessageId = 'settings.126';
                    break;
                default:
                    break;
            }

            var reload = function reload() {};
            if (firstNode.getParent()) {
                (function () {
                    var parent = firstNode.getParent();
                    reload = function () {
                        parent.reload(null, true);
                    };
                })();
            }
            var callback = function callback() {
                var selection = userSelection.getSelectedNodes();
                var next = function next() {
                    if (!selection.length) {
                        return;
                    }
                    var n = selection.shift();
                    _pydioHttpApi2['default'].getRestClient().getIdmApi().deleteIdmUser(n.getMetadata().get('IdmUser')).then(function () {
                        reload();
                        next();
                    })['catch'](function (e) {
                        Pydio.getInstance().UI.displayMessage('ERROR', e.message);
                        next();
                    });
                };
                next();
            };

            pydio.UI.openConfirmDialog({
                message: MessageHash[deleteMessageId],
                validCallback: callback
            });
        }
    }, {
        key: 'applyDND',
        value: function applyDND(manager, dndActionParameter) {

            if (dndActionParameter.getStep() === PydioComponents.DNDActionParameter.STEP_CAN_DROP) {

                AdminComponents.DNDActionsManager.canDropNodeOnNode(dndActionParameter.getSource(), dndActionParameter.getTarget());
            } else if (dndActionParameter.getStep() === PydioComponents.DNDActionParameter.STEP_END_DRAG) {

                AdminComponents.DNDActionsManager.dropNodeOnNode(dndActionParameter.getSource(), dndActionParameter.getTarget());
            }
        }
    }]);

    return Callbacks;
})();

exports['default'] = Callbacks;
module.exports = exports['default'];
