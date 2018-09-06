'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global) {
    var Loader = (function () {
        function Loader() {
            _classCallCheck(this, Loader);
        }

        _createClass(Loader, null, [{
            key: 'loadInfoPanel',
            value: function loadInfoPanel(container, node) {
                var mainCont = container.querySelectorAll("#ajxp_shared_info_panel .infoPanelTable")[0];
                mainCont.destroy = function () {
                    React.unmountComponentAtNode(mainCont);
                };
                mainCont.className += (mainCont.className ? ' ' : '') + 'infopanel-destroyable-pane';
                React.render(React.createElement(InfoPanel, { pydio: global.pydio, node: node }), mainCont);
            }
        }]);

        return Loader;
    })();

    var ReactInfoPanel = React.createClass({
        displayName: 'ReactInfoPanel',

        render: function render() {

            var actions = [React.createElement(MaterialUI.FlatButton, {
                key: 'edit-share',
                label: this.props.pydio.MessageHash['share_center.125'],
                primary: true,
                onTouchTap: function () {
                    global.pydio.getController().fireAction("share-edit-shared");
                }
            })];

            return React.createElement(
                PydioWorkspaces.InfoPanelCard,
                { title: this.props.pydio.MessageHash['share_center.50'], actions: actions, icon: 'share-variant', iconColor: '#009688', iconStyle: { fontSize: 13, display: 'inline-block', paddingTop: 3 } },
                React.createElement(InfoPanel, this.props)
            );
        }

    });

    global.ShareInfoPanel = {};
    global.ShareInfoPanel.loader = Loader.loadInfoPanel;
    global.ShareInfoPanel.InfoPanel = ReactInfoPanel;
})(window);
