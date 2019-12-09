import React from 'react'
import ReactDOM from 'react-dom'
import {Paper, FlatButton} from 'material-ui'
import {dia, layout} from 'jointjs'
import dagre from 'dagre'
import graphlib from 'graphlib'
import Query from "./Query";
import Link from "../graph/Link";
import Input from "./Input";
import Output from "./Output";
import {JobsNodesSelector, JobsIdmSelector, JobsUsersSelector} from 'pydio/http/rest-api';

const margin = 20;

class QueryBuilder extends React.Component {

    constructor(props){
        super(props);
        this.graph = new dia.Graph();
        this.state = this.buildGraph();
    }

    detectTypes(){
        const {query, queryType} = this.props;
        let inputIcon, outputIcon;
        let objectType = 'node';
        if(query instanceof JobsNodesSelector) {
            objectType = 'node';
        } else if(query instanceof JobsIdmSelector) {
            objectType = 'user';
            switch (query.Type) {
                case "User":
                    objectType = 'user';
                    break;
                case "Workspace":
                    objectType = 'workspace';
                    break;
                case "Role":
                    objectType = 'role';
                    break;
                case "Acl":
                    objectType = 'acl';
                    break;
                default:
                    break;
            }
        } else if (query instanceof JobsUsersSelector) {
            objectType = 'user';
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
        return {inputIcon, outputIcon, objectType};
    }

    buildGraph(){
        const {query} = this.props;
        const {inputIcon, outputIcon} = this.detectTypes();
        const input = new Input(inputIcon);
        const output = new Output(outputIcon);
        input.addTo(this.graph);
        output.addTo(this.graph);
        if(query.All) {
            const all = new Query('Select All');
            all.addTo(this.graph);
            const link = new Link(input.id, 'search', all.id, 'input');
            link.addTo(this.graph);
            const link2 = new Link(all.id, 'output', output.id, 'input');
            link2.addTo(this.graph);
        } else if(query.Query && query.Query.SubQueries) {
            query.Query.SubQueries.forEach(q => {
                Object.keys(q.value).forEach(key => {
                    const field = new Query(key, q.value[key]);
                    field.addTo(this.graph);
                    const link = new Link(input.id, 'search', field.id, 'input');
                    link.addTo(this.graph);
                    const link2 = new Link(field.id, 'output', output.id, 'input');
                    link2.addTo(this.graph);
                })
            })
        }
        return layout.DirectedGraph.layout(this.graph, {
            nodeSep: 20,
            edgeSep: 20,
            rankSep: 40,
            rankDir: "LR",
            marginX: margin,
            marginY: margin,
            dagre,
            graphlib
        });

    }

    componentDidMount(){

        const {width, height} = this.state;
        this.paper = new dia.Paper({
            el: ReactDOM.findDOMNode(this.refs.graph),
            width: 300,
            height: height + margin*2,
            model: this.graph,
            interactive: {
                addLinkFromMagnet: false,
                useLinkTools: false,
                elementMove: true
            }
        });
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

    render() {

        const {queryType, style} = this.props;
        const {objectType} = this.detectTypes();
        const title = (queryType === 'filter' ? 'Filter' : 'Select') + ' ' +  objectType + (queryType === 'filter' ? '' : 's');

        return (
            <div style={style}>
                <div>{title}</div>
                <div ref={"graph"} id={"graph"}></div>
                <FlatButton label={"Remove"} onTouchTap={this.remove.bind(this)}/>
            </div>
        );
    }

}

export default QueryBuilder