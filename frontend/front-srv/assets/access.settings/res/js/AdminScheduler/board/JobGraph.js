
import React from 'react'
import ReactDOM from 'react-dom'
import PydioApi from 'pydio/http/api'
import {JobsJob, ConfigServiceApi, RestConfiguration, JobsAction} from 'pydio/http/rest-api'
import {linkTools, dia, layout, shapes, g} from 'jointjs'
import JobInput from './graph/JobInput'
import Filter from "./graph/Filter";
import Link from "./graph/Link";
import Action from "./graph/Action";
import {ClusterConfig, Orange} from "./graph/Configs";
import dagre from 'dagre'
import graphlib from 'graphlib'
import Selector from "./graph/Selector";
import {Paper, FlatButton} from 'material-ui'
import FormPanel from "./builder/FormPanel";
import QueryBuilder from "./builder/QueryBuilder";
import {Events, Schedule} from "./builder/Triggers";
import {createStore} from 'redux'
import allReducers from './reducers'
import {
    attachModelAction,
    bindPaperAction,
    emptyModelAction, detachModelAction, removeModelAction,
    resizePaperAction,
    toggleEditAction, JOB_ACTION_EMPTY
} from "./actions/editor";
import { devToolsEnhancer } from 'redux-devtools-extension';
import Filters from "./builder/Filters";


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
`;

const mapStateToProps = state => {
    console.log(state);
    return {...state}
};

const mapDispatchToProps = dispatch => {
    return {
        onToggleEdit : (on = true) => {
            dispatch(toggleEditAction(on));
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
    }

    loadDescriptions() {
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        api.schedulerActionsDiscovery().then(data => {
            // Draw now!
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
            /*
            const filter = action.NodesFilter || action.IdmFilter || action.UsersFilter;
            const selector = action.NodesSelector || action.IdmSelector || action.UsersSelector;
            if (filter || selector) {
                let filterShape;
                if(filter){
                    filterShape = new Filter(filter, action.NodesFilter?'node':(action.UsersFilter?'user':'idm'));
                } else {
                    filterShape = new Selector(selector, action.NodesSelector?'node':(action.UsersSelector?'user':'idm'));
                }
                filterShape.addTo(graph);
                const link = new Link(crtInput, 'output', filterShape.id, 'input', hasData);
                link.addTo(graph);
                crtInput = filterShape.id;
                hasData = true;
            }
            */
            const shape = new Action(descriptions, action, hasChain);
            shape.addTo(graph);
            const link = new Link(crtInput, 'output', shape.id, 'input', hasData);
            link.addTo(graph);
            if (hasChain) {
                this.chainActions(graph, action.ChainedActions, shape.id);
            }
        });

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
        let firstLinkHasData = !!job.EventNames;

        /*
        if (job.NodeEventFilter || job.UserEventFilter || job.IdmFilter) {

            let filterType;
            if(job.NodeEventFilter){
                filterType = 'node';
            } else if (job.UserEventFilter) {
                filterType = 'user';
            } else {
                filterType = 'idm';
            }
            const filter = new Filter(job.NodeEventFilter || job.UserEventFilter || job.IdmFilter, filterType);
            filter.addTo(graph);

            const fLink = new Link(actionsInput, 'output', filter.id, 'input', firstLinkHasData);
            fLink.addTo(graph);

            firstLinkHasData = true;
            actionsInput = filter.id;
        }
        */

        this.chainActions(graph, job.Actions, actionsInput, firstLinkHasData);
    }

    reLayout(){
        const {graph, onPaperResize} = this.state;
        // Relayout graph and return bounding box
        const bbox = layout.DirectedGraph.layout(graph, {
            nodeSep: 30,
            edgeSep: 30,
            rankSep: 80,
            rankDir: "LR",
            marginX: 40,
            marginY: 40,
            clusterPadding: 20,
            dagre,
            graphlib
        });
        bbox.width += 80;
        bbox.height+= 80;
        onPaperResize(bbox.width, bbox.height);
    }

    clearSelection(){
        const {graph} = this.state;
        graph.getCells().filter(c => c.clearSelection).forEach(c => c.clearSelection());
        this.setState({
            selection: null,
            selectionType: null,
            selectionModel: null
        });
    }

    select(model){
        const s = {
            selectionModel: model,
            scrollLeft: ReactDOM.findDOMNode(this.refs.scroller).scrollLeft || 0
        };
        if (model instanceof Action) {
            s.selection = model.getJobsAction();
            s.selectionType = 'action';
        } else if (model instanceof Selector) {
            s.selection = model.getSelector();
            s.selectionType = 'selector'
        } else if (model instanceof Filter) {
            s.selection = model.getFilter();
            s.selectionType = 'filter'
        } else if( model instanceof JobInput && model.getInputType() === 'event') {
            s.selection = model.getEventNames();
            s.selectionType = 'events';
        } else if( model instanceof JobInput && model.getInputType() === 'schedule') {
            s.selection = model.getSchedule();
            s.selectionType = 'schedule';
        }
//        model.attr('rect/stroke', Orange);
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
        const {graph, job, onPaperBind, onAttachModel, onDetachModel, editMode} = this.state;
        const _this = this;
        onPaperBind(ReactDOM.findDOMNode(this.refs.placeholder), graph, {
            'element:pointerdown': (elementView, event) => {
                event.data = elementView.model.position();
                if(_this.state.editMode){
                    const {model} = elementView;
                    if(model instanceof Action || model instanceof Selector || model instanceof Filter || model instanceof JobInput) {
                        this.clearSelection();
                        model.select();
                        this.select(model);
                    }
                }
            },
            'element:filter:pointerdown': (elementView, event) => {
                if(_this.state.editMode){
                    this.clearSelection();
                    elementView.model.selectFilter();
                    if(elementView.model instanceof JobInput){
                        this.setState({selectionModel: job, selectionType:'filter'})
                    } else if(elementView.model instanceof Action){
                        this.setState({selectionModel: elementView.model.getJobsAction(), selectionType:'filter'})
                    }
                    event.stopPropagation();
                }
            },
            'element:selector:pointerdown': (elementView, event) => {
                if(_this.state.editMode){
                    this.clearSelection();
                    elementView.model.selectSelector();
                    if(elementView.model instanceof JobInput){
                        this.setState({selectionModel: job, selectionType:'selector'})
                    } else if(elementView.model instanceof Action){
                        this.setState({selectionModel: elementView.model.getJobsAction(), selectionType:'selector'})
                    }
                    event.stopPropagation();
                }
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
                            elementBelow.setFilter(true);
                        } else {
                            elementBelow.setSelector(true);
                        }
                        elementAbove.remove();
                    }
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
                //console.log('connect => link', linkView);
                linkView.addTools(new dia.ToolsView({tools:[removeLinkTool()]}));
                onAttachModel(linkView);
            },
            'link:disconnect':(linkView, event, elementView) => {
                //console.log('disconnect => remove linkView from original', elementView);
                onDetachModel(linkView, null, elementView);
            },
            'link:remove' : removeLinkTool
        });
        this.reLayout();
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
        const {selection, selectionType, descriptions, selectionModel, scrollLeft, createNewAction} = this.state;
        // Redux store stuff - should be on props!
        const {onToggleEdit, onEmptyModel, editMode} = this.state;

        let blockProps = {onDismiss: ()=>{this.clearSelection()}};
        if(createNewAction) {
            selBlock = <FormPanel
                actions={descriptions}
                action={JobsAction.constructFromObject({ID:JOB_ACTION_EMPTY})}
                onChange={(newAction) => {
                    onEmptyModel(new Action(descriptions, newAction));
                }}
                onDismiss={()=>{this.setState({createNewAction: false})}}
            />
        } else if(selectionModel){
            if(selectionType === 'action'){
                selBlock = <FormPanel
                    actions={descriptions}
                    actionInfo={descriptions[selection.ID]}
                    action={selection} {...blockProps}
                    onChange={(newAction) => console.log(newAction)}
                />
            } else if(selectionType === 'selector' || selectionType === 'filter') {
                if(selectionModel instanceof JobsJob){
                    selBlock =  <Filters job={selectionModel} type={selectionType} {...blockProps} />
                } else {
                    selBlock = <Filters action={selectionModel} type={selectionType} {...blockProps}/>
                }
            } else if(selectionType === 'events') {
                selBlock = <Events events={selection} {...blockProps}/>
            } else if(selectionType === 'schedule') {
                selBlock = <Schedule schedule={selection} {...blockProps}/>
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
                    {editMode && <FlatButton disabled={!selection || selectionModel instanceof JobInput} onTouchTap={()=> {this.deleteButton()}} label={"Remove"}/>}
                    {editMode && <FlatButton onTouchTap={()=> {this.setState({createNewAction: true})}} label={"+ Action"}/>}
                    {editMode && <FlatButton onTouchTap={()=> {onEmptyModel(Filter.createEmptyNodesFilter())}} label={"+ Filter"}/>}
                    {editMode && <FlatButton onTouchTap={()=> {onEmptyModel(new Selector({}, 'node'));}} label={"+ Selector"}/>}
                    {editMode && <FlatButton onTouchTap={()=> {this.reLayout()}} label={"Layout"}/>}
                    <FlatButton onTouchTap={()=> onToggleEdit(!editMode)} label={editMode?'Close':'Edit'}/>
                </div>
                <div style={{position:'relative', display:'flex', minHeight:editMode?400:null}}>
                    <div style={{flex: 1, overflowX: 'auto'}} ref="scroller">
                        <div id="playground" ref="placeholder"></div>
                    </div>
                    <Paper zDepth={0} style={{width: selBlock?300:0}}>
                        {selBlock}
                    </Paper>
                </div>
                <style type={"text/css"} dangerouslySetInnerHTML={{__html:style}}></style>
            </Paper>
        );
    }

}

//JobGraph = connect(mapStateToProps, mapDispatchToProps)(JobGraph);

export default JobGraph