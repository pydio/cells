/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioHttpSearchApi = require('pydio/http/search-api');

var _pydioHttpSearchApi2 = _interopRequireDefault(_pydioHttpSearchApi);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _pydioModelEmptyNodeProvider = require('pydio/model/empty-node-provider');

var _pydioModelEmptyNodeProvider2 = _interopRequireDefault(_pydioModelEmptyNodeProvider);

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _Facets = require("./Facets");

var _Facets2 = _interopRequireDefault(_Facets);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var SimpleList = _Pydio$requireLib.SimpleList;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib2.PydioContextConsumer;
var moment = _Pydio$requireLib2.moment;

var _Pydio$requireLib3 = _pydio2['default'].requireLib('workspaces');

var FilePreview = _Pydio$requireLib3.FilePreview;

var HomeSearchForm = (function (_Component) {
    _inherits(HomeSearchForm, _Component);

    function HomeSearchForm(props) {
        var _this = this;

        _classCallCheck(this, HomeSearchForm);

        _get(Object.getPrototypeOf(HomeSearchForm.prototype), 'constructor', this).call(this, props);

        // Create Fake DM
        this.basicDataModel = new _pydioModelDataModel2['default'](true);
        var rNodeProvider = new _pydioModelEmptyNodeProvider2['default']();
        this.basicDataModel.setAjxpNodeProvider(rNodeProvider);
        var rootNode = new AjxpNode("/", false, '', '', rNodeProvider);
        this.basicDataModel.setRootNode(rootNode);

        this.state = {
            queryString: '',
            dataModel: this.basicDataModel,
            empty: true,
            loading: false,
            facets: [],
            facetFilter: {},
            history: []
        };
        this.loadHistory().then(function (hh) {
            return _this.setState({ history: hh });
        });
        this.submitD = (0, _lodashDebounce2['default'])(this.submit, 500);
    }

    _createClass(HomeSearchForm, [{
        key: 'update',
        value: function update(queryString) {
            var _this2 = this;

            this.setState({ queryString: queryString }, function () {
                _this2.submitD(true);
            });
        }
    }, {
        key: 'filterByFacet',
        value: function filterByFacet(facet, toggle) {
            var _this3 = this;

            var _state$selectedFacets = this.state.selectedFacets;
            var selectedFacets = _state$selectedFacets === undefined ? [] : _state$selectedFacets;

            var newFacets = [];
            if (toggle) {
                newFacets = [].concat(_toConsumableArray(selectedFacets), [facet]);
            } else {
                newFacets = selectedFacets.filter(function (s) {
                    return !(s.FieldName === facet.FieldName && s.Label === facet.Label);
                });
            }
            this.setState({ selectedFacets: newFacets }, function () {
                _this3.submit();
            });
        }
    }, {
        key: 'computeFacets',
        value: function computeFacets(queryString) {
            var data = {};
            var _state$selectedFacets2 = this.state.selectedFacets;
            var selectedFacets = _state$selectedFacets2 === undefined ? [] : _state$selectedFacets2;

            selectedFacets.forEach(function (facet) {
                switch (facet.FieldName) {
                    case "Size":
                        data['ajxp_bytesize'] = { from: facet.Min, to: facet.Max };
                        break;
                    case "ModifTime":
                        data['ajxp_modiftime'] = { from: facet.Start * 1000, to: facet.End * 1000 };
                        break;
                    case "Extension":
                        data['ajxp_mime'] = facet.Label;
                        break;
                    case "NodeType":
                        data['ajxp_mime'] = 'ajxp_' + facet.Label;
                        break;
                    case "TextContent":
                        data['basenameOrContent'] = '';
                        data['Content'] = queryString;
                        break;
                    case "Basename":
                        data['basenameOrContent'] = '';
                        data['basename'] = queryString;
                        break;
                    default:
                        if (facet.FieldName.indexOf('Meta.') === 0) {
                            data['ajxp_meta_' + facet.FieldName.replace('Meta.', '')] = facet.Label;
                        }
                        break;
                }
            });
            return data;
        }
    }, {
        key: 'submit',
        value: function submit() {
            var _this4 = this;

            var refreshFacets = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
            var queryString = this.state.queryString;

            if (refreshFacets) {
                this.setState({ selectedFacets: [] });
            }
            if (!queryString) {
                this.toggleEmpty(true);
                this.setState({ loading: false, facets: [], selectedFacets: [] });
                return;
            }
            var dataModel = this.state.dataModel;

            var rootNode = dataModel.getRootNode();
            rootNode.setChildren([]);
            rootNode.setLoaded(true);
            this.toggleEmpty(false);
            this.setState({ loading: true });

            var api = new _pydioHttpSearchApi2['default'](this.props.pydio);
            var facetFilter = this.computeFacets(queryString);
            api.search(_extends({ basenameOrContent: queryString }, facetFilter), 'all', this.props.limit || 10).then(function (response) {
                rootNode.setChildren(response.Results);
                rootNode.setLoaded(true);
                _this4.pushHistory(queryString);
                _this4.setState({
                    loading: false,
                    facets: response.Facets || []
                });
            })['catch'](function (e) {
                _this4.setState({ loading: false });
            });
        }
    }, {
        key: 'getUserHistoryKey',
        value: function getUserHistoryKey() {
            return _pydio2['default'].getInstance().user.getIdmUser().then(function (u) {
                return "cells.search-engine.history." + u.Uuid;
            });
        }
    }, {
        key: 'loadHistory',
        value: function loadHistory() {
            return this.getUserHistoryKey().then(function (key) {
                var i = localStorage.getItem(key);
                if (!i) {
                    return [];
                }
                try {
                    var data = JSON.parse(i);
                    if (data.map) {
                        return data;
                    }
                    return [];
                } catch (e) {
                    return [];
                }
            });
        }
    }, {
        key: 'pushHistory',
        value: function pushHistory(term) {
            var _this5 = this;

            if (!term) {
                return;
            }
            var _state$history = this.state.history;
            var history = _state$history === undefined ? [] : _state$history;

            var newHistory = history.filter(function (f) {
                return f !== term;
            }).slice(0, 19); // store only 20 terms
            newHistory.unshift(term);
            this.getUserHistoryKey().then(function (key) {
                _this5.setState({ history: newHistory }, function () {
                    localStorage.setItem(key, JSON.stringify(newHistory));
                });
            });
        }
    }, {
        key: 'toggleEmpty',
        value: function toggleEmpty(e) {
            this.setState({ empty: e });
            if (e) {
                this.input.blur();
            }
            var onSearchStateChange = this.props.onSearchStateChange;

            if (onSearchStateChange) {
                onSearchStateChange(e);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            var _state = this.state;
            var loading = _state.loading;
            var dataModel = _state.dataModel;
            var empty = _state.empty;
            var queryString = _state.queryString;
            var searchFocus = _state.searchFocus;
            var facets = _state.facets;
            var _state$selectedFacets3 = _state.selectedFacets;
            var selectedFacets = _state$selectedFacets3 === undefined ? [] : _state$selectedFacets3;
            var history = _state.history;
            var _props = this.props;
            var style = _props.style;
            var zDepth = _props.zDepth;
            var pydio = _props.pydio;
            var fullScreen = _props.fullScreen;

            var hintText = pydio.MessageHash[607];
            var whiteTransp = 'rgba(0,0,0,.53)';

            var styles = {
                textFieldContainer: {
                    display: 'flex',
                    backgroundColor: '#eceff1',
                    height: 50,
                    width: '96%',
                    maxWidth: 700,
                    padding: '2px 4px 4px 4px',
                    borderRadius: 50,
                    position: 'absolute',
                    top: fullScreen ? 25 : -25
                },
                textField: { flex: 1 },
                textInput: { color: 'inherit' },
                textHint: { color: whiteTransp, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' },
                magnifier: { color: whiteTransp, fontSize: 20, padding: '14px 8px' },
                close: { position: 'absolute', right: 0 }
            };

            var renderIcon = function renderIcon(node) {
                var entryProps = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                return React.createElement(FilePreview, { loadThumbnail: !entryProps['parentIsScrolling'], node: node });
            };
            var renderSecondLine = function renderSecondLine(node) {
                var path = node.getPath();
                var metaData = node.getMetadata();
                var date = new Date();
                date.setTime(parseInt(metaData.get('ajxp_modiftime')) * 1000);
                var mDate = moment(date).fromNow();
                var bSize = _pydioUtilPath2['default'].roundFileSize(parseInt(node.getMetadata().get('bytesize')));
                var dir = _pydioUtilPath2['default'].getDirname(path);
                var location = undefined;
                if (dir) {
                    location = pydio.MessageHash['user_home.search.result.location'] + ': ' + _pydioUtilPath2['default'].getDirname(path) || '/';
                }
                return React.createElement(
                    'div',
                    null,
                    mDate,
                    ' • ',
                    bSize,
                    ' ',
                    location ? React.createElement(
                        'span',
                        null,
                        '•'
                    ) : null,
                    ' ',
                    location
                );
            };
            var renderGroupHeader = function renderGroupHeader(repoId, repoLabel) {
                return React.createElement(
                    'div',
                    { style: { fontSize: 13, color: '#93a8b2', fontWeight: 500, cursor: 'pointer' }, onClick: function () {
                            return pydio.triggerRepositoryChange(repoId);
                        } },
                    repoLabel
                );
            };

            return React.createElement(
                _materialUi.Paper,
                { style: style, zDepth: zDepth, className: 'vertical-layout home-center-paper', rounded: false },
                React.createElement(
                    _materialUi.Paper,
                    { zDepth: searchFocus || queryString ? 1 : 0, style: styles.textFieldContainer, ref: "container", className: 'home-search-form' },
                    React.createElement(_materialUi.FontIcon, { className: 'mdi mdi-magnify', style: styles.magnifier }),
                    React.createElement(_materialUi.AutoComplete, {
                        ref: function (r) {
                            _this6.input = r;
                        },
                        dataSource: history.map(function (k) {
                            return { text: k, value: k };
                        }),
                        filter: function (searchText, key) {
                            return (searchText === '' || key.indexOf(searchText) === 0) && searchText !== key;
                        },
                        openOnFocus: !queryString,
                        open: searchFocus,
                        menuProps: { desktop: true },
                        style: styles.textField,
                        inputStyle: styles.textInput,
                        hintStyle: styles.textHint,
                        fullWidth: true,
                        underlineShow: false,
                        hintText: hintText,
                        searchText: queryString,
                        menuStyle: { maxHeight: 300 },
                        onUpdateInput: function (v) {
                            return _this6.update(v);
                        },
                        onKeyPress: function (e) {
                            return e.key === 'Enter' ? _this6.update(e.target.value) : null;
                        },
                        onFocus: function () {
                            _this6.setState({ searchFocus: true });
                        },
                        onBlur: function () {
                            _this6.setState({ searchFocus: false });
                        }
                    }),
                    !loading && React.createElement('div', { style: { width: 36 } }),
                    loading && React.createElement(
                        'div',
                        { style: { marginTop: 14, marginRight: 8 } },
                        React.createElement(_materialUi.CircularProgress, { size: 20, thickness: 2 })
                    )
                ),
                fullScreen && React.createElement(_materialUi.IconButton, {
                    iconClassName: 'mdi mdi-close',
                    style: styles.close,
                    onClick: function () {
                        return _this6.update('');
                    },
                    tooltipPosition: "bottom-left",
                    tooltip: pydio.MessageHash['86']
                }),
                !empty && facets && React.createElement(_Facets2['default'], { facets: facets, selected: selectedFacets, pydio: pydio, onSelectFacet: this.filterByFacet.bind(this) }),
                !empty && React.createElement(PydioComponents.NodeListCustomProvider, {
                    ref: 'results',
                    containerStyle: { width: '86%', maxWidth: 650, marginTop: fullScreen ? 75 : 20 },
                    className: 'files-list vertical_fit',
                    elementHeight: SimpleList.HEIGHT_TWO_LINES,
                    entryRenderIcon: renderIcon,
                    entryRenderActions: function () {
                        return null;
                    },
                    entryRenderSecondLine: renderSecondLine,
                    entryRenderGroupHeader: renderGroupHeader,
                    presetDataModel: dataModel,
                    openCollection: function (node) {
                        pydio.goTo(node);
                    },
                    nodeClicked: function (node) {
                        pydio.goTo(node);
                    },
                    defaultGroupBy: 'repository_id',
                    groupByLabel: 'repository_display',
                    emptyStateProps: {
                        iconClassName: "",
                        primaryTextId: loading ? 'searchengine.searching' : 478,
                        style: { backgroundColor: 'transparent' }
                    }
                }),
                this.props.children && React.createElement(
                    'div',
                    { style: { display: empty ? 'block' : 'none', flex: 1, overflowY: 'auto', marginTop: 40 }, id: 'history-block' },
                    this.props.children
                )
            );
        }
    }]);

    return HomeSearchForm;
})(_react.Component);

exports['default'] = HomeSearchForm = PydioContextConsumer(HomeSearchForm);
exports['default'] = HomeSearchForm = (0, _materialUiStyles.muiThemeable)()(HomeSearchForm);
exports['default'] = HomeSearchForm;
module.exports = exports['default'];
