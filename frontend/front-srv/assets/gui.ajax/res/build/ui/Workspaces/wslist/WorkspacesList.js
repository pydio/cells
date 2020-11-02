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

var _pydioModelRepository = require('pydio/model/repository');

var _pydioModelRepository2 = _interopRequireDefault(_pydioModelRepository);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _materialUi = require('material-ui');

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var withVerticalScroll = _Pydio$requireLib.withVerticalScroll;
var ModernTextField = _Pydio$requireLib.ModernTextField;

var _require = require('material-ui/styles');

var muiThemeable = _require.muiThemeable;

var Entries = (function (_React$Component) {
    _inherits(Entries, _React$Component);

    function Entries(props) {
        _classCallCheck(this, Entries);

        _React$Component.call(this, props);
        this.state = {
            toggleFilter: false,
            filterValue: ''
        };
    }

    Entries.prototype.computePagination = function computePagination(entries) {
        if (!entries || !entries.length) {
            return { use: false };
        }
        var pageSize = 15;
        if (entries.length <= pageSize) {
            return { use: false };
        }
        var page = this.state.page;
        var activeWorkspace = this.props.activeWorkspace;

        if (!page) {
            page = 1;
            if (activeWorkspace) {
                var wsIndex = entries.map(function (ws) {
                    return ws.getId();
                }).indexOf(activeWorkspace);
                if (wsIndex > -1) {
                    // Select page that shows active workspace
                    page = Math.floor(wsIndex / pageSize) + 1;
                }
            }
        }
        var max = Math.ceil(entries.length / pageSize);
        var sliceStart = (page - 1) * pageSize;
        var sliceEnd = Math.min(page * pageSize, entries.length);
        var pages = [];
        for (var i = 1; i <= max; i++) {
            pages.push(i);
        }
        return {
            use: true,
            sliceStart: sliceStart,
            sliceEnd: sliceEnd,
            total: entries.length,
            pages: pages,
            page: page,
            pageSize: pageSize
        };
    };

    Entries.prototype.renderPagination = function renderPagination(pagination) {
        var _this = this;

        var titleStyle = this.props.titleStyle;
        var page = pagination.page;
        var pages = pagination.pages;
        var sliceStart = pagination.sliceStart;
        var sliceEnd = pagination.sliceEnd;
        var total = pagination.total;

        var chevStyles = { style: { width: 36, height: 36, padding: 6 }, iconStyle: { color: titleStyle.color } };
        return _react2['default'].createElement(
            'div',
            { style: { display: 'flex', backgroundColor: 'rgba(0, 0, 0, 0.03)', color: titleStyle.color, alignItems: 'center', justifyContent: 'center', fontWeight: 400 } },
            _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-chevron-left", disabled: page === 1, onTouchTap: function () {
                    return _this.setState({ page: page - 1 });
                } }, chevStyles)),
            _react2['default'].createElement(
                'div',
                null,
                sliceStart + 1,
                '-',
                sliceEnd,
                ' of ',
                total
            ),
            _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-chevron-right", disabled: page === pages.length, onTouchTap: function () {
                    return _this.setState({ page: page + 1 });
                } }, chevStyles))
        );
    };

    Entries.prototype.render = function render() {
        var _this2 = this;

        var _props = this.props;
        var title = _props.title;
        var entries = _props.entries;
        var filterHint = _props.filterHint;
        var titleStyle = _props.titleStyle;
        var pydio = _props.pydio;
        var createAction = _props.createAction;
        var activeWorkspace = _props.activeWorkspace;
        var palette = _props.palette;
        var buttonStyles = _props.buttonStyles;
        var emptyState = _props.emptyState;
        var nonActiveRoots = _props.nonActiveRoots;
        var _state = this.state;
        var toggleFilter = _state.toggleFilter;
        var filterValue = _state.filterValue;

        var filterFunc = function filterFunc(t, f, ws) {
            return !t || !f || ws.getLabel().toLowerCase().indexOf(f.toLowerCase()) >= 0;
        };

        var wss = entries.filter(function (ws) {
            return filterFunc(toggleFilter, filterValue, ws);
        });
        var pagination = this.computePagination(wss);
        if (pagination.use) {
            wss = wss.slice(pagination.sliceStart, pagination.sliceEnd);
        }
        var uniqueResult = undefined;
        if (toggleFilter && filterValue && wss.length === 1 && wss[0].getId() !== activeWorkspace) {
            uniqueResult = wss[0];
        }

        return _react2['default'].createElement(
            'div',
            null,
            !toggleFilter && _react2['default'].createElement(
                'div',
                { key: 'shared-title', className: 'section-title', style: titleStyle },
                _react2['default'].createElement(
                    'span',
                    { style: { cursor: 'pointer' }, title: filterHint, onClick: function () {
                            _this2.setState({ toggleFilter: true });
                        } },
                    title,
                    _react2['default'].createElement('span', { style: { fontSize: 12, opacity: '0.4', marginLeft: 3 }, className: "mdi mdi-filter" })
                ),
                createAction
            ),
            toggleFilter && _react2['default'].createElement(
                'div',
                { key: 'shared-title', className: 'section-title', style: _extends({}, titleStyle, { paddingLeft: 12, paddingRight: 8, textTransform: 'none', transition: 'none' }) },
                _react2['default'].createElement(ModernTextField, {
                    focusOnMount: true,
                    fullWidth: true,
                    style: { marginTop: -16, marginBottom: -16, top: -1 },
                    hintText: filterHint,
                    hintStyle: { fontWeight: 400 },
                    inputStyle: { fontWeight: 400, color: palette.primary1Color },
                    value: filterValue,
                    onChange: function (e, v) {
                        _this2.setState({ filterValue: v });
                    },
                    onBlur: function () {
                        setTimeout(function () {
                            if (!filterValue) _this2.setState({ toggleFilter: false });
                        }, 150);
                    },
                    onKeyPress: function (ev) {
                        if (ev.key === 'Enter' && uniqueResult) {
                            pydio.triggerRepositoryChange(uniqueResult.getId());
                            _this2.setState({ filterValue: '', toggleFilter: false });
                        }
                    }
                }),
                uniqueResult && _react2['default'].createElement(
                    'div',
                    { style: _extends({}, buttonStyles.button, { right: 28, lineHeight: '24px', fontSize: 20, opacity: 0.5 }) },
                    _react2['default'].createElement('span', { className: "mdi mdi-keyboard-return" })
                ),
                _react2['default'].createElement(_materialUi.IconButton, {
                    key: "close-filter",
                    iconClassName: "mdi mdi-close",
                    style: buttonStyles.button,
                    iconStyle: buttonStyles.icon,
                    onTouchTap: function () {
                        _this2.setState({ toggleFilter: false, filterValue: '' });
                    }
                })
            ),
            _react2['default'].createElement(
                'div',
                { className: "workspaces" },
                wss.map(function (ws) {
                    return _react2['default'].createElement(_WorkspaceEntry2['default'], {
                        pydio: pydio,
                        key: ws.getId(),
                        workspace: ws,
                        showFoldersTree: activeWorkspace && activeWorkspace === ws.getId()
                    });
                }),
                !entries.length && emptyState,
                pagination.use && this.renderPagination(pagination)
            )
        );
    };

    return Entries;
})(_react2['default'].Component);

