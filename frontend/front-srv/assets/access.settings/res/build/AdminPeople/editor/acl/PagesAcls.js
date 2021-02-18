'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _cellsSdk = require('cells-sdk');

var _WorkspaceAcl = require('./WorkspaceAcl');

var _WorkspaceAcl2 = _interopRequireDefault(_WorkspaceAcl);

var PagesAcls = (function (_React$Component) {
    _inherits(PagesAcls, _React$Component);

    function PagesAcls(props) {
        _classCallCheck(this, PagesAcls);

        _get(Object.getPrototypeOf(PagesAcls.prototype), 'constructor', this).call(this, props);
        var m = function m(id) {
            return props.pydio.MessageHash['pydio_role.' + id] || id;
        };

        var workspaces = [];
        var homepageWorkspace = new _cellsSdk.IdmWorkspace();
        homepageWorkspace.UUID = "homepage";
        homepageWorkspace.Label = m('workspace.statics.home.title');
        homepageWorkspace.Description = m('workspace.statics.home.description');
        homepageWorkspace.Slug = "homepage";
        homepageWorkspace.RootNodes = { "homepage-ROOT": _cellsSdk.TreeNode.constructFromObject({ Uuid: "homepage-ROOT" }) };
        workspaces.push(homepageWorkspace);
        if (props.showSettings) {
            var settingsWorkspace = new _cellsSdk.IdmWorkspace();
            settingsWorkspace.UUID = "settings";
            settingsWorkspace.Label = m('workspace.statics.settings.title');
            settingsWorkspace.Description = m('workspace.statics.settings.description');
            settingsWorkspace.Slug = "settings";
            settingsWorkspace.RootNodes = { "settings-ROOT": _cellsSdk.TreeNode.constructFromObject({ Uuid: "settings-ROOT" }) };
            workspaces.push(settingsWorkspace);
        }
        workspaces.sort(_pydioUtilLang2['default'].arraySorter('Label', false, true));
        this.state = { workspaces: workspaces };
    }

    _createClass(PagesAcls, [{
        key: 'render',
        value: function render() {
            var role = this.props.role;
            var workspaces = this.state.workspaces;

            if (!role) {
                return _react2['default'].createElement('div', null);
            }
            return _react2['default'].createElement(
                'div',
                { className: "material-list" },
                workspaces.map(function (ws) {
                    return _react2['default'].createElement(_WorkspaceAcl2['default'], { workspace: ws, role: role });
                })
            );
        }
    }]);

    return PagesAcls;
})(_react2['default'].Component);

exports['default'] = PagesAcls;
module.exports = exports['default'];
