
import React from 'react'
import ReactDOM from 'react-dom'
import PydioApi from 'pydio/http/api'
import DOMUtils from 'pydio/util/dom'
import {JobsJob, ConfigServiceApi, RestConfiguration, JobsAction} from 'pydio/http/rest-api'
import {linkTools, dia, layout, g} from 'jointjs'
import JobInput from './graph/JobInput'
import Filter from "./graph/Filter";
import Link from "./graph/Link";
import Action from "./graph/Action";
import dagre from 'dagre'
import graphlib from 'graphlib'
import Selector from "./graph/Selector";
import {Paper, FlatButton} from 'material-ui'
import FormPanel from "./builder/FormPanel";
import {Triggers} from "./builder/Triggers";
import {createStore} from 'redux'
import allReducers from './reducers'
import {
    attachModelAction,
    bindPaperAction,
    emptyModelAction,
    detachModelAction,
    removeModelAction,
    resizePaperAction,
    toggleEditAction,
    JOB_ACTION_EMPTY,
    dropFilterAction,
    removeFilterAction,
    changeTriggerAction,
    clearSelectionAction,
    setSelectionAction
} from "./actions/editor";
import { devToolsEnhancer } from 'redux-devtools-extension';
import Filters from "./builder/Filters";
import Templates from "./graph/Templates";
import {linkAttr} from "./graph/Configs";


const style = `
text[joint-selector="icon"] tspan, text[joint-selector="filter-icon"] tspan , text[joint-selector="selector-icon"] tspan {
    font: normal normal normal 24px/1 "Material Design Icons";
    font-size: 24px;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
}
text[joint-selector="filter-icon"] tspan, text[joint-selector="selector-icon"] tspan{
    font-size: 18px;
}
.react-mui-context .pydio-form-panel{
    padding-bottom: 0;
}
.react-mui-context .pydio-form-panel .form-legend{
    display:none;
}
.react-mui-context .pydio-form-panel>.pydio-form-group{
    margin: 12px;
}
`;

const readonlyStyle = `
path.marker-arrowhead {
    opacity: 0 !important;
}
.joint-element, .marker-arrowheads, [magnet=true]:not(.joint-element){
    cursor: default;
}
`;

const mapStateToProps = state => {
    console.log(state);
    return {...state}
};

const mapDispatchToProps = dispatch => {
    return {
        onToggleEdit : (on = true, layout = () =>{}) => {
            dispatch(toggleEditAction(on, layout));
        },
        onPaperBind : (element, graph, events) => {
            dispatch(bindPaperAction(element, graph, events));
        },
        onPaperResize : (width, height) => {
            dispatch(resizePaperAction(width, height))
        },
        onEmptyModel: (model) => {
            dispatch(emptyModelAction(model))
        },
        onAttachModel : ( link ) => {
            dispatch(attachModelAction(link));
        },
        onDetachModel : ( linkView, toolView, originalTarget ) => {
            dispatch(detachModelAction(linkView, toolView, originalTarget ));
        },
        onRemoveModel : (model, parentModel) => {
            dispatch(removeModelAction(model, parentModel));
        },
        onDropFilter : (target, dropped, filterOrSelector, objectType) => {
            dispatch(dropFilterAction(target, dropped, filterOrSelector, objectType))
        },
        onRemoveFilter : (target, filter, filterOrSelector, objectType) => {
            dispatch(removeFilterAction(target, filter, filterOrSelector, objectType))
        },
        onTriggerChange : (triggerType, triggerData) => {
            dispatch(changeTriggerAction(triggerType, triggerData));
        },
        onSelectionClear : () => {
            dispatch(clearSelectionAction())
        },
        onSelectionSet : (type, model) => {
            dispatch(setSelectionAction(type, model))
        }
    }
};

function storeStateToState(store){
    return {...mapStateToProps(store.getState()), ...mapDispatchToProps(store.dispatch)}
}


class JobGraph extends React.Component {

    constructor(props){
        super(props);
        this.store = createStore(allReducers, {job: props.job});
        this.state = storeStateToState(this.store);
        this.store.subscribe(() => {
            this.setState(storeStateToState(this.store));
        });
    }

    componentDidMount(){
        this.loadDescriptions();
        this.boundingRef = ReactDOM.findDOMNode(this.refs.boundingBox);
        this._resizer = ()=> {
            const {editMode, paper} = this.state;
            if(editMode && this.boundingRef){
                const graphWidth = paper.model.getBBox().width + 80;
                const paperHeight = paper.getArea().height;
                const maxWidth = this.boundingRef.clientWidth;
                paper.setDimensions(Math.max(graphWidth, maxWidth), paperHeight);
            }
        };
        DOMUtils.observeWindowResize(this._resizer)
    }