var WorkspacesList = (function (_React$Component2) {
    _inherits(WorkspacesList, _React$Component2);

    function WorkspacesList(props, context) {
        var _this3 = this;

        _classCallCheck(this, WorkspacesList);

        _React$Component2.call(this, props, context);
        this.state = this.stateFromPydio(props.pydio);
        this._reloadObserver = function () {
            _this3.setState(_this3.stateFromPydio(_this3.props.pydio));
        };
    }

    WorkspacesList.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
        return nextState.random !== this.state.random || nextState.popoverOpen !== this.state.popoverOpen;
    };

    WorkspacesList.prototype.stateFromPydio = function stateFromPydio(pydio) {
        var workspaces = pydio.user ? pydio.user.getRepositoriesList() : [];
        var wsList = [];
        workspaces.forEach(function (o) {
            return wsList.push(o);
        });
        return {
            random: Math.random(),
            workspaces: workspaces,
            activeWorkspace: pydio.user ? pydio.user.activeRepository : false,
            activeRepoIsHome: pydio.user && pydio.user.activeRepository === 'homepage'
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
        var _this5 = this;

        var createAction = undefined;
        var _state2 = this.state;
        var workspaces = _state2.workspaces;
        var activeWorkspace = _state2.activeWorkspace;
        var popoverOpen = _state2.popoverOpen;
        var popoverAnchor = _state2.popoverAnchor;
        var popoverContent = _state2.popoverContent;
        var _props2 = this.props;
        var pydio = _props2.pydio;
        var className = _props2.className;
        var muiTheme = _props2.muiTheme;
        var sectionTitleStyle = _props2.sectionTitleStyle;

        // Split Workspaces from Cells
        var wsList = [];
        workspaces.forEach(function (o) {
            return wsList.push(o);
        });
        wsList = wsList.filter(function (ws) {
            return !_pydioModelRepository2['default'].isInternal(ws.getId());
        });
        wsList.sort(function (oA, oB) {
            if (oA.getRepositoryType() === "workspace-personal") {
                return -1;
            }
            if (oB.getRepositoryType() === "workspace-personal") {
                return 1;
            }
            var res = oA.getLabel().localeCompare(oB.getLabel(), undefined, { numeric: true });
            if (res === 0) {
                return oA.getSlug().localeCompare(oB.getSlug());
            } else {
                return res;
            }
        });
        var entries = wsList.filter(function (ws) {
            return !ws.getOwner();
        });
        var sharedEntries = wsList.filter(function (ws) {
            return ws.getOwner();
        });

        var messages = pydio.MessageHash;

        var createClick = (function (event) {
            var _this4 = this;

            var target = event.target;
            _pydioHttpResourcesManager2['default'].loadClassesAndApply(['ShareDialog'], function () {
                _this4.setState({
                    popoverOpen: true,
                    popoverAnchor: target,
                    popoverContent: _react2['default'].createElement(ShareDialog.CreateCellDialog, { pydio: pydio, onDismiss: function () {
                            _this4.setState({ popoverOpen: false });
                        } })
                });
            });
        }).bind(this);

        var buttonStyles = {
            button: {
                width: 36,
                height: 36,
                padding: 6,
                position: 'absolute',
                right: 4,
                top: 8
            },
            icon: {
                fontSize: 22,
                color: muiTheme.palette.primary1Color //'rgba(0,0,0,.54)'
            }
        };

        if (this.createRepositoryEnabled() && sharedEntries.length) {
            createAction = _react2['default'].createElement(_materialUi.IconButton, {
                key: "create-cell",
                style: buttonStyles.button,
                iconStyle: buttonStyles.icon,
                iconClassName: "mdi mdi-plus",
                tooltip: messages[417],
                tooltipPosition: "top-left",
                onTouchTap: createClick
            });
        }

        var classNames = ['user-workspaces-list'];
        if (className) {
            classNames.push(className);
        }

        return _react2['default'].createElement(
            'div',
            { className: classNames.join(' ') },
            _react2['default'].createElement(
                _materialUi.Popover,
                {
                    open: popoverOpen,
                    anchorEl: popoverAnchor,
                    useLayerForClickAway: true,
                    onRequestClose: function () {
                        _this5.setState({ popoverOpen: false });
                    },
                    anchorOrigin: sharedEntries.length ? { horizontal: "left", vertical: "top" } : { horizontal: "left", vertical: "bottom" },
                    targetOrigin: sharedEntries.length ? { horizontal: "left", vertical: "top" } : { horizontal: "left", vertical: "bottom" },
                    zDepth: 3,
                    style: { borderRadius: 6, overflow: 'hidden', marginLeft: sharedEntries.length ? -10 : 0, marginTop: sharedEntries.length ? -10 : 0 }
                },
                popoverContent
            ),
            entries.length > 0 && _react2['default'].createElement(Entries, {
                title: messages[468],
                entries: entries,
                filterHint: messages['ws.quick-filter'],
                titleStyle: _extends({}, sectionTitleStyle, { marginTop: 5, position: 'relative', overflow: 'visible', transition: 'none' }),
                pydio: pydio,
                activeWorkspace: activeWorkspace,
                palette: muiTheme.palette,
                buttonStyles: buttonStyles
            }),
            _react2['default'].createElement(Entries, {
                title: messages[469],
                entries: sharedEntries,
                filterHint: messages['cells.quick-filter'],
                titleStyle: _extends({}, sectionTitleStyle, { position: 'relative', overflow: 'visible', transition: 'none' }),
                pydio: pydio,
                createAction: createAction,
                activeWorkspace: activeWorkspace,
                palette: muiTheme.palette,
                buttonStyles: buttonStyles,
                emptyState: _react2['default'].createElement(
                    'div',
                    { style: { textAlign: 'center', color: _color2['default'](muiTheme.palette.primary1Color).fade(0.6).toString() } },
                    _react2['default'].createElement('div', { className: 'icomoon-cells', style: { fontSize: 80 } }),
                    this.createRepositoryEnabled() && _react2['default'].createElement(_materialUi.FlatButton, { style: { color: muiTheme.palette.accent2Color, marginTop: 5 }, primary: true, label: messages[418], onTouchTap: createClick }),
                    _react2['default'].createElement(
                        'div',
                        { style: { fontSize: 13, padding: '5px 20px' } },
                        messages[633]
                    )
                )
            })
        );
    };

    return WorkspacesList;
})(_react2['default'].Component);

WorkspacesList.PropTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']),
    workspaces: _react2['default'].PropTypes.instanceOf(Map),
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
