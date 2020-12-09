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

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _viewsFilePreview = require('../../views/FilePreview');

var _viewsFilePreview2 = _interopRequireDefault(_viewsFilePreview);

var _AdvancedSearch = require('./AdvancedSearch');

var _AdvancedSearch2 = _interopRequireDefault(_AdvancedSearch);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioModelEmptyNodeProvider = require('pydio/model/empty-node-provider');

var _pydioModelEmptyNodeProvider2 = _interopRequireDefault(_pydioModelEmptyNodeProvider);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioHttpSearchApi = require('pydio/http/search-api');

var _pydioHttpSearchApi2 = _interopRequireDefault(_pydioHttpSearchApi);

var _SearchScopeSelector = require('./SearchScopeSelector');

var _SearchScopeSelector2 = _interopRequireDefault(_SearchScopeSelector);

var _MainSearch = require('./MainSearch');

var _MainSearch2 = _interopRequireDefault(_MainSearch);

var _materialUi = require('material-ui');

var _lodash = require('lodash');

/**
 * Multi-state search component
 */

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var EmptyStateView = _Pydio$requireLib.EmptyStateView;

var _require$requireLib = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

var SearchForm = (function (_Component) {
    _inherits(SearchForm, _Component);

    function SearchForm(props) {
        var _this = this;

        _classCallCheck(this, SearchForm);

        _Component.call(this, props);

        // Create Fake DM
        var clearDataModel = function clearDataModel() {
            var basicDataModel = new PydioDataModel(true);
            var rNodeProvider = new _pydioModelEmptyNodeProvider2['default']();
            basicDataModel.setAjxpNodeProvider(rNodeProvider);
            var rootNode = new _pydioModelNode2['default']("/", false, '', '', rNodeProvider);
            basicDataModel.setRootNode(rootNode);
            return basicDataModel;
        };

        this.state = {
            values: props.advancedPanel && props.values ? props.values : {},
            display: props.advancedPanel ? 'advanced' : 'closed',
            dataModel: clearDataModel(),
            empty: true,
            loading: false,
            searchScope: props.uniqueSearchScope || props.searchScope || 'folder'
        };

        this.setMode = _lodash.debounce(this.setMode, 250);
        this.update = _lodash.debounce(this.update, 500);
        this.submit = _lodash.debounce(this.submit, 500);

        this.props.pydio.observe('repository_list_refreshed', function () {
            if (!props.advancedPanel) {
                _this.setState({
                    values: {},
                    display: 'closed',
                    dataModel: clearDataModel(),
                    empty: true,
                    loading: false
                });
            }
        });

        if (props.advancedPanel && props.values && Object.keys(props.values).length) {
            this.submit();
        }
    }

    SearchForm.prototype.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
        var _this2 = this;

        if (this.refs.results && this.refs.results.refs.list) {
            this.refs.results.refs.list.updateInfiniteContainerHeight();
            FuncUtils.bufferCallback('search_results_resize_list', 550, function () {
                try {
                    _this2.refs.results.refs.list.updateInfiniteContainerHeight();
                } catch (e) {}
            });
        }
    };

    SearchForm.prototype.setMode = function setMode(mode) {
        if (mode === 'small' && this.state.display !== 'closed') {
            // we can only set to small when the previous state was closed
            return;
        }
        if (mode === 'small' && this.state.display === 'closed') {
            var _state$values = this.state.values;
            var basename = _state$values.basename;

            var otherValues = _objectWithoutProperties(_state$values, ['basename']);

            if (otherValues && Object.keys(otherValues).length) {
                mode = 'advanced';
            }
        }
        this.setState({
            display: mode
        });
    };

    SearchForm.prototype.update = function update(newValues) {
        var _props = this.props;
        var onUpdateState = _props.onUpdateState;
        var searchScope = _props.searchScope;

        var values = _extends({}, this.state.values, newValues);

        // Removing empty values
        Object.keys(values).forEach(function (key) {
            return !values[key] && delete values[key];
        });

        this.setState({ values: values }, this.submit);
        if (onUpdateState) {
            onUpdateState({ searchScope: searchScope, values: values });
        }
    };

    SearchForm.prototype.changeSearchScope = function changeSearchScope(scope) {
        var _this3 = this;

        var onUpdateState = this.props.onUpdateState;
        var _state = this.state;
        var display = _state.display;
        var values = _state.values;

        if (display === 'small') {
            setTimeout(function () {
                return _this3.setMode('small');
            }, 250);
        }
        this.setState({ searchScope: scope }, this.submit);
        if (onUpdateState) {
            onUpdateState({ searchScope: scope, values: values });
        }
    };

    SearchForm.prototype.submit = function submit() {
        var _this4 = this;

        var _state2 = this.state;
        var display = _state2.display;
        var values = _state2.values;
        var searchScope = _state2.searchScope;
        var dataModel = _state2.dataModel;
        var crossWorkspace = this.props.crossWorkspace;

        var limit = crossWorkspace || searchScope === 'all' ? 6 : display === 'small' ? 9 : 100;
        var rootNode = dataModel.getRootNode();
        rootNode.setChildren([]);
        rootNode.setLoaded(false);

        var keys = Object.keys(values);
        if (keys.length === 0 || keys.length === 1 && keys[0] === 'basename' && !values['basename']) {
            this.setState({ loading: false, empty: true });
            return;
        }

        this.setState({ loading: true, empty: false });
        rootNode.setLoading(true);
        var api = new _pydioHttpSearchApi2['default'](this.props.pydio);
        api.search(values, crossWorkspace ? 'all' : searchScope, limit).then(function (response) {
            rootNode.setChildren(response.Results);
            rootNode.setLoading(false);
            rootNode.setLoaded(true);
            _this4.setState({ loading: false });
        })['catch'](function () {
            rootNode.setLoading(false);
            _this4.setState({ loading: false });
        });
    };

    SearchForm.prototype.render = function render() {
        var _this5 = this;

        var _props2 = this.props;
        var crossWorkspace = _props2.crossWorkspace;
        var pydio = _props2.pydio;
        var getMessage = _props2.getMessage;
        var advancedPanel = _props2.advancedPanel;
        var onOpenAdvanced = _props2.onOpenAdvanced;
        var onCloseAdvanced = _props2.onCloseAdvanced;
        var id = _props2.id;
        var xtraSmallScreen = _props2.xtraSmallScreen;
        var _state3 = this.state;
        var searchScope = _state3.searchScope;
        var display = _state3.display;
        var loading = _state3.loading;
        var dataModel = _state3.dataModel;
        var empty = _state3.empty;
        var values = _state3.values;

        var renderSecondLine = null,
            renderIcon = null,
            elementHeight = 49;
        if (display !== 'small' && display !== 'closed') {
            elementHeight = PydioComponents.SimpleList.HEIGHT_TWO_LINES + 10;
            renderSecondLine = function (node) {
                var path = node.getPath();
                if (searchScope === 'folder') {
                    var crtFolder = pydio.getContextHolder().getContextNode().getPath();
                    if (path.indexOf(crtFolder) === 0) {
                        path = './' + _pydioUtilLang2['default'].trimLeft(path.substr(crtFolder.length), '/');
                    }
                }
                return _react2['default'].createElement(
                    'div',
                    null,
                    path
                );
            };
            renderIcon = function (node) {
                var entryProps = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                return _react2['default'].createElement(_viewsFilePreview2['default'], { loadThumbnail: !entryProps['parentIsScrolling'], node: node });
            };
        } else {
            renderIcon = function (node) {
                var entryProps = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                return _react2['default'].createElement(_viewsFilePreview2['default'], { loadThumbnail: false, richPreview: false, node: node,
                    style: { width: 30, height: 30, borderRadius: '50%', margin: '9px 6px' },
                    mimeFontStyle: { fontSize: 16, display: 'block', padding: '4px 7px' }
                });
            };
        }

        var nodeClicked = function nodeClicked(node) {
            pydio.goTo(node);
            if (advancedPanel) {
                var targetRepo = node.getMetadata().get('repository_id');
                if (targetRepo && targetRepo !== pydio.user.activeRepository) {
                    onCloseAdvanced();
                }
            } else {
                _this5.setMode('closed');
            }
        };

        var style = _extends({}, this.props.style, { backgroundColor: 'transparent' });
        var searchResultsStyle = {};
        if (display !== 'closed' && !advancedPanel) {
            searchResultsStyle = {
                backgroundColor: 'white',
                position: 'absolute',
                right: 0,
                display: 'block',
                width: 256
            };
        }
        if (xtraSmallScreen) {
            searchResultsStyle.width = '100%';
            searchResultsStyle.flex = 2;
        }

        var results = _react2['default'].createElement(
            _materialUi.Paper,
            { className: 'search-results', zDepth: advancedPanel ? 0 : 2, style: searchResultsStyle, rounded: !advancedPanel },
            empty && _react2['default'].createElement(EmptyStateView, {
                iconClassName: '',
                primaryTextId: 611,
                style: { minHeight: 180, backgroundColor: 'transparent', padding: '0 20px' }
            }),
            _react2['default'].createElement(PydioComponents.NodeListCustomProvider, {
                ref: 'results',
                className: display !== 'small' ? 'files-list' : null,
                elementHeight: elementHeight,
                entryRenderIcon: renderIcon,
                entryRenderActions: function () {
                    return null;
                },
                entryRenderSecondLine: renderSecondLine,
                presetDataModel: dataModel,
                heightAutoWithMax: advancedPanel ? 0 : 500,
                openCollection: nodeClicked,
                nodeClicked: nodeClicked,
                defaultGroupBy: crossWorkspace || searchScope === 'all' ? 'repository_id' : null,
                groupByLabel: crossWorkspace || searchScope === 'all' ? 'repository_display' : null,
                emptyStateProps: {
                    iconClassName: "",
                    primaryTextId: loading ? 'searchengine.searching' : 478,
                    style: {
                        minHeight: display === 'small' ? 180 : advancedPanel ? 240 : 412,
                        backgroundColor: 'transparent',
                        padding: '0 20px'
                    },
                    secondaryTextId: searchScope === 'ws' ? 620 : searchScope === 'folder' ? 619 : null,
                    actionLabelId: searchScope === 'ws' ? 610 : searchScope === 'folder' ? 609 : null,
                    actionCallback: searchScope !== 'all' ? function () {
                        _this5.changeSearchScope(searchScope === 'ws' ? 'all' : 'ws');
                    } : null,
                    actionStyle: { marginTop: 10 }
                }
            }),
            display === 'small' && _react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', padding: 4, paddingTop: 0, backgroundColor: '#eeeeee', width: '100%' } },
                !crossWorkspace && !this.props.uniqueSearchScope && _react2['default'].createElement(_SearchScopeSelector2['default'], { style: { flex: 1 }, labelStyle: { paddingLeft: 8 }, value: searchScope, onChange: function (scope) {
                        _this5.changeSearchScope(scope);
                    }, onTouchTap: function () {
                        return _this5.setMode('small');
                    } }),
                _react2['default'].createElement(_materialUi.FlatButton, { style: { marginTop: 4, minWidth: 0 }, labelStyle: { padding: '0 8px' }, primary: true, label: getMessage(456), onTouchTap: function () {
                        onOpenAdvanced();
                    } })
            )
        );

        if (advancedPanel) {
            return _react2['default'].createElement(
                _materialUi.Paper,
                { ref: 'root', zDepth: 0, className: "top_search_form " + display, style: style, id: id },
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', padding: '0 8px 8px', height: 44, width: '100%', backgroundColor: '#eee', borderBottom: '1px solid #e0e0e0' } },
                    !crossWorkspace && !this.props.uniqueSearchScope && _react2['default'].createElement(
                        'div',
                        { style: { flex: 1, height: 48 } },
                        _react2['default'].createElement(_SearchScopeSelector2['default'], { labelStyle: { paddingLeft: 8 }, value: searchScope, onChange: function (scope) {
                                _this5.changeSearchScope(scope);
                            } })
                    ),
                    _react2['default'].createElement(_materialUi.IconButton, {
                        iconClassName: "mdi mdi-close",
                        style: { minWidth: 0, marginTop: 4 },
                        tooltip: getMessage(86),
                        onTouchTap: function () {
                            onCloseAdvanced();
                        }
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1, display: 'flex', flexDirection: xtraSmallScreen ? 'column' : 'row' } },
                    _react2['default'].createElement(_AdvancedSearch2['default'], _extends({}, this.props, {
                        values: values,
                        onChange: function (values) {
                            return _this5.update(values);
                        },
                        onSubmit: function () {
                            return _this5.submit();
                        },
                        rootStyle: xtraSmallScreen ? { flex: 1, width: '100%', borderRight: 0 } : {}
                    })),
                    results
                )
            );
        } else {
            var formStyles = this.props.formStyles;

            return _react2['default'].createElement(
                _materialUi.Paper,
                { ref: 'root', zDepth: 0, className: "top_search_form " + display, style: style, id: id },
                _react2['default'].createElement(_MainSearch2['default'], _extends({
                    mode: display,
                    value: values.basename,
                    onOpen: function () {
                        return _this5.setMode("small");
                    },
                    onClose: function () {
                        return _this5.setMode("closed");
                    },
                    showAdvanced: !crossWorkspace,
                    onAdvanced: onOpenAdvanced,
                    onChange: function (values) {
                        return _this5.update(values);
                    },
                    onSubmit: function () {
                        return _this5.submit();
                    },
                    hintText: getMessage(crossWorkspace || searchScope === 'all' ? 607 : 87) + "...",
                    loading: loading,
                    scopeSelectorProps: crossWorkspace || this.props.uniqueSearchScope ? null : {
                        value: searchScope,
                        onChange: this.changeSearchScope.bind(this)
                    }
                }, formStyles)),
                results
            );
        }
    };

    return SearchForm;
})(_react.Component);

SearchForm = PydioContextConsumer(SearchForm);
exports['default'] = SearchForm;
module.exports = exports['default'];
