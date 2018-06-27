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

const React = require('react');
const {List, ListItem, FlatButton, Paper, Divider} = require('material-ui');
const PydioApi = require('pydio/http/api');
const {Loader, PydioContextConsumer} = require('pydio').requireLib('boot');
const {ClipboardTextField, MaterialTable} = require('pydio').requireLib('components');

class DiagnosticDashboard extends React.Component{

    constructor(props, context){
        super(props,context);
        this.state = {loaded: false, entries: {}, copy: false};
    }

    componentDidMount(){
        if(this.state.loaded) return;
        this.setState({loading: true});
        PydioApi.getClient().request({
            get_action:'ls',
            dir: this.props.access || '/admin/php',
            format: 'json'
        }, (transport) => {
            const resp = transport.responseJSON;
            if(!resp || !resp.children) return;
            this.setState({loaded: true, loading: false, entries: resp.children});
        });
    }

    render(){

        const {entries, loading, copy} = this.state;
        const columns = [
            {name:'label', label:'Label', style:{fontSize:15, width: '30%'}, headerStyle:{width:'30%'}},
            {name:'info', label:'Info'}
        ];
        let tableData = [];
        let content, copyPanel, copyContent = '';
        if(loading){
            content = <Loader/>;
        }else{
            let listItems = [];
            Object.keys(entries).forEach((k) => {
                const entry = entries[k];
                let data = entry.data;
                if(typeof data === 'boolean'){
                    data = data ? 'Yes' : 'No';
                }
                listItems.push(
                    <ListItem
                        key={k}
                        primaryText={entry.label}
                        secondaryText={data}
                        disabled={true}

                    />
                );
                listItems.push(<Divider/>);
                copyContent += entry.label + ' : ' + data + '\n';
                tableData.push({
                    label:entry.label,
                    info : data
                })
            });
            if(listItems.length) {
                listItems.pop();
            }
            content = <List>{listItems}</List>;
            content = (
                <MaterialTable
                    data={tableData}
                    columns={columns}
                    onSelectRows={()=>{}}
                    showCheckboxes={false}
                />
            );
        }

        if(copy){
            copyPanel = (
                <Paper zDepth={2} style={{position:'absolute', top: '15%', left: '20%', width: '60%', padding:'20px 20px 0', height:370, overflowY: 'auto', zIndex:2}}>
                    <div style={{fontSize: 20}}>Copy Diagnostic</div>
                    <ClipboardTextField rows={5} rowsMax={10} multiLine={true} inputValue={copyContent} floatingLabelText={this.props.getMessage('5', 'settings')} getMessage={this.props.getMessage}/>
                    <div style={{textAlign:'right'}}>
                        <FlatButton label="Close" onTouchTap={() => {this.setState({copy:false})}} secondary={true}/>
                    </div>
                </Paper>
            )
        }

        return (
            <div style={{height: '100%', display:'flex', flexDirection:'column', position:'relative'}}>
                <AdminComponents.Header
                    title={this.props.getMessage('5', 'settings')}
                    icon={"mdi mdi-stethoscope"}
                    actions={<FlatButton label="Copy" onTouchTap={() => {this.setState({copy:true})}} secondary={true} style={{marginRight: 16}}/>}
                    loading={loading}
                />
                {copyPanel}
                <div style={{flex: 1, overflowY: 'auto'}}>
                    <Paper zDepth={1} style={{margin:16}}>{content}</Paper>
                </div>

            </div>
        );

    }

}

DiagnosticDashboard = PydioContextConsumer(DiagnosticDashboard);
export {DiagnosticDashboard as default}