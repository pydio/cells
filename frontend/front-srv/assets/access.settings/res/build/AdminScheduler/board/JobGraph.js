'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x7, _x8, _x9) { var _again = true; _function: while (_again) { var object = _x7, property = _x8, receiver = _x9; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x7 = parent; _x8 = property; _x9 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

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

var _graphSelector = require("./graph/Selector");

var _graphSelector2 = _interopRequireDefault(_graphSelector);

var _materialUi = require('material-ui');

var _builderFormPanel = require("./builder/FormPanel");

var _builderFormPanel2 = _interopRequireDefault(_builderFormPanel);

var _builderTriggers = require("./builder/Triggers");

var _redux = require('redux');

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _reducers = require('./reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _actionsEditor = require("./actions/editor");

var _builderFilters = require("./builder/Filters");

var _builderFilters2 = _interopRequireDefault(_builderFilters);

var _graphConfigs = require("./graph/Configs");

var _builderStyles = require("./builder/styles");

var _graphActionFilter = require("./graph/ActionFilter");

var _graphActionFilter2 = _interopRequireDefault(_graphActionFilter);

var _CreateActions = require('./CreateActions');

var _CreateActions2 = _interopRequireDefault(_CreateActions);

var _CreateFilters = require("./CreateFilters");

var _CreateFilters2 = _interopRequireDefault(_CreateFilters);

var _JobParameters = require("./JobParameters");

var _JobParameters2 = _interopRequireDefault(_JobParameters);

var _graphTplManager = require("./graph/TplManager");

var _graphTplManager2 = _interopRequireDefault(_graphTplManager);

var _uuid4 = require('uuid4');

var _uuid42 = _interopRequireDefault(_uuid4);

var _builderTemplateDialog = require("./builder/TemplateDialog");

var _builderTemplateDialog2 = _interopRequireDefault(_builderTemplateDialog);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var mapStateToProps = function mapStateToProps(state) {
    console.debug(state);
    return _extends({}, state);
};

var editWindowHeight = 600;

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
        onToggleEdit: function onToggleEdit() {
            var on = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
            var layout = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            dispatch(function (d, getState) {
                d((0, _actionsEditor.toggleEditAction)(on, layout));

                var _getState = getState();

                var graph = _getState.graph;
                var boundingRef = _getState.boundingRef;
                var editMode = _getState.editMode;
                var paper = _getState.paper;
                var createLinkTool = _getState.createLinkTool;

                d((0, _actionsEditor.requireLayoutAction)(graph, boundingRef, editMode, paper, createLinkTool));

                var _getState2 = getState();

                var bbox = _getState2.bbox;

                d((0, _actionsEditor.resizePaperAction)(bbox.width, bbox.height));
            });
        },
        onSetBoundingRef: function onSetBoundingRef(element) {
            dispatch((0, _actionsEditor.attachBoundingRefAction)(element));
        },
        onSetDirty: function onSetDirty() {
            var dirty = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            dispatch((0, _actionsEditor.setDirtyAction)(dirty));
        },
        onPaperBind: function onPaperBind(element, graph, events) {
            dispatch((0, _actionsEditor.bindPaperAction)(element, graph, events));
        },
        onUpdateDescriptions: function onUpdateDescriptions(descriptions) {
            dispatch(function (d, getState) {
                d((0, _actionsEditor.attachDescriptions)(descriptions));

                var _getState3 = getState();

                var job = _getState3.job;
                var editMode = _getState3.editMode;

                d((0, _actionsEditor.jobChangedAction)(job, descriptions, editMode));

                var _getState4 = getState();

                var graph = _getState4.graph;
                var boundingRef = _getState4.boundingRef;
                var paper = _getState4.paper;
                var createLinkTool = _getState4.createLinkTool;

                d((0, _actionsEditor.requireLayoutAction)(graph, boundingRef, editMode, paper, createLinkTool));

                var _getState5 = getState();

                var bbox = _getState5.bbox;

                d((0, _actionsEditor.resizePaperAction)(bbox.width, bbox.height));
            });
        },
        refreshGraph: function refreshGraph() {
            dispatch(function (d, getState) {
                var _getState6 = getState();

                var job = _getState6.job;
                var descriptions = _getState6.descriptions;
                var editMode = _getState6.editMode;

                d((0, _actionsEditor.jobChangedAction)(job, descriptions, editMode));

                var _getState7 = getState();

                var graph = _getState7.graph;
                var boundingRef = _getState7.boundingRef;
                var paper = _getState7.paper;
                var createLinkTool = _getState7.createLinkTool;

                d((0, _actionsEditor.requireLayoutAction)(graph, boundingRef, editMode, paper, createLinkTool));

                var _getState8 = getState();

                var bbox = _getState8.bbox;

                d((0, _actionsEditor.resizePaperAction)(bbox.width, bbox.height));
            });
        },
        requireLayout: function requireLayout() {
            dispatch(function (d, getState) {
                var _getState9 = getState();

                var graph = _getState9.graph;
                var boundingRef = _getState9.boundingRef;
                var editMode = _getState9.editMode;
                var paper = _getState9.paper;
                var createLinkTool = _getState9.createLinkTool;

                d((0, _actionsEditor.requireLayoutAction)(graph, boundingRef, editMode, paper, createLinkTool));

                var _getState10 = getState();

                var bbox = _getState10.bbox;

                d((0, _actionsEditor.resizePaperAction)(bbox.width, bbox.height));
            });
        },
        onPaperResize: function onPaperResize(width, height) {
            dispatch((0, _actionsEditor.resizePaperAction)(width, height));
        },
        onEmptyModel: function onEmptyModel(model) {
            dispatch(function (d, getState) {
                d((0, _actionsEditor.emptyModelAction)(model));

                var _getState11 = getState();

                var graph = _getState11.graph;
                var boundingRef = _getState11.boundingRef;
                var editMode = _getState11.editMode;
                var paper = _getState11.paper;
                var createLinkTool = _getState11.createLinkTool;

                d((0, _actionsEditor.requireLayoutAction)(graph, boundingRef, editMode, paper, createLinkTool));
            });
        },
        onAttachModel: function onAttachModel(link) {
            dispatch(function (d) {
                d((0, _actionsEditor.attachModelAction)(link));
                d((0, _actionsEditor.setDirtyAction)(true));
            });
        },
        onDetachModel: function onDetachModel(linkView, toolView, originalTarget) {
            dispatch(function (d) {
                d((0, _actionsEditor.detachModelAction)(linkView, toolView, originalTarget));
                d((0, _actionsEditor.setDirtyAction)(true));
            });
        },
        onRemoveModel: function onRemoveModel(model, parentModel) {
            var removeFilter = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            dispatch(function (d) {
                d((0, _actionsEditor.removeModelAction)(model, parentModel, removeFilter));
                d((0, _actionsEditor.setDirtyAction)(true));
            });
        },
        onDropFilter: function onDropFilter(target, dropped, filterOrSelector, objectType) {
            dispatch(function (d, getState) {
                d((0, _actionsEditor.dropFilterAction)(target, dropped, filterOrSelector, objectType));
                d((0, _actionsEditor.setDirtyAction)(true));

                var _getState12 = getState();

                var job = _getState12.job;
                var descriptions = _getState12.descriptions;
                var editMode = _getState12.editMode;

                d((0, _actionsEditor.jobChangedAction)(job, descriptions, editMode));

                var _getState13 = getState();

                var graph = _getState13.graph;
                var boundingRef = _getState13.boundingRef;
                var paper = _getState13.paper;
                var createLinkTool = _getState13.createLinkTool;

                d((0, _actionsEditor.requireLayoutAction)(graph, boundingRef, editMode, paper, createLinkTool));
            });
        },
        onRemoveFilter: function onRemoveFilter(target, filter, filterOrSelector, objectType) {
            dispatch(function (d, getState) {
                d((0, _actionsEditor.removeFilterAction)(target, filter, filterOrSelector, objectType));
                d((0, _actionsEditor.setDirtyAction)(true));

                var _getState14 = getState();

                var job = _getState14.job;
                var descriptions = _getState14.descriptions;
                var editMode = _getState14.editMode;

                d((0, _actionsEditor.jobChangedAction)(job, descriptions, editMode));

                var _getState15 = getState();

                var graph = _getState15.graph;
                var boundingRef = _getState15.boundingRef;
                var paper = _getState15.paper;
                var createLinkTool = _getState15.createLinkTool;

                d((0, _actionsEditor.requireLayoutAction)(graph, boundingRef, editMode, paper, createLinkTool));
            });
        },
        onToggleFilterAsCondition: function onToggleFilterAsCondition(toggle, action) {
            dispatch(function (d, getState) {
                d((0, _actionsEditor.toggleFilterAsConditionAction)(toggle, action));
                d((0, _actionsEditor.setDirtyAction)(true));

                var _getState16 = getState();

                var job = _getState16.job;
                var descriptions = _getState16.descriptions;
                var editMode = _getState16.editMode;

                d((0, _actionsEditor.jobChangedAction)(job, descriptions, editMode));

                var _getState17 = getState();

                var graph = _getState17.graph;
                var boundingRef = _getState17.boundingRef;
                var paper = _getState17.paper;
                var createLinkTool = _getState17.createLinkTool;

                d((0, _actionsEditor.requireLayoutAction)(graph, boundingRef, editMode, paper, createLinkTool));
            });
        },
        onTriggerChange: function onTriggerChange(triggerType, triggerData) {
            dispatch(function (d) {
                d((0, _actionsEditor.changeTriggerAction)(triggerType, triggerData));
                d((0, _actionsEditor.setDirtyAction)(true));
            });
        },
        onLabelChange: function onLabelChange(newLabel) {
            dispatch(function (d) {
                d((0, _actionsEditor.updateLabelAction)(newLabel));
                d((0, _actionsEditor.setDirtyAction)(true));
            });
        },
        onJobPropertyChange: function onJobPropertyChange(name, value) {
            dispatch(function (d) {
                d((0, _actionsEditor.updateJobPropertyAction)(name, value));
                d((0, _actionsEditor.setDirtyAction)(true));
            });
        },
        onSelectionClear: function onSelectionClear() {
            dispatch((0, _actionsEditor.clearSelectionAction)());
        },
        onSelectionSet: function onSelectionSet(type, model) {
            dispatch((0, _actionsEditor.setSelectionAction)(type, model));
        },
        onRevert: function onRevert(original, callback) {
            dispatch(function (d, getState) {
                d((0, _actionsEditor.revertAction)(original));
                d((0, _actionsEditor.setDirtyAction)(false));

                var _getState18 = getState();

                var job = _getState18.job;
                var descriptions = _getState18.descriptions;
                var editMode = _getState18.editMode;

                d((0, _actionsEditor.jobChangedAction)(job, descriptions, editMode));

                var _getState19 = getState();

                var graph = _getState19.graph;
                var boundingRef = _getState19.boundingRef;
                var paper = _getState19.paper;
                var createLinkTool = _getState19.createLinkTool;

                d((0, _actionsEditor.requireLayoutAction)(graph, boundingRef, editMode, paper, createLinkTool));
            });
        },
        onSave: function onSave(job) {
            var onJobSave = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            dispatch(function (d) {
                _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
                    var SchedulerServiceApi = sdk.SchedulerServiceApi;
                    var JobsPutJobRequest = sdk.JobsPutJobRequest;

                    var api = new SchedulerServiceApi(_pydioHttpApi2['default'].getRestClient());
                    var req = new JobsPutJobRequest();
                    // Clone and remove tasks
                    req.Job = _pydioHttpRestApi.JobsJob.constructFromObject(JSON.parse(JSON.stringify(job)));
                    if (req.Job.Tasks !== undefined) {
                        delete req.Job.Tasks;
                    }
                    return api.putJob(req);
                }).then(function () {
                    d((0, _actionsEditor.saveSuccessAction)(job));
                    if (onJobSave) {
                        onJobSave(job);
                    }
                })['catch'](function (e) {
                    d((0, _actionsEditor.saveErrorAction)(job));
                });
            });
        }
    };
};

function storeStateToState(store) {
    return _extends({}, mapStateToProps(store.getState()), mapDispatchToProps(store.dispatch));
}

var JobGraph = (function (_React$Component) {
    _inherits(JobGraph, _React$Component);

    function JobGraph(props) {
        var _this2 = this;

        _classCallCheck(this, JobGraph);

        _get(Object.getPrototypeOf(JobGraph.prototype), 'constructor', this).call(this, props);
        var job = _pydioHttpRestApi.JobsJob.constructFromObject(JSON.parse(JSON.stringify(props.job)));
        var original = _pydioHttpRestApi.JobsJob.constructFromObject(JSON.parse(JSON.stringify(props.job)));
        this.store = (0, _redux.createStore)(_reducers2['default'], {
            job: job,
            original: original,
            createLinkTool: this.createLinkTool.bind(this)
        }, (0, _redux.applyMiddleware)(_reduxThunk2['default']));
        this.state = storeStateToState(this.store);
        this.store.subscribe(function () {
            _this2.setState(storeStateToState(_this2.store));
        });
    }

    //JobGraph = connect(mapStateToProps, mapDispatchToProps)(JobGraph);

    _createClass(JobGraph, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this3 = this;

            var _state = this.state;
            var onSetBoundingRef = _state.onSetBoundingRef;
            var refreshGraph = _state.refreshGraph;

            this.drawGraph();
            onSetBoundingRef(_reactDom2['default'].findDOMNode(this.refs.boundingBox));
            refreshGraph();
            // Load descriptions
            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            api.schedulerActionsDiscovery().then(function (data) {
                _this3.state.onUpdateDescriptions(data.Actions);
                if (_this3.props.onUpdateDescriptions) {
                    _this3.props.onUpdateDescriptions(data.Actions);
                }
            });
            // Bind window resizer
            this._resizer = function () {
                var _state2 = _this3.state;
                var editMode = _state2.editMode;
                var paper = _state2.paper;
                var boundingRef = _state2.boundingRef;

                if (editMode && boundingRef) {
                    var graphWidth = paper.model.getBBox().width + 80;
                    var paperHeight = paper.getArea().height;
                    var maxWidth = boundingRef.clientWidth;
                    paper.setDimensions(Math.max(graphWidth, maxWidth), paperHeight);
                }
            };
            _pydioUtilDom2['default'].observeWindowResize(this._resizer);
            window.setTimeout(function () {
                var create = _this3.props.create;

                if (create) {
                    _this3.toggleEdit();
                }
            }, 500);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _pydioUtilDom2['default'].stopObservingWindowResize(this._resizer);
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            return nextProps.random === this.props.random;
        }
    }, {
        key: 'clearSelection',
        value: function clearSelection() {
            var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];
            var graph = this.state.graph;

            graph.getCells().filter(function (c) {
                return c.clearSelection;
            }).forEach(function (c) {
                return c.clearSelection();
            });
            this.setState({
                selectionType: null,
                selectionModel: null,
                fPanelWidthOffset: 0
            }, callback);
        }
    }, {
        key: 'select',
        value: function select(model) {
            var s = {
                selectionModel: model
            };
            if (model instanceof _graphAction2['default']) {
                s.createNewAction = false;
                s.selectionType = 'action';
            } else if (model instanceof _graphSelector2['default']) {
                s.selectionType = 'selector';
            } else if (model instanceof _graphFilter2['default']) {
                s.selectionType = 'filter';
            } else if (model instanceof _graphJobInput2['default']) {
                s.createNewAction = false;
                s.selectionType = 'trigger';
            }
            this.setState(s);
        }
    }, {
        key: 'insertOutput',
        value: function insertOutput(source, toInsert) {
            var graph = this.state.graph;

            var outLinks = graph.getConnectedLinks(source).filter(function (link) {
                return link.getSourceCell() === source;
            });
            var link = new _graphLink2['default'](source.id, 'output', toInsert.id, 'input', true);
            link.addTo(graph);
            outLinks.forEach(function (link) {
                link.source({ id: toInsert.id, port: 'output' });
            });
        }
    }, {
        key: 'insertInput',
        value: function insertInput(target, toInsert) {
            var graph = this.state.graph;

            // retarget existing links
            graph.getConnectedLinks(target).filter(function (link) {
                return link.getTargetCell() === target;
            }).forEach(function (link) {
                link.target({ id: toInsert.id, port: 'input' });
            });
            var link = new _graphLink2['default'](toInsert.id, 'output', target.id, 'input');
            link.addTo(graph);
        }
    }, {
        key: 'clearHighlight',
        value: function clearHighlight() {
            var _state3 = this.state;
            var graph = _state3.graph;
            var paper = _state3.paper;

            graph.getCells().forEach(function (c) {
                c.findView(paper).unhighlight();
                if (c.hideLegend) {
                    c.hideLegend();
                }
            });
        }
    }, {
        key: 'createLinkTool',
        value: function createLinkTool() {
            var onDetachModel = this.state.onDetachModel;

            return new _jointjs.linkTools.Remove({
                action: function action(evt, linkView, toolView) {
                    onDetachModel(linkView, toolView);
                },
                distance: -40
            });
        }
    }, {
        key: 'drawGraph',
        value: function drawGraph() {
            var _this4 = this;

            var _state4 = this.state;
            var graph = _state4.graph;
            var job = _state4.job;
            var onPaperBind = _state4.onPaperBind;
            var onAttachModel = _state4.onAttachModel;
            var onDetachModel = _state4.onDetachModel;
            var onDropFilter = _state4.onDropFilter;
            var editMode = _state4.editMode;
            var requireLayout = _state4.requireLayout;

            var removeLinkTool = function removeLinkTool() {
                return _this4.createLinkTool();
            };
            var _this = this;

            //const templates = new Templates(graph);
            //templates.addTo(graph);

            onPaperBind(_reactDom2['default'].findDOMNode(this.refs.placeholder), graph, {
                'element:pointerdown': function elementPointerdown(elementView, event) {
                    event.data = elementView.model.position();
                    var model = elementView.model;

                    if (_this.state.editMode && !model.isTemplate) {
                        if (model instanceof _graphAction2['default'] || model instanceof _graphSelector2['default'] || model instanceof _graphFilter2['default'] || model instanceof _graphJobInput2['default']) {
                            _this4.clearSelection();
                            model.select();
                            _this4.select(model);
                        }
                    } else if (model.isTemplate /*&& model !== templates*/) {
                            // Start dragging new model and duplicate
                            //templates.replicate(model, graph);
                            model.toFront();
                        }
                },
                'element:filter:pointerdown': function elementFilterPointerdown(elementView, event) {
                    var model = elementView.model;

                    if (_this.state.editMode) {
                        _this4.clearSelection();
                        model.selectFilter();
                        if (model instanceof _graphJobInput2['default']) {
                            _this4.setState({ selectionModel: job, selectionType: 'filter' });
                        } else if (model instanceof _graphAction2['default'] || model instanceof _graphActionFilter2['default']) {
                            _this4.setState({ selectionModel: model.getJobsAction(), selectionType: 'filter' });
                        }
                        event.stopPropagation();
                    }
                },
                'element:selector:pointerdown': function elementSelectorPointerdown(elementView, event) {
                    var model = elementView.model;

                    if (_this.state.editMode) {
                        _this4.clearSelection();
                        model.selectSelector();
                        if (model instanceof _graphJobInput2['default']) {
                            _this4.setState({ selectionModel: job, selectionType: 'selector' });
                        } else if (model instanceof _graphAction2['default']) {
                            _this4.setState({ selectionModel: model.getJobsAction(), selectionType: 'selector' });
                        }
                        event.stopPropagation();
                    }
                },
                'element:nomove': function elementNomove(elementView, event) {
                    event.stopPropagation();
                },
                'element:pointerup': function elementPointerup(elementView, evt, x, y) {
                    var elementAbove = elementView.model;
                    var isFilter = elementAbove instanceof _graphFilter2['default'] || elementAbove instanceof _graphSelector2['default'];
                    _this.clearHighlight();
                    var coordinates = new _jointjs.g.Point(x, y);
                    var elementBelow = this.model.findModelsFromPoint(coordinates).find(function (el) {
                        return el.id !== elementAbove.id;
                    });
                    if (!elementBelow && elementAbove instanceof _graphFilter2['default']) {
                        var linkBelow = this.model.getLinks().find(function (el) {
                            return el.getBBox().containsPoint(coordinates);
                        });
                        if (linkBelow) {
                            elementBelow = linkBelow.getTargetCell();
                        }
                    }
                    if (isFilter && elementBelow) {
                        if (_this.isDroppable(elementAbove, elementBelow)) {
                            if (elementAbove instanceof _graphFilter2['default']) {
                                if (elementBelow instanceof _graphJobInput2['default']) {
                                    onDropFilter(job, elementAbove.getFilter(), 'filter', elementAbove.getFilterType());
                                    _this.clearSelection(function () {
                                        _this.setState({ selectionModel: job, selectionType: 'filter' });
                                    });
                                } else if (elementBelow instanceof _graphAction2['default'] || elementBelow instanceof _graphActionFilter2['default']) {
                                    onDropFilter(elementBelow.getJobsAction(), elementAbove.getFilter(), 'filter', elementAbove.getFilterType());
                                    _this.clearSelection(function () {
                                        _this.setState({ selectionModel: elementBelow.getJobsAction(), selectionType: 'filter' });
                                    });
                                }
                                elementBelow.selectFilter();
                            } else {
                                if (elementBelow instanceof _graphJobInput2['default']) {
                                    onDropFilter(job, elementAbove.getSelector(), 'selector', elementAbove.getSelectorType());
                                    _this.clearSelection(function () {
                                        _this.setState({ selectionModel: job, selectionType: 'selector' });
                                    });
                                } else if (elementBelow instanceof _graphAction2['default']) {
                                    onDropFilter(elementBelow.getJobsAction(), elementAbove.getSelector(), 'selector', elementAbove.getSelectorType());
                                    _this.clearSelection(function () {
                                        _this.setState({ selectionModel: elementBelow.getJobsAction(), selectionType: 'selector' });
                                    });
                                }
                                elementBelow.selectSelector();
                            }

                            elementAbove.remove();
                            return;
                        } else {
                            _this.clearHighlight();
                        }
                    }
                    if (isFilter && elementAbove.isTemplate) {
                        elementAbove.remove();
                    }
                },
                'element:pointermove': function elementPointermove(elementView, evt, x, y) {
                    var elementAbove = elementView.model;
                    var isFilter = elementAbove instanceof _graphFilter2['default'] || elementAbove instanceof _graphSelector2['default'];
                    _this.clearHighlight();
                    var coordinates = new _jointjs.g.Point(x, y);
                    var elementBelow = this.model.findModelsFromPoint(coordinates).find(function (el) {
                        return el.id !== elementAbove.id;
                    });
                    // If the two elements are connected already, don't
                    // connect them again (this is application-specific though).
                    if (elementBelow && _this.isDroppable(elementAbove, elementBelow)) {
                        elementBelow.findView(this).highlight();
                    } else if (elementAbove instanceof _graphFilter2['default']) {
                        // Filters can be dropped on links ? => use link.getTargetCell() as drop target
                        var linkBelow = this.model.getLinks().find(function (el) {
                            return el.getBBox().containsPoint(coordinates);
                        });
                        if (linkBelow && linkBelow.getTargetCell() instanceof _graphAction2['default'] && _this.isDroppable(elementAbove, linkBelow.getTargetCell())) {
                            linkBelow.findView(this).highlight();
                        }
                    }
                },
                'link:connect': function linkConnect(linkView, event) {
                    linkView.addTools(new _jointjs.dia.ToolsView({ tools: [removeLinkTool()] }));
                    linkView.model.attr((0, _graphConfigs.linkAttr)(JobGraph.jobInputCreatesData(job)));
                    linkView.model.attr('.link-tool/display', 'none');
                    linkView.model.router('manhattan');
                    linkView.model.connector('rounded');
                    onAttachModel(linkView);
                },
                'link:disconnect': function linkDisconnect(linkView, event, elementView) {
                    //console.log('disconnect => remove linkView from original', elementView);
                    onDetachModel(linkView, null, elementView);
                },
                'link:remove': removeLinkTool,
                'button:create-action': function buttonCreateAction(elView, evt) {
                    evt.stopPropagation();
                    _this4.clearSelection();
                    _this4.setState({ createNewAction: true });
                },
                'button:reflow': function buttonReflow(elView, evt) {
                    evt.stopPropagation();
                    requireLayout();
                }
            });
            requireLayout();
        }
    }, {
        key: 'isDroppable',
        value: function isDroppable(elementAbove, elementBelow) {
            if (elementAbove instanceof _graphAction2['default']) {
                return false;
            }
            if (elementAbove instanceof _graphFilter2['default'] && elementBelow instanceof _graphActionFilter2['default']) {
                // Replace with parent action Action model
                elementBelow = elementBelow.getJobsAction().model;
            }
            if (!(elementBelow instanceof _graphJobInput2['default'] || elementBelow instanceof _graphAction2['default'])) {
                return false;
            }
            var job = this.state.job;

            var dropFromType = elementAbove instanceof _graphFilter2['default'] ? "filter" : "selector";
            var dropOn = elementBelow instanceof _graphJobInput2['default'] ? "job" : "action";
            var dropFromProto = elementAbove instanceof _graphFilter2['default'] ? elementAbove.getFilter() : elementAbove.getSelector();
            var dropOnProto = elementBelow instanceof _graphAction2['default'] ? elementBelow.getJobsAction() : job;
            var keySet = _graphConfigs.AllowedKeys.target[dropOn][dropFromType].filter(function (o) {
                return dropFromProto instanceof o.type;
            });
            if (!keySet.length) {
                return false;
            }
            // Check if the targetProto already has a similar key
            var targetKey = keySet[0].key;
            if (dropOnProto[targetKey]) {
                if (elementBelow.showLegend) {
                    elementBelow.showLegend('Already has ' + targetKey);
                }
                return false;
            }
            // Finally do not add filters on non-event based JobInput
            if (dropFromType === 'filter' && dropOn === 'job' && job.EventNames === undefined) {
                if (elementBelow.showLegend) {
                    elementBelow.showLegend('Cannot add filter on non event-based trigger');
                }
                return false;
            }
            return true;
        }
    }, {
        key: 'deleteAction',
        value: function deleteAction() {
            var _state5 = this.state;
            var selectionModel = _state5.selectionModel;
            var paper = _state5.paper;
            var graph = _state5.graph;
            var onRemoveModel = _state5.onRemoveModel;

            var parentModel = undefined,
                removeFilter = undefined;
            graph.getConnectedLinks(selectionModel).forEach(function (link) {
                var linkView = link.findView(paper);
                if (linkView.targetView.model === selectionModel) {
                    parentModel = linkView.sourceView.model;
                }
            });
            if (parentModel instanceof _graphActionFilter2['default']) {
                // Step up one level
                if (!window.confirm('This will also remove the filters on the left of this action, are you sure you want to do this?')) {
                    return;
                }
                removeFilter = parentModel;
                graph.getConnectedLinks(parentModel).forEach(function (link) {
                    var linkView = link.findView(paper);
                    if (linkView.targetView.model === parentModel) {
                        parentModel = linkView.sourceView.model;
                    }
                });
            } else if (!window.confirm('Do you want to delete this action?')) {
                return;
            }
            onRemoveModel(selectionModel, parentModel, removeFilter);
            this.clearSelection();
        }
    }, {
        key: 'toggleEdit',
        value: function toggleEdit() {
            var _state6 = this.state;
            var onToggleEdit = _state6.onToggleEdit;
            var editMode = _state6.editMode;
            var dirty = _state6.dirty;

            if (editMode && dirty) {
                if (!confirm('There are unsaved changes, are you sure you want to close?')) {
                    return;
                }
            }
            this.clearSelection();
            onToggleEdit(!editMode);
        }
    }, {
        key: 'revertAction',
        value: function revertAction() {
            var _state7 = this.state;
            var onRevert = _state7.onRevert;
            var original = _state7.original;

            this.clearSelection();
            onRevert(original);
        }
    }, {
        key: 'cleanJsonActions',
        value: function cleanJsonActions(actions) {
            var _this5 = this;

            actions.forEach(function (a) {
                if (a.model) {
                    delete a.model;
                }
                if (a.ChainedActions) {
                    _this5.cleanJsonActions(a.ChainedActions);
                }
                if (a.FailedFilterActions) {
                    _this5.cleanJsonActions(a.FailedFilterActions);
                }
            });
        }
    }, {
        key: 'computeJSON',
        value: function computeJSON() {
            var _state8 = this.state;
            var jsonJob = _state8.jsonJob;
            var job = _state8.job;

            var j = jsonJob ? jsonJob : job;
            var cleanJsonStruct = JSON.parse(JSON.stringify(j));
            delete cleanJsonStruct['Tasks'];
            delete cleanJsonStruct['model'];
            if (cleanJsonStruct.Actions) {
                this.cleanJsonActions(cleanJsonStruct.Actions);
            }
            return JSON.stringify(cleanJsonStruct, null, 2);
        }
    }, {
        key: 'updateJSON',
        value: function updateJSON(newValue) {
            var job = this.state.job;

            var valid = undefined;
            try {
                var j = JSON.parse(newValue);
                if (j) {
                    valid = _pydioHttpRestApi.JobsJob.constructFromObject(j);
                }
                valid.ID = job.ID; // Keep ID
            } catch (e) {}
            if (valid) {
                this.setState({ jsonJob: valid, jsonJobInvalid: false });
            } else {
                this.setState({ jsonJobInvalid: true });
            }
        }
    }, {
        key: 'saveJSON',
        value: function saveJSON() {
            var _state9 = this.state;
            var jsonJob = _state9.jsonJob;
            var onSave = _state9.onSave;

            onSave(jsonJob, this.props.onJsonSave);
        }
    }, {
        key: 'saveAsTemplate',
        value: function saveAsTemplate() {
            var job = this.state.job;

            var tpl = _pydioHttpRestApi.JobsJob.constructFromObject(JSON.parse(JSON.stringify(job)));
            tpl.ID = (0, _uuid42['default'])();
            tpl.Tasks = [];
            _graphTplManager2['default'].getInstance().saveJob(tpl).then(function () {
                _pydio2['default'].getInstance().UI.displayMessage('SUCCESS', 'Successfully saved job as template');
            })['catch'](function (e) {
                _pydio2['default'].getInstance().UI.displayMessage('ERROR', 'Could not save template: ' + e.message);
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            var selBlock = undefined;
            var _props = this.props;
            var jobsEditable = _props.jobsEditable;
            var create = _props.create;
            var adminStyles = _props.adminStyles;
            var _state10 = this.state;
            var onEmptyModel = _state10.onEmptyModel;
            var editMode = _state10.editMode;
            var bbox = _state10.bbox;
            var selectionType = _state10.selectionType;
            var descriptions = _state10.descriptions;
            var selectionModel = _state10.selectionModel;
            var onTriggerChange = _state10.onTriggerChange;
            var onLabelChange = _state10.onLabelChange;
            var onJobPropertyChange = _state10.onJobPropertyChange;
            var createNewAction = _state10.createNewAction;
            var createNewFilter = _state10.createNewFilter;
            var onToggleFilterAsCondition = _state10.onToggleFilterAsCondition;
            var onRemoveFilter = _state10.onRemoveFilter;
            var dirty = _state10.dirty;
            var onSetDirty = _state10.onSetDirty;
            var onRevert = _state10.onRevert;
            var onSave = _state10.onSave;
            var original = _state10.original;
            var job = _state10.job;
            var showTemplateDialog = _state10.showTemplateDialog;
            var showJsonDialog = _state10.showJsonDialog;
            var jsonJobInvalid = _state10.jsonJobInvalid;
            var requireLayout = _state10.requireLayout;
            var showParameters = _state10.showParameters;

            var fPanelWidthOffset = this.state.fPanelWidthOffset || 0;

            var blockProps = { onDismiss: function onDismiss() {
                    _this6.clearSelection();
                } };
            var rightWidth = 300;
            var showOffsetButton = undefined;
            if (!createNewAction && selectionModel) {
                if (selectionType === 'action') {
                    (function () {
                        showOffsetButton = true;
                        var action = selectionModel.getJobsAction();
                        selBlock = _react2['default'].createElement(_builderFormPanel2['default'], _extends({
                            actions: descriptions,
                            actionInfo: descriptions[action.ID],
                            action: action }, blockProps, {
                            onRemove: function () {
                                _this6.deleteAction();
                            },
                            onChange: function (newAction) {
                                action.Parameters = newAction.Parameters;
                                action.Label = newAction.Label;
                                action.Description = newAction.Description;
                                selectionModel.notifyJobModel(action);
                                onSetDirty(true);
                            }
                        }));
                    })();
                } else if (selectionType === 'selector' || selectionType === 'filter') {
                    rightWidth = 600;
                    var filtersProps = _extends({
                        type: selectionType
                    }, blockProps, {
                        onRemoveFilter: onRemoveFilter,
                        onSave: function onSave() {
                            onSetDirty(true);
                        }
                    });
                    if (selectionModel instanceof _pydioHttpRestApi.JobsJob) {
                        filtersProps.job = selectionModel;
                    } else {
                        filtersProps.action = selectionModel;
                        if (selectionType === 'filter') {
                            filtersProps.onToggleFilterAsCondition = onToggleFilterAsCondition;
                        }
                    }
                    selBlock = _react2['default'].createElement(_builderFilters2['default'], filtersProps);
                } else if (selectionType === 'trigger') {
                    var _job = this.state.job;

                    selBlock = _react2['default'].createElement(_builderTriggers.Triggers, _extends({ job: _job }, blockProps, { onChange: onTriggerChange }));
                }
            }

            var st = {
                header: {
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: editMode ? '#424242' : adminStyles.body.block.header.backgroundColor,
                    height: 48,
                    color: editMode ? '#eeeeee' : adminStyles.body.block.header.color,
                    borderBottom: '1px solid ' + adminStyles.body.lineColor,
                    fontSize: 12,
                    fontWeight: 500,
                    paddingRight: 12
                },
                icon: {
                    color: editMode ? '#eeeeee' : '#9e9e9e'
                },
                disabled: {
                    color: 'rgba(255,255,255,0.3)'
                }
            };

            var header = _react2['default'].createElement(
                'span',
                { style: { flex: 1, padding: '14px 24px' } },
                'Job Workflow'
            );
            var footer = undefined,
                actionBar = undefined;
            if (jobsEditable && editMode) {
                header = _react2['default'].createElement(
                    'span',
                    { style: { flex: 1, padding: '0 6px' } },
                    _react2['default'].createElement(ModernTextField, { fullWidth: true, style: { maxWidth: 500 }, value: job.Label, onChange: function (e, v) {
                            onLabelChange(v);
                        }, inputStyle: { color: 'white' } })
                );
                footer = _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', backgroundColor: 'rgb(251, 251, 252)', borderTop: '1px solid rgb(236, 239, 241)' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', alignItems: 'center', padding: '0 16px' } },
                        'Max. Parallel Tasks : ',
                        _react2['default'].createElement(ModernTextField, { style: { width: 60 }, value: job.MaxConcurrency, onChange: function (e, v) {
                                onJobPropertyChange('MaxConcurrency', parseInt(v));
                            }, type: "number" })
                    ),
                    _react2['default'].createElement(_materialUi.Checkbox, { style: { width: 200 }, checked: job.AutoStart, onCheck: function (e, v) {
                            onJobPropertyChange('AutoStart', v);
                        }, label: "Run-On-Save" }),
                    _react2['default'].createElement('span', { style: { flex: 1 } }),
                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-book-plus", iconStyle: { color: 'rgba(0,0,0,.43)' }, onTouchTap: function () {
                            _this6.setState({ showTemplateDialog: true });
                        }, tooltip: "Save job as template", tooltipPosition: "top-left" }),
                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-json", iconStyle: { color: 'rgba(0,0,0,.43)' }, onTouchTap: function () {
                            _this6.setState({ showJsonDialog: true });
                        }, tooltip: "Import/Export JSON", tooltipPosition: "top-left" })
                );

                actionBar = _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', backgroundColor: 'rgb(251, 251, 252)', borderBottom: '1px solid rgb(236, 239, 241)', padding: 5 } },
                    _react2['default'].createElement(_materialUi.FlatButton, { label: "Action", primary: true, onTouchTap: function () {
                            return _this6.setState({ createNewAction: true });
                        }, icon: _react2['default'].createElement(_materialUi.FontIcon, { style: { fontSize: 16 }, className: "mdi mdi-chip" }) }),
                    _react2['default'].createElement(_materialUi.FlatButton, { label: "Filter", primary: true, onTouchTap: function () {
                            return _this6.setState({ createNewFilter: 'filter' });
                        }, icon: _react2['default'].createElement(_materialUi.FontIcon, { style: { fontSize: 16 }, className: "mdi mdi-filter-outline" }) }),
                    _react2['default'].createElement(_materialUi.FlatButton, { label: "Selector", primary: true, onTouchTap: function () {
                            return _this6.setState({ createNewFilter: 'selector' });
                        }, icon: _react2['default'].createElement(_materialUi.FontIcon, { style: { fontSize: 16 }, className: "mdi mdi-magnify" }) }),
                    _react2['default'].createElement('span', { style: { display: 'block', height: 30, width: 1, backgroundColor: '#E0E0E0' } }),
                    _react2['default'].createElement(_materialUi.FlatButton, { label: "Parameters", secondary: !!showParameters, onTouchTap: function () {
                            return _this6.setState({ showParameters: !showParameters });
                        }, icon: _react2['default'].createElement(_materialUi.FontIcon, { style: { fontSize: 16 }, className: "mdi mdi-chevron-" + (showParameters ? 'up' : 'down') }) }),
                    _react2['default'].createElement(_materialUi.FlatButton, { label: "Reflow", 'default': true, onTouchTap: function () {
                            requireLayout();
                        } })
                );
            }

            return _react2['default'].createElement(
                _materialUi.Paper,
                adminStyles.body.block.props,
                _react2['default'].createElement(_CreateActions2['default'], {
                    open: createNewAction,
                    descriptions: descriptions,
                    onSubmit: function (newAction) {
                        onEmptyModel(new _graphAction2['default'](descriptions, newAction, true));
                        _this6.setState({ createNewAction: false });
                    },
                    onDismiss: function () {
                        _this6.setState({ createNewAction: false });
                    }
                }),
                _react2['default'].createElement(_CreateFilters2['default'], {
                    open: createNewFilter,
                    selectors: createNewFilter === 'selector',
                    onSubmit: function (newData, newType) {
                        var emptyModel = undefined;
                        if (createNewFilter === 'selector') {
                            emptyModel = new _graphSelector2['default'](newData, newType);
                        } else {
                            emptyModel = new _graphFilter2['default'](newData, newType);
                        }
                        emptyModel.isTemplate = true;
                        onEmptyModel(emptyModel);
                        _this6.setState({ createNewFilter: '' });
                    },
                    onDismiss: function () {
                        _this6.setState({ createNewFilter: '' });
                    }
                }),
                showTemplateDialog && _react2['default'].createElement(_builderTemplateDialog2['default'], {
                    type: "job",
                    data: job,
                    defaultLabel: job.Label,
                    onDismiss: function () {
                        _this6.setState({ showTemplateDialog: false });
                    },
                    actionsDescriptions: descriptions
                }),
                _react2['default'].createElement(
                    _materialUi.Dialog,
                    {
                        title: "Import/Export JSON",
                        onRequestClose: function () {
                            _this6.setState({ showJsonDialog: false });
                        },
                        open: showJsonDialog,
                        autoDetectWindowHeight: true,
                        autoScrollBodyContent: true,
                        actions: [_react2['default'].createElement(_materialUi.FlatButton, { onTouchTap: function () {
                                _this6.setState({ showJsonDialog: false });
                            }, label: "Cancel" }), _react2['default'].createElement(_materialUi.FlatButton, { primary: true, onTouchTap: function () {
                                _this6.saveJSON();
                            }, disabled: jsonJobInvalid, label: "Save" })]
                    },
                    _react2['default'].createElement(
                        'div',
                        null,
                        showJsonDialog && _react2['default'].createElement(AdminComponents.CodeMirrorField, {
                            value: this.computeJSON(),
                            onChange: function (e, v) {
                                _this6.updateJSON(v);
                            },
                            mode: "json"
                        })
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: st.header },
                    header,
                    jobsEditable && dirty && _react2['default'].createElement(_materialUi.IconButton, { onTouchTap: function () {
                            _this6.revertAction();
                        }, tooltip: 'Revert', iconClassName: "mdi mdi-undo", iconStyle: st.icon }),
                    jobsEditable && dirty && _react2['default'].createElement(_materialUi.IconButton, { onTouchTap: function () {
                            onSave(job, _this6.props.onJobSave);
                        }, tooltip: 'Save', iconClassName: "mdi mdi-content-save", iconStyle: st.icon }),
                    jobsEditable && _react2['default'].createElement(_materialUi.IconButton, { onTouchTap: function () {
                            _this6.toggleEdit();
                        }, tooltip: editMode ? 'Close' : 'Edit', iconClassName: editMode ? "mdi mdi-close" : "mdi mdi-pencil", iconStyle: st.icon })
                ),
                actionBar,
                editMode && showParameters && _react2['default'].createElement(_JobParameters2['default'], { parameters: job.Parameters, onChange: function (v) {
                        onJobPropertyChange('Parameters', v);
                    } }),
                _react2['default'].createElement(
                    'div',
                    { style: { position: 'relative', display: 'flex', minHeight: editMode ? editWindowHeight : null }, ref: "boundingBox" },
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1, overflowX: 'auto' }, ref: 'scroller' },
                        _react2['default'].createElement('div', { id: 'playground', ref: 'placeholder' })
                    ),
                    _react2['default'].createElement(
                        _materialUi.Paper,
                        { zDepth: 0, style: { width: selBlock ? rightWidth + fPanelWidthOffset : 0, height: bbox ? bbox.height : editWindowHeight, position: 'relative' } },
                        selBlock,
                        showOffsetButton && fPanelWidthOffset === 0 && _react2['default'].createElement('span', { className: "mdi mdi-chevron-left right-panel-expand-button", onClick: function () {
                                _this6.setState({ fPanelWidthOffset: 300 });
                            } }),
                        showOffsetButton && fPanelWidthOffset === 300 && _react2['default'].createElement('span', { className: "mdi mdi-chevron-right right-panel-expand-button", onClick: function () {
                                _this6.setState({ fPanelWidthOffset: 0 });
                            } })
                    )
                ),
                footer,
                (0, _builderStyles.getCssStyle)(editMode)
            );
        }
    }], [{
        key: 'jobInputCreatesData',
        value: function jobInputCreatesData(job) {
            return job.EventNames !== undefined || !!job.IdmSelector || !!job.NodesSelector || !!job.UsersSelector;
        }
    }]);

    return JobGraph;
})(_react2['default'].Component);

exports['default'] = JobGraph;
module.exports = exports['default'];
