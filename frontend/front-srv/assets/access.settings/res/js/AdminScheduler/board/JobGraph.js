
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
import {Paper, FlatButton, FontIcon, IconButton, Checkbox, Dialog} from 'material-ui'
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
    setSelectionAction,
    setDirtyAction,
    saveSuccessAction,
    saveErrorAction,
    revertAction,
    updateLabelAction,
    updateJobPropertyAction,
    jobChangedAction,
    attachBoundingRefAction,
    requireLayoutAction,
    attachDescriptions,
    toggleFilterAsConditionAction
} from "./actions/editor";
import Filters from "./builder/Filters";
import Templates from "./graph/Templates";
import {AllowedKeys, linkAttr} from "./graph/Configs";
const {ModernTextField} = Pydio.requireLib('hoc');
import {getCssStyle} from "./builder/styles";
import ActionFilter from "./graph/ActionFilter";

const mapStateToProps = state => {
    console.debug(state);
    return {...state}
};

const editWindowHeight = 600;

const mapDispatchToProps = dispatch => {
    return {
        onToggleEdit : (on = true, layout = () =>{}) => {
            dispatch((d, getState) => {
                d(toggleEditAction(on, layout));
                const {graph, boundingRef, editMode, paper, createLinkTool} = getState();
                d(requireLayoutAction(graph, boundingRef, editMode, paper, createLinkTool));
                const {bbox} = getState();
                d(resizePaperAction(bbox.width, bbox.height))
            })
        },
        onSetBoundingRef:(element) => {
            dispatch(attachBoundingRefAction(element))
        },
        onSetDirty:(dirty = true) => {
            dispatch(setDirtyAction(dirty));
        },
        onPaperBind : (element, graph, events) => {
            dispatch(bindPaperAction(element, graph, events));
        },
        onUpdateDescriptions : (descriptions) => {
            dispatch((d, getState) => {
                d(attachDescriptions(descriptions));
                const {job, editMode} = getState();
                d(jobChangedAction(job, descriptions, editMode));
                const {graph, boundingRef, paper, createLinkTool} = getState();
                d(requireLayoutAction(graph, boundingRef, editMode, paper, createLinkTool));
                const {bbox} = getState();
                d(resizePaperAction(bbox.width, bbox.height))
            });
        },
        refreshGraph: () => {
            dispatch((d, getState) => {
                const {job, descriptions, editMode} = getState();
                d(jobChangedAction(job, descriptions, editMode));
                const {graph, boundingRef, paper, createLinkTool} = getState();
                d(requireLayoutAction(graph, boundingRef, editMode, paper, createLinkTool));
                const {bbox} = getState();
                d(resizePaperAction(bbox.width, bbox.height))
            })
        },
        requireLayout:() => {
            dispatch((d, getState) => {
                const {graph, boundingRef, editMode, paper, createLinkTool} = getState();
                d(requireLayoutAction(graph, boundingRef, editMode, paper, createLinkTool));
                const {bbox} = getState();
                d(resizePaperAction(bbox.width, bbox.height))
            })
        },
        onPaperResize : (width, height) => {
            dispatch(resizePaperAction(width, height))
        },
        onEmptyModel: (model) => {
            dispatch((d, getState) => {
                d(emptyModelAction(model));
                const {graph, boundingRef, editMode, paper, createLinkTool} = getState();
                d(requireLayoutAction(graph, boundingRef, editMode, paper, createLinkTool));
            })
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
            dispatch((d, getState) => {
                d(dropFilterAction(target, dropped, filterOrSelector, objectType));
                d(setDirtyAction(true));
                const {job, descriptions} = getState();
                d(jobChangedAction(job, descriptions));
                const {graph, boundingRef, editMode, paper, createLinkTool} = getState();
                d(requireLayoutAction(graph, boundingRef, editMode, paper, createLinkTool));
            });
        },
        onRemoveFilter : (target, filter, filterOrSelector, objectType) => {
            dispatch((d, getState) => {
                d(removeFilterAction(target, filter, filterOrSelector, objectType));
                d(setDirtyAction(true));
                const {job, descriptions} = getState();
                d(jobChangedAction(job, descriptions));
                const {graph, boundingRef, editMode, paper, createLinkTool} = getState();
                d(requireLayoutAction(graph, boundingRef, editMode, paper, createLinkTool));
            });
        },
        onToggleFilterAsCondition: (toggle, action) => {
            dispatch((d, getState) => {
                d(toggleFilterAsConditionAction(toggle, action));
                d(setDirtyAction(true));
                const {job, descriptions} = getState();
                d(jobChangedAction(job, descriptions));
                const {graph, boundingRef, editMode, paper, createLinkTool} = getState();
                d(requireLayoutAction(graph, boundingRef, editMode, paper, createLinkTool));
            })
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
        onJobPropertyChange : (name, value) => {
            dispatch((d) => {
                d(updateJobPropertyAction(name, value));
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
                const {job, descriptions} = getState();
                d(jobChangedAction(job, descriptions));
                const {graph, boundingRef, editMode, paper, createLinkTool} = getState();
                d(requireLayoutAction(graph, boundingRef, editMode, paper, createLinkTool));
            });
        },
        onSave : (job, onJobSave = null) => {
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
                    if(onJobSave){
                        onJobSave(job);
                    }
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
        this.store = createStore(allReducers, {
            job,
            original,
            createLinkTool:this.createLinkTool.bind(this),
        }, applyMiddleware(thunk));
        this.state = storeStateToState(this.store);
        this.store.subscribe(() => {
            this.setState(storeStateToState(this.store));
        });
    }

    componentDidMount(){
        const {onSetBoundingRef, refreshGraph} = this.state;
        this.drawGraph();
        onSetBoundingRef(ReactDOM.findDOMNode(this.refs.boundingBox));
        refreshGraph();
        // Load descriptions
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        api.schedulerActionsDiscovery().then(data => {
            this.state.onUpdateDescriptions(data.Actions);
        });
        // Bind window resizer
        this._resizer = ()=> {
            const {editMode, paper, boundingRef} = this.state;
            if(editMode && boundingRef){
                const graphWidth = paper.model.getBBox().width + 80;
                const paperHeight = paper.getArea().height;
                const maxWidth = boundingRef.clientWidth;
                paper.setDimensions(Math.max(graphWidth, maxWidth), paperHeight);
            }
        };
        DOMUtils.observeWindowResize(this._resizer);
        window.setTimeout(()=>{
            const {create} = this.props;
            if(create){
                this.toggleEdit();
            }
        }, 500);
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
            this.state.onUpdateDescriptions(data.Actions);
        });
    }


    static jobInputCreatesData(job){
        return (job.EventNames !== undefined) || !!job.IdmSelector || !!job.NodesSelector || !!job.UsersSelector;
    }

    clearSelection(callback = ()=>{}){
        const {graph} = this.state;
        graph.getCells().filter(c => c.clearSelection).forEach(c => c.clearSelection());
        this.setState({
            selectionType: null,
            selectionModel: null,
            fPanelWidthOffset: 0
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

        const {graph, job, onPaperBind, onAttachModel, onDetachModel, onDropFilter, editMode, requireLayout} = this.state;
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
                    } else if(model instanceof Action || model instanceof ActionFilter){
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
                let elementBelow = this.model.findModelsFromPoint(coordinates).find(function(el) {
                    return (el.id !== elementAbove.id);
                });
                if(!elementBelow && elementAbove instanceof Filter){
                    const linkBelow = this.model.getLinks().find(function(el) { return el.getBBox().containsPoint(coordinates); });
                    if(linkBelow){
                        elementBelow = linkBelow.getTargetCell();
                    }
                }
                if (isFilter && elementBelow) {
                    if(_this.isDroppable(elementAbove, elementBelow)) {
                        if(elementAbove instanceof Filter){
                            if(elementBelow instanceof JobInput){
                                onDropFilter(job, elementAbove.getFilter(), 'filter', elementAbove.getFilterType());
                                _this.clearSelection(()=>{_this.setState({selectionModel: job, selectionType:'filter'});});
                            } else if(elementBelow instanceof Action || elementBelow instanceof ActionFilter){
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
                if (elementBelow && _this.isDroppable(elementAbove, elementBelow)){
                    elementBelow.findView(this).highlight();
                } else if(elementAbove instanceof Filter) {
                    // Filters can be dropped on links ? => use link.getTargetCell() as drop target
                    const linkBelow = this.model.getLinks().find(function(el) { return el.getBBox().containsPoint(coordinates); });
                    if(linkBelow && linkBelow.getTargetCell() instanceof Action && _this.isDroppable(elementAbove, linkBelow.getTargetCell())){
                        linkBelow.findView(this).highlight();
                    }
                }
            },
            'link:connect': (linkView, event) => {
                linkView.addTools(new dia.ToolsView({tools:[removeLinkTool()]}));
                linkView.model.attr(linkAttr(JobGraph.jobInputCreatesData(job)));
                linkView.model.attr('.link-tool/display', 'none');
                linkView.model.router('manhattan');
                linkView.model.connector('rounded');
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
                requireLayout();
            }
        });
        requireLayout();
    }

    isDroppable(elementAbove, elementBelow){
        if (elementAbove instanceof Filter && elementBelow instanceof ActionFilter){
            // Replace with parent action Action model
            elementBelow = elementBelow.getJobsAction().model;
        }
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
        onToggleEdit(!editMode);
    }

    revertAction(){
        const {onRevert, original} = this.state;
        this.clearSelection();
        onRevert(original);
    }

    cleanJsonActions(actions){
        actions.forEach(a => {
            if(a.model){
                delete a.model;
            }
            if(a.ChainedActions){
                this.cleanJsonActions(a.ChainedActions);
            }
            if(a.FailedFilterActions) {
                this.cleanJsonActions(a.FailedFilterActions);
            }
        })
    }

    computeJSON(){
        const {jsonJob, job} = this.state;
        const j = jsonJob ? jsonJob : job;
        const cleanJsonStruct = JSON.parse(JSON.stringify(j));
        delete cleanJsonStruct['Tasks'];
        delete cleanJsonStruct['model'];
        if(cleanJsonStruct.Actions){
            this.cleanJsonActions(cleanJsonStruct.Actions);
        }
        return JSON.stringify(cleanJsonStruct, null, 2);
    }

    updateJSON(newValue){
        const {job} = this.state;
        let valid;
        try {
            const j = JSON.parse(newValue);
            if(j){
                valid = JobsJob.constructFromObject(j);
            }
            valid.ID = job.ID; // Keep ID
        } catch(e){}
        if(valid){
            this.setState({jsonJob: valid, jsonJobInvalid: false});
        } else {
            this.setState({jsonJobInvalid: true});
        }
    }

    saveJSON(){
        const {jsonJob, onSave} = this.state;
        onSave(jsonJob, this.props.onJsonSave);
    }

    render() {

        let selBlock;
        const {jobsEditable, create} = this.props;
        const {onEmptyModel, editMode, bbox, selectionType, descriptions, selectionModel, onTriggerChange,
            onLabelChange, onJobPropertyChange, createNewAction, onToggleFilterAsCondition,
            onRemoveFilter, dirty, onSetDirty, onRevert, onSave, original, job, showJsonDialog, jsonJobInvalid} = this.state;
        let fPanelWidthOffset = this.state.fPanelWidthOffset || 0;

        let blockProps = {onDismiss: ()=>{this.clearSelection()}};
        let rightWidth = 300;
        let showOffsetButton;
        if(createNewAction) {
            showOffsetButton = true;
            selBlock = <FormPanel
                actions={descriptions}
                action={JobsAction.constructFromObject({ID:JOB_ACTION_EMPTY})}
                onChange={(newAction) => { onEmptyModel(new Action(descriptions, newAction, true)); }}
                create={true}
                onDismiss={()=>{this.setState({createNewAction: false, fPanelWidthOffset: 0})}}
            />
        } else if(selectionModel){
            if(selectionType === 'action'){
                showOffsetButton = true;
                const action = selectionModel.getJobsAction();
                selBlock = <FormPanel
                    actions={descriptions}
                    actionInfo={descriptions[action.ID]}
                    action={action} {...blockProps}
                    onRemove={()=>{this.deleteAction()}}
                    onChange={(newAction) => {
                        action.Parameters = newAction.Parameters;
                        action.Label = newAction.Label;
                        action.Description = newAction.Description;
                        selectionModel.notifyJobModel(action);
                        onSetDirty(true);
                    }}
                />
            } else if(selectionType === 'selector' || selectionType === 'filter') {
                rightWidth = 600;
                const filtersProps = {
                    type: selectionType,
                    ...blockProps,
                    onRemoveFilter,
                    onSave : () => {onSetDirty(true)}
                };
                if(selectionModel instanceof JobsJob){
                    filtersProps.job = selectionModel;
                } else {
                    filtersProps.action = selectionModel;
                    if(selectionType === 'filter'){
                        filtersProps.onToggleFilterAsCondition=onToggleFilterAsCondition
                    }
                }
                selBlock = <Filters {...filtersProps}/>
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
        let footer;
        if(jobsEditable && editMode) {
            header = (
                <span style={{flex: 1, padding: '0 6px'}}>
                    <ModernTextField value={job.Label} onChange={(e,v)=>{onLabelChange(v)}} inputStyle={{color: 'white'}}/>
                </span>
            );
            footer = (
                <div style={{display:'flex',alignItems: 'center',backgroundColor: '#f5f5f5', borderTop: '1px solid #e0e0e0'}}>
                    <div style={{display:'flex',alignItems: 'center', padding: '0 16px'}}>
                        Max. Parallel Tasks : <ModernTextField style={{width:60}} value={job.MaxConcurrency} onChange={(e,v)=>{onJobPropertyChange('MaxConcurrency', parseInt(v))}} type={"number"}/>
                    </div>
                    <Checkbox style={{width:200}} checked={job.AutoStart} onCheck={(e,v) => {onJobPropertyChange('AutoStart', v)}} label={"Run-On-Save"}/>
                    <span style={{flex: 1}}></span>
                    <IconButton iconClassName={"mdi mdi-json"} onTouchTap={()=>{this.setState({showJsonDialog: true})}} tooltip={"Import/Export JSON"} tooltipPosition={"top-left"}/>
                </div>
            );
        }

        return (
            <Paper zDepth={1} style={{margin: 20}}>
                <Dialog
                    title={"Import/Export JSON"}
                    onRequestClose={()=>{this.setState({showJsonDialog: false})}}
                    open={showJsonDialog}
                    autoDetectWindowHeight={true}
                    autoScrollBodyContent={true}
                    actions={[
                        <FlatButton onTouchTap={() => {this.setState({showJsonDialog:false})}} label={"Cancel"}/>,
                        <FlatButton primary={true} onTouchTap={()=>{this.saveJSON()}} disabled={jsonJobInvalid} label={"Save"}/>
                    ]}
                >
                    <div>
                        {showJsonDialog &&
                            <AdminComponents.CodeMirrorField
                                value={this.computeJSON()}
                                onChange={(e, v) => {
                                    this.updateJSON(v);
                                }}
                                mode={"json"}
                            />
                        }
                    </div>
                </Dialog>
                <div style={st.header}>
                    {header}
                    {jobsEditable && dirty && <IconButton onTouchTap={()=> {onSave(job, this.props.onJobSave)}} tooltip={'Save'} iconClassName={"mdi mdi-content-save"} iconStyle={st.icon} />}
                    {jobsEditable && dirty && <IconButton onTouchTap={()=> {this.revertAction()}} tooltip={'Revert'} iconClassName={"mdi mdi-undo"} iconStyle={st.icon} />}
                    {jobsEditable && <IconButton onTouchTap={()=> {this.toggleEdit()}} tooltip={editMode?'Close':'Edit'} iconClassName={editMode ? "mdi mdi-close" : "mdi mdi-pencil"} iconStyle={st.icon} />}
                </div>
                <div style={{position:'relative', display:'flex', minHeight:editMode?editWindowHeight:null}} ref={"boundingBox"}>
                    <div style={{flex: 1, overflowX: 'auto'}} ref="scroller">
                        <div id="playground" ref="placeholder"></div>
                    </div>
                    <Paper zDepth={0} style={{width: selBlock?(rightWidth + fPanelWidthOffset):0, height: (bbox?bbox.height:editWindowHeight), position:'relative'}}>
                        {selBlock}
                        {showOffsetButton && fPanelWidthOffset === 0 &&
                            <span className={"mdi mdi-chevron-left right-panel-expand-button"} onClick={() => {this.setState({fPanelWidthOffset:300})}}/>
                        }
                        {showOffsetButton && fPanelWidthOffset === 300 &&
                            <span className={"mdi mdi-chevron-right right-panel-expand-button"} onClick={() => {this.setState({fPanelWidthOffset:0})}}/>
                        }
                    </Paper>
                </div>
                {footer}
                {getCssStyle(editMode)}
            </Paper>
        );
    }

}

//JobGraph = connect(mapStateToProps, mapDispatchToProps)(JobGraph);

export default JobGraph