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
