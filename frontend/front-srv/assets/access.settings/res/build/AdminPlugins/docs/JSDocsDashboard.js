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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _materialUi = require('material-ui');

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var JSDocsPanel = (function (_Component) {
    _inherits(JSDocsPanel, _Component);

    function JSDocsPanel(props, context) {
        _classCallCheck(this, JSDocsPanel);

        _get(Object.getPrototypeOf(JSDocsPanel.prototype), 'constructor', this).call(this, props, context);
        this.state = { data: {}, selection: null, search: '' };
    }

    _createClass(JSDocsPanel, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            PydioApi.getClient().loadFile('plug/gui.ajax/docgen.json', function (transp) {
                if (!transp.responseJSON || !transp.responseJSON['gui.ajax']) {
                    _this.setState({ error: 'Docs are not loaded, you probably have to run \'grunt docgen\' command inside the gui.ajax plugin.' });
                    return;
                }
                var data = transp.responseJSON['gui.ajax'];
                Object.keys(transp.responseJSON).forEach(function (pluginId) {
                    if (pluginId === 'gui.ajax') return;
                    var comps = transp.responseJSON[pluginId];
                    Object.keys(comps).forEach(function (compName) {
                        data[pluginId + '/' + compName] = comps[compName];
                    });
                });
                _this.setState({ data: data });
            });
        }
    }, {
        key: 'onSearch',
        value: function onSearch(event, value) {
            this.setState({ search: value });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state;
            var data = _state.data;
            var selection = _state.selection;
            var search = _state.search;
            var error = _state.error;

            var items = [];
            var classPathes = {};
            Object.keys(data).forEach(function (key) {

                var parts = key.split('/');
                var classPath = parts.shift();
                var title = parts.pop().replace('.js', '').replace('.es6', '');
                if (search && title.indexOf(search) === -1) {
                    return;
                } else if (search && title.indexOf(search) > -1) {
                    var _parts = [];
                    var startIndex = title.indexOf(search);
                    var endIndex = startIndex + search.length;
                    if (startIndex > 0) _parts.push(title.substr(0, startIndex));
                    _parts.push(React.createElement(
                        'span',
                        { style: { color: '#E64A19' } },
                        title.substr(startIndex, search.length)
                    ));
                    if (endIndex < title.length - 1) _parts.push(title.substr(endIndex));
                    title = React.createElement(
                        'span',
                        null,
                        _parts
                    );
                }
                var secondary = parts.join('/');
                if (!classPathes[classPath]) {
                    classPathes[classPath] = classPath;
                    items.push(React.createElement(_materialUi.Divider, { key: key + '-div' }));
                    items.push(React.createElement(
                        _materialUi.Subheader,
                        { key: key + '-sub' },
                        classPath
                    ));
                }
                items.push(React.createElement(_materialUi.ListItem, {
                    key: key,
                    primaryText: title,
                    onTouchTap: function () {
                        _this2.setState({ selection: key });
                    }
                }));
            });
            var adminStyles = AdminComponents.AdminStyles();
            return React.createElement(
                'div',
                { className: "main-layout-nav-to-stack vertical-layout" },
                React.createElement(AdminComponents.Header, {
                    title: "Javascript SDK Documentation",
                    icon: 'mdi mdi-nodejs'
                }),
                React.createElement(
                    'div',
                    { className: "layout-fill", style: { display: 'flex', backgroundColor: 'white' } },
                    React.createElement(
                        _materialUi.Paper,
                        { zDepth: 1, style: { width: 256, overflowY: 'scroll', display: 'flex', flexDirection: 'column', zIndex: 1 } },
                        React.createElement(
                            'div',
                            { style: { padding: 16, paddingBottom: 0, paddingTop: 8 } },
                            React.createElement(_materialUi.TextField, { fullWidth: true, value: search, onChange: this.onSearch.bind(this), hintText: 'Search classes...', underlineShow: false })
                        ),
                        error && React.createElement(
                            'div',
                            { style: { padding: 16 } },
                            error
                        ),
                        React.createElement(
                            _materialUi.List,
                            { style: { flex: 1 } },
                            items
                        )
                    ),
                    React.createElement(
                        'div',
                        { style: { flex: 1, overflowY: 'scroll', backgroundColor: adminStyles.body.mainPanel.backgroundColor } },
                        selection && React.createElement(ClassPanel, { path: selection, data: data[selection][0] })
                    )
                )
            );
        }
    }]);

    return JSDocsPanel;
})(_react.Component);

