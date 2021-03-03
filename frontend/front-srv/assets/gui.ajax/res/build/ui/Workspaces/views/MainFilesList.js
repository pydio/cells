'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _pydioModelAction = require('pydio/model/action');

var _pydioModelAction2 = _interopRequireDefault(_pydioModelAction);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _FilePreview = require('./FilePreview');

var _FilePreview2 = _interopRequireDefault(_FilePreview);

var _materialUi = require('material-ui');

var _CellsMessageToolbar = require('./CellsMessageToolbar');

var _CellsMessageToolbar2 = _interopRequireDefault(_CellsMessageToolbar);

var _OverlayIcon = require('./OverlayIcon');

var _OverlayIcon2 = _interopRequireDefault(_OverlayIcon);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var SimpleList = _Pydio$requireLib.SimpleList;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('boot');

var moment = _Pydio$requireLib2.moment;
var SingleJobProgress = _Pydio$requireLib2.SingleJobProgress;

var ComponentConfigsParser = (function () {
    function ComponentConfigsParser() {
        _classCallCheck(this, ComponentConfigsParser);
    }

    ComponentConfigsParser.prototype.getDefaultListColumns = function getDefaultListColumns() {
        return {
            text: {
                label: 'File Name',
                message: '1',
                width: '50%',
                renderCell: MainFilesList.tableEntryRenderCell,
                sortType: 'file-natural',
                remoteSortAttribute: 'ajxp_label'
            },
            filesize: {
                label: 'File Size',
                message: '2',
                sortType: 'number',
                sortAttribute: 'bytesize',
                remoteSortAttribute: 'filesize'
            },
            mimestring: {
                label: 'File Type',
                message: '3',
                sortType: 'string'
            },
            ajxp_modiftime: {
                label: 'Mofidied on',
                message: '4',
                sortType: 'number'
            }
        };
    };

    ComponentConfigsParser.prototype.loadConfigs = function loadConfigs(componentName) {
        var configs = new Map();
        var columnsNodes = XMLUtils.XPathSelectNodes(global.pydio.getXmlRegistry(), 'client_configs/component_config[@component="FilesList"]/columns/column|client_configs/component_config[@component="FilesList"]/columns/additional_column');
        var columns = {};
        var messages = global.pydio.MessageHash;
        columnsNodes.forEach(function (colNode) {
            var name = colNode.getAttribute('attributeName');
            var sortType = colNode.getAttribute('sortType');
            var sorts = { 'String': 'string', 'StringDirFile': 'string', 'MyDate': 'number', 'CellSorterValue': 'number' };
            sortType = sorts[sortType] || 'string';
            if (name === 'bytesize') sortType = 'number';
            columns[name] = {
                message: colNode.getAttribute('messageId'),
                label: colNode.getAttribute('messageString') ? colNode.getAttribute('messageString') : messages[colNode.getAttribute('messageId')],
                sortType: sortType
            };
            if (name === 'ajxp_label') {
                columns[name].renderCell = MainFilesList.tableEntryRenderCell;
            }
            if (colNode.getAttribute('reactModifier')) {
                (function () {
                    var reactModifier = colNode.getAttribute('reactModifier');
                    ResourcesManager.detectModuleToLoadAndApply(reactModifier, function () {
                        columns[name].renderComponent = columns[name].renderCell = FuncUtils.getFunctionByName(reactModifier, global);
                    }, true);
                })();
            }
        });
        configs.set('columns', columns);
        return configs;
    };

    return ComponentConfigsParser;
})();

