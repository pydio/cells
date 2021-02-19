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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _cellsSdk = require('cells-sdk');

var _pydioModelDataModel = require("pydio/model/data-model");

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _materialUi = require("material-ui");

var _Pydio$requireLib = _pydio2['default'].requireLib("hoc");

var ModernTextField = _Pydio$requireLib.ModernTextField;
var ModernSelectField = _Pydio$requireLib.ModernSelectField;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var FoldersTree = _Pydio$requireLib2.FoldersTree;

var TreeDialog = (0, _createReactClass2['default'])({

    propTypes: {
        isMove: _propTypes2['default'].bool.isRequired,
        submitValue: _propTypes2['default'].func.isRequired
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
        var dm = _pydioModelDataModel2['default'].RemoteDataModelFactory(repoId ? { tmp_repository_id: repoId } : {}, repoLabel);
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
        var api = new _cellsSdk.TreeServiceApi(PydioApi.getRestClient());
        var request = new _cellsSdk.RestCreateNodesRequest();

        var path = slug + _pydioUtilLang2['default'].trimRight(parent.getPath(), '/') + '/' + nodeName;
        var node = new _cellsSdk.TreeNode();
        node.Path = path;
        node.Type = _cellsSdk.TreeNodeType.constructFromObject('COLLECTION');
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
        var wsSelector = _react2['default'].createElement('div', { style: { height: 30 } });
        if (user && user.canCrossRepositoryCopy() && user.hasCrossRepositories()) {
            (function () {
                var menuItems = [];
                var items = [];
                if (user.canWrite()) {
                    menuItems.push(_react2['default'].createElement(_materialUi.MenuItem, { key: 'current', value: '__CURRENT__', primaryText: _this2.props.pydio.MessageHash[372] }));
                }
                user.getCrossRepositories().forEach(function (repo, key) {
                    items.push({ label: repo.getLabel(), item: _react2['default'].createElement(_materialUi.MenuItem, { key: key, value: key, primaryText: repo.getLabel() }) });
                });
                items.sort(function (a, b) {
                    return a.label.localeCompare(b.label, undefined, { numeric: true });
                });
                menuItems = [].concat(_toConsumableArray(menuItems), _toConsumableArray(items.map(function (i) {
                    return i.item;
                })));
                wsSelector = _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        ModernSelectField,
                        {
                            style: { width: '100%' },
                            floatingLabelText: _this2.props.pydio.MessageHash[373],
                            value: _this2.state.wsId,
                            onChange: _this2.handleRepositoryChange
                        },
                        menuItems
                    )
                );
            })();
        }
        var newFolderFormOpen = this.state.newFolderFormOpen;

        return _react2['default'].createElement(
            'div',
            { style: { width: '100%', paddingTop: 18 } },
            wsSelector,
            _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 0, style: { height: 300, overflowX: 'auto', color: '#546E7A', fontSize: 14, padding: '6px 0px', backgroundColor: '#f5f5f5', marginTop: 4 } },
                _react2['default'].createElement(
                    'div',
                    { style: { marginTop: -41, marginLeft: -21 } },
                    _react2['default'].createElement(FoldersTree, {
                        pydio: this.props.pydio,
                        dataModel: this.state.dataModel,
                        onNodeSelected: this.onNodeSelected,
                        showRoot: true,
                        draggable: false
                    })
                )
            ),
            _react2['default'].createElement(
                _materialUi.Paper,
                {
                    className: 'bezier-transitions',
                    zDepth: 0,
                    style: {
                        display: 'flex',
                        alignItems: 'baseline',
                        height: newFolderFormOpen ? 50 : 0,
                        overflow: newFolderFormOpen ? 'visible' : 'hidden',
                        opacity: newFolderFormOpen ? 1 : 0,
                        padding: 0,
                        marginTop: newFolderFormOpen ? 0 : 4
                    }
                },
                _react2['default'].createElement(ModernTextField, { fullWidth: true, floatingLabelText: this.props.pydio.MessageHash[173], ref: 'newfolder_input', style: { flex: 1 } }),
                _react2['default'].createElement(_materialUi.IconButton, { iconClassName: 'mdi mdi-check', iconStyle: { color: '#546E7A' }, tooltip: this.props.pydio.MessageHash[48], onTouchTap: function () {
                        _this2.createNewFolder();
                    } }),
                _react2['default'].createElement(_materialUi.IconButton, { iconClassName: 'mdi mdi-close', iconStyle: { color: '#546E7A' }, tooltip: this.props.pydio.MessageHash[49], onTouchTap: openNewFolderForm })
            ),
            _react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center' } },
                _react2['default'].createElement(ModernTextField, {
                    style: { flex: 1, width: '100%', marginRight: 10 },
                    floatingLabelText: this.props.pydio.MessageHash[373],
                    ref: 'input',
                    value: this.state.selectedNode.getPath(),
                    disabled: false,
                    onChange: function () {}
                }),
                !newFolderFormOpen && _react2['default'].createElement(_materialUi.IconButton, {
                    iconClassName: 'mdi mdi-folder-plus',
                    style: { height: 38, width: 38, padding: 6 },
                    iconStyle: { color: '#546E7A', fontSize: 24 },
                    tooltip: this.props.pydio.MessageHash[154],
                    tooltipPosition: "top-left",
                    onTouchTap: openNewFolderForm
                })
            )
        );
    }

});

exports['default'] = TreeDialog;
module.exports = exports['default'];
