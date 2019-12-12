import React from 'react'
import ReactDOM from 'react-dom'
import {Paper, FlatButton} from 'material-ui'
import {dia, layout, shapes} from 'jointjs'
import dagre from 'dagre'
import graphlib from 'graphlib'
import Query from "./Query";
import Link from "../graph/Link";
import {ServiceQuery, JobsNodesSelector, JobsIdmSelector, JobsUsersSelector, ProtobufAny} from 'pydio/http/rest-api';
import QueryConnector from "./QueryConnector";
import QueryCluster from "./QueryCluster";
import QueryInput from "./QueryInput";
import QueryOutput from "./QueryOutput";
import ProtoValue from "./ProtoValue";

const margin = 20;

class QueryBuilder extends React.Component {

    constructor(props){
        super(props);
        this.graph = new dia.Graph();
        this.state = this.buildGraph();
    }

    detectTypes(){
        const {query, queryType} = this.props;
        let inputIcon, outputIcon, singleQuery;
        let objectType = 'node';
        if(query instanceof JobsNodesSelector) {
            objectType = 'node';
            singleQuery = 'tree.Query'
        } else if(query instanceof JobsIdmSelector) {
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
        } else if (query instanceof JobsUsersSelector) {
            objectType = 'user';
            singleQuery = 'idm.UserSingleQuery';
        }

        if(queryType === 'selector') {
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
        return {inputIcon, outputIcon, objectType, singleQuery};
    }

    redraw(){
        this.graph.getCells().forEach(c => c.remove());
        const bbox = this.buildGraph();
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
        const {query} = this.props;
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
            //const output = new QueryConnector();
            //output.addTo(graph);
            SubQueries.forEach(q => {
                if(q.type_url === 'type.googleapis.com/service.Query' && q.value.SubQueries){
                    const {cluster: subCluster, last} = this.buildServiceQuery(graph, input, q.value);
                    cluster.embed(subCluster);
                    if(last instanceof QueryConnector){
                        cluster.embed(last);
                    }
                    if(connector){
                        const link2 = new Link(last.id, last instanceof QueryConnector ? 'input' : 'output', connector.id, 'input');
                        link2.addTo(this.graph);
                    } else {
                        output = last;
                    }
                } else {
                    const isNot = q.value.Not || q.value.not;
                    Object.keys(q.value).filter(k => k.toLowerCase() !== 'not').forEach(key => {
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
                    Object.keys(q.value).filter(k => k.toLowerCase() !== 'not').forEach(key => {
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

    buildGraph(){
        const {query} = this.props;
        console.log(query);
        const {inputIcon, outputIcon} = this.detectTypes();
        const input = new QueryInput(inputIcon);
        const output = new QueryOutput(outputIcon);
        input.addTo(this.graph);
        output.addTo(this.graph);
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
                elementMove: true
            }
        });
        this.paper.on('cluster:type', (elementView, evt) => {
            const query = elementView.model.query;
            query.Operation = (query.Operation === 'AND' ? 'OR' : 'AND');
            this.redraw();
        });
        this.paper.on('cluster:add', (elementView, evt) => {
            this.setState({
                queryAddProto: elementView.model.query,
                selectedProto: ProtobufAny.constructFromObject({'@type':'type.googleapis.com/idm.RoleSingleQuery'})
            });
        });
        this.paper.on('cluster:split', (elementView, evt) => {
            this.setState({
                querySplitProto: elementView.model.query,
                selectedProto: ProtobufAny.constructFromObject({'@type':'type.googleapis.com/idm.RoleSingleQuery'})
            });
        });
        this.paper.on('root:add', (elementView, evt) => {
            const {query} = this.props;
            query.Query = ServiceQuery.constructFromObject({SubQueries:[], Operation:'OR'});
            this.setState({
                queryAddProto: query.Query,
                selectedProto: ProtobufAny.constructFromObject({'@type':'type.googleapis.com/idm.RoleSingleQuery'})
            });
        });
        this.paper.on('query:select', (elementView, evt) => {
            const {proto, fieldName} = elementView.model;
            this.clearSelection();
            elementView.model.select();
            this.setState({selectedProto: proto, selectedFieldName: fieldName});
        });
        this.paper.on('cluster:delete', (elementView) => {
            const {query} = elementView.model;
            query.SubQueries = [];
            this.pruneEmpty();
            this.redraw();
        });
        this.paper.on('query:delete', (elementView) => {
            const {parentQuery, proto} = elementView.model;
            console.log(proto, parentQuery);
            parentQuery.SubQueries = parentQuery.SubQueries.filter(q => q !== proto);
            this.pruneEmpty();
            this.redraw();
        })
    }

    clearSelection(){
        this.setState({queryAddProto: null, querySplitProto: null, selectedProto: null, selectedFieldName: null});
        this.graph.getCells().filter(c => c instanceof Query).forEach(cell => cell.deselect())
    }

    remove(){
        const {onRemoveFilter, query} = this.props;
        let modelType;
        if(query instanceof JobsNodesSelector){
            modelType = 'node'
        } else if(query instanceof JobsIdmSelector){
            modelType = 'idm'
        } else if(query instanceof JobsUsersSelector){
            modelType = 'user'
        }
        onRemoveFilter(modelType);
    }

    changeQueryValue(newField, newValue, notProps){

        const {selectedProto, selectedFieldName, queryAddProto, querySplitProto} = this.state;
        // Clean old values
        if(selectedFieldName && newField !== selectedFieldName){
            delete selectedProto.value[selectedFieldName];
        }
        if(notProps) {
            selectedProto.value = {...selectedProto.value, ...notProps};
        } else {
            if(selectedProto.value["Not"]) {
                delete selectedProto.value["Not"];
            }
            if (selectedProto.value["not"]) {
                delete selectedProto.value["not"];
            }
        }
        selectedProto.value[newField] = newValue;
        if(queryAddProto){
            if(!queryAddProto.SubQueries) {
                queryAddProto.SubQueries = [];
            }
            queryAddProto.SubQueries.push(selectedProto);
        } else if(querySplitProto){
            // Create a new branch and move proto inside this branch
            const newBranch1 = ProtobufAny.constructFromObject({'@type':'type.googleapis.com/service.Query', SubQueries:[], Operation:'AND'});
            const newBranch2 = ProtobufAny.constructFromObject({'@type':'type.googleapis.com/service.Query', SubQueries:[], Operation:querySplitProto.Operation});
            newBranch1.value.SubQueries = [selectedProto];
            newBranch2.value.SubQueries = querySplitProto.SubQueries;
            querySplitProto.SubQueries = [newBranch1, newBranch2];
        }
        this.redraw();
    }

    render() {

        const {queryType, style} = this.props;
        const {selectedProto, selectedFieldName} = this.state;
        const {objectType, singleQuery} = this.detectTypes();
        const title = (queryType === 'filter' ? 'Filter' : 'Select') + ' ' +  objectType + (queryType === 'filter' ? '' : 's');

        return (
            <div style={style}>
                <div>{title}</div>
                <div style={{width:'100%', overflowX:'auto'}}>
                    <div ref={"graph"} id={"graph"}></div>
                </div>
                {selectedProto &&
                <ProtoValue
                    proto={selectedProto}
                    singleQuery={singleQuery}
                    fieldName={selectedFieldName}
                    onChange={(f,v,nP) => {this.changeQueryValue(f,v,nP)}}
                    onDismiss={()=>{this.clearSelection()}}
                />
                }
                <FlatButton label={"Remove"} onTouchTap={this.remove.bind(this)}/>
            </div>
        );
    }

}

export default QueryBuilder