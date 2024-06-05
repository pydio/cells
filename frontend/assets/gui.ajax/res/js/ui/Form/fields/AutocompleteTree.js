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
import asFormField from "../hoc/asFormField";
const debounce = require('lodash.debounce');
const {AutoComplete, MenuItem, RefreshIndicator, FontIcon} = require('material-ui');

class AutocompleteTree extends React.Component{

    handleUpdateInput(searchText) {
        this.debounced();
        this.setState({searchText: searchText});
    }

    handleNewRequest(chosenValue) {
        let key;
        if (chosenValue.key === undefined) {
            key = chosenValue;
        } else {
            key = chosenValue.key;
        }
        this.props.onChange(null, key);
        this.loadValues(key);
    }

    componentWillMount(){
        this.debounced = debounce(this.loadValues.bind(this), 300);
        this.lastSearch = null;
        let value = "";
        if(this.props.value){
            value = this.props.value;
        }
        this.loadValues(value);
    }

    loadValues(value = "") {
        let basePath = value;
        if (!value && this.state.searchText){
            let last = this.state.searchText.lastIndexOf('/');
            basePath = this.state.searchText.substr(0, last);
        }
        if(this.lastSearch !== null && this.lastSearch === basePath){
            return;
        }
        this.lastSearch = basePath;
        // TODO : load values from service
    }

    render(){

        let dataSource = [];
        if (this.state && this.state.nodes){
            this.state.nodes.forEach((node) => {
                let icon = "mdi mdi-folder";
                if (node.uuid.startsWith("DATASOURCE:")){
                    icon = "mdi mdi-database";
                }
                dataSource.push({
                    key         : node.path,
                    text        : node.path,
                    value       : <MenuItem><FontIcon className={icon} color="#616161" style={{float:'left',marginRight:8}}/> {node.path}</MenuItem>
                });
            });
        }

        let displayText = this.state.value;

        return (
            <div className="pydioform_autocomplete" style={{position:'relative'}}>
                {!dataSource.length &&
                    <RefreshIndicator
                        size={30}
                        right={10}
                        top={0}
                        status="loading"
                    />
                }
                <AutoComplete
                    fullWidth={true}
                    searchText={displayText}
                    onUpdateInput={this.handleUpdateInput.bind(this)}
                    onNewRequest={this.handleNewRequest.bind(this)}
                    dataSource={dataSource}
                    floatingLabelText={this.props.attributes['label']}
                    filter={(searchText, key) => (key.toLowerCase().indexOf(searchText.toLowerCase()) === 0)}
                    openOnFocus={true}
                    menuProps={{maxHeight: 200}}
                />
            </div>

        );
    }

}


export default asFormField(AutocompleteTree);