var ClassPanel = (function (_Component2) {
    _inherits(ClassPanel, _Component2);

    function ClassPanel() {
        _classCallCheck(this, ClassPanel);

        _get(Object.getPrototypeOf(ClassPanel.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ClassPanel, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var path = _props.path;
            var data = _props.data;

            var title = _pydioUtilPath2['default'].getBasename(path);
            var classPath = _pydioUtilPath2['default'].getDirname(path);
            var largeColumn = { width: '35%' };

            var props = [],
                methods = [];
            if (data.props && path.indexOf('core/') !== 0) {
                Object.keys(data.props).forEach(function (pName) {
                    var pData = data.props[pName];
                    props.push(React.createElement(
                        _materialUi.TableRow,
                        { key: pName },
                        React.createElement(
                            _materialUi.TableRowColumn,
                            { style: { fontSize: 16 } },
                            pName
                        ),
                        React.createElement(
                            _materialUi.TableRowColumn,
                            { style: largeColumn },
                            pData.description
                        ),
                        React.createElement(
                            _materialUi.TableRowColumn,
                            null,
                            pData.type && pData.type.raw && pData.type.raw.replace('React.PropTypes.', '').replace('.isRequired', '')
                        ),
                        React.createElement(
                            _materialUi.TableRowColumn,
                            null,
                            pData.required || pData.type && pData.type.raw && pData.type.raw.indexOf('.isRequired') > -1 ? 'true' : ''
                        )
                    ));
                });
            }

            if (data.methods) {
                methods = data.methods.map(function (mData) {
                    var params = mData.params.map(function (p) {
                        return React.createElement(
                            'div',
                            null,
                            p.name + (p.type ? ' (' + p.type.name + ') ' : '') + (p.description ? ': ' + p.description : '')
                        );
                    });
                    return React.createElement(
                        _materialUi.TableRow,
                        { key: mData.name },
                        React.createElement(
                            _materialUi.TableRowColumn,
                            { style: { fontSize: 16 } },
                            mData.name
                        ),
                        React.createElement(
                            _materialUi.TableRowColumn,
                            { style: largeColumn },
                            mData.description
                        ),
                        React.createElement(
                            _materialUi.TableRowColumn,
                            null,
                            params
                        ),
                        React.createElement(
                            _materialUi.TableRowColumn,
                            null,
                            mData.returns && mData.returns.type ? mData.returns.type.name : ''
                        )
                    );
                });
            }
            var dStyle = { padding: '0 16px 16px' };
            var adminStyles = AdminComponents.AdminStyles();

            return React.createElement(
                'div',
                { style: { paddingBottom: 16 } },
                React.createElement(_materialUi.CardTitle, { title: title, subtitle: classPath }),
                React.createElement(
                    'div',
                    { style: dStyle },
                    data.description
                ),
                data.require && React.createElement(
                    'div',
                    { style: dStyle },
                    React.createElement(
                        'em',
                        null,
                        'Usage: '
                    ),
                    ' ',
                    React.createElement(
                        'code',
                        null,
                        data.require
                    )
                ),
                React.createElement(_materialUi.CardTitle, { title: 'Props' }),
                props.length > 0 && React.createElement(
                    _materialUi.Paper,
                    adminStyles.body.block.props,
                    React.createElement(
                        _materialUi.Table,
                        null,
                        React.createElement(
                            _materialUi.TableHeader,
                            { displaySelectAll: false, adjustForCheckbox: false },
                            React.createElement(
                                _materialUi.TableRow,
                                null,
                                React.createElement(
                                    _materialUi.TableHeaderColumn,
                                    null,
                                    'Name'
                                ),
                                React.createElement(
                                    _materialUi.TableHeaderColumn,
                                    { style: largeColumn },
                                    'Description'
                                ),
                                React.createElement(
                                    _materialUi.TableHeaderColumn,
                                    null,
                                    'Type'
                                ),
                                React.createElement(
                                    _materialUi.TableHeaderColumn,
                                    null,
                                    'Required'
                                )
                            )
                        ),
                        React.createElement(
                            _materialUi.TableBody,
                            { displayRowCheckbox: false },
                            props
                        )
                    )
                ),
                !props.length && React.createElement(
                    'div',
                    { style: _extends({}, dStyle, { color: 'rgba(0,0,0,0.33)' }) },
                    'No Props documented'
                ),
                React.createElement(_materialUi.CardTitle, { title: 'Methods' }),
                methods.length > 0 && React.createElement(
                    _materialUi.Paper,
                    adminStyles.body.block.props,
                    React.createElement(
                        _materialUi.Table,
                        null,
                        React.createElement(
                            _materialUi.TableHeader,
                            { displaySelectAll: false, adjustForCheckbox: false },
                            React.createElement(
                                _materialUi.TableRow,
                                null,
                                React.createElement(
                                    _materialUi.TableHeaderColumn,
                                    null,
                                    'Name'
                                ),
                                React.createElement(
                                    _materialUi.TableHeaderColumn,
                                    { style: largeColumn },
                                    'Description'
                                ),
                                React.createElement(
                                    _materialUi.TableHeaderColumn,
                                    null,
                                    'Parameters'
                                ),
                                React.createElement(
                                    _materialUi.TableHeaderColumn,
                                    null,
                                    'Return'
                                )
                            )
                        ),
                        React.createElement(
                            _materialUi.TableBody,
                            { displayRowCheckbox: false },
                            methods
                        )
                    )
                ),
                !methods.length && React.createElement(
                    'div',
                    { style: _extends({}, dStyle, { color: 'rgba(0,0,0,0.33)' }) },
                    'No Methods documented'
                )
            );
        }
    }]);

    return ClassPanel;
})(_react.Component);

exports['default'] = JSDocsPanel;
module.exports = exports['default'];
