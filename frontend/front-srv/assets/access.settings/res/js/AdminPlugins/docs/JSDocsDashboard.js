/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

import {Component} from 'react'
import {List, ListItem, Paper, CardTitle, Divider, Subheader, TextField,
    Table, TableHeader, TableRow, TableBody, TableHeaderColumn, TableRowColumn} from 'material-ui'
import PathUtils from 'pydio/util/path'

class JSDocsPanel extends Component{

    constructor(props, context){
        super(props, context);
        this.state = {data : {}, selection: null, search: ''};
    }

    componentDidMount(){
        PydioApi.getClient().loadFile('plug/gui.ajax/docgen.json', (transp) => {
            if(!transp.responseJSON || !transp.responseJSON['gui.ajax']){
                this.setState({error: 'Docs are not loaded, you probably have to run \'grunt docgen\' command inside the gui.ajax plugin.'});
                return;
            }
            let data = transp.responseJSON['gui.ajax'];
            Object.keys(transp.responseJSON).forEach((pluginId) => {
                if(pluginId === 'gui.ajax') return;
                const comps = transp.responseJSON[pluginId];
                Object.keys(comps).forEach((compName) => {
                    data[pluginId + '/' + compName] = comps[compName];
                });
            });
            this.setState({data});
        });
    }

    onSearch(event, value){
        this.setState({search: value});
    }

    render(){

        const {data, selection, search, error} = this.state;
        let items = [];
        let classPathes = {};
        Object.keys(data).forEach((key) => {

            const parts = key.split('/');
            const classPath = parts.shift();
            let title = parts.pop().replace('.js', '').replace('.es6', '');
            if(search && title.indexOf(search) === -1){
                return;
            }else if(search && title.indexOf(search) > -1){
                let parts = [];
                const startIndex = title.indexOf(search);
                const endIndex = startIndex + search.length;
                if(startIndex > 0) parts.push(title.substr(0, startIndex));
                parts.push(<span style={{color:'#E64A19'}}>{title.substr(startIndex, search.length)}</span>);
                if(endIndex < title.length - 1) parts.push(title.substr(endIndex));
                title = <span>{parts}</span>
            }
            const secondary = parts.join('/');
            if(!classPathes[classPath]){
                classPathes[classPath] = classPath;
                items.push(<Divider key={key+'-div'}/>);
                items.push(<Subheader key={key+'-sub'}>{classPath}</Subheader>);
            }
            items.push(
                <ListItem
                    key={key}
                    primaryText={title}
                    onClick={() => {this.setState({selection:key})}}
                />
            );
        });
        const adminStyles = AdminComponents.AdminStyles();
        return (
            <div className={"main-layout-nav-to-stack vertical-layout"}>
                <AdminComponents.Header
                    title={"Javascript SDK Documentation"}
                    icon="mdi mdi-nodejs"
                />
                <div className={"layout-fill"} style={{display:'flex', backgroundColor:'white'}}>
                    <Paper zDepth={1} style={{width:256, overflowY:'scroll', display:'flex', flexDirection:'column', zIndex: 1}}>
                        <div style={{padding:16, paddingBottom: 0, paddingTop: 8}}>
                            <TextField fullWidth={true} value={search} onChange={this.onSearch.bind(this)} hintText="Search classes..." underlineShow={false}/>
                        </div>
                        {error && <div style={{padding:16}}>{error}</div>}
                        <List style={{flex:1}}>{items}</List>
                    </Paper>
                    <div style={{flex:1, overflowY: 'scroll', backgroundColor:adminStyles.body.mainPanel.backgroundColor}}>
                        {selection &&
                            <ClassPanel path={selection} data={data[selection][0]}/>
                        }
                    </div>
                </div>
            </div>
        );

    }

}

class ClassPanel extends Component{

    render(){
        const {path, data} = this.props;
        const title = PathUtils.getBasename(path);
        const classPath = PathUtils.getDirname(path);
        const largeColumn = {width: '35%'};

        let props = [], methods = [];
        if(data.props && path.indexOf('core/') !== 0){
            Object.keys(data.props).forEach((pName) => {
                const pData = data.props[pName];
                props.push(
                    <TableRow key={pName}>
                        <TableRowColumn style={{fontSize: 16}}>{pName}</TableRowColumn>
                        <TableRowColumn style={largeColumn}>{pData.description}</TableRowColumn>
                        <TableRowColumn>{pData.type && pData.type.raw && pData.type.raw.replace('PropTypes.', '').replace('.isRequired', '')}</TableRowColumn>
                        <TableRowColumn>{(pData.required || (pData.type && pData.type.raw && pData.type.raw.indexOf('.isRequired') > -1) ) ? 'true': ''}</TableRowColumn>
                    </TableRow>
                );
            });
        }

        if(data.methods){
            methods = data.methods.map((mData) => {
                let params = mData.params.map((p) => {
                    return <div>{p.name + (p.type ? (' (' + p.type.name + ') ') : '') + (p.description? ': ' + p.description : '')}</div>;
                });
                return(
                    <TableRow key={mData.name}>
                        <TableRowColumn style={{fontSize: 16}}>{mData.name}</TableRowColumn>
                        <TableRowColumn style={largeColumn}>{mData.description}</TableRowColumn>
                        <TableRowColumn>{params}</TableRowColumn>
                        <TableRowColumn>{mData.returns && mData.returns.type ? mData.returns.type.name : ''}</TableRowColumn>
                    </TableRow>
                );
            });
        }
        const dStyle = {padding:'0 16px 16px'};
        const adminStyles = AdminComponents.AdminStyles();

        return (
            <div style={{paddingBottom:16}}>
                <CardTitle title={title} subtitle={classPath}/>
                <div style={dStyle}>{data.description}</div>
                {data.require &&
                    <div style={dStyle}><em>Usage: </em> <code>{data.require}</code></div>
                }
                <CardTitle title="Props"/>
                {props.length > 0 &&
                <Paper {...adminStyles.body.block.props}>
                    <Table>
                        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                            <TableRow>
                                <TableHeaderColumn>Name</TableHeaderColumn>
                                <TableHeaderColumn style={largeColumn}>Description</TableHeaderColumn>
                                <TableHeaderColumn>Type</TableHeaderColumn>
                                <TableHeaderColumn>Required</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody displayRowCheckbox={false}>
                            {props}
                        </TableBody>
                    </Table>
                </Paper>
                }
                {!props.length && <div style={{...dStyle, color: 'rgba(0,0,0,0.33)'}}>No Props documented</div>}
                <CardTitle title="Methods"/>
                {methods.length > 0 &&
                <Paper {...adminStyles.body.block.props}>
                    <Table>
                        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                            <TableRow>
                                <TableHeaderColumn>Name</TableHeaderColumn>
                                <TableHeaderColumn style={largeColumn}>Description</TableHeaderColumn>
                                <TableHeaderColumn>Parameters</TableHeaderColumn>
                                <TableHeaderColumn>Return</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody displayRowCheckbox={false}>
                            {methods}
                        </TableBody>
                    </Table>
                </Paper>
                }
                {!methods.length && <div style={{...dStyle, color: 'rgba(0,0,0,0.33)'}}>No Methods documented</div>}
            </div>
        );
    }

}

export {JSDocsPanel as default}