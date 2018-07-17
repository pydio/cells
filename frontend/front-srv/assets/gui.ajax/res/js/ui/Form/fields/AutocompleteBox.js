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

import FormMixin from '../mixins/FormMixin'
const React = require('react');
const {AutoComplete, MenuItem, RefreshIndicator} = require('material-ui');
import FieldWithChoices from '../mixins/FieldWithChoices'

let AutocompleteBox = React.createClass({

    mixins:[FormMixin],

    handleUpdateInput: function(searchText) {
        //this.setState({searchText: searchText});
    },

    handleNewRequest: function(chosenValue) {
        if (chosenValue.key === undefined){
            this.onChange(null, chosenValue);
        } else {
            this.onChange(null, chosenValue.key);
        }
    },

    render: function(){

        const {choices} = this.props;
        let dataSource = [];
        let labels = {};
        choices.forEach((choice, key) => {
            dataSource.push({
                key         : key,
                text        : choice,
                value       : <MenuItem>{choice}</MenuItem>
            });
            labels[key] = choice;
        });

        let displayText = this.state.value;
        if(labels && labels[displayText]){
            displayText = labels[displayText];
        }

        if((this.isDisplayGrid() && !this.state.editMode) || this.props.disabled){
            let value = this.state.value;
            if(choices.get(value)) {
                value = choices.get(value);
            }
            return (
                <div
                    onClick={this.props.disabled?function(){}:this.toggleEditMode}
                    className={value?'':'paramValue-empty'}>
                    {!value?'Empty':value} &nbsp;&nbsp;<span className="icon-caret-down"></span>
                </div>
            );
        }

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
                {dataSource.length &&
                    <AutoComplete
                        fullWidth={true}
                        searchText={displayText}
                        onUpdateInput={this.handleUpdateInput}
                        onNewRequest={this.handleNewRequest}
                        dataSource={dataSource}
                        floatingLabelText={this.props.attributes['label']}
                        filter={(searchText, key) => (key.toLowerCase().indexOf(searchText.toLowerCase()) === 0)}
                        openOnFocus={true}
                        menuProps={{maxHeight: 200}}
                    />
                }
            </div>

        );
    }

});

AutocompleteBox = FieldWithChoices(AutocompleteBox);
export {AutocompleteBox as default}