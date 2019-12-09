'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _materialUi = require('material-ui');

var _jointjs = require('jointjs');

var _dagre = require('dagre');

var _dagre2 = _interopRequireDefault(_dagre);

var _graphlib = require('graphlib');

var _graphlib2 = _interopRequireDefault(_graphlib);

var _Query = require("./Query");

var _Query2 = _interopRequireDefault(_Query);

var _graphLink = require("../graph/Link");

var _graphLink2 = _interopRequireDefault(_graphLink);

var _Input = require("./Input");

var _Input2 = _interopRequireDefault(_Input);

var _Output = require("./Output");

var _Output2 = _interopRequireDefault(_Output);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var margin = 20;

var QueryBuilder = (function (_React$Component) {
    _inherits(QueryBuilder, _React$Component);

    function QueryBuilder(props) {
        _classCallCheck(this, QueryBuilder);

        _get(Object.getPrototypeOf(QueryBuilder.prototype), 'constructor', this).call(this, props);
        this.graph = new _jointjs.dia.Graph();
        this.state = this.buildGraph();
    }

    _createClass(QueryBuilder, [{
        key: 'detectTypes',
        value: function detectTypes() {
            var _props = this.props;
            var query = _props.query;
            var queryType = _props.queryType;

            var inputIcon = undefined,
                outputIcon = undefined;
            var objectType = 'node';
            if (query instanceof _pydioHttpRestApi.JobsNodesSelector) {
                objectType = 'node';
            } else if (query instanceof _pydioHttpRestApi.JobsIdmSelector) {
                objectType = 'user';
                switch (query.Type) {
                    case "User":
                        objectType = 'user';
                        break;
                    case "Workspace":
                        objectType = 'workspace';
                        break;
                    case "Role":
                        objectType = 'role';
                        break;
                    case "Acl":
                        objectType = 'acl';
                        break;
                    default:
                        break;
                }
            } else if (query instanceof _pydioHttpRestApi.JobsUsersSelector) {
                objectType = 'user';
            }

            if (queryType === 'selector') {
                inputIcon = 'database';
                switch (objectType) {
                    case "node":
                        outputIcon = 'file-multiple';
                        break;
                    case "user":
                        outputIcon = 'account-multiple';
                        break;
                    case "role":
                        outputIcon = 'account-card-details';
                        break;
                    case "workspace":
                        outputIcon = 'folder-open';
                        break;
                    case "acl":
                        outputIcon = 'format-list-checks';
                        break;
                    default:
                        break;
                }
            } else {
                switch (objectType) {
                    case "node":
                        inputIcon = 'file';
                        outputIcon = 'file';
                        break;
                    case "user":
                        inputIcon = 'account';
                        outputIcon = 'account';
                        break;
                    case "role":
                        inputIcon = 'account-card-details';
                        outputIcon = 'account-card-details';
                        break;
                    case "workspace":
                        inputIcon = 'folder-open';
                        outputIcon = 'folder-open';
                        break;
                    case "acl":
                        inputIcon = 'format-list-checks';
                        outputIcon = 'format-list-checks';
                        break;
                    default:
                        break;
                }
            }
            return { inputIcon: inputIcon, outputIcon: outputIcon, objectType: objectType };
        }
    }, {
        key: 'buildGraph',
        value: function buildGraph() {
            var _this = this;

            var query = this.props.query;

            var _detectTypes = this.detectTypes();

            var inputIcon = _detectTypes.inputIcon;
            var outputIcon = _detectTypes.outputIcon;

            var input = new _Input2['default'](inputIcon);
            var output = new _Output2['default'](outputIcon);
            input.addTo(this.graph);
            output.addTo(this.graph);
            if (query.All) {
                var all = new _Query2['default']('Select All');
                all.addTo(this.graph);
                var link = new _graphLink2['default'](input.id, 'search', all.id, 'input');
                link.addTo(this.graph);
                var link2 = new _graphLink2['default'](all.id, 'output', output.id, 'input');
                link2.addTo(this.graph);
            } else if (query.Query && query.Query.SubQueries) {
                query.Query.SubQueries.forEach(function (q) {
                    Object.keys(q.value).forEach(function (key) {
                        var field = new _Query2['default'](key, q.value[key]);
                        field.addTo(_this.graph);
                        var link = new _graphLink2['default'](input.id, 'search', field.id, 'input');
                        link.addTo(_this.graph);
                        var link2 = new _graphLink2['default'](field.id, 'output', output.id, 'input');
                        link2.addTo(_this.graph);
                    });
                });
            }
            return _jointjs.layout.DirectedGraph.layout(this.graph, {
                nodeSep: 20,
                edgeSep: 20,
                rankSep: 40,
                rankDir: "LR",
                marginX: margin,
                marginY: margin,
                dagre: _dagre2['default'],
                graphlib: _graphlib2['default']
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _state = this.state;
            var width = _state.width;
            var height = _state.height;

            this.paper = new _jointjs.dia.Paper({
                el: _reactDom2['default'].findDOMNode(this.refs.graph),
                width: 300,
                height: height + margin * 2,
                model: this.graph,
                interactive: {
                    addLinkFromMagnet: false,
                    useLinkTools: false,
                    elementMove: true
                }
            });
        }
    }, {
        key: 'remove',
        value: function remove() {
            var _props2 = this.props;
            var onRemoveFilter = _props2.onRemoveFilter;
            var query = _props2.query;

            var modelType = undefined;
            if (query instanceof _pydioHttpRestApi.JobsNodesSelector) {
                modelType = 'node';
            } else if (query instanceof _pydioHttpRestApi.JobsIdmSelector) {
                modelType = 'idm';
            } else if (query instanceof _pydioHttpRestApi.JobsUsersSelector) {
                modelType = 'user';
            }
            onRemoveFilter(modelType);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props3 = this.props;
            var queryType = _props3.queryType;
            var style = _props3.style;

            var _detectTypes2 = this.detectTypes();

            var objectType = _detectTypes2.objectType;

            var title = (queryType === 'filter' ? 'Filter' : 'Select') + ' ' + objectType + (queryType === 'filter' ? '' : 's');

            return _react2['default'].createElement(
                'div',
                { style: style },
                _react2['default'].createElement(
                    'div',
                    null,
                    title
                ),
                _react2['default'].createElement('div', { ref: "graph", id: "graph" }),
                _react2['default'].createElement(_materialUi.FlatButton, { label: "Remove", onTouchTap: this.remove.bind(this) })
            );
        }
    }]);

    return QueryBuilder;
})(_react2['default'].Component);

exports['default'] = QueryBuilder;
module.exports = exports['default'];
