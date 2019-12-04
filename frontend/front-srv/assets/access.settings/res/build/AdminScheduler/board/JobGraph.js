'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

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

var style = '\ntext[joint-selector="icon"] tspan {\n    font: normal normal normal 24px/1 "Material Design Icons";\n    font-size: 24px;\n    text-rendering: auto;\n    -webkit-font-smoothing: antialiased;\n}\n';

var JobGraph = (function (_React$Component) {
    _inherits(JobGraph, _React$Component);

    function JobGraph(props) {
        _classCallCheck(this, JobGraph);

        _get(Object.getPrototypeOf(JobGraph.prototype), 'constructor', this).call(this, props);
        this.graph = new _jointjs.dia.Graph();
        this.state = this.graphFromJob();
    }

    _createClass(JobGraph, [{
        key: 'chainActions',
        value: function chainActions(graph, actions, inputId) {
            var _this = this;

            var hasData = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

            actions.forEach(function (action) {
                var crtInput = inputId;
                var hasChain = action.ChainedActions && action.ChainedActions.length;
                var filter = action.NodesFilter || action.IdmFilter || action.UsersFilter;
                var selector = action.NodesSelector || action.IdmSelector || action.UsersSelector;
                if (filter || selector) {
                    var filterShape = undefined;
                    if (filter) {
                        filterShape = new _graphFilter2['default'](filter, action.NodesFilter ? 'node' : action.UsersFilter ? 'user' : 'idm');
                    } else {
                        filterShape = new _graphSelector2['default'](selector, action.NodesSelector ? 'node' : action.UsersSelector ? 'user' : 'idm');
                    }
                    filterShape.addTo(graph);
                    var _link = new _graphLink2['default'](crtInput, 'output', filterShape.id, 'input', hasData);
                    _link.addTo(graph);
                    crtInput = filterShape.id;
                    hasData = true;
                }
                var shape = new _graphAction2['default'](action, hasChain);
                shape.addTo(graph);
                var link = new _graphLink2['default'](crtInput, 'output', shape.id, 'input', hasData);
                link.addTo(graph);
                if (hasChain) {
                    _this.chainActions(graph, action.ChainedActions, shape.id);
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
                dagre: _dagre2['default'],
                graphlib: _graphlib2['default']
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var _state = this.state;
            var width = _state.width;
            var height = _state.height;

            this.paper = new _jointjs.dia.Paper({
                el: _reactDom2['default'].findDOMNode(this.refs.placeholder),
                width: width + 80,
                height: height + 80,
                model: this.graph,
                highlighting: {
                    'default': {
                        name: 'stroke',
                        options: {
                            padding: 3
                        }
                    },
                    connecting: {
                        name: 'addClass',
                        options: {
                            className: 'highlight-connecting'
                        }
                    }
                }
            });
            this.paper.on('element:pointerdown', function (el) {
                if (_this2._selection) {
                    _this2._selection.attr('rect/stroke', _this2._selectionStrokeOrigin);
                }
                _this2._selection = el.model;
                _this2._selectionStrokeOrigin = _this2._selection.attr('rect/stroke');
                _this2._selection.attr('rect/stroke', _graphConfigs.Orange);
            });
        }
    }, {
        key: 'render',
        value: function render() {

            return _react2['default'].createElement(
                'div',
                { style: { width: '100%', overflowX: 'auto' } },
                _react2['default'].createElement('div', { id: 'playground', ref: 'placeholder' }),
                _react2['default'].createElement('style', { type: "text/css", dangerouslySetInnerHTML: { __html: style } })
            );
        }
    }]);

    return JobGraph;
})(_react2['default'].Component);

exports['default'] = JobGraph;
module.exports = exports['default'];
