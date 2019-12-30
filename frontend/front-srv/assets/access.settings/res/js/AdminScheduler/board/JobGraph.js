
import React from 'react'
import Pydio from 'pydio'
import ReactDOM from 'react-dom'
import PydioApi from 'pydio/http/api'
import DOMUtils from 'pydio/util/dom'
import ResourcesManager from 'pydio/http/resources-manager'
import {JobsJob, ConfigServiceApi, RestConfiguration, JobsAction} from 'pydio/http/rest-api'
import {linkTools, dia, layout, g} from 'jointjs'
import JobInput from './graph/JobInput'
import Filter from "./graph/Filter";
import Link from "./graph/Link";
import Action from "./graph/Action";
import dagre from 'dagre'
import graphlib from 'graphlib'
import Selector from "./graph/Selector";
import {Paper, FlatButton, FontIcon, IconButton} from 'material-ui'
import FormPanel from "./builder/FormPanel";
import {Triggers} from "./builder/Triggers";
import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
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
    setSelectionAction, setDirtyAction, saveSuccessAction, saveErrorAction, revertAction, updateLabelAction
} from "./actions/editor";
import Filters from "./builder/Filters";
import Templates from "./graph/Templates";
import {AllowedKeys, linkAttr} from "./graph/Configs";
const {ModernTextField} = Pydio.requireLib('hoc');
import {getCssStyle} from "./builder/styles";

const mapStateToProps = state => {
    console.log(state);
    return {...state}
};

const mapDispatchToProps = dispatch => {
    return {
        onToggleEdit : (on = true, layout = () =>{}) => {
            dispatch(toggleEditAction(on, layout));
        },
        onSetDirty:(dirty = true) => {
            dispatch(setDirtyAction(dirty));
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
            dispatch((d) => {
                d(attachModelAction(link));
                d(setDirtyAction(true));
            });
        },
        onDetachModel : ( linkView, toolView, originalTarget ) => {
            dispatch((d) => {
                d(detachModelAction(linkView, toolView, originalTarget ));
                d(setDirtyAction(true));
            });
        },
        onRemoveModel : (model, parentModel) => {
            dispatch((d) => {
                d(removeModelAction(model, parentModel));
                d(setDirtyAction(true));
            });
        },
        onDropFilter : (target, dropped, filterOrSelector, objectType) => {
            dispatch((d) => {
                d(dropFilterAction(target, dropped, filterOrSelector, objectType));
                d(setDirtyAction(true));
            });
        },
        onRemoveFilter : (target, filter, filterOrSelector, objectType) => {
            dispatch((d) => {
                d(removeFilterAction(target, filter, filterOrSelector, objectType));
                d(setDirtyAction(true));
            });
        },
        onTriggerChange : (triggerType, triggerData) => {
            dispatch((d) => {
                d(changeTriggerAction(triggerType, triggerData));
                d(setDirtyAction(true));
            });
        },
        onLabelChange : (newLabel) => {
            dispatch((d) => {
                d(updateLabelAction(newLabel));
                d(setDirtyAction(true));
            });
        },
        onSelectionClear : () => {
            dispatch(clearSelectionAction())
        },
        onSelectionSet : (type, model) => {
            dispatch(setSelectionAction(type, model))
        },
        onRevert: (original, callback) => {
            dispatch((d, getState)=> {
                d(revertAction(original));
                d(setDirtyAction(false));
                const {job} = getState();
                callback(job);
            });
        },
        onSave : (job) => {
            dispatch((d) => {
                ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
                    const {SchedulerServiceApi, JobsPutJobRequest} = sdk;
                    const api = new SchedulerServiceApi(PydioApi.getRestClient());
                    const req = new JobsPutJobRequest();
                    // Clone and remove tasks
                    req.Job = JobsJob.constructFromObject(JSON.parse(JSON.stringify(job)));
                    if(req.Job.Tasks !== undefined){
                        delete req.Job.Tasks;
                    }
                    return api.putJob(req);
                }).then(() => {
                    d(saveSuccessAction(job));
                }).catch(e => {
                    d(saveErrorAction(job));
                });
            });
        },
    }
};

function storeStateToState(store){
    return {...mapStateToProps(store.getState()), ...mapDispatchToProps(store.dispatch)}
}


class JobGraph extends React.Component {

    constructor(props){
        super(props);
        const job = JobsJob.constructFromObject(JSON.parse(JSON.stringify(props.job)));
        const original = JobsJob.constructFromObject(JSON.parse(JSON.stringify(props.job)));
        this.store = createStore(allReducers, {job, original}, applyMiddleware(thunk));
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
        DOMUtils.observeWindowResize(this._resizer);
        window.setTimeout(()=>{
            const {create} = this.props;
            if(create){
                this.toggleEdit();
            }
        }, 500)
    }

