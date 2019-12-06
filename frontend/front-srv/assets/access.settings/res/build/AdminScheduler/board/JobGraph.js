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

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _jointjs = require('jointjs');

var _graphJobInput = require('./graph/JobInput');

var _graphJobInput2 = _interopRequireDefault(_graphJobInput);

var _graphFilter = require("./graph/Filter");

var _graphFilter2 = _interopRequireDefault(_graphFilter);

var _graphLink = require("./graph/Link");

var _graphLink2 = _interopRequireDefault(_graphLink);

var _graphAction = require("./graph/Action");

var _graphAction2 = _interopRequireDefault(_graphAction);

var _graphConfigs = require("./graph/Configs");

var _dagre = require('dagre');

var _dagre2 = _interopRequireDefault(_dagre);

var _graphlib = require('graphlib');

var _graphlib2 = _interopRequireDefault(_graphlib);

var _graphSelector = require("./graph/Selector");

var _graphSelector2 = _interopRequireDefault(_graphSelector);

var _materialUi = require('material-ui');

var _builderFormPanel = require("./builder/FormPanel");

var _builderFormPanel2 = _interopRequireDefault(_builderFormPanel);

var _builderQueryBuilder = require("./builder/QueryBuilder");

var _builderQueryBuilder2 = _interopRequireDefault(_builderQueryBuilder);

var _builderTriggers = require("./builder/Triggers");

var style = '\ntext[joint-selector="icon"] tspan {\n    font: normal normal normal 24px/1 "Material Design Icons";\n    font-size: 24px;\n    text-rendering: auto;\n    -webkit-font-smoothing: antialiased;\n}\n';

