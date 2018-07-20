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

var _lodash2 = _interopRequireDefault(_lodash);

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
        this._basicDataModel = new PydioDataModel(true);
        var rNodeProvider = new EmptyNodeProvider();
        this._basicDataModel.setAjxpNodeProvider(rNodeProvider);
        var rootNode = new AjxpNode("/", false, '', '', rNodeProvider);
        this._basicDataModel.setRootNode(rootNode);

        this.state = {
            values: {},
            display: 'closed',
            dataModel: this._basicDataModel,
            empty: true,
            loading: false,
            searchScope: props.uniqueSearchScope || 'folder'
        };

        this.setMode = _lodash2['default'].debounce(this.setMode, 250);
        this.update = _lodash2['default'].debounce(this.update, 500);
        this.submit = _lodash2['default'].debounce(this.submit, 500);

        this.props.pydio.observe('repository_list_refreshed', function () {
            _this.setState({
                values: {},
                display: 'closed',
                dataModel: _this._basicDataModel,
                empty: true,
                loading: false
            });
        });
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
        if (mode === 'small' && this.state.display !== 'closed') return; // we can only set to small when the previous state was closed
        if (mode === 'more' && this.state.display === 'advanced') {
            var _state$values = this.state.values;
            var basename = _state$values.basename;

            var otherValues = _objectWithoutProperties(_state$values, ['basename']);

            if (basename) this.setState({ values: { basename: basename } }, this.submit);else this.setState({ values: {} }, this.submit);
        } else if (mode === 'small' && this.state.display === 'closed') {
            var _state$values2 = this.state.values;
            var basename = _state$values2.basename;

            var otherValues = _objectWithoutProperties(_state$values2, ['basename']);

            if (otherValues && Object.keys(otherValues).length) {
                mode = 'advanced';
            }
        }
        this.setState({
            display: mode
        });
    };

    SearchForm.prototype.update = function update(newValues) {
        var values = _extends({}, this.state.values, newValues);

        // Removing empty values
        Object.keys(values).forEach(function (key) {
            return !values[key] && delete values[key];
        });

        this.setState({ values: values }, this.submit);
    };

    SearchForm.prototype.submit = function submit() {
        var _this3 = this;

        var _state = this.state;
        var display = _state.display;
        var values = _state.values;
        var searchScope = _state.searchScope;
        var dataModel = _state.dataModel;
        var crossWorkspace = this.props.crossWorkspace;

        var limit = crossWorkspace || searchScope === 'all' ? 6 : display === 'small' ? 9 : 100;
        var rootNode = dataModel.getRootNode();
        rootNode.setChildren([]);
        rootNode.setLoaded(true);

        var keys = Object.keys(values);
        if (keys.length === 0 || keys.length === 1 && keys[0] === 'basename' && !values['basename']) {
            this.setState({ loading: false, empty: true });
            return;
        }
        this.setState({ loading: true, empty: false });

        var api = new _pydioHttpSearchApi2['default'](this.props.pydio);
        api.search(values, crossWorkspace ? 'all' : searchScope, limit).then(function (results) {
            rootNode.setChildren(results);
            rootNode.setLoaded(true);
            _this3.setState({ loading: false });
        });
    };

    SearchForm.prototype.render = function render() {
        var _this4 = this;

        var _props = this.props;
        var crossWorkspace = _props.crossWorkspace;
        var pydio = _props.pydio;
        var getMessage = _props.getMessage;
        var _state2 = this.state;
        var searchScope = _state2.searchScope;
        var display = _state2.display;
        var loading = _state2.loading;
        var dataModel = _state2.dataModel;
        var empty = _state2.empty;
        var values = _state2.values;

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
            _this4.setMode('closed');
        };

        var searchScopeChanged = function searchScopeChanged(value) {
            if (display === 'small') {
                setTimeout(function () {
                    return _this4.setMode('small');
                }, 250);
            }
            _this4.setState({ searchScope: value });
            _this4.submit();
        };

        var style = this.props.style;
        var zDepth = 2;
        if (display === 'closed') {
            zDepth = 0;
            style = _extends({}, style, { backgroundColor: 'transparent' });
        } else {
            style = _extends({}, style, { backgroundColor: '#f5f5f5' });
        }

        return _react2['default'].createElement(
            _materialUi.Paper,
            { ref: 'root', zDepth: zDepth, className: "top_search_form " + display, style: style },
            _react2['default'].createElement(_MainSearch2['default'], {
                mode: display,
                value: values.basename,
                title: display === 'advanced' ? 'Advanced Search' : null,
                onOpen: function () {
                    return _this4.setMode("small");
                },
                showAdvanced: !this.props.crossWorkspace,
                onAdvanced: function () {
                    return _this4.setMode("advanced");
                },
                onClose: function () {
                    return _this4.setMode("closed");
                },
                onMore: function () {
                    return _this4.setMode("more");
                },
                onChange: function (values) {
                    return _this4.update(values);
                },
                onSubmit: function () {
                    return _this4.submit();
                },
                hintText: getMessage(this.props.crossWorkspace || searchScope === 'all' ? 607 : 87) + "...",
                loading: loading,
                scopeSelectorProps: this.props.crossWorkspace || this.props.uniqueSearchScope ? null : {
                    value: searchScope,
                    onChange: searchScopeChanged
                }
            }),
            display === 'advanced' && _react2['default'].createElement(_AdvancedSearch2['default'], _extends({}, this.props, {
                values: values,
                onChange: function (values) {
                    return _this4.update(values);
                },
                onSubmit: function () {
                    return _this4.submit();
                }
            })),
            _react2['default'].createElement(
                'div',
                { className: 'search-results', style: display === 'small' ? { backgroundColor: 'white' } : null },
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
                    heightAutoWithMax: display === 'small' ? 500 : display === 'advanced' ? 512 : 412,
                    openCollection: nodeClicked,
                    nodeClicked: nodeClicked,
                    defaultGroupBy: crossWorkspace || searchScope === 'all' ? 'repository_id' : null,
                    groupByLabel: crossWorkspace || searchScope === 'all' ? 'repository_display' : null,
                    emptyStateProps: {
                        iconClassName: "",
                        primaryTextId: 478,
                        style: {
                            minHeight: display === 'small' ? 180 : display === 'advanced' ? 512 : 412,
                            backgroundColor: 'transparent',
                            padding: '0 20px'
                        },
                        secondaryTextId: searchScope === 'ws' ? 620 : searchScope === 'folder' ? 619 : null,
                        actionLabelId: searchScope === 'ws' ? 610 : searchScope === 'folder' ? 609 : null,
                        actionCallback: searchScope !== 'all' ? function () {
                            searchScopeChanged(searchScope === 'ws' ? 'all' : 'ws');
                        } : null,
                        actionStyle: { marginTop: 10 }
                    }
                }),
                display === 'small' && _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', padding: 5, paddingLeft: 0, backgroundColor: '#f5f5f5' } },
                    !this.props.crossWorkspace && !this.props.uniqueSearchScope && _react2['default'].createElement(_SearchScopeSelector2['default'], { style: { flex: 1, maxWidth: 162 }, labelStyle: { paddingLeft: 8 }, value: searchScope, onChange: searchScopeChanged, onTouchTap: function () {
                            return _this4.setMode('small');
                        } }),
                    _react2['default'].createElement(_materialUi.FlatButton, { style: { marginTop: 4 }, primary: true, label: getMessage(456), onFocus: function () {
                            return _this4.setMode("small");
                        }, onTouchTap: function () {
                            return _this4.setMode("more");
                        }, onClick: function () {
                            return _this4.setMode("more");
                        } })
                )
            )
        );
    };

    return SearchForm;
})(_react.Component);

SearchForm = PydioContextConsumer(SearchForm);
exports['default'] = SearchForm;
module.exports = exports['default'];