    componentWillUnmount(){
        DOMUtils.stopObservingWindowResize(this._resizer);
    }

    shouldComponentUpdate(nextProps, nextState){
        return nextProps.random === this.props.random;
    }

    loadDescriptions() {
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        api.schedulerActionsDiscovery().then(data => {
            this.setState({descriptions: data.Actions}, () => {
                this.graphFromJob(this.state.job);
                this.drawGraph();
            });
        }).catch(() => {
            this.graphFromJob(this.state.job);
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

    graphFromJob(job){
        const {graph} = this.state;

        graph.getCells().filter(c => !c.isTemplate).forEach(c => c.remove());

        const shapeIn = new JobInput(job);
        shapeIn.addTo(graph);

        if(!job || !job.Actions || !job.Actions.length){
            return;
        }

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
            graph.getLinks().forEach(l => {
                const linkView = l.findView(paper);
                if(!linkView.hasTools()){
                    linkView.addTools(new dia.ToolsView({tools:[this.createLinkTool()]}));
                    if(!editMode){
                        linkView.hideTools();
                    }
                }
            })
        } else {
            onPaperResize(bbox.width, bbox.height);
        }
        this.setState({bbox});
    }

    clearSelection(callback = ()=>{}){
        const {graph} = this.state;
        graph.getCells().filter(c => c.clearSelection).forEach(c => c.clearSelection());
        this.setState({
            selectionType: null,
            selectionModel: null
        }, callback);
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
            if(c.hideLegend){
                c.hideLegend();
            }
        })
    }

    createLinkTool(){
        const {onDetachModel} = this.state;
        return new linkTools.Remove({
            action:(evt, linkView, toolView) => {
                onDetachModel(linkView, toolView);
            },
            distance: -40
        })
    }

    drawGraph() {

        const {graph, job, onPaperBind, onAttachModel, onDetachModel, onDropFilter, editMode} = this.state;
        const removeLinkTool = () => this.createLinkTool();
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
                    if(_this.isDroppable(elementAbove, elementBelow)) {
                        if(elementAbove instanceof Filter){
                            if(elementBelow instanceof JobInput){
                                onDropFilter(job, elementAbove.getFilter(), 'filter', elementAbove.getFilterType());
                                _this.clearSelection(()=>{_this.setState({selectionModel: job, selectionType:'filter'});});
                            } else if(elementBelow instanceof Action){
                                onDropFilter(elementBelow.getJobsAction(), elementAbove.getFilter(), 'filter', elementAbove.getFilterType());
                                _this.clearSelection(()=>{_this.setState({selectionModel: elementBelow.getJobsAction(), selectionType:'filter'});});
                            }
                            elementBelow.selectFilter();
                        } else {
                            if(elementBelow instanceof JobInput){
                                onDropFilter(job, elementAbove.getSelector(), 'selector', elementAbove.getSelectorType());
                                _this.clearSelection(()=>{_this.setState({selectionModel: job, selectionType:'selector'});});
                            } else if(elementBelow instanceof Action){
                                onDropFilter(elementBelow.getJobsAction(), elementAbove.getSelector(), 'selector', elementAbove.getSelectorType());
                                _this.clearSelection(()=>{_this.setState({selectionModel: elementBelow.getJobsAction(), selectionType:'selector'});});
                            }
                            elementBelow.selectSelector();
                        }

                        elementAbove.remove();
                        return;
                    } else {
                        _this.clearHighlight();
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
                    if(_this.isDroppable(elementAbove, elementBelow)) {
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
            'link:remove' : removeLinkTool,
            'button:create-action':(elView, evt) => {
                evt.stopPropagation();
                this.clearSelection();
                this.setState({createNewAction: true});
            },
            'button:reflow':(elView, evt) => {
                evt.stopPropagation();
                this.reLayout(this.state.editMode);
            }
        });
        this.reLayout(editMode);
    }