var JobGraph = (function (_React$Component) {
    _inherits(JobGraph, _React$Component);

    function JobGraph(props) {
        _classCallCheck(this, JobGraph);

        _get(Object.getPrototypeOf(JobGraph.prototype), 'constructor', this).call(this, props);
        this.state = {};
        this.graph = new _jointjs.dia.Graph();
    }

    _createClass(JobGraph, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadDescriptions();
        }
    }, {
        key: 'loadDescriptions',
        value: function loadDescriptions() {
            var _this = this;

            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            api.schedulerActionsDiscovery().then(function (data) {
                // Draw now!
                _this.setState({ descriptions: data.Actions }, function () {
                    var bbox = _this.graphFromJob();
                    _this.setState(bbox, function () {
                        _this.drawGraph();
                    });
                });
            })['catch'](function () {
                var bbox = _this.graphFromJob();
                _this.setState(bbox, function () {
                    _this.drawGraph();
                });
            });
        }
    }, {
        key: 'chainActions',
        value: function chainActions(graph, actions, inputId) {
            var _this2 = this;

            var hasData = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];
            var descriptions = this.state.descriptions;

            actions.forEach(function (action) {
                var crtInput = inputId;
                var hasChain = action.ChainedActions && action.ChainedActions.length;
                var filter = action.NodesFilter || action.IdmFilter || action.UsersFilter;
                var selector = action.NodesSelector || action.IdmSelector || action.UsersSelector;
                var cluster = undefined;
                if (filter || selector) {
                    cluster = new _jointjs.shapes.basic.Rect(_graphConfigs.ClusterConfig);
                    cluster.addTo(graph);
                    var filterShape = undefined;
                    if (filter) {
                        filterShape = new _graphFilter2['default'](filter, action.NodesFilter ? 'node' : action.UsersFilter ? 'user' : 'idm');
                    } else {
                        filterShape = new _graphSelector2['default'](selector, action.NodesSelector ? 'node' : action.UsersSelector ? 'user' : 'idm');
                    }
                    filterShape.addTo(graph);
                    cluster.embed(filterShape);
                    var _link = new _graphLink2['default'](crtInput, 'output', filterShape.id, 'input', hasData);
                    _link.addTo(graph);
                    crtInput = filterShape.id;
                    hasData = true;
                }
                var shape = new _graphAction2['default'](descriptions, action, hasChain);
                shape.addTo(graph);
                if (cluster) {
                    cluster.embed(shape);
                }
                var link = new _graphLink2['default'](crtInput, 'output', shape.id, 'input', hasData);
                link.addTo(graph);
                if (hasChain) {
                    _this2.chainActions(graph, action.ChainedActions, shape.id);
                }
            });
        }
    }, {
        key: 'graphFromJob',
        value: function graphFromJob() {
            var job = this.props.job;

            if (!job || !job.Actions || !job.Actions.length) {
                return { width: 0, height: 0 };
            }
            // cluster trigger with filter: add cluster before the others
            var cluster = undefined;
            if (job.NodeEventFilter || job.UserEventFilter || job.IdmFilter) {
                cluster = new _jointjs.shapes.basic.Rect(_graphConfigs.ClusterConfig);
                cluster.addTo(this.graph);
            }

            var shapeIn = new _graphJobInput2['default'](job);
            shapeIn.addTo(this.graph);

            var actionsInput = shapeIn.id;
            var firstLinkHasData = !!job.EventNames;

            if (job.NodeEventFilter || job.UserEventFilter || job.IdmFilter) {

                var filterType = undefined;
                if (job.NodeEventFilter) {
                    filterType = 'node';
                } else if (job.UserEventFilter) {
                    filterType = 'user';
                } else {
                    filterType = 'idm';
                }
                var filter = new _graphFilter2['default'](job.NodeEventFilter || job.UserEventFilter || job.IdmFilter, filterType);
                filter.addTo(this.graph);

                cluster.embed(shapeIn);
                cluster.embed(filter);

                var fLink = new _graphLink2['default'](actionsInput, 'output', filter.id, 'input', firstLinkHasData);
                fLink.addTo(this.graph);

                firstLinkHasData = true;
                actionsInput = filter.id;
            }

            this.chainActions(this.graph, job.Actions, actionsInput, firstLinkHasData);
            // Relayout graph and return bounding box
            return _jointjs.layout.DirectedGraph.layout(this.graph, {
                nodeSep: 30,
                edgeSep: 30,
                rankSep: 80,
                rankDir: "LR",
                marginX: 40,
                marginY: 40,
                clusterPadding: 20,
                dagre: _dagre2['default'],
                graphlib: _graphlib2['default']
            });
        }
    }, {
        key: 'clearSelection',
        value: function clearSelection() {
            if (this._selection) {
                this._selection.attr('rect/stroke', this._selectionStrokeOrigin);
            }
            this.setState({
                selection: null,
                selectionType: null
            });
        }
    }, {
        key: 'select',
        value: function select(model) {
            this._selection = model;
            this._selectionStrokeOrigin = this._selection.attr('rect/stroke');
            this._selection.attr('rect/stroke', _graphConfigs.Orange);
            var s = {
                position: model.position(),
                size: model.size(),
                scrollLeft: _reactDom2['default'].findDOMNode(this.refs.scroller).scrollLeft || 0
            };
            if (model instanceof _graphAction2['default']) {
                s.selection = model.getJobsAction();
                s.selectionType = 'action';
            } else if (model instanceof _graphSelector2['default']) {
                s.selection = model.getSelector();
                s.selectionType = 'selector';
            } else if (model instanceof _graphFilter2['default']) {
                s.selection = model.getFilter();
                s.selectionType = 'filter';
            } else if (model instanceof _graphJobInput2['default'] && model.getInputType() === 'event') {
                s.selection = model.getEventNames();
                s.selectionType = 'events';
            } else if (model instanceof _graphJobInput2['default'] && model.getInputType() === 'schedule') {
                s.selection = model.getSchedule();
                s.selectionType = 'schedule';
            }
            this.setState(s);
        }
    }, {
        key: 'drawGraph',
        value: function drawGraph() {
            var _this3 = this;

            var _state = this.state;
            var width = _state.width;
            var height = _state.height;

            this.paper = new _jointjs.dia.Paper({
                el: _reactDom2['default'].findDOMNode(this.refs.placeholder),
                width: width + 80,
                height: height + 80,
                model: this.graph,
                interactive: {
                    addLinkFromMagnet: false,
                    useLinkTools: false,
                    elementMove: true
                }
            });
            this.paper.on('element:pointerdown', function (el, event) {
                console.log(el, event);
                if (el.model instanceof _graphAction2['default'] || el.model instanceof _graphSelector2['default'] || el.model instanceof _graphFilter2['default'] || el.model instanceof _graphJobInput2['default']) {
                    _this3.clearSelection();
                    _this3.select(el.model);
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var selBlock = undefined;
            var _state2 = this.state;
            var selection = _state2.selection;
            var selectionType = _state2.selectionType;
            var descriptions = _state2.descriptions;
            var position = _state2.position;
            var size = _state2.size;
            var scrollLeft = _state2.scrollLeft;

            var blockProps = {
                sourcePosition: position,
                sourceSize: size,
                scrollLeft: scrollLeft,
                onDismiss: function onDismiss() {
                    _this4.clearSelection();
                }
            };
            if (selectionType === 'action' && descriptions[selection.ID]) {
                var desc = descriptions[selection.ID];
                selBlock = _react2['default'].createElement(_builderFormPanel2['default'], _extends({ actionInfo: desc, action: selection }, blockProps));
            } else if (selectionType === 'selector' || selectionType === 'filter') {
                selBlock = _react2['default'].createElement(_builderQueryBuilder2['default'], _extends({ query: selection, queryType: selectionType }, blockProps));
            } else if (selectionType === 'events') {
                selBlock = _react2['default'].createElement(_builderTriggers.Events, _extends({ events: selection }, blockProps));
            } else if (selectionType === 'schedule') {
                selBlock = _react2['default'].createElement(_builderTriggers.Schedule, _extends({ schedule: selection }, blockProps));
            }

            var headerStyle = {
                backgroundColor: 'whitesmoke',
                borderBottom: '1px solid #e0e0e0',
                height: 48,
                color: '#9e9e9e',
                fontSize: 12,
                fontWeight: 500,
                padding: '14px 24px'
            };

            return _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 1, style: { margin: 20 } },
                _react2['default'].createElement(
                    'div',
                    { style: headerStyle },
                    'Job Workflow - click on boxes to show details'
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { position: 'relative' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1, overflowX: 'auto' }, ref: 'scroller' },
                        _react2['default'].createElement('div', { id: 'playground', ref: 'placeholder' })
                    ),
                    selBlock
                ),
                _react2['default'].createElement('style', { type: "text/css", dangerouslySetInnerHTML: { __html: style } })
            );
        }
    }]);

    return JobGraph;
})(_react2['default'].Component);

exports['default'] = JobGraph;
module.exports = exports['default'];
