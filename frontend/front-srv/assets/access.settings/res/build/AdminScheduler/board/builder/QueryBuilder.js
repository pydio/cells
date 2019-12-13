'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _QueryConnector = require("./QueryConnector");

var _QueryConnector2 = _interopRequireDefault(_QueryConnector);

var _QueryCluster = require("./QueryCluster");

var _QueryCluster2 = _interopRequireDefault(_QueryCluster);

var _QueryInput = require("./QueryInput");

var _QueryInput2 = _interopRequireDefault(_QueryInput);

var _QueryOutput = require("./QueryOutput");

var _QueryOutput2 = _interopRequireDefault(_QueryOutput);

var _ProtoValue = require("./ProtoValue");

var _ProtoValue2 = _interopRequireDefault(_ProtoValue);

var _styles = require("./styles");

var margin = 20;

var QueryBuilder = (function (_React$Component) {
    _inherits(QueryBuilder, _React$Component);

    function QueryBuilder(props) {
        _classCallCheck(this, QueryBuilder);

        _get(Object.getPrototypeOf(QueryBuilder.prototype), 'constructor', this).call(this, props);
        this.graph = new _jointjs.dia.Graph();
        var _props = this.props;
        var cloner = _props.cloner;
        var query = _props.query;

        var qCopy = cloner(query);
        this.state = _extends({}, this.buildGraph(qCopy), {
            query: qCopy,
            cleanState: query
        });
    }

    _createClass(QueryBuilder, [{
        key: 'detectTypes',
        value: function detectTypes(query) {
            var queryType = this.props.queryType;

            var inputIcon = undefined,
                outputIcon = undefined,
                singleQuery = undefined;
            var objectType = 'node';
            if (query instanceof _pydioHttpRestApi.JobsNodesSelector) {
                objectType = 'node';
                singleQuery = 'tree.Query';
            } else if (query instanceof _pydioHttpRestApi.JobsIdmSelector) {
                objectType = 'user';
                switch (query.Type) {
                    case "User":
                        objectType = 'user';
                        singleQuery = 'idm.UserSingleQuery';
                        break;
                    case "Workspace":
                        objectType = 'workspace';
                        singleQuery = 'idm.WorkspaceSingleQuery';
                        break;
                    case "Role":
                        objectType = 'role';
                        singleQuery = 'idm.RoleSingleQuery';
                        break;
                    case "Acl":
                        objectType = 'acl';
                        singleQuery = 'idm.ACLSingleQuery';
                        break;
                    default:
                        break;
                }
            } else if (query instanceof _pydioHttpRestApi.JobsUsersSelector) {
                objectType = 'user';
                singleQuery = 'idm.UserSingleQuery';
            }

            if (queryType === 'selector') {
                inputIcon = 'database';
                var multiple = query.Collect || false;
                switch (objectType) {
                    case "node":
                        outputIcon = multiple ? 'file-multiple' : 'file';
                        break;
                    case "user":
                        outputIcon = multiple ? 'account-multiple' : 'account';
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
            return { inputIcon: inputIcon, outputIcon: outputIcon, objectType: objectType, singleQuery: singleQuery };
        }
    }, {
        key: 'redraw',
        value: function redraw() {
            var _this = this;

            var query = this.state.query;

            this.graph.getCells().forEach(function (c) {
                return c.remove();
            });
            var bbox = this.buildGraph(query);
            this.setState(bbox, function () {
                _this.paper.setDimensions(bbox.width + margin * 2, bbox.height + margin * 2);
            });
        }
    }, {
        key: 'protoHasChildren',
        value: function protoHasChildren(p) {
            var _this2 = this;

            if (!Object.keys(p).length) {
                return false;
            }
            if (p.SubQueries === undefined) {
                return true;
            }
            if (p.SubQueries !== undefined && !p.SubQueries.length) {
                return false;
            }
            var has = true;
            p.SubQueries.forEach(function (sub) {
                var subHas = _this2.protoHasChildren(sub.value);
                if (!subHas) {
                    has = false;
                }
            });
            return has;
        }
    }, {
        key: 'pruneEmpty',
        value: function pruneEmpty() {
            var _this3 = this;

            var sQ = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            var root = false;
            var query = this.state.query;

            if (sQ === null) {
                if (!query.Query) {
                    return;
                }
                root = true;
                sQ = query.Query;
            }
            if (sQ.SubQueries !== undefined) {
                sQ.SubQueries.forEach(function (sub) {
                    _this3.pruneEmpty(sub.value);
                    if (!_this3.protoHasChildren(sub.value)) {
                        sQ.SubQueries = sQ.SubQueries.filter(function (c) {
                            return c !== sub;
                        });
                    }
                });
            }
            if (root && sQ.SubQueries && sQ.SubQueries.length === 0) {
                delete query.Query;
                query.All = true;
            }
        }

        /**
         *
         * @param graph
         * @param input
         * @param query
         * @return Object
         */
    }, {
        key: 'buildServiceQuery',
        value: function buildServiceQuery(graph, input, query) {
            var _this4 = this;

            var _query$Operation = query.Operation;
            var Operation = _query$Operation === undefined ? 'OR' : _query$Operation;
            var SubQueries = query.SubQueries;

            // Show cluster
            var cluster = new _QueryCluster2['default'](query);
            cluster.addTo(graph);
            if (Operation === 'OR') {
                var _ret = (function () {
                    var output = undefined,
                        connector = undefined;
                    if (SubQueries.length > 1) {
                        connector = new _QueryConnector2['default']();
                        connector.addTo(graph);
                        output = connector;
                    }
                    //const output = new QueryConnector();
                    //output.addTo(graph);
                    SubQueries.forEach(function (q) {
                        if (q.type_url === 'type.googleapis.com/service.Query' && q.value.SubQueries) {
                            var _buildServiceQuery = _this4.buildServiceQuery(graph, input, q.value);

                            var subCluster = _buildServiceQuery.cluster;
                            var last = _buildServiceQuery.last;

                            cluster.embed(subCluster);
                            if (last instanceof _QueryConnector2['default']) {
                                cluster.embed(last);
                            }
                            if (connector) {
                                var link2 = new _graphLink2['default'](last.id, last instanceof _QueryConnector2['default'] ? 'input' : 'output', connector.id, 'input');
                                link2.addTo(_this4.graph);
                            } else {
                                output = last;
                            }
                        } else {
                            (function () {
                                var isNot = q.value.Not || q.value.not;
                                Object.keys(q.value).filter(function (k) {
                                    return k.toLowerCase() !== 'not';
                                }).forEach(function (key) {
                                    var field = new _Query2['default'](q, key, query, isNot);
                                    field.addTo(_this4.graph);
                                    var link = new _graphLink2['default'](input.id, input instanceof _QueryConnector2['default'] ? 'input' : 'output', field.id, 'input');
                                    link.addTo(_this4.graph);
                                    cluster.embed(field);
                                    if (connector) {
                                        var link2 = new _graphLink2['default'](field.id, 'output', connector.id, 'input');
                                        link2.addTo(_this4.graph);
                                    } else {
                                        output = field;
                                    }
                                });
                            })();
                        }
                    });
                    return {
                        v: { cluster: cluster, last: output }
                    };
                })();

                if (typeof _ret === 'object') return _ret.v;
            } else {
                var _ret3 = (function () {
                    var lastOp = input;
                    SubQueries.forEach(function (q) {
                        if (q.type_url === 'type.googleapis.com/service.Query' && q.value.SubQueries) {
                            var _buildServiceQuery2 = _this4.buildServiceQuery(graph, lastOp, q.value);

                            var subCluster = _buildServiceQuery2.cluster;
                            var last = _buildServiceQuery2.last;

                            lastOp = last;
                            cluster.embed(subCluster);
                            if (last instanceof _QueryConnector2['default']) {
                                cluster.embed(last);
                            }
                        } else {
                            (function () {
                                var isNot = q.value.Not || q.value.not;
                                Object.keys(q.value).filter(function (k) {
                                    return k.toLowerCase() !== 'not';
                                }).forEach(function (key) {
                                    var field = new _Query2['default'](q, key, query, isNot);
                                    field.addTo(_this4.graph);
                                    var link = new _graphLink2['default'](lastOp.id, lastOp instanceof _QueryConnector2['default'] ? 'input' : 'output', field.id, 'input');
                                    link.addTo(_this4.graph);
                                    lastOp = field;
                                    cluster.embed(field);
                                });
                            })();
                        }
                    });
                    return {
                        v: { cluster: cluster, last: lastOp }
                    };
                })();

                if (typeof _ret3 === 'object') return _ret3.v;
            }
        }
    }, {
        key: 'buildGraph',
        value: function buildGraph(query) {
            var queryType = this.props.queryType;

            var _detectTypes = this.detectTypes(query);

            var inputIcon = _detectTypes.inputIcon;
            var outputIcon = _detectTypes.outputIcon;

            var input = new _QueryInput2['default'](inputIcon);
            input.addTo(this.graph);
            var output = this.buildSpreadOutput(query, queryType, outputIcon);
            //        output.addTo(this.graph);
            if (query.Query && query.Query.SubQueries && query.Query.SubQueries.length) {
                var _buildServiceQuery3 = this.buildServiceQuery(this.graph, input, query.Query);

                var cluster = _buildServiceQuery3.cluster;
                var last = _buildServiceQuery3.last;

                var link = new _graphLink2['default'](last.id, last instanceof _QueryConnector2['default'] ? 'input' : 'output', output.id, 'input');
                link.addTo(this.graph);
            } else {
                var all = new _Query2['default'](null, 'Select All');
                all.addTo(this.graph);
                var link = new _graphLink2['default'](input.id, 'output', all.id, 'input');
                link.addTo(this.graph);
                var link2 = new _graphLink2['default'](all.id, 'output', output.id, 'input');
                link2.addTo(this.graph);
            }
            return _jointjs.layout.DirectedGraph.layout(this.graph, {
                nodeSep: 20,
                edgeSep: 20,
                rankSep: 40,
                rankDir: "LR",
                marginX: margin,
                marginY: margin,
                clusterPadding: 24,
                dagre: _dagre2['default'],
                graphlib: _graphlib2['default']
            });
        }
    }, {
        key: 'buildSpreadOutput',
        value: function buildSpreadOutput(query, queryType, icon) {
            if (queryType === 'selector' && !query.Collect) {
                var output = new _QueryConnector2['default']();
                output.addTo(this.graph);
                for (var i = 0; i < 3; i++) {
                    var spread = new _QueryOutput2['default']("chip");
                    spread.addTo(this.graph);
                    var link = new _graphLink2['default'](output.id, "input", spread.id, "input");
                    link.addTo(this.graph);
                }
                return output;
            } else {
                var output = new _QueryOutput2['default']("chip");
                output.addTo(this.graph);
                return output;
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this5 = this;

            var _state = this.state;
            var width = _state.width;
            var height = _state.height;

            this.paper = new _jointjs.dia.Paper({
                el: _reactDom2['default'].findDOMNode(this.refs.graph),
                width: width + margin * 2,
                height: height + margin * 2,
                model: this.graph,
                interactive: {
                    addLinkFromMagnet: false,
                    useLinkTools: false,
                    elementMove: false
                }
            });
            this.paper.on('cluster:type', function (elementView, evt) {
                var query = elementView.model.query;
                query.Operation = query.Operation === 'AND' ? 'OR' : 'AND';
                _this5.redraw();
                _this5.setDirty();
            });
            this.paper.on('cluster:add', function (elementView, evt) {
                var _detectTypes2 = _this5.detectTypes(_this5.state.query);

                var singleQuery = _detectTypes2.singleQuery;

                _this5.setState({
                    queryAddProto: elementView.model.query,
                    selectedProto: _pydioHttpRestApi.ProtobufAny.constructFromObject({ '@type': 'type.googleapis.com/' + singleQuery }),
                    aPosition: elementView.model.position(),
                    aSize: elementView.model.size(),
                    aScrollLeft: _reactDom2['default'].findDOMNode(_this5.refs.scroller).scrollLeft || 0
                });
            });
            this.paper.on('cluster:split', function (elementView, evt) {
                var _detectTypes3 = _this5.detectTypes(_this5.state.query);

                var singleQuery = _detectTypes3.singleQuery;

                _this5.setState({
                    querySplitProto: elementView.model.query,
                    selectedProto: _pydioHttpRestApi.ProtobufAny.constructFromObject({ '@type': 'type.googleapis.com/' + singleQuery }),
                    aPosition: elementView.model.position(),
                    aSize: elementView.model.size(),
                    aScrollLeft: _reactDom2['default'].findDOMNode(_this5.refs.scroller).scrollLeft || 0
                });
            });
            this.paper.on('root:add', function (elementView, evt) {
                var query = _this5.state.query;

                var _detectTypes4 = _this5.detectTypes(query);

                var singleQuery = _detectTypes4.singleQuery;

                query.Query = _pydioHttpRestApi.ServiceQuery.constructFromObject({ SubQueries: [], Operation: 'OR' });
                _this5.setState({
                    queryAddProto: query.Query,
                    selectedProto: _pydioHttpRestApi.ProtobufAny.constructFromObject({ '@type': 'type.googleapis.com/' + singleQuery }),
                    aPosition: elementView.model.position(),
                    aSize: elementView.model.size(),
                    aScrollLeft: _reactDom2['default'].findDOMNode(_this5.refs.scroller).scrollLeft || 0
                });
            });
            this.paper.on('query:select', function (elementView, evt) {
                var _elementView$model = elementView.model;
                var proto = _elementView$model.proto;
                var fieldName = _elementView$model.fieldName;

                _this5.clearSelection();
                elementView.model.select();
                _this5.setState({
                    selectedProto: proto,
                    selectedFieldName: fieldName,
                    aPosition: elementView.model.position(),
                    aSize: elementView.model.size(),
                    aScrollLeft: _reactDom2['default'].findDOMNode(_this5.refs.scroller).scrollLeft || 0
                });
            });
            this.paper.on('cluster:delete', function (elementView, evt) {
                evt.stopPropagation();
                if (!window.confirm('Remove whole branch?')) {
                    return;
                }
                var query = elementView.model.query;

                query.SubQueries = [];
                _this5.pruneEmpty();
                _this5.redraw();
                _this5.setDirty();
            });
            this.paper.on('query:delete', function (elementView) {
                if (!window.confirm('Remove this condition?')) {
                    return;
                }
                var _elementView$model2 = elementView.model;
                var parentQuery = _elementView$model2.parentQuery;
                var proto = _elementView$model2.proto;

                parentQuery.SubQueries = parentQuery.SubQueries.filter(function (q) {
                    return q !== proto;
                });
                _this5.pruneEmpty();
                _this5.redraw();
                _this5.setDirty();
            });
            this.paper.on('element:mouseenter', function (elementView) {
                if (elementView.model instanceof _Query2['default'] || elementView.model instanceof _QueryCluster2['default']) {
                    elementView.model.hover(true);
                    /*
                    // Hover parent cluster
                    if(elementView.model instanceof Query){
                        if(elementView.model.getParentCell() !== null && elementView.model.getParentCell() instanceof QueryCluster){
                            elementView.model.getParentCell().hover(true);
                        }
                    }
                    */
                }
            });
            this.paper.on('element:mouseleave', function (elementView) {
                if (elementView.model instanceof _Query2['default'] || elementView.model instanceof _QueryCluster2['default']) {
                    elementView.model.hover(false);
                }
            });
        }
    }, {
        key: 'clearSelection',
        value: function clearSelection() {
            this.setState({ queryAddProto: null, querySplitProto: null, selectedProto: null, selectedFieldName: null });
            this.graph.getCells().filter(function (c) {
                return c instanceof _Query2['default'];
            }).forEach(function (cell) {
                return cell.deselect();
            });
        }
    }, {
        key: 'remove',
        value: function remove() {
            if (!window.confirm('Are you sure you want to remove this filter?')) {
                return;
            }
            var onRemoveFilter = this.props.onRemoveFilter;
            var query = this.state.query;

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
        key: 'changeQueryValue',
        value: function changeQueryValue(newField, newValue, notProps) {
            var _state2 = this.state;
            var selectedProto = _state2.selectedProto;
            var selectedFieldName = _state2.selectedFieldName;
            var queryAddProto = _state2.queryAddProto;
            var querySplitProto = _state2.querySplitProto;

            // Clean old values
            if (selectedFieldName && newField !== selectedFieldName) {
                delete selectedProto.value[selectedFieldName];
            }
            if (notProps) {
                //selectedProto.value = {...selectedProto.value, ...notProps};
                Object.keys(notProps).forEach(function (k) {
                    selectedProto.value[k] = notProps[k];
                });
            } else {
                if (selectedProto.value["Not"]) {
                    delete selectedProto.value["Not"];
                }
                if (selectedProto.value["not"]) {
                    delete selectedProto.value["not"];
                }
            }
            selectedProto.value[newField] = newValue;
            if (queryAddProto) {
                if (!queryAddProto.SubQueries) {
                    queryAddProto.SubQueries = [];
                }
                queryAddProto.SubQueries.push(selectedProto);
            } else if (querySplitProto) {
                // Create a new branch and move proto inside this branch
                var newBranch1 = _pydioHttpRestApi.ProtobufAny.constructFromObject({ '@type': 'type.googleapis.com/service.Query', SubQueries: [], Operation: 'AND' });
                var newBranch2 = _pydioHttpRestApi.ProtobufAny.constructFromObject({ '@type': 'type.googleapis.com/service.Query', SubQueries: [], Operation: querySplitProto.Operation });
                newBranch1.value.SubQueries = [selectedProto];
                newBranch2.value.SubQueries = querySplitProto.SubQueries;
                querySplitProto.SubQueries = [newBranch1, newBranch2];
            }
            this.setDirty();
            this.redraw();
        }
    }, {
        key: 'toggleCollect',
        value: function toggleCollect(value) {
            var query = this.state.query;

            query.Collect = value;
            this.setDirty();
            this.redraw();
        }
    }, {
        key: 'setDirty',
        value: function setDirty() {
            this.setState({ dirty: true });
        }
    }, {
        key: 'revert',
        value: function revert() {
            var _this6 = this;

            var cloner = this.props.cloner;
            var cleanState = this.state.cleanState;

            this.setState({ dirty: false, query: cloner(cleanState) }, function () {
                _this6.redraw();
            });
        }
    }, {
        key: 'save',
        value: function save() {
            var query = this.state.query;
            var _props2 = this.props;
            var onSave = _props2.onSave;
            var cloner = _props2.cloner;

            onSave(query);
            this.setState({
                dirty: false,
                cleanState: cloner(query)
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this7 = this;

            var _props3 = this.props;
            var queryType = _props3.queryType;
            var style = _props3.style;
            var _state3 = this.state;
            var query = _state3.query;
            var selectedProto = _state3.selectedProto;
            var selectedFieldName = _state3.selectedFieldName;
            var dirty = _state3.dirty;
            var aPosition = _state3.aPosition;
            var aSize = _state3.aSize;
            var aScrollLeft = _state3.aScrollLeft;

            var _detectTypes5 = this.detectTypes(query);

            var objectType = _detectTypes5.objectType;
            var singleQuery = _detectTypes5.singleQuery;

            var title = (queryType === 'filter' ? 'Filter' : 'Select') + ' ' + objectType + (queryType === 'filter' ? '' : 's');

            var bStyles = _extends({}, _styles.styles.button);
            if (!dirty) {
                bStyles = _extends({}, bStyles, _styles.styles.disabled);
            }

            return _react2['default'].createElement(
                'div',
                { style: _extends({}, style, { position: 'relative' }) },
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', fontSize: 15, padding: 10 } },
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1 } },
                        title
                    ),
                    _react2['default'].createElement(
                        'div',
                        null,
                        _react2['default'].createElement('span', { className: "mdi mdi-undo", onClick: dirty ? function () {
                                _this7.revert();
                            } : function () {}, style: bStyles }),
                        _react2['default'].createElement('span', { className: "mdi mdi-content-save", onClick: dirty ? function () {
                                _this7.save();
                            } : function () {}, style: bStyles }),
                        _react2['default'].createElement('span', { className: "mdi mdi-delete", onClick: function () {
                                _this7.remove();
                            }, style: _extends({}, _styles.styles.button, _styles.styles['delete']) })
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { width: '100%', overflowX: 'auto' }, ref: "scroller" },
                    _react2['default'].createElement('div', { ref: "graph", id: "graph" })
                ),
                queryType === "selector" && _react2['default'].createElement(
                    'div',
                    { style: { padding: '0 6px 2px' } },
                    _react2['default'].createElement(_materialUi.Toggle, {
                        toggled: query.Collect,
                        onToggle: function (e, v) {
                            _this7.toggleCollect(v);
                        },
                        labelPosition: "right",
                        fullWidth: true,
                        label: query.Collect ? "Trigger one action with all results" : "Trigger one action per result",
                        style: { padding: '7px 5px 4px', fontSize: 15 }
                    })
                ),
                selectedProto && _react2['default'].createElement(_ProtoValue2['default'], {
                    proto: selectedProto,
                    singleQuery: singleQuery,
                    fieldName: selectedFieldName,
                    onChange: function (f, v, nP) {
                        _this7.changeQueryValue(f, v, nP);
                    },
                    onDismiss: function () {
                        _this7.clearSelection();
                    },
                    style: (0, _styles.position)(300, aSize, aPosition, aScrollLeft, 40)
                })
            );
        }
    }]);

    return QueryBuilder;
})(_react2['default'].Component);

exports['default'] = QueryBuilder;
module.exports = exports['default'];