    isDroppable(elementAbove, elementBelow){
        if (!(elementBelow instanceof JobInput || elementBelow instanceof Action)){
            return false;
        }
        const {job} = this.state;
        const dropFromType = elementAbove instanceof Filter ? "filter" : "selector";
        const dropOn = elementBelow instanceof JobInput ? "job" : "action";
        const dropFromProto = elementAbove instanceof Filter ? elementAbove.getFilter() : elementAbove.getSelector();
        const dropOnProto = elementBelow instanceof Action ? elementBelow.getJobsAction() : job;
        const keySet = AllowedKeys.target[dropOn][dropFromType].filter(o => {
            return dropFromProto instanceof o.type
        });
        if(!keySet.length) {
            return false;
        }
        // Check if the targetProto already has a similar key
        const targetKey = keySet[0].key;
        if(dropOnProto[targetKey]){
            if(elementBelow.showLegend){
                elementBelow.showLegend('Already has ' + targetKey);
            }
            return false;
        }
        // Finally do not add filters on non-event based JobInput
        if(dropFromType === 'filter' && dropOn === 'job' && job.EventNames === undefined){
            if(elementBelow.showLegend){
                elementBelow.showLegend('Cannot add filter on non event-based trigger');
            }
            return false
        }
        return true;
    }

    deleteAction(){
        if(!window.confirm('Do you want to delete this action?')){
            return;
        }
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

    toggleEdit(){
        const {onToggleEdit, editMode} = this.state;
        this.clearSelection();
        onToggleEdit(!editMode, this.reLayout.bind(this));
    }

    render() {

        let selBlock;
        const {jobsEditable, create} = this.props;
        const {onEmptyModel, editMode, bbox, selectionType, descriptions, selectionModel, onTriggerChange, onLabelChange, createNewAction,
            onRemoveFilter, dirty, onSetDirty, onRevert, onSave, original, job} = this.state;

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
                    onRemove={()=>{this.deleteAction()}}
                    onChange={(newAction) => {
                        action.Parameters = newAction.Parameters;
                        selectionModel.notifyJobModel(action);
                        onSetDirty(true);
                    }}
                />
            } else if(selectionType === 'selector' || selectionType === 'filter') {
                rightWidth = 600;
                if(selectionModel instanceof JobsJob){
                    selBlock =  <Filters job={selectionModel} type={selectionType} {...blockProps} onRemoveFilter={onRemoveFilter} onSave={()=>{onSetDirty(true)}}/>
                } else {
                    selBlock = <Filters action={selectionModel} type={selectionType} {...blockProps} onRemoveFilter={onRemoveFilter} onSave={()=>{onSetDirty(true)}}/>
                }
            } else if(selectionType === 'trigger') {
                const {job} = this.state;
                selBlock = <Triggers job={job} {...blockProps} onChange={onTriggerChange}/>
            }
        }

        const st = {
            header: {
                display:'flex',
                alignItems:'center',
                backgroundColor: editMode ? '#424242' : 'whitesmoke',
                borderBottom: '1px solid #e0e0e0',
                height: 48,
                color: editMode ? '#eeeeee' : '#9e9e9e',
                fontSize: 12,
                fontWeight: 500,
                paddingRight: 12
            },
            icon: {
                color: editMode ? '#eeeeee' : '#9e9e9e'
            },
            disabled : {
                color: 'rgba(255,255,255,0.3)'
            }
        };

        let header = <span style={{flex: 1, padding: '14px 24px'}}>Job Workflow</span>
        if(jobsEditable && editMode) {
            header = (
                <span style={{flex: 1, padding: '0 6px'}}>
                    <ModernTextField value={job.Label} onChange={(e,v)=>{onLabelChange(v)}} inputStyle={{color: 'white'}}/>
                </span>
            );
        }

        return (
            <Paper zDepth={1} style={{margin: 20}}>
                <div style={st.header}>
                    {header}
                    {jobsEditable && dirty && <IconButton onTouchTap={()=> {onSave(job)}} tooltip={'Save'} iconClassName={"mdi mdi-content-save"} iconStyle={st.icon} />}
                    {jobsEditable && dirty && <IconButton onTouchTap={()=> {onRevert(original, (j)=>{this.graphFromJob(j); this.reLayout(editMode);})}} tooltip={'Revert'} iconClassName={"mdi mdi-undo"} iconStyle={st.icon} />}
                    {jobsEditable && <IconButton onTouchTap={()=> {this.toggleEdit()}} tooltip={editMode?'Close':'Edit'} iconClassName={editMode ? "mdi mdi-close" : "mdi mdi-pencil"} iconStyle={st.icon} />}
                </div>
                <div style={{position:'relative', display:'flex', minHeight:editMode?500:null}} ref={"boundingBox"}>
                    <div style={{flex: 1, overflowX: 'auto'}} ref="scroller">
                        <div id="playground" ref="placeholder"></div>
                    </div>
                    <Paper zDepth={0} style={{width: selBlock?rightWidth:0, height: (bbox?bbox.height:500)}}>
                        {selBlock}
                    </Paper>
                </div>
                {getCssStyle(editMode)}
            </Paper>
        );
    }

}

//JobGraph = connect(mapStateToProps, mapDispatchToProps)(JobGraph);

export default JobGraph