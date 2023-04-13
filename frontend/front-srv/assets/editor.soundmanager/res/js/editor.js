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
import Pydio from 'pydio'
import React, {Component} from 'react'
import { connect } from 'react-redux'
import { Table, TableBody, TableRow, TableRowColumn, Paper } from 'material-ui'
import Player from './Player';
const PydioApi = require('pydio/http/api');
const {withSelection, EditorActions} = Pydio.requireLib("hoc");

const editors = Pydio.getInstance().Registry.getActiveExtensionByType("editor")
const conf = editors.filter(({id}) => id === 'editor.soundmanager')[0]

const getSelectionFilter = (node) => conf.mimes.indexOf(node.getAjxpMime()) > -1

const getSelection = (node) => new Promise((resolve, reject) => {
    let selection = [];

    node.getParent().getChildren().forEach((child) => selection.push(child));
    selection = selection.filter(getSelectionFilter).sort((a,b)=>{
        return a.getLabel().localeCompare(b.getLabel(), undefined, {numeric:true})
    })

    resolve({
        selection,
        currentIndex: selection.reduce((currentIndex, current, index) => current === node && index || currentIndex, 0)
    })
});

const styles = {
    container: {
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex: 1
    },
    player: {
        margin: "auto"
    },
    table: {
        width: 320
    }
};

@withSelection(getSelection)
@connect(null, EditorActions)
class Editor extends Component {

    componentDidMount() {
        this.loadNode(this.props)
        const {editorModify} = this.props;
        if (this.props.isActive) {
            editorModify({fixedToolbar: false})
        }
    }

    componentWillReceiveProps(nextProps) {
        const {editorModify} = this.props;
        if (nextProps.isActive) {
            editorModify({fixedToolbar: false})
        }
        if (nextProps.node !== this.props.node) {
            this.setState({url: ''}, () => {
                this.loadNode(nextProps)
            });
        }
    }

    loadNode(props) {
        const {node} = props;

        PydioApi.getClient().buildPresignedGetUrl(node, (url) => {
        this.setState({
            node: node,
            url: url,
            mimeType: "audio/" + node.getAjxpMime()
        })

        }, "audio/" + node.getAjxpMime());
    }

    playNext(){
        const {selection} = this.props;
        const {node} = this.state;
        const index = selection.selection.indexOf(node);
        if(index < selection.selection.length - 1){
            this.onRowSelection([index +1]);
        }
    }

    onRowSelection(data){
        if(!data.length) return;
        const {selection} = this.props;
        if(!selection) return;
        this.setState({url: null}, () => {
            this.loadNode({node: selection.selection[data[0]]});
        });
    }

    render() {
        const {mimeType, url, node} = this.state || {}

        return (
            <div style={styles.container}>
                <Paper zDepth={3} style={styles.player}>
                    <div style={{padding:'0 60px'}}>
                        {url &&
                            <Player autoPlay={true} rich={!this.props.icon && this.props.rich} onReady={this.props.onLoad} onFinish={() => {this.playNext()}}>
                                <a type={mimeType} href={url} />
                            </Player>
                        }
                    </div>
                    <div style={{clear: 'both'}}>
                    <Table
                        style={styles.table}
                        selectable={true}
                        multiSelectable={false}
                        height={250}
                        onRowSelection={(data) => {this.onRowSelection(data)}}
                    >
                        <TableBody
                            displayRowCheckbox={false}
                            stripedRows={false}
                            deselectOnClickaway={false}
                        >
                        {this.props.selection && this.props.selection.selection.map( (n, index) => (
                            <TableRow key={index}>
                                <TableRowColumn style={{width: 16, backgroundColor:'white'}}>{node && n.getPath() === node.getPath() ? <span className={"mdi mdi-play"}/> : index}</TableRowColumn>
                                <TableRowColumn style={{backgroundColor:'white'}}>{n.getLabel()}</TableRowColumn>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </div>
                </Paper>

            </div>
        );
    }
}

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}



export default Editor
