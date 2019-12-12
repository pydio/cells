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
import {position} from "./styles";

const margin = 20;

class QueryBuilder extends React.Component {

    constructor(props){
        super(props);
        this.graph = new dia.Graph();
        const {cloner, query} = this.props;
        this.state = {
            ...this.buildGraph(query),
            query: cloner(query),
            cleanState: query,
        };
    }

    detectTypes(query){
        const {queryType} = this.props;
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

    buildGraph(query){
        const {inputIcon, outputIcon} = this.detectTypes(query);
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
            this.setDirty();
        });
        this.paper.on('cluster:add', (elementView, evt) => {
            this.setState({
                queryAddProto: elementView.model.query,
                selectedProto: ProtobufAny.constructFromObject({'@type':'type.googleapis.com/idm.RoleSingleQuery'}),
                aPosition:elementView.model.position(),
                aSize: elementView.model.size(),
                aScrollLeft: ReactDOM.findDOMNode(this.refs.scroller).scrollLeft || 0
            });
        });
        this.paper.on('cluster:split', (elementView, evt) => {
            this.setState({
                querySplitProto: elementView.model.query,
                selectedProto: ProtobufAny.constructFromObject({'@type':'type.googleapis.com/idm.RoleSingleQuery'}),
                aPosition:elementView.model.position(),
                aSize: elementView.model.size(),
                aScrollLeft: ReactDOM.findDOMNode(this.refs.scroller).scrollLeft || 0
            });
        });
        this.paper.on('root:add', (elementView, evt) => {
            const {query} = this.state;
            query.Query = ServiceQuery.constructFromObject({SubQueries:[], Operation:'OR'});
            this.setState({
                queryAddProto: query.Query,
                selectedProto: ProtobufAny.constructFromObject({'@type':'type.googleapis.com/idm.RoleSingleQuery'}),
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
        this.paper.on('cluster:delete', (elementView) => {
            const {query} = elementView.model;
            query.SubQueries = [];
            this.pruneEmpty();
            this.redraw();
            this.setDirty();
        });
        this.paper.on('query:delete', (elementView) => {
            const {parentQuery, proto} = elementView.model;
            console.log(proto, parentQuery);
            parentQuery.SubQueries = parentQuery.SubQueries.filter(q => q !== proto);
            this.pruneEmpty();
            this.redraw();
            this.setDirty();
        })
    }

    clearSelection(){
        this.setState({queryAddProto: null, querySplitProto: null, selectedProto: null, selectedFieldName: null});
        this.graph.getCells().filter(c => c instanceof Query).forEach(cell => cell.deselect())
    }

    remove(){
        const {onRemoveFilter} = this.props;
        const {query} = this.state;
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
        this.setDirty();
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

        return (
            <div style={{...style, position:'relative'}}>
                <div style={{display:'flex', fontSize: 15, padding: 10}}>
                    <div style={{flex: 1}}>{title}</div>
                    <div>
                        {dirty && <span className={"mdi mdi-undo"} onClick={()=>{this.revert()}} style={{color: '#9e9e9e', cursor: 'pointer'}}/>}
                        {dirty && <span className={"mdi mdi-content-save"} onClick={()=>{this.save()}} style={{color: '#9e9e9e', cursor: 'pointer'}}/>}
                        <span className={"mdi mdi-delete"} onClick={()=>{this.remove()}} style={{color: '#9e9e9e', cursor: 'pointer'}}/>
                    </div>
                </div>
                <div style={{width:'100%', overflowX:'auto'}} ref={"scroller"}>
                    <div ref={"graph"} id={"graph"}></div>
                </div>
                {selectedProto &&
                <ProtoValue
                    proto={selectedProto}
                    singleQuery={singleQuery}
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