    componentWillUnmount(){
        DOMUtils.stopObservingWindowResize(this._resizer);
    }

    shouldComponentUpdate(nextProps, nextState){
        if(nextProps.random !== this.props.random){
            return false;
        }
        return true;
    }

    loadDescriptions() {
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        api.schedulerActionsDiscovery().then(data => {
            this.setState({descriptions: data.Actions}, () => {
                this.graphFromJob();
                this.drawGraph();
            });
        }).catch(() => {
            this.graphFromJob();
            this.drawGraph();
        })
    }

    chainActions(graph, actions, inputId, hasData = true) {
        const {descriptions} = this.state;
        actions.forEach(action => {
            let crtInput = inputId;
            const hasChain = (action.ChainedActions && action.ChainedActions.length);
            const shape = new Action(descriptions, action, hasChain);
            shape.addTo(graph);
            const link = new Link(crtInput, 'output', shape.id, 'input', hasData);
            link.addTo(graph);
            if (hasChain) {
                this.chainActions(graph, action.ChainedActions, shape.id);
            }
        });

    }

    static jobInputCreatesData(job){
        return (job.EventNames !== undefined) || !!job.IdmSelector || !!job.NodesSelector || !!job.UsersSelector;
    }

    graphFromJob(){
        const {job} = this.props;
        const {graph} = this.state;

        if(!job || !job.Actions || !job.Actions.length){
            return;
        }

        const shapeIn = new JobInput(job);
        shapeIn.addTo(graph);

        let actionsInput = shapeIn.id;
        let firstLinkHasData = JobGraph.jobInputCreatesData(job);

        this.chainActions(graph, job.Actions, actionsInput, firstLinkHasData);
    }

    reLayout(editMode){
        const {graph, paper, onPaperResize} = this.state;
        // Relayout graph and return bounding box
        // Find JobInput and apply graph on this one ?
        const inputs = graph.getCells().filter(c => !c.isTemplate);
        const bbox = layout.DirectedGraph.layout(inputs, {
            nodeSep: 48,
            edgeSep: 48,
            rankSep: 128,
            rankDir: "LR",
            marginX: editMode ? 160 : 32,
            marginY: 32,
            dagre,
            graphlib
        });
        bbox.width += 80;
        bbox.height+= 80;
        if (editMode) {
            bbox.height = Math.max(500, bbox.height);
            bbox.width += 200;
            if(this.boundingRef){
                const maxWidth = this.boundingRef.clientWidth;
                bbox.width = Math.max(bbox.width, maxWidth);
            }
        }
        if(paper){
            paper.setDimensions(bbox.width, bbox.height);
        } else {
            onPaperResize(bbox.width, bbox.height);
        }
    }

    clearSelection(){
        const {graph} = this.state;
        graph.getCells().filter(c => c.clearSelection).forEach(c => c.clearSelection());
        this.setState({
            selectionType: null,
            selectionModel: null
        });
    }

    select(model){
        const s = {
            selectionModel: model,
        };
        if (model instanceof Action) {
            s.createNewAction = false;
            s.selectionType = 'action';
        } else if (model instanceof Selector) {
            s.selectionType = 'selector'
        } else if (model instanceof Filter) {
            s.selectionType = 'filter'
        } else if( model instanceof JobInput) {
            s.createNewAction = false;
            s.selectionType = 'trigger';
        }
        this.setState(s);
    }

    insertOutput(source, toInsert){
        const {graph} = this.state;
        const outLinks = graph.getConnectedLinks(source).filter(link => link.getSourceCell() === source);
        const link = new Link(source.id, 'output', toInsert.id, 'input', true);
        link.addTo(graph);
        outLinks.forEach(link => {
            link.source({id: toInsert.id, port:'output'});
        })
    }

    insertInput(target, toInsert){
        const {graph} = this.state;
        // retarget existing links
        graph.getConnectedLinks(target).filter(link => link.getTargetCell() === target).forEach(link => {
            link.target({id:toInsert.id, port:'input'});
        });
        const link = new Link(toInsert.id, 'output', target.id, 'input');
        link.addTo(graph);
    }

    clearHighlight(){
        const {graph, paper} = this.state;
        graph.getCells().forEach(c => {
            c.findView(paper).unhighlight();
        })
    }

