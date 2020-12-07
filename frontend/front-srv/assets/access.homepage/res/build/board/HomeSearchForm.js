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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _pydioModelEmptyNodeProvider = require('pydio/model/empty-node-provider');

var _pydioModelEmptyNodeProvider2 = _interopRequireDefault(_pydioModelEmptyNodeProvider);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var SimpleList = _Pydio$requireLib.SimpleList;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib2.PydioContextConsumer;

var _Pydio$requireLib3 = _pydio2['default'].requireLib('workspaces');

var FilePreview = _Pydio$requireLib3.FilePreview;

var HomeSearchForm = (function (_Component) {
    _inherits(HomeSearchForm, _Component);

    function HomeSearchForm(props) {
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
            loading: false
        };

        this.submit = _lodash2['default'].debounce(this.submit, 500);
    }

    _createClass(HomeSearchForm, [{
        key: 'update',
        value: function update(queryString) {
            var _this = this;

            this.setState({ queryString: queryString }, function () {
                _this.submit();
            });
        }
    }, {
        key: 'submit',
        value: function submit() {
            var _this2 = this;

            var forceValue = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
            var queryString = this.state.queryString;

            if (forceValue) queryString = forceValue;
            if (!queryString) {
                this.setState({ empty: true, loading: false });
                return;
            }
            var dataModel = this.state.dataModel;

            var rootNode = dataModel.getRootNode();
            rootNode.setChildren([]);
            rootNode.setLoaded(true);
            this.setState({ loading: true, empty: false });

            var api = new _pydioHttpSearchApi2['default'](this.props.pydio);
            api.search({ basenameOrContent: queryString }, 'all', this.props.limit || 10).then(function (response) {
                rootNode.setChildren(response.Results);
                rootNode.setLoaded(true);
                _this2.setState({
                    loading: false,
                    facets: response.Facets || []
                });
            })['catch'](function (e) {
                _this2.setState({ loading: false });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _state = this.state;
            var loading = _state.loading;
            var dataModel = _state.dataModel;
            var empty = _state.empty;
            var queryString = _state.queryString;
            var searchFocus = _state.searchFocus;
            var _props = this.props;
            var style = _props.style;
            var zDepth = _props.zDepth;
            var pydio = _props.pydio;
            var muiTheme = _props.muiTheme;

            var hintText = pydio.MessageHash[607];
            //const accent2Color = muiTheme.palette.primary1Color;
            var whiteTransp = 'rgba(0,0,0,.53)';
            var white = 'rgb(255,255,255)';

            var styles = {
                textFieldContainer: {
                    display: 'flex',
                    backgroundColor: '#eceff1',
                    height: 50,
                    width: '96%',
                    maxWidth: 600,
                    padding: '2px 4px 4px 4px',
                    borderRadius: 50,
                    position: 'absolute',
                    top: -25
                },
                textField: { flex: 1 },
                textInput: { color: 'inherit' },
                textHint: { color: whiteTransp, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' },
                magnifier: { color: whiteTransp, fontSize: 20, padding: '14px 8px' },
                close: { color: whiteTransp, fontSize: 20, padding: '14px 8px', cursor: 'pointer' }
            };

            var renderIcon = function renderIcon(node) {
                var entryProps = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                return React.createElement(FilePreview, { loadThumbnail: !entryProps['parentIsScrolling'], node: node });
            };
            var renderSecondLine = function renderSecondLine(node) {
                var path = node.getPath();
                return React.createElement(
                    'div',
                    null,
                    path
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
                    { zDepth: searchFocus || queryString ? 1 : 0, style: styles.textFieldContainer, className: 'home-search-form' },
                    React.createElement(_materialUi.FontIcon, { className: 'mdi mdi-magnify', style: styles.magnifier }),
                    React.createElement(_materialUi.TextField, {
                        ref: function (input) {
                            return _this3.input = input;
                        },
                        style: styles.textField,
                        inputStyle: styles.textInput,
                        hintStyle: styles.textHint,
                        fullWidth: true,
                        underlineShow: false,
                        hintText: hintText,
                        value: queryString,
                        onChange: function (e, v) {
                            return _this3.update(v);
                        },
                        onKeyPress: function (e) {
                            return e.key === 'Enter' ? _this3.update(e.target.value) : null;
                        },
                        onFocus: function () {
                            _this3.setState({ searchFocus: true });
                        },
                        onBlur: function () {
                            _this3.setState({ searchFocus: false });
                        }
                    }),
                    loading && React.createElement(
                        'div',
                        { style: { marginTop: 14, marginRight: 8 } },
                        React.createElement(_materialUi.CircularProgress, { size: 20, thickness: 2 })
                    ),
                    queryString && !loading && React.createElement(_materialUi.FontIcon, { className: 'mdi mdi-close', style: styles.close, onTouchTap: function () {
                            return _this3.update('');
                        } })
                ),
                !empty && React.createElement(PydioComponents.NodeListCustomProvider, {
                    ref: 'results',
                    containerStyle: { width: '86%', maxWidth: 550, marginTop: 20 },
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
                        primaryTextId: 478,
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
