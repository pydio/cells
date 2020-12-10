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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var Facet = (function (_React$Component) {
    _inherits(Facet, _React$Component);

    function Facet() {
        _classCallCheck(this, Facet);

        _get(Object.getPrototypeOf(Facet.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Facet, [{
        key: 'select',
        value: function select() {
            var _props = this.props;
            var onSelect = _props.onSelect;
            var facet = _props.facet;

            onSelect(facet, true);
        }
    }, {
        key: 'clear',
        value: function clear() {
            var _props2 = this.props;
            var onSelect = _props2.onSelect;
            var facet = _props2.facet;

            onSelect(facet, false);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props3 = this.props;
            var facet = _props3.facet;
            var selected = _props3.selected;
            var m = _props3.m;

            var requestSelect = undefined,
                requestDelete = undefined;
            var mFacet = function mFacet(id) {
                var key = 'facet.label.' + id;
                return m(key) === key ? id : m(key);
            };
            if (selected) {
                requestDelete = function () {
                    return _this.clear();
                };
            } else {
                requestSelect = function () {
                    return _this.select();
                };
            }
            var cc = {
                chip: {
                    backgroundColor: selected ? '#03a9f4' : null,
                    labelColor: selected ? 'white' : null
                },
                avatar: {
                    backgroundColor: selected ? '#0288D1' : null,
                    color: selected ? 'white' : null
                }
            };
            return _react2['default'].createElement(
                _materialUi.Chip,
                _extends({
                    style: { margin: 4 },
                    onRequestDelete: requestDelete,
                    onTouchTap: requestSelect
                }, cc.chip),
                _react2['default'].createElement(
                    _materialUi.Avatar,
                    cc.avatar,
                    facet.Count
                ),
                ' ',
                mFacet(facet.Label)
            );
        }
    }]);

    return Facet;
})(_react2['default'].Component);

var Facets = (function (_React$Component2) {
    _inherits(Facets, _React$Component2);

    function Facets() {
        _classCallCheck(this, Facets);

        _get(Object.getPrototypeOf(Facets.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Facets, [{
        key: 'isSelected',
        value: function isSelected(selected, facet) {
            return selected.filter(function (s) {
                return s.FieldName === facet.FieldName && s.Label === facet.Label;
            }).length > 0;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props4 = this.props;
            var pydio = _props4.pydio;
            var facets = _props4.facets;
            var onSelectFacet = _props4.onSelectFacet;
            var _props4$selected = _props4.selected;
            var selected = _props4$selected === undefined ? [] : _props4$selected;

            var m = function m(id) {
                return pydio.MessageHash['user_home.' + id] || id;
            };
            var groups = {};
            var groupKeys = {
                'NodeType': 'type',
                'Extension': 'extension',
                'Size': 'size',
                'ModifTime': 'modified',
                'Basename': 'found',
                'Meta': 'metadata'
            };
            var hasContentSelected = selected.filter(function (f) {
                return f.FieldName === 'TextContent';
            }).length > 0;
            facets.forEach(function (f) {
                var fName = f.FieldName;
                if (fName.indexOf('Meta.') === 0) {
                    fName = 'Meta';
                }
                if (fName === 'Basename' && hasContentSelected) {
                    return; // Exclude Basename when TextContent is selected
                }
                if (fName === 'TextContent') {
                    // Group basename / TextContent
                    fName = 'Basename';
                }
                if (!groups[fName]) {
                    groups[fName] = [];
                }
                groups[fName].push(f);
            });
            if (!Object.keys(groupKeys).filter(function (k) {
                return groups[k];
            }).filter(function (k) {
                var hasSelected = groups[k].filter(function (f) {
                    return _this2.isSelected(selected, f);
                }).length > 0;
                return hasSelected || groups[k].length > 1;
            }).length) {
                return null;
            }
            var styles = {
                container: {
                    position: 'absolute',
                    top: 90,
                    right: 'calc(50% + 350px)',
                    maxHeight: 'calc(100% - 100px)',
                    overflowY: 'auto',
                    width: 200,
                    borderRadius: 6,
                    paddingBottom: 10
                },
                header: {
                    fontWeight: 500,
                    color: '#5c7784',
                    padding: 10,
                    fontSize: 15
                },
                subHeader: {
                    fontWeight: 500,
                    padding: '5px 10px',
                    color: 'rgba(92, 119, 132, 0.7)'
                }
            };

            return _react2['default'].createElement(
                _materialUi.Paper,
                { style: styles.container },
                _react2['default'].createElement(
                    'div',
                    { style: styles.header },
                    m('search.facets.title')
                ),
                Object.keys(groupKeys).filter(function (k) {
                    return groups[k];
                }).filter(function (k) {
                    var hasSelected = groups[k].filter(function (f) {
                        return _this2.isSelected(selected, f);
                    }).length > 0;
                    return hasSelected || groups[k].length > 1;
                }).map(function (k) {
                    return _react2['default'].createElement(
                        'div',
                        { style: { marginBottom: 10 } },
                        _react2['default'].createElement(
                            'div',
                            { style: styles.subHeader },
                            m('search.facet.' + groupKeys[k])
                        ),
                        _react2['default'].createElement(
                            'div',
                            { style: { zoom: .8, marginLeft: 10 } },
                            groups[k].sort(function (a, b) {
                                return a.Label.localeCompare(b.Label);
                            }).map(function (f) {
                                return _react2['default'].createElement(Facet, { m: m, facet: f, selected: _this2.isSelected(selected, f), onSelect: onSelectFacet });
                            })
                        )
                    );
                })
            );
        }
    }]);

    return Facets;
})(_react2['default'].Component);

exports['default'] = Facets;
module.exports = exports['default'];
