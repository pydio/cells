import React from 'react'
import ReactDOM from 'react-dom'
import {Paper, FlatButton, Toggle} from 'material-ui'
import {dia, layout, shapes} from 'jointjs'
import dagre from 'dagre'
import graphlib from 'graphlib'
import Query from "./Query";
import Link from "../graph/Link";
import {ServiceQuery, JobsNodesSelector, JobsIdmSelector, JobsUsersSelector, ProtobufAny, JobsContextMetaFilter, JobsActionOutputFilter} from 'pydio/http/rest-api';
import QueryConnector from "./QueryConnector";
import QueryCluster from "./QueryCluster";
import QueryInput from "./QueryInput";
import QueryOutput from "./QueryOutput";
import ProtoValue from "./ProtoValue";
import {position, styles} from "./styles";


const margin = 20;

class QueryBuilder extends React.Component {

    constructor(props){
        super(props);
        this.graph = new dia.Graph();
        const {cloner, query} = this.props;
        const qCopy = cloner(query);
        this.state = {
            ...this.buildGraph(qCopy),
            query: qCopy,
            cleanState: query,
        };
    }

    detectTypes(query){
        const {queryType} = this.props;
        let inputIcon, outputIcon, singleQuery;
        let uniqueSingleOnly = false;
        let objectType = 'node';
        if(query instanceof JobsNodesSelector) {
            objectType = 'node';
            singleQuery = 'tree.Query';
            if(queryType === 'selector'){
                uniqueSingleOnly = true;
            }
        } else if(query instanceof JobsIdmSelector) {
            switch (query.Type) {
                case "User":
                    objectType = 'user';
                    singleQuery = 'idm.UserSingleQuery';
                    uniqueSingleOnly = true;
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
                    objectType = 'user';
                    singleQuery = 'idm.UserSingleQuery';
                    uniqueSingleOnly = true;
                    break;
            }
        } else if (query instanceof JobsUsersSelector) {
            objectType = 'user';
            singleQuery = 'idm.UserSingleQuery';
        } else if (query instanceof JobsContextMetaFilter){
            objectType = 'context';
            singleQuery = 'jobs.ContextMetaSingleQuery'
        } else if (query instanceof JobsActionOutputFilter){
            objectType = 'output';
            singleQuery = 'jobs.ActionOutputSingleQuery'
        }
        let modelType = objectType;
        if(query instanceof JobsIdmSelector) {
            modelType = 'idm'; // Generic Type
        }

        if(queryType === 'selector') {
            inputIcon = 'database';
            const multiple = query.Collect || false;
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
                case "context":
                    inputIcon = 'tag';
                    outputIcon = 'tag';
                    break;
                case "output":
                    inputIcon = 'message';
                    outputIcon = 'message';
                    break;
                default:
                    break;
            }

        }
        return {inputIcon, outputIcon, objectType, singleQuery, uniqueSingleOnly, modelType};
    }

    redraw(){
        const {query} = this.state;
        this.graph.getCells().forEach(c => c.remove());
        const bbox = this.buildGraph(query);
        this.setState(bbox, () => {
            this.paper.setDimensions(bbox.width + margin*2, bbox.height + margin*2);
        });
    }

    protoHasChildren(p){
        if(!Object.keys(p).length) {
            return false;
        }
        if(p.SubQueries === undefined){
            return true;
        }
        if(p.SubQueries !== undefined && !p.SubQueries.length){
            return false;
        }
        let has = true;
        p.SubQueries.forEach(sub => {
            const subHas = this.protoHasChildren(sub.value);
            if(!subHas){
                has = false;
            }
        });
        return has;
    }

    pruneEmpty(sQ = null) {
        let root = false;
        const {query} = this.state;
        if(sQ === null){
            if(!query.Query){
                return;
            }
            root = true;
            sQ = query.Query;
        }
        if(sQ.SubQueries !== undefined){
            sQ.SubQueries.forEach((sub => {
                this.pruneEmpty(sub.value);
                if(!this.protoHasChildren(sub.value)){
                    sQ.SubQueries = sQ.SubQueries.filter(c => c !== sub);
                }
            }));
        }
        if(root && sQ.SubQueries && sQ.SubQueries.length === 0) {
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
    buildServiceQuery(graph, input, query){
        const {Operation = 'OR', SubQueries} = query;
        // Show cluster
        const cluster = new QueryCluster(query);
        cluster.addTo(graph);
        if(Operation === 'OR') {
            let output, connector;
            if(SubQueries.length > 1) {
                connector = new QueryConnector();
                connector.addTo(graph);
                output = connector;
            }
            SubQueries.forEach(q => {
                if(q.type_url === 'type.googleapis.com/service.Query' && q.value.SubQueries) {
                    const {cluster: subCluster, last} = this.buildServiceQuery(graph, input, q.value);
                    cluster.embed(subCluster);
                    if (last instanceof QueryConnector) {
                        cluster.embed(last);
                    }
                    if (connector) {
                        const link2 = new Link(last.id, last instanceof QueryConnector ? 'input' : 'output', connector.id, 'input');
                        link2.addTo(this.graph);
                    } else {
                        output = last;
                    }
                } else {
                    const isNot = q.value.Not || q.value.not;
                    let components;
                    if(q.type_url === 'type.googleapis.com/jobs.ContextMetaSingleQuery') {
                        // Use value as one query block
                        components = ['value'];
                    } else {
                        // Spread each value keys as one query block
                        components = Object.keys(q.value).filter(k => k.toLowerCase() !== 'not');
                    }
                    components.forEach(key => {
                        const field = new Query(q, key, query, isNot);
                        field.addTo(this.graph);
                        const link = new Link(input.id, input instanceof QueryConnector ? 'input' : 'output', field.id, 'input');
                        link.addTo(this.graph);
                        cluster.embed(field);
                        if(connector) {
                            const link2 = new Link(field.id, 'output', connector.id, 'input');
                            link2.addTo(this.graph);
                        } else {
                            output = field;
                        }
                    })
                }
            });
            return {cluster, last: output};
        } else {
            let lastOp = input;
            SubQueries.forEach(q => {
                if(q.type_url === 'type.googleapis.com/service.Query' && q.value.SubQueries){
                    const {cluster: subCluster, last} = this.buildServiceQuery(graph, lastOp, q.value);
                    lastOp = last;
                    cluster.embed(subCluster);
                    if(last instanceof QueryConnector){
                        cluster.embed(last);
                    }
                } else {
                    const isNot = q.value.Not || q.value.not;
                    let components;
                    if(q.type_url === 'type.googleapis.com/jobs.ContextMetaSingleQuery') {
                        // Use value as one query block
                        components = ['value'];
                    } else {
                        // Spread each value keys as one query block
                        components = Object.keys(q.value).filter(k => k.toLowerCase() !== 'not');
                    }
                    components.forEach(key => {
                        const field = new Query(q, key, query, isNot);
                        field.addTo(this.graph);
                        const link = new Link(lastOp.id, lastOp instanceof QueryConnector ? 'input' : 'output', field.id, 'input');
                        link.addTo(this.graph);
                        lastOp = field;
                        cluster.embed(field);
                    })
                }
            });
            return {cluster, last: lastOp};
        }
    }

    buildGraph(query){
        const {queryType} = this.props;
        const {inputIcon, outputIcon} = this.detectTypes(query);
        const input = new QueryInput(inputIcon);
        input.addTo(this.graph);
        const output = this.buildSpreadOutput(query, queryType, outputIcon);
        if(query.Query && query.Query.SubQueries && query.Query.SubQueries.length) {
            const {cluster, last} = this.buildServiceQuery(this.graph, input, query.Query);
            const link = new Link(last.id, last instanceof QueryConnector ? 'input' : 'output', output.id, 'input');
            link.addTo(this.graph);
        } else {
            const all = new Query(null, 'Select All');
            all.addTo(this.graph);
            const link = new Link(input.id, 'output', all.id, 'input');
            link.addTo(this.graph);
            const link2 = new Link(all.id, 'output', output.id, 'input');
            link2.addTo(this.graph);
        }
        return layout.DirectedGraph.layout(this.graph, {
            nodeSep: 20,
            edgeSep: 20,
            rankSep: 40,
            rankDir: "LR",
            marginX: margin,
            marginY: margin,
            clusterPadding: 24,
            dagre,
            graphlib
        });

    }

    buildSpreadOutput(query, queryType, icon){
        if(queryType === 'selector' && !query.Collect){
            const output = new QueryConnector();
            output.addTo(this.graph);
            for(let i = 0; i < 3; i++){
                const spread = new QueryOutput("chip");
                spread.addTo(this.graph);
                const link = new Link(output.id, "input", spread.id, "input");
                link.addTo(this.graph);
            }
            return output;
        } else {
            const output = new QueryOutput("chip");
            output.addTo(this.graph);
            return output;
        }
    }

    componentDidMount(){

        const {width, height} = this.state;
        this.paper = new dia.Paper({
            el: ReactDOM.findDOMNode(this.refs.graph),
            width: width + margin*2,
            height: height + margin*2,
            model: this.graph,
            interactive: {
                addLinkFromMagnet: false,
                useLinkTools: false,
                elementMove: false
            }
        });
        this.paper.on('cluster:type', (elementView, evt) => {
            const query = elementView.model.query;
            query.Operation = (query.Operation === 'AND' ? 'OR' : 'AND');
            this.redraw();
            this.setDirty();
        });
        this.paper.on('cluster:add', (elementView, evt) => {
            const {singleQuery} = this.detectTypes(this.state.query);
            this.setState({
                queryAddProto: elementView.model.query,
                selectedProto: ProtobufAny.constructFromObject({'@type':'type.googleapis.com/' + singleQuery}),
                aPosition:elementView.model.position(),
                aSize: elementView.model.size(),
                aScrollLeft: ReactDOM.findDOMNode(this.refs.scroller).scrollLeft || 0
            });
        });
        this.paper.on('cluster:split', (elementView, evt) => {
            const {singleQuery} = this.detectTypes(this.state.query);
            if(singleQuery !== 'tree.Query') { // Cannot split tree.Query
                this.setState({
                    querySplitProto: elementView.model.query,
                    selectedProto: ProtobufAny.constructFromObject({'@type':'type.googleapis.com/' + singleQuery}),
                    aPosition:elementView.model.position(),
                    aSize: elementView.model.size(),
                    aScrollLeft: ReactDOM.findDOMNode(this.refs.scroller).scrollLeft || 0
                });
            } else {
                window.alert('Node filters do not support multiple conditions yet')
            }
        });
        this.paper.on('root:add', (elementView, evt) => {
            const {query} = this.state;
            const {singleQuery, uniqueSingleOnly} = this.detectTypes(query);
            query.Query = ServiceQuery.constructFromObject({SubQueries:[], Operation:uniqueSingleOnly?'AND':'OR'});
            this.setState({
                queryAddProto: query.Query,
                selectedProto: ProtobufAny.constructFromObject({'@type':'type.googleapis.com/' + singleQuery}),
                aPosition:elementView.model.position(),
                aSize: elementView.model.size(),
                aScrollLeft: ReactDOM.findDOMNode(this.refs.scroller).scrollLeft || 0
            });
        });
        this.paper.on('query:select', (elementView, evt) => {
            const {proto, fieldName} = elementView.model;
            this.clearSelection();
            elementView.model.select();
            this.setState({
                selectedProto: proto,
                selectedFieldName: fieldName,
                aPosition:elementView.model.position(),
                aSize: elementView.model.size(),
                aScrollLeft: ReactDOM.findDOMNode(this.refs.scroller).scrollLeft || 0
            });
        });
        this.paper.on('cluster:delete', (elementView, evt) => {
            evt.stopPropagation();
            if(!window.confirm('Remove whole branch?')){
                return;
            }
            const {query} = elementView.model;
            query.SubQueries = [];
            this.pruneEmpty();
            this.redraw();
            this.setDirty();
        });
        this.paper.on('query:delete', (elementView) => {
            if(!window.confirm('Remove this condition?')){
                return;
            }
            const {uniqueSingleOnly} = this.detectTypes(this.state.query);
            const {parentQuery, proto} = elementView.model;
            if(uniqueSingleOnly) {
                // Remove key from first SubQuery
                const {fieldName} = elementView.model;
                delete proto.value[fieldName]
            } else {
                // Remove single Query
                parentQuery.SubQueries = parentQuery.SubQueries.filter(q => q !== proto);
            }
            this.pruneEmpty();
            this.redraw();
            this.setDirty();
        });
        this.paper.on('element:mouseenter', (elementView)=>{
            if(elementView.model instanceof Query || elementView.model instanceof QueryCluster){
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
        this.paper.on('element:mouseleave', (elementView)=>{
            if(elementView.model instanceof Query || elementView.model instanceof QueryCluster){
                elementView.model.hover(false);
            }
        })
    }

    clearSelection(){
        this.setState({queryAddProto: null, querySplitProto: null, selectedProto: null, selectedFieldName: null});
        this.graph.getCells().filter(c => c instanceof Query).forEach(cell => cell.deselect())
    }

    remove(){
        if(!window.confirm('Are you sure you want to remove this filter?')){
            return;
        }
        const {onRemoveFilter} = this.props;
        const {query} = this.state;
        const {modelType} = this.detectTypes(query);
        onRemoveFilter(modelType);
    }

    static FormToContextMetaSingleQuery(values){
        const {Condition = {}, FieldName} = values;
        const condType = Condition['@value'];
        delete Condition['@value'];
        const condOptions = JSON.stringify(Condition);
        return {
            FieldName,
            Condition: {
                type: condType,
                jsonOptions: condOptions
            }
        };
    }

    static ContextMetaSingleQueryToForm(proto) {
        const {Condition = {}, FieldName} = proto.value;
        const {type, jsonOptions = "{}"} = Condition;
        const otherValues = JSON.parse(jsonOptions);
        return {
            FieldName,
            Condition : {
                '@value' : type,
                ...otherValues
            }
        };
    }

    changeQueryValue(newField, newValue, notProps){

        const {selectedProto, selectedFieldName, queryAddProto, querySplitProto} = this.state;
        const {uniqueSingleOnly, singleQuery} = this.detectTypes(this.state.query);
        if(singleQuery === 'jobs.ContextMetaSingleQuery') {
            selectedProto.value = QueryBuilder.FormToContextMetaSingleQuery(newValue);
        } else {
            // Clean old values
            if(selectedFieldName && newField !== selectedFieldName){
                delete selectedProto.value[selectedFieldName];
            }
            if(notProps) {
                //selectedProto.value = {...selectedProto.value, ...notProps};
                Object.keys(notProps).forEach(k => {
                    selectedProto.value[k] = notProps[k];
                })
            } else {
                if(selectedProto.value["Not"]) {
                    delete selectedProto.value["Not"];
                }
                if (selectedProto.value["not"]) {
                    delete selectedProto.value["not"];
                }
            }
            selectedProto.value[newField] = newValue;
        }
        if(queryAddProto){
            if(!queryAddProto.SubQueries) {
                queryAddProto.SubQueries = [];
            }
            if(uniqueSingleOnly && queryAddProto.SubQueries.length) {
                let values = queryAddProto.SubQueries[0].value;
                values = {...values, ...selectedProto.value};
                queryAddProto.SubQueries[0].value = values;
            } else {
                queryAddProto.SubQueries.push(selectedProto);
            }
        } else if(querySplitProto){
            // Create a new branch and move proto inside this branch
            const newBranch1 = ProtobufAny.constructFromObject({'@type':'type.googleapis.com/service.Query', SubQueries:[], Operation:'AND'});
            const newBranch2 = ProtobufAny.constructFromObject({'@type':'type.googleapis.com/service.Query', SubQueries:[], Operation:querySplitProto.Operation});
            newBranch1.value.SubQueries = [selectedProto];
            newBranch2.value.SubQueries = querySplitProto.SubQueries;
            querySplitProto.SubQueries = [newBranch1, newBranch2];
        }
        this.setDirty();
        this.redraw();
    }

    toggleCollect(value){
        const {query} = this.state;
        query.Collect = value;
        this.setDirty();
        this.redraw();
    }

    setDirty(){
        this.setState({dirty: true});
    }

    revert(){
        const {cloner} = this.props;
        const {cleanState} = this.state;
        this.setState({dirty: false, query: cloner(cleanState)}, () => {
            this.redraw();
        })
    }

    save(){
        const {query} = this.state;
        const {onSave, cloner} = this.props;
        onSave(query);
        this.setState({
            dirty: false,
            cleanState: cloner(query)
        });
    }

    render() {

        const {queryType, style} = this.props;
        const {query, selectedProto, selectedFieldName, dirty, aPosition, aSize, aScrollLeft} = this.state;
        const {objectType, singleQuery} = this.detectTypes(query);
        const title = (queryType === 'filter' ? 'Filter' : 'Select') + ' ' +  objectType + (queryType === 'filter' ? '' : 's');

        let bStyles = {...styles.button};
        if(!dirty){
            bStyles = {...bStyles, ...styles.disabled};
        }

        return (
            <div style={{...style, position:'relative'}}>
                <div style={{display:'flex', fontSize: 15, padding: 10}}>
                    <div style={{flex: 1}}>{title}</div>
                    <div>
                        <span className={"mdi mdi-undo"} onClick={dirty?()=>{this.revert()}:()=>{}} style={bStyles}/>
                        <span className={"mdi mdi-content-save"} onClick={dirty?()=>{this.save()}:()=>{}} style={bStyles}/>
                        <span className={"mdi mdi-delete"} onClick={()=>{this.remove()}} style={{...styles.button, ...styles.delete}}/>
                    </div>
                </div>
                <div style={{width:'100%', overflowX:'auto'}} ref={"scroller"}>
                    <div ref={"graph"} id={"graph"}></div>
                </div>
                {queryType === "selector" &&
                <div style={{padding:'0 6px 2px'}}>
                    <Toggle
                        toggled={query.Collect}
                        onToggle={(e,v)=>{this.toggleCollect(v)}}
                        labelPosition={"right"}
                        fullWidth={true}
                        label={query.Collect ? "Trigger one action with all results" : "Trigger one action per result"}
                        style={{padding: '7px 5px 4px',fontSize: 15}}
                    />
                </div>
                }
                {selectedProto &&
                <ProtoValue
                    proto={singleQuery === "jobs.ContextMetaSingleQuery" ? QueryBuilder.ContextMetaSingleQueryToForm(selectedProto) :selectedProto}
                    singleQuery={singleQuery}
                    isSwitch={singleQuery !== "jobs.ContextMetaSingleQuery"}
                    fieldName={selectedFieldName}
                    onChange={(f,v,nP) => {this.changeQueryValue(f,v,nP)}}
                    onDismiss={()=>{this.clearSelection()}}
                    style={position(300, aSize, aPosition, aScrollLeft, 40)}
                />
                }
            </div>
        );
    }

}

export default QueryBuilder