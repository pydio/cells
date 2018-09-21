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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _WorkspaceEntry = require('./WorkspaceEntry');

var _WorkspaceEntry2 = _interopRequireDefault(_WorkspaceEntry);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _materialUi = require('material-ui');

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var withVerticalScroll = _Pydio$requireLib.withVerticalScroll;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var EmptyStateView = _Pydio$requireLib2.EmptyStateView;

var Repository = require('pydio/model/repository');

var _require = require('material-ui/styles');

var muiThemeable = _require.muiThemeable;

var WorkspacesList = (function (_React$Component) {
    _inherits(WorkspacesList, _React$Component);

    function WorkspacesList(props, context) {
        var _this = this;

        _classCallCheck(this, WorkspacesList);

        _React$Component.call(this, props, context);
        this.state = this.stateFromPydio(props.pydio);
        this._reloadObserver = function () {
            _this.setState(_this.stateFromPydio(_this.props.pydio));
        };
    }

    WorkspacesList.prototype.stateFromPydio = function stateFromPydio(pydio) {
        return {
            workspaces: pydio.user ? pydio.user.getRepositoriesList() : [],
            showTreeForWorkspace: pydio.user ? pydio.user.activeRepository : false
        };
    };

    WorkspacesList.prototype.componentDidMount = function componentDidMount() {
        this.props.pydio.observe('repository_list_refreshed', this._reloadObserver);
    };

    WorkspacesList.prototype.componentWillUnmount = function componentWillUnmount() {
        this.props.pydio.stopObserving('repository_list_refreshed', this._reloadObserver);
    };

    WorkspacesList.prototype.createRepositoryEnabled = function createRepositoryEnabled() {
        return this.props.pydio.getPluginConfigs("auth").get("USER_CREATE_CELLS");
    };

    WorkspacesList.prototype.render = function render() {
        var _this3 = this;

        var entries = [],
            sharedEntries = [],
            createAction = undefined;
        var _state = this.state;
        var workspaces = _state.workspaces;
        var showTreeForWorkspace = _state.showTreeForWorkspace;
        var _props = this.props;
        var pydio = _props.pydio;
        var className = _props.className;
        var style = _props.style;
        var filterByType = _props.filterByType;
        var muiTheme = _props.muiTheme;

        var wsList = [];
        workspaces.forEach(function (o, k) {
            wsList.push(o);
        });
        wsList.sort(_pydioUtilLang2['default'].arraySorter('getLabel', true));

        wsList.forEach((function (object) {

            var key = object.getId();
            if (Repository.isInternal(key)) return;
            if (object.hasContentFilter()) return;
            if (object.getAccessStatus() === 'declined') return;

            var entry = _react2['default'].createElement(_WorkspaceEntry2['default'], _extends({}, this.props, {
                key: key,
                workspace: object,
                showFoldersTree: showTreeForWorkspace && showTreeForWorkspace === key
            }));
            if (object.getOwner()) {
                sharedEntries.push(entry);
            } else {
                entries.push(entry);
            }
        }).bind(this));

        var messages = pydio.MessageHash;
        var createClick = (function (event) {
            var _this2 = this;

            var target = event.target;
            _pydioHttpResourcesManager2['default'].loadClassesAndApply(['ShareDialog'], function () {
                _this2.setState({
                    popoverOpen: true,
                    popoverAnchor: target,
                    popoverContent: _react2['default'].createElement(ShareDialog.CreateCellDialog, { pydio: _this2.props.pydio, onDismiss: function () {
                            _this2.setState({ popoverOpen: false });
                        } })
                });
            });
        }).bind(this);
        if (this.createRepositoryEnabled()) {
            var styles = {
                button: {
                    width: 36,
                    height: 36,
                    padding: 6,
                    position: 'absolute',
                    right: 8,
                    top: 8
                },
                icon: {
                    fontSize: 22,
                    color: muiTheme.palette.accent1Color //'rgba(0,0,0,.54)'
                }
            };
            if (sharedEntries.length) {
                createAction = _react2['default'].createElement(_materialUi.IconButton, {
                    style: styles.button,
                    iconStyle: styles.icon,
                    iconClassName: "icomoon-cells-clear-plus",
                    tooltip: messages[417],
                    tooltipPosition: "top-left",
                    onTouchTap: createClick
                });
            }
        }

        var sections = [];
        if (entries.length) {
            sections.push({
                k: 'entries',
                title: _react2['default'].createElement(
                    'div',
                    { key: 'entries-title', className: 'section-title', style: this.props.sectionTitleStyle },
                    messages[468]
                ),
                content: _react2['default'].createElement(
                    'div',
                    { key: 'entries-ws', className: 'workspaces' },
                    entries
                )
            });
        }
        if (!sharedEntries.length) {
            sharedEntries = _react2['default'].createElement(EmptyStateView, {
                iconClassName: "icomoon-cells",
                primaryTextId: messages[632],
                secondaryTextId: messages[633],
                actionLabelId: this.createRepositoryEnabled() ? messages[418] : null,
                actionCallback: this.createRepositoryEnabled() ? createClick : null,
                actionStyle: { marginTop: 20 },
                style: { backgroundColor: 'transparent' }
            });
        }
        sections.push({
            k: 'shared',
            title: _react2['default'].createElement(
                'div',
                { key: 'shared-title', className: 'section-title', style: _extends({}, this.props.sectionTitleStyle, { position: 'relative', overflow: 'visible', padding: '16px 16px' }) },
                sharedEntries.length ? messages[469] : '',
                createAction
            ),
            content: _react2['default'].createElement(
                'div',
                { key: 'shared-ws', className: 'workspaces' },
                sharedEntries
            )
        });

        var classNames = ['user-workspaces-list'];
        if (className) classNames.push(className);

        if (filterByType) {
            var ret = undefined;
            sections.map(function (s) {
                if (filterByType && filterByType === s.k) {
                    ret = _react2['default'].createElement(
                        'div',
                        { className: classNames.join(' '), style: style },
                        s.title,
                        s.content
                    );
                }
            });
            return ret;
        }

        var elements = [];
        sections.map(function (s) {
            elements.push(s.title);
            elements.push(s.content);
        });
        return _react2['default'].createElement(
            'div',
            { className: classNames.join(' '), style: style },
            elements,
            _react2['default'].createElement(
                _materialUi.Popover,
                {
                    open: this.state.popoverOpen,
                    anchorEl: this.state.popoverAnchor,
                    useLayerForClickAway: true,
                    onRequestClose: function () {
                        _this3.setState({ popoverOpen: false });
                    },
                    anchorOrigin: sharedEntries.length ? { horizontal: "left", vertical: "top" } : { horizontal: "left", vertical: "bottom" },
                    targetOrigin: sharedEntries.length ? { horizontal: "left", vertical: "top" } : { horizontal: "left", vertical: "bottom" },
                    zDepth: 3,
                    style: { borderRadius: 6, overflow: 'hidden', marginLeft: sharedEntries.length ? -10 : 0, marginTop: sharedEntries.length ? -10 : 0 }
                },
                this.state.popoverContent
            )
        );
    };

    return WorkspacesList;
})(_react2['default'].Component);

WorkspacesList.PropTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']),
    workspaces: _react2['default'].PropTypes.instanceOf(Map),
    showTreeForWorkspace: _react2['default'].PropTypes.string,
    onHoverLink: _react2['default'].PropTypes.func,
    onOutLink: _react2['default'].PropTypes.func,
    className: _react2['default'].PropTypes.string,
    style: _react2['default'].PropTypes.object,
    sectionTitleStyle: _react2['default'].PropTypes.object,
    filterByType: _react2['default'].PropTypes.oneOf(['shared', 'entries', 'create'])
};

exports['default'] = WorkspacesList = withVerticalScroll(WorkspacesList);
exports['default'] = WorkspacesList = muiThemeable()(WorkspacesList);

exports['default'] = WorkspacesList;
module.exports = exports['default'];