    drawGraph() {

        const removeLinkTool = () => new linkTools.Remove({
            action:(evt, linkView, toolView) => {
                onDetachModel(linkView, toolView);
            }
        });
        const targetArrowHead = () => new linkTools.TargetArrowhead({focusOpacity:0.5});
        const {graph, job, onPaperBind, onAttachModel, onDetachModel, onDropFilter, editMode} = this.state;
        const _this = this;

        const templates = new Templates(graph);
        templates.addTo(graph);

        onPaperBind(ReactDOM.findDOMNode(this.refs.placeholder), graph, {
            'element:pointerdown': (elementView, event) => {
                event.data = elementView.model.position();
                const {model} = elementView;
                if(_this.state.editMode && !model.isTemplate){
                    if(model instanceof Action || model instanceof Selector || model instanceof Filter || model instanceof JobInput) {
                        this.clearSelection();
                        model.select();
                        this.select(model);
                    }
                } else if(model.isTemplate && model !== templates){
                    // Start dragging new model and duplicate
                    templates.replicate(model, graph);
                    model.toFront();
                }
            },
            'element:filter:pointerdown': (elementView, event) => {
                const {model} = elementView;
                if(_this.state.editMode){
                    this.clearSelection();
                    model.selectFilter();
                    if(model instanceof JobInput){
                        this.setState({selectionModel: job, selectionType:'filter'})
                    } else if(model instanceof Action){
                        this.setState({selectionModel: model.getJobsAction(), selectionType:'filter'})
                    }
                    event.stopPropagation();
                }
            },
            'element:selector:pointerdown': (elementView, event) => {
                const {model} = elementView;
                if(_this.state.editMode){
                    this.clearSelection();
                    model.selectSelector();
                    if(model instanceof JobInput){
                        this.setState({selectionModel: job, selectionType:'selector'})
                    } else if(model instanceof Action){
                        this.setState({selectionModel: model.getJobsAction(), selectionType:'selector'})
                    }
                    event.stopPropagation();
                }
            },
            'element:nomove':(elementView, event) => {
                event.stopPropagation();
            },
            'element:pointerup': function (elementView, evt, x, y) {
                const elementAbove = elementView.model;
                const isFilter = (elementAbove instanceof Filter || elementAbove instanceof Selector);
                _this.clearHighlight();
                const coordinates = new g.Point(x, y);
                const elementBelow = this.model.findModelsFromPoint(coordinates).find(function(el) {
                    return (el.id !== elementAbove.id);
                });
                // If the two elements are connected already, don't
                // connect them again (this is application-specific though).
                if (isFilter && elementBelow && graph.getNeighbors(elementBelow).indexOf(elementAbove) === -1) {
                    // Move the element to the position before dragging.
                    // elementAbove.position(evt.data.x, evt.data.y);
                    if(elementBelow instanceof JobInput || elementBelow instanceof Action) {
                        if(elementAbove instanceof Filter){
                            if(elementBelow instanceof JobInput){
                                onDropFilter(job, elementAbove.getFilter(), 'filter', elementAbove.getFilterType());
                                _this.setState({selectionModel: job, selectionType:'filter'});
                            } else if(elementBelow instanceof Action){
                                onDropFilter(elementBelow.getJobsAction(), elementAbove.getFilter(), 'filter', elementAbove.getFilterType());
                                _this.setState({selectionModel: elementBelow.getJobsAction(), selectionType:'filter'});
                            }
                            elementBelow.selectFilter();
                        } else {
                            if(elementBelow instanceof JobInput){
                                onDropFilter(job, elementAbove.getSelector(), 'selector', elementAbove.getSelectorType());
                                _this.setState({selectionModel: job, selectionType:'selector'});
                            } else if(elementBelow instanceof Action){
                                onDropFilter(elementBelow.getJobsAction(), elementAbove.getSelector(), 'selector', elementAbove.getSelectorType());
                                _this.setState({selectionModel: elementBelow.getJobsAction(), selectionType:'selector'});
                            }
                            elementBelow.selectSelector();
                        }

                        elementAbove.remove();
                        return;
                    }
                }
                if(isFilter && elementAbove.isTemplate){
                    elementAbove.remove();
                }
            },
            'element:pointermove': function (elementView, evt, x, y) {
                const elementAbove = elementView.model;
                const isFilter = (elementAbove instanceof Filter || elementAbove instanceof Selector);
                _this.clearHighlight();
                const coordinates = new g.Point(x, y);
                const elementBelow = this.model.findModelsFromPoint(coordinates).find((el) => {
                    return (el.id !== elementAbove.id);
                });
                // If the two elements are connected already, don't
                // connect them again (this is application-specific though).
                if (isFilter && elementBelow && graph.getNeighbors(elementBelow).indexOf(elementAbove) === -1) {
                    if(elementBelow instanceof JobInput || elementBelow instanceof Action) {
                        elementBelow.findView(this).highlight();
                    }
                }
            },
            'link:connect': (linkView, event) => {
                linkView.addTools(new dia.ToolsView({tools:[removeLinkTool()]}));
                linkView.model.attr(linkAttr(JobGraph.jobInputCreatesData(job)));
                linkView.model.attr('.link-tool/display', 'none');
                onAttachModel(linkView);
            },
            'link:disconnect':(linkView, event, elementView) => {
                //console.log('disconnect => remove linkView from original', elementView);
                onDetachModel(linkView, null, elementView);
            },
            'link:remove' : removeLinkTool
        });
        this.reLayout(editMode);
    }