var MainFilesList = (function (_React$Component) {
    _inherits(MainFilesList, _React$Component);

    MainFilesList.tableEntryRenderCell = function tableEntryRenderCell(node) {
        return _react2['default'].createElement(
            'span',
            null,
            _react2['default'].createElement(_FilePreview2['default'], { rounded: true, loadThumbnail: false, node: node, style: { backgroundColor: 'transparent' } }),
            _react2['default'].createElement(
                'span',
                { style: { display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }, title: node.getLabel() },
                node.getLabel()
            )
        );
    };

    _createClass(MainFilesList, null, [{
        key: 'propTypes',
        value: {
            pydio: _propTypes2['default'].instanceOf(_pydio2['default']),
            horizontalRibbon: _propTypes2['default'].bool
        },
        enumerable: true
    }, {
        key: 'computeLabel',
        value: function value(node) {
            var label = node.getLabel();
            if (node.isLeaf() && label[0] !== ".") {
                var ext = _pydioUtilPath2['default'].getFileExtension(label);
                if (ext) {
                    ext = '.' + ext;
                    label = _react2['default'].createElement(
                        'span',
                        null,
                        label.substring(0, label.length - ext.length),
                        _react2['default'].createElement(
                            'span',
                            { className: "label-extension", style: { opacity: 0.33, display: 'none' } },
                            ext
                        )
                    );
                }
            }
            return label;
        },
        enumerable: true
    }]);

    function MainFilesList(props, context) {
        var _this = this;

        _classCallCheck(this, MainFilesList);

        _React$Component.call(this, props, context);

        this.displayModeFromPrefs = function (defaultMode) {
            var pydio = _this.props.pydio;

            if (!pydio.user) {
                return defaultMode || 'list';
            }
            var slug = pydio.user.getActiveRepositoryObject().getSlug();
            var guiPrefs = pydio.user ? pydio.user.getPreference('gui_preferences', true) : {};
            if (guiPrefs['FilesListDisplayMode'] && guiPrefs['FilesListDisplayMode'][slug]) {
                return guiPrefs['FilesListDisplayMode'][slug];
            }
            return defaultMode || 'list';
        };

        this.displayModeToPrefs = function (mode) {
            var pydio = _this.props.pydio;

            if (!pydio.user) {
                return 'list';
            }
            var slug = pydio.user.getActiveRepositoryObject().getSlug();
            var guiPrefs = pydio.user ? pydio.user.getPreference('gui_preferences', true) : {};
            var dPrefs = guiPrefs['FilesListDisplayMode'] || {};
            dPrefs[slug] = mode;
            guiPrefs['FilesListDisplayMode'] = dPrefs;
            pydio.user.setPreference('gui_preferences', guiPrefs, true);
            pydio.user.savePreference('gui_preferences');
        };

        this.resize = function () {
            _this.recomputeThumbnailsDimension();
        };

        this.recomputeThumbnailsDimension = function (nearest) {

            var MAIN_CONTAINER_FULL_PADDING = 2;
            var THUMBNAIL_MARGIN = 1;
            var containerWidth = undefined;
            try {
                containerWidth = _reactDom2['default'].findDOMNode(_this.refs['list'].refs['infinite']).clientWidth - MAIN_CONTAINER_FULL_PADDING;
            } catch (e) {
                containerWidth = 200;
            }
            if (_this.state.displayMode.indexOf('grid') === 0) {
                if (!nearest || nearest instanceof Event) {
                    nearest = _this.state.thumbNearest;
                }
                // Find nearest dim
                var blockNumber = Math.floor(containerWidth / nearest);
                var width = Math.floor(containerWidth / blockNumber) - THUMBNAIL_MARGIN * 2;
                if (_this.props.horizontalRibbon) {
                    blockNumber = _this.state.contextNode.getChildren().size;
                    if (_this.state.displayMode === 'grid-160') {
                        width = 160;
                    } else if (_this.state.displayMode === 'grid-320') {
                        width = 320;
                    } else if (_this.state.displayMode === 'grid-80') {
                        width = 80;
                    } else {
                        width = 200;
                    }
                }
                _this.setState({
                    elementsPerLine: blockNumber,
                    thumbSize: width,
                    thumbNearest: nearest
                });
            } else {
                (function () {
                    // Recompute columns widths
                    var columns = _this.state.columns;
                    var columnKeys = Object.keys(columns);
                    var defaultFirstWidthPercent = 10;
                    var firstColWidth = Math.max(250, containerWidth * defaultFirstWidthPercent / 100);
                    var otherColWidth = (containerWidth - firstColWidth) / (Object.keys(_this.state.columns).length - 1);
                    columnKeys.map(function (columnKey) {
                        columns[columnKey]['width'] = otherColWidth;
                    });
                    _this.setState({
                        columns: columns
                    });
                })();
            }
        };

        this.entryRenderIcon = function (node) {
            var entryProps = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            if (entryProps && entryProps.parent) {
                return _react2['default'].createElement(_FilePreview2['default'], {
                    loadThumbnail: false,
                    node: node,
                    mimeClassName: 'mimefont mdi mdi-chevron-left',
                    onClick: function () {
                        _this.entryHandleClicks(node, SimpleList.CLICK_TYPE_DOUBLE);
                    },
                    style: { cursor: 'pointer' }
                });
            } else {
                var hasThumbnail = !!node.getMetadata().get("thumbnails");
                var processing = !!node.getMetadata().get('Processing');
                return _react2['default'].createElement(_FilePreview2['default'], {
                    loadThumbnail: !entryProps['parentIsScrolling'] && hasThumbnail && !processing,
                    node: node,
                    processing: processing
                });
            }
        };

        this.entryRenderActions = function (node) {
            var content = null;
            var pydio = _this.props.pydio;

            var mobile = pydio.UI.MOBILE_EXTENSIONS;
            var dm = pydio.getContextHolder();
            if (mobile) {
                var _ret3 = (function () {
                    var ContextMenuModel = require('pydio/model/context-menu');
                    return {
                        v: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: 'mdi mdi-dots-vertical', style: { zIndex: 0, padding: 10 }, tooltip: 'Info', onClick: function (event) {
                                pydio.observeOnce('actions_refreshed', function () {
                                    ContextMenuModel.getInstance().openNodeAtPosition(node, event.clientX, event.clientY);
                                });
                                event.stopPropagation();
                                dm.setSelectedNodes([node]);
                                ContextMenuModel.getInstance().openNodeAtPosition(node, event.clientX, event.clientY);
                            } })
                    };
                })();

                if (typeof _ret3 === 'object') return _ret3.v;
            } else if (node.getMetadata().get('overlay_class')) {
                var elements = node.getMetadata().get('overlay_class').split(',').filter(function (c) {
                    return !!c;
                }).map(function (c) {
                    return _react2['default'].createElement(_OverlayIcon2['default'], { node: node, key: c, overlay: c, pydio: pydio });
                });
                content = _react2['default'].createElement(
                    'div',
                    { className: 'overlay_icon_div' },
                    elements
                );
            }
            return content;
        };

        this.entryHandleClicks = function (node, clickType, event) {
            var dm = _this.props.pydio.getContextHolder();
            var mobile = _this.props.pydio.UI.MOBILE_EXTENSIONS || _this.props.horizontalRibbon;
            if (dm.getContextNode().getParent() === node && clickType === SimpleList.CLICK_TYPE_SIMPLE) {
                return;
            }
            if (!mobile && (!clickType || clickType === SimpleList.CLICK_TYPE_SIMPLE)) {
                var crtSelection = dm.getSelectedNodes();
                if (event && event.shiftKey && crtSelection.length) {
                    var newSelection = _this.refs.list.computeSelectionFromCurrentPlusTargetNode(crtSelection, node);
                    dm.setSelectedNodes(newSelection);
                } else if (event && (event.ctrlKey || event.metaKey) && crtSelection.length) {
                    if (crtSelection.indexOf(node) === -1) {
                        dm.setSelectedNodes([].concat(crtSelection, [node]));
                    } else {
                        var otherSelection = crtSelection.filter(function (obj) {
                            return obj !== node;
                        });
                        dm.setSelectedNodes(otherSelection);
                    }
                } else {
                    dm.setSelectedNodes([node]);
                }
            } else if (mobile || clickType === SimpleList.CLICK_TYPE_DOUBLE) {
                if (!node.isBrowsable()) {
                    dm.setSelectedNodes([node]);
                    _this.props.pydio.Controller.fireAction("open_with_unique");
                } else {
                    dm.requireContextChange(node);
                }
            }
        };

        this.entryRenderSecondLine = function (node) {
            var metaData = node.getMetadata();
            var pieces = [];
            var standardPieces = [];
            var otherPieces = [];

            if (metaData.has('pending_operation')) {
                if (metaData.has('pending_operation_uuid')) {
                    return _react2['default'].createElement(SingleJobProgress, { jobID: metaData.get('pending_operation_uuid'), style: { display: 'flex', flexDirection: 'row-reverse', alignItems: 'center' }, progressStyle: { width: 60, paddingRight: 10 }, labelStyle: { flex: 1 } });
                } else {
                    return _react2['default'].createElement(
                        'span',
                        { style: { fontStyle: 'italic', color: 'rgba(0,0,0,.33)' } },
                        metaData.get('pending_operation')
                    );
                }
            }

            if (metaData.get('ajxp_modiftime')) {
                var mDate = moment(parseFloat(metaData.get('ajxp_modiftime')) * 1000);
                var dateString = mDate.calendar();
                if (dateString.indexOf('/') > -1) {
                    dateString = mDate.fromNow();
                }
                pieces.push(_react2['default'].createElement(
                    'span',
                    { key: 'time_description', className: 'metadata_chunk metadata_chunk_description' },
                    dateString
                ));
            }

            var first = false;
            var attKeys = Object.keys(_this.state.columns);

            for (var i = 0; i < attKeys.length; i++) {
                var s = attKeys[i];
                var columnDef = _this.state.columns[s];
                var label = undefined;
                var standard = false;
                if (s === 'ajxp_label' || s === 'text') {
                    continue;
                } else if (s === "ajxp_modiftime") {
                    var date = new Date();
                    date.setTime(parseInt(metaData.get(s)) * 1000);
                    label = _pydioUtilPath2['default'].formatModifDate(date);
                    standard = true;
                } else if (s === "ajxp_dirname" && metaData.get("filename")) {
                    var dirName = _pydioUtilPath2['default'].getDirname(metaData.get("filename"));
                    label = dirName ? dirName : "/";
                    standard = true;
                } else if (s === "bytesize") {
                    if (metaData.get(s) === "-") {
                        continue;
                    } else {
                        var test = _pydioUtilPath2['default'].roundFileSize(parseInt(metaData.get(s)));
                        if (test !== NaN) {
                            label = test;
                        } else {
                            continue;
                        }
                    }
                    standard = true;
                } else if (columnDef.renderComponent) {
                    columnDef['name'] = s;
                    label = columnDef.renderComponent(node, columnDef);
                    if (label === null) {
                        continue;
                    }
                } else {
                    if (s === 'mimestring' || s === 'readable_dimension') {
                        standard = true;
                    }
                    var metaValue = metaData.get(s) || "";
                    if (!metaValue) {
                        continue;
                    }
                    label = metaValue;
                }
                var sep = undefined;
                if (!first) {
                    sep = _react2['default'].createElement('span', { className: 'icon-angle-right' });
                }
                var cellClass = 'metadata_chunk metadata_chunk_' + (standard ? 'standard' : 'other') + ' metadata_chunk_' + s;
                var cell = _react2['default'].createElement(
                    'span',
                    { key: s, className: cellClass },
                    sep,
                    _react2['default'].createElement(
                        'span',
                        { className: 'text_label' },
                        label
                    )
                );
                standard ? standardPieces.push(cell) : otherPieces.push(cell);
            }
            pieces.push.apply(pieces, otherPieces.concat(standardPieces));
            return pieces;
        };

        this.switchDisplayMode = function (displayMode) {
            _this.setState({ displayMode: displayMode }, function () {
                var near = null;
                if (displayMode.indexOf('grid-') === 0) {
                    near = parseInt(displayMode.split('-')[1]);
                }
                _this.recomputeThumbnailsDimension(near);
                _this.displayModeToPrefs(displayMode);
                if (_this.props.onDisplayModeChange) {
                    _this.props.onDisplayModeChange(displayMode);
                }
                _this.props.pydio.notify('actions_refreshed');
            });
        };

        this.buildDisplayModeItems = function () {
            var displayMode = _this.state.displayMode;

            var list = [{ name: 'List', title: 227, icon_class: 'mdi mdi-view-list', value: 'list', hasAccessKey: true, accessKey: 'list_access_key' }, { name: 'Detail', title: 461, icon_class: 'mdi mdi-view-headline', value: 'detail', hasAccessKey: true, accessKey: 'detail_access_key' }, { name: 'Thumbs', title: 229, icon_class: 'mdi mdi-view-grid', value: 'grid-160', hasAccessKey: true, accessKey: 'thumbs_access_key' }, { name: 'Thumbs large', title: 229, icon_class: 'mdi mdi-view-agenda', value: 'grid-320', hasAccessKey: false }, { name: 'Thumbs small', title: 229, icon_class: 'mdi mdi-view-module', value: 'grid-80', hasAccessKey: false }];
            return list.map(function (item) {
                var i = _extends({}, item);
                var value = item.value;
                i.callback = function () {
                    _this.switchDisplayMode(i.value);
                };
                if (value === displayMode) {
                    i.icon_class = 'mdi mdi-check';
                }
                return i;
            });
        };

        this.getPydioActions = function () {
            var keysOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            if (keysOnly) {
                return ['switch_display_mode'];
            }
            var multiAction = new _pydioModelAction2['default']({
                name: 'switch_display_mode',
                icon_class: 'mdi mdi-view-list',
                text_id: 150,
                title_id: 151,
                text: MessageHash[150],
                title: MessageHash[151],
                hasAccessKey: false,
                subMenu: true,
                subMenuUpdateImage: true
            }, {
                selection: false,
                dir: true,
                actionBar: true,
                actionBarGroup: 'display_toolbar',
                contextMenu: false,
                infoPanel: false
            }, {}, {}, {
                dynamicBuilder: _this.buildDisplayModeItems.bind(_this)
            });
            var buttons = new Map();
            buttons.set('switch_display_mode', multiAction);
            return buttons;
        };

        var configParser = new ComponentConfigsParser();
        var columns = configParser.loadConfigs('FilesList').get('columns');
        var dMode = this.displayModeFromPrefs(props.displayMode);
        var tSize = 200;
        if (dMode === 'grid-320') {
            tSize = 320;
        } else if (dMode === 'grid-80') {
            tSize = 80;
        }

        this.state = {
            contextNode: props.pydio.getContextHolder().getContextNode(),
            displayMode: dMode,
            thumbNearest: tSize,
            thumbSize: tSize,
            elementsPerLine: 5,
            columns: columns ? columns : configParser.getDefaultListColumns(),
            parentIsScrolling: props.parentIsScrolling,
            repositoryId: props.pydio.repositoryId
        };
    }

    MainFilesList.prototype.componentDidMount = function componentDidMount() {
        // Hook to the central datamodel
        this._contextObserver = (function () {
            this.setState({ contextNode: this.props.pydio.getContextHolder().getContextNode() });
        }).bind(this);
        this.props.pydio.getContextHolder().observe("context_changed", this._contextObserver);
        this.props.pydio.getController().updateGuiActions(this.getPydioActions());

        this.recomputeThumbnailsDimension();
        if (window.addEventListener) {
            window.addEventListener('resize', this.recomputeThumbnailsDimension);
        } else {
            window.attachEvent('onresize', this.recomputeThumbnailsDimension);
        }
        if (this.props.onDisplayModeChange && this.state && this.state.displayMode) {
            this.props.onDisplayModeChange(this.state.displayMode);
        }
    };

    MainFilesList.prototype.componentWillUnmount = function componentWillUnmount() {
        this.props.pydio.getContextHolder().stopObserving("context_changed", this._contextObserver);
        this.getPydioActions(true).map((function (key) {
            this.props.pydio.getController().deleteFromGuiActions(key);
        }).bind(this));
        if (window.addEventListener) {
            window.removeEventListener('resize', this.recomputeThumbnailsDimension);
        } else {
            window.detachEvent('onresize', this.recomputeThumbnailsDimension);
        }
    };

    MainFilesList.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
        return !this.state || this.state.repositoryId !== nextProps.pydio.repositoryId || nextState !== this.state;
    };

    MainFilesList.prototype.componentWillReceiveProps = function componentWillReceiveProps() {
        var _this2 = this;

        if (this.state && this.state.repositoryId !== this.props.pydio.repositoryId) {
            (function () {
                _this2.props.pydio.getController().updateGuiActions(_this2.getPydioActions());
                var configParser = new ComponentConfigsParser();
                var columns = configParser.loadConfigs('FilesList').get('columns');
                var dMode = _this2.displayModeFromPrefs(_this2.state ? _this2.state.displayMode : 'list');
                if (_this2.state.displayMode !== dMode && dMode.indexOf('grid-') === 0) {
                    var tSize = 200;
                    if (dMode === 'grid-320') {
                        tSize = 320;
                    } else if (dMode === 'grid-80') {
                        tSize = 80;
                    }
                    _this2.setState({
                        thumbNearest: tSize,
                        thumbSize: tSize
                    });
                }
                _this2.setState({
                    repositoryId: _this2.props.pydio.repositoryId,
                    columns: columns ? columns : configParser.getDefaultListColumns(),
                    displayMode: dMode
                }, function () {
                    if (_this2.props.onDisplayModeChange) {
                        _this2.props.onDisplayModeChange(dMode);
                    }
                });
            })();
        }
    };

    MainFilesList.prototype.render = function render() {

        var tableKeys = undefined,
            sortKeys = undefined,
            elementStyle = undefined,
            className = 'files-list layout-fill main-files-list';
        var elementHeight = undefined,
            entryRenderSecondLine = undefined,
            elementsPerLine = 1,
            near = undefined;
        var dMode = this.state.displayMode;
        if (dMode.indexOf('grid-') === 0) {
            near = parseInt(dMode.split('-')[1]);
            dMode = 'grid';
        }
        var infiniteSliceCount = 50;

        if (dMode === 'detail') {

            elementHeight = SimpleList.HEIGHT_ONE_LINE;
            tableKeys = this.state.columns;
        } else if (dMode === 'grid') {

            sortKeys = this.state.columns;
            className += ' material-list-grid grid-size-' + near;
            elementHeight = Math.ceil(this.state.thumbSize / this.state.elementsPerLine);
            if (!elementHeight || this.props.horizontalRibbon) {
                elementHeight = 1;
            }
            elementsPerLine = this.state.elementsPerLine;
            elementStyle = {
                width: this.state.thumbSize,
                height: this.state.thumbSize
            };
            if (this.props.horizontalRibbon) {
                className += ' horizontal-ribbon';
            }
            // Todo: compute a more real number of elements visible per page.
            if (near === 320) infiniteSliceCount = 25;else if (near === 160) infiniteSliceCount = 80;else if (near === 80) infiniteSliceCount = 200;
        } else if (dMode === 'list') {

            sortKeys = this.state.columns;
            elementHeight = SimpleList.HEIGHT_TWO_LINES;
            entryRenderSecondLine = this.entryRenderSecondLine;
        }

        var pydio = this.props.pydio;
        var contextNode = this.state.contextNode;

        var messages = pydio.MessageHash;
        var canUpload = pydio.Controller.getActionByName('upload') && !contextNode.getMetadata().has('node_readonly');
        var secondary = messages[canUpload ? '565' : '566'];
        var iconClassName = canUpload ? 'mdi mdi-cloud-upload' : 'mdi mdi-folder-outline';
        var emptyStateProps = {
            style: { backgroundColor: 'transparent' },
            iconClassName: iconClassName,
            primaryTextId: messages['562'],
            secondaryTextId: secondary
        };
        if (contextNode.isRoot()) {
            (function () {
                var isCell = pydio.user && pydio.user.activeRepository ? pydio.user.getRepositoriesList().get(pydio.user.activeRepository).getOwner() : false;
                var recyclePath = contextNode.getMetadata().get('repo_has_recycle');
                emptyStateProps = {
                    style: { backgroundColor: 'transparent' },
                    iconClassName: iconClassName,
                    primaryTextId: isCell ? messages['631'] : messages['563'],
                    secondaryTextId: secondary
                };
                if (recyclePath) {
                    emptyStateProps = _extends({}, emptyStateProps, {
                        checkEmptyState: function checkEmptyState(node) {
                            return node.isLoaded() && node.getChildren().size === 1 && node.getChildren().get(recyclePath);
                        },
                        actionLabelId: messages['567'],
                        actionIconClassName: 'mdi mdi-delete',
                        actionCallback: function actionCallback(e) {
                            pydio.goTo(recyclePath);
                        }
                    });
                }
            })();
        } else {
            var recycle = pydio.getContextHolder().getRootNode().getMetadata().get('repo_has_recycle');
            if (contextNode.getPath() === recycle) {
                emptyStateProps = _extends({}, emptyStateProps, {
                    iconClassName: 'mdi mdi-delete-empty',
                    primaryTextId: messages['564'],
                    secondaryTextId: null
                });
            }
        }

        return _react2['default'].createElement(SimpleList, {
            ref: 'list',
            tableKeys: tableKeys,
            sortKeys: sortKeys,
            node: this.state.contextNode,
            dataModel: pydio.getContextHolder(),
            className: className,
            actionBarGroups: ["change_main"],
            infiniteSliceCount: infiniteSliceCount,
            skipInternalDataModel: true,
            style: this.props.style,
            displayMode: dMode,
            usePlaceHolder: true,
            elementsPerLine: elementsPerLine,
            elementHeight: elementHeight,
            elementStyle: elementStyle,
            passScrollingStateToChildren: true,
            entryRenderIcon: this.entryRenderIcon,
            entryRenderParentIcon: this.entryRenderIcon,
            entryRenderFirstLine: function (node) {
                return MainFilesList.computeLabel(node);
            },
            entryRenderSecondLine: entryRenderSecondLine,
            entryRenderActions: this.entryRenderActions,
            entryHandleClicks: this.entryHandleClicks,
            horizontalRibbon: this.props.horizontalRibbon,
            emptyStateProps: emptyStateProps,
            defaultSortingInfo: { sortType: 'file-natural', attribute: '', direction: 'asc' },
            hideToolbar: true,
            customToolbar: _react2['default'].createElement(_CellsMessageToolbar2['default'], { pydio: pydio })
        });
    };

    return MainFilesList;
})(_react2['default'].Component);

exports['default'] = MainFilesList;
module.exports = exports['default'];

/**
 * Save displayMode to user prefs
 * @param mode
 * @return {string}
 */
