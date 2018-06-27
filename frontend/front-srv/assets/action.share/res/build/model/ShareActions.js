'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global) {

    var pydio = global.pydio;

    var Callbacks = (function () {
        function Callbacks() {
            _classCallCheck(this, Callbacks);
        }

        _createClass(Callbacks, null, [{
            key: 'share',
            value: function share() {
                pydio.UI.openComponentInModal('ShareDialog', 'CompositeDialog', { pydio: pydio, selection: pydio.getUserSelection(), create: true });
            }
        }, {
            key: 'editShare',
            value: function editShare() {
                var node = pydio.getUserSelection().getUniqueNode();
                pydio.UI.openComponentInModal('ShareDialog', 'CompositeDialog', { pydio: pydio, selection: pydio.getUserSelection() });
            }
        }, {
            key: 'loadList',
            value: function loadList() {
                if (window.actionManager) {
                    window.actionManager.getDataModel().requireContextChange(window.actionManager.getDataModel().getRootNode(), true);
                }
            }
        }, {
            key: 'clearExpired',
            value: function clearExpired() {
                var conn = new Connexion();
                conn.addParameter("get_action", "sharelist-clearExpired");
                var dm = window.actionManager.getDataModel();
                conn.onComplete = function (transport) {
                    PydioApi.getClient().parseXmlMessage(transport.responseXML);
                    if (window.actionManager) {
                        dm.requireContextChange(dm.getRootNode(), true);
                    }
                };
                conn.sendAsync();
            }
        }, {
            key: 'editFromList',
            value: function editFromList() {
                var dataModel;
                if (window.actionArguments && window.actionArguments.length) {
                    dataModel = window.actionArguments[0];
                } else if (window.actionManager) {
                    dataModel = window.actionManager.getDataModel();
                }
                pydio.UI.openComponentInModal('ShareDialog', 'MainPanel', { pydio: pydio, readonly: true, selection: dataModel });
            }
        }, {
            key: 'openUserShareView',
            value: function openUserShareView() {

                pydio.UI.openComponentInModal('ShareDialog', 'ShareViewModal', {
                    pydio: pydio,
                    currentUser: true,
                    filters: {
                        parent_repository_id: "250",
                        share_type: "share_center.238"
                    }
                });
            }
        }]);

        return Callbacks;
    })();

    var Listeners = function Listeners() {
        _classCallCheck(this, Listeners);
    };

    global.ShareActions = {
        Callbacks: Callbacks,
        Listeners: Listeners
    };
})(window);