    deleteButton(){
        const {selectionModel, paper, graph, onRemoveModel} = this.state;
        let parentModel;
        graph.getConnectedLinks(selectionModel).forEach(link => {
            const linkView = link.findView(paper);
            if(linkView.targetView.model === selectionModel) {
                parentModel = linkView.sourceView.model;
            }
        });
        onRemoveModel(selectionModel, parentModel);
        this.clearSelection();
    }

    render() {

        let selBlock;
        const {selectionType, descriptions, selectionModel, onTriggerChange, createNewAction, onRemoveFilter} = this.state;
        // Redux store stuff - should be on props!
        const {onToggleEdit, onEmptyModel, editMode} = this.state;

        let blockProps = {onDismiss: ()=>{this.clearSelection()}};
        let rightWidth = 300;
        if(createNewAction) {
            selBlock = <FormPanel
                actions={descriptions}
                action={JobsAction.constructFromObject({ID:JOB_ACTION_EMPTY})}
                onChange={(newAction) => {
                    onEmptyModel(new Action(descriptions, newAction, true));
                }}
                create={true}
                onDismiss={()=>{this.setState({createNewAction: false})}}
            />
        } else if(selectionModel){
            if(selectionType === 'action'){
                const action = selectionModel.getJobsAction();
                selBlock = <FormPanel
                    actions={descriptions}
                    actionInfo={descriptions[action.ID]}
                    action={action} {...blockProps}
                    onChange={(newAction) => {
                        action.Parameters = newAction.Parameters;
                        selectionModel.notifyJobModel(action);
                    }}
                />
            } else if(selectionType === 'selector' || selectionType === 'filter') {
                rightWidth = 600;
                if(selectionModel instanceof JobsJob){
                    selBlock =  <Filters job={selectionModel} type={selectionType} {...blockProps} onRemoveFilter={onRemoveFilter}/>
                } else {
                    selBlock = <Filters action={selectionModel} type={selectionType} {...blockProps} onRemoveFilter={onRemoveFilter}/>
                }
            } else if(selectionType === 'trigger') {
                const {job} = this.state;
                selBlock = <Triggers job={job} {...blockProps} onChange={onTriggerChange}/>
            }
        }

        const headerStyle = {
            display:'flex',
            alignItems:'center',
            backgroundColor: 'whitesmoke',
            borderBottom: '1px solid #e0e0e0',
            height: 48,
            color: '#9e9e9e',
            fontSize: 12,
            fontWeight: 500,
        };

        return (
            <Paper zDepth={1} style={{margin: 20}}>
                <div style={headerStyle}>
                    <span style={{flex: 1, padding: '14px 24px'}}>Job Workflow - click on boxes to show details</span>
                    {editMode && <FlatButton disabled={!selectionModel || selectionModel instanceof JobInput} onTouchTap={()=> {this.deleteButton()}} label={"Remove"}/>}
                    {editMode && <FlatButton onTouchTap={()=> {this.clearSelection(); this.setState({createNewAction: true})}} label={"+ Action"}/>}
                    {editMode && <FlatButton onTouchTap={()=> {this.reLayout(editMode)}} label={"Layout"}/>}
                    <FlatButton onTouchTap={()=> {
                        this.clearSelection();
                        onToggleEdit(!editMode, this.reLayout.bind(this))
                    }} label={editMode?'Close':'Edit'}/>
                </div>
                <div style={{position:'relative', display:'flex', minHeight:editMode?500:null}} ref={"boundingBox"}>
                    <div style={{flex: 1, overflowX: 'auto'}} ref="scroller">
                        <div id="playground" ref="placeholder"></div>
                    </div>
                    <Paper zDepth={0} style={{width: selBlock?rightWidth:0, height: 500}}>
                        {selBlock}
                    </Paper>
                </div>
                <style type={"text/css"} dangerouslySetInnerHTML={{__html:style + (editMode ? '' : readonlyStyle)}}></style>
            </Paper>
        );
    }

}

//JobGraph = connect(mapStateToProps, mapDispatchToProps)(JobGraph);

export default JobGraph