/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import React from 'react'
import Pydio from 'pydio'
import LangUtils from 'pydio/util/lang'
import colorsFromString from "../hoc/colorsFromString";
import asMetaForm from "../hoc/asMetaForm";
import MetaClient from "../MetaClient";

import {MenuItem, Chip, AutoComplete} from 'material-ui'
const {ModernStyles} = Pydio.requireLib('hoc');


class TagsCloud extends React.Component {

    constructor(props) {
        super(props);
        const {node, value, column} = this.props;
        this.state = {
            loading     : false,
            dataSource  : [],
            tags        : (node ? node.getMetadata().get(column.name) : value),
            searchText  : ''
        }
    }

    componentDidMount() {
        this.getRealValue();
        if(this.props.editMode){
            this.load();
        }
    }

    componentWillReceiveProps(nextProps) {
        let {node, value, column} = nextProps;
        if(node){
            this.setState({tags: node.getMetadata().get(column.name)});
        }else if(value){
            this.setState({tags: value});
        } else {
            this.setState({tags: ''})
        }
        if(nextProps.editMode && !this.state.loaded) {
            this.load();
        }
    }

    getRealValue(){
        let {node, value, column} = this.props;
        if (node == null) {
            this.setState({tags: value});
        } else {
            this.setState({tags: node.getMetadata().get(column.name)});
        }
    }

    suggestionLoader(callback) {
        this.setState({loading:this.state.loading + 1});

        MetaClient.getInstance().listTags(this.props.fieldname || this.props.column.name).then(tags => {
            this.setState({loading:this.state.loading - 1});
            callback(tags);
        });
    }

    load() {
        this.setState({loading: true});
        this.suggestionLoader(function(tags){
            const values = tags.filter(tag => !!tag).map((tag) => {
                return {
                    value:(
                        <MenuItem
                            innerDivStyle={{paddingLeft:0, marginLeft: 0}}
                            style={{margin:'5px 10px', fontSize: 14, fontWeight: 500, paddingLeft: 10, borderRadius: 4,...colorsFromString(tag)}}
                        >
                            <span className={'mdi mdi-label-outline'} style={{marginRight: 5}}/>{tag}
                        </MenuItem>),
                    text:tag
                };
            });
            this.setState({dataSource: values, loading: false, loaded: true});
        }.bind(this));
    }

    handleRequestDelete(tag) {
        const {updateValue} = this.props;
        let tags = this.state.tags.split(',');
        let index = tags.indexOf(tag);
        tags.splice(index, 1);
        this.setState({
                tags: tags.toString()},
            () => {
                updateValue(this.state.tags, true);
            });
    }

    handleUpdateInput(searchText) {
        this.setState({searchText: searchText});
    }

    handleNewRequest() {
        const {searchText, tags} = this.state;
        if (!searchText){
            return
        }
        let newTags = [];
        if (tags && tags.split) {
            newTags = tags.split(',');
        }
        if(newTags.indexOf(searchText) > -1){
            this.setState({searchText:''});
            return;
        }
        newTags.push(searchText);
        this.setState({
                searchText: '',
                tags: newTags.toString()},
            () => {
                const {updateValue} = this.props;
                updateValue(this.state.tags, true);
            });
    }

    renderChip(tag) {
        const {color, backgroundColor} = colorsFromString(tag);
        const chipStyle = {margin:2, borderRadius:'4px 16px 16px 4px'};
        const labelStyle = {color, fontWeight: 500, paddingLeft: 10, paddingRight: 16};
        if (this.props.editMode) {
            return ( <Chip key={tag} backgroundColor={backgroundColor} labelStyle={labelStyle} style={chipStyle} onRequestDelete={this.handleRequestDelete.bind(this, tag)}>{tag}</Chip> );
        } else {
            return ( <Chip key={tag} backgroundColor={backgroundColor} labelStyle={labelStyle} style={chipStyle}>{tag}</Chip> );
        }
    }

    render(){
        const {editMode, search} = this.props;
        const {tags, searchText} = this.state;

        let tagsList = <div/>, autoCompleter, knownTags = [];

        if (tags && tags.split) {
            knownTags = tags.split(',').map(tag => LangUtils.trim(tag, ' ')).filter(tag => !!tag)
            tagsList = knownTags.map(tag => this.renderChip(tag));
        }

        if (editMode) {
            autoCompleter = (
                <AutoComplete
                    fullWidth={true}
                    hintText={Pydio.getMessages()['meta.user.10']}
                    searchText={searchText}
                    onUpdateInput={this.handleUpdateInput.bind(this)}
                    onNewRequest={this.handleNewRequest.bind(this)}
                    dataSource={this.state.dataSource}
                    filter={(searchText, key) => (key.toLowerCase().indexOf(searchText.toLowerCase()) === 0 && knownTags.indexOf(key) === -1)}
                    openOnFocus={true}
                    menuProps={{maxHeight: 200, desktop: true}}
                    style={{marginBottom: -8}}
                    onClose={() => {if(searchText) {
                        this.handleNewRequest()
                    }}}
                    {...ModernStyles.textField}
                />
            );
        } else {
            autoCompleter = <div></div>
        }

        return (
            <div style={search?{marginBottom: 8}:{}}>
                {autoCompleter}
                <div style={{display: 'flex', flexWrap: 'wrap', zoom: .8, marginTop: 8}}>{tagsList}</div>
            </div>
        )
    }
}

export default asMetaForm(TagsCloud);
