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
import Pydio from 'pydio'
import asFormField from "../hoc/asFormField";
import withChoices from '../hoc/withChoices'
import {muiThemeable} from 'material-ui/styles'
const {AutoComplete, MenuItem, RefreshIndicator} = require('material-ui');
const {ThemedModernStyles, ModernAutoComplete} = Pydio.requireLib('hoc');

class AutocompleteBox extends React.Component{

    handleUpdateInput(searchText) {
        //this.setState({searchText: searchText});
    }

    handleNewRequest(chosenValue) {
        if (chosenValue.key === undefined){
            this.props.onChange(null, chosenValue);
        } else {
            this.props.onChange(null, chosenValue.key);
        }
    }

    render(){

        const {choices, isDisplayGrid, editMode, disabled,toggleEditMode, variant, muiTheme} = this.props;
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

        let {value} = this.props;
        if(labels && labels[value]){
            value = labels[value];
        }

        if((isDisplayGrid() && !editMode) || disabled){
            if(choices.get(value)) {
                value = choices.get(value);
            }
            return (
                <div
                    onClick={disabled?function(){}:toggleEditMode}
                    className={value?'':'paramValue-empty'}>
                    {value ? value : 'Empty'} &nbsp;&nbsp;<span className="mdi mdi-chevron-down"></span>
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
                {variant !== 'v2' && dataSource.length &&
                    <AutoComplete
                        fullWidth={true}
                        searchText={value}
                        onUpdateInput={(s) => this.handleUpdateInput(s)}
                        onNewRequest={(v) => this.handleNewRequest(v)}
                        dataSource={dataSource}
                        hintText={this.props.attributes['label']}
                        filter={(searchText, key) => {
                            if(!key || !searchText) {
                                return false;
                            }
                            return key.toLowerCase().indexOf(searchText.toLowerCase()) === 0
                        }}
                        openOnFocus={true}
                        menuProps={{maxHeight: 200}}
                        {...ThemedModernStyles(muiTheme).textField}
                    />
                }
                {variant === 'v2' && dataSource.length &&
                    <ModernAutoComplete
                        fullWidth={true}
                        searchText={value}
                        onUpdateInput={(s) => this.handleUpdateInput(s)}
                        onNewRequest={(v) => this.handleNewRequest(v)}
                        dataSource={dataSource}
                        hintText={this.props.attributes['label']}
                        filter={(searchText, key) => {
                            if(!key || !searchText) {
                                return false;
                            }
                            return key.toLowerCase().indexOf(searchText.toLowerCase()) === 0
                        }}
                        openOnFocus={true}
                        menuProps={{maxHeight: 200}}
                        autoComplete={'no-completion'}
                    />
                }
            </div>
        );
    }
}

AutocompleteBox = muiThemeable()(AutocompleteBox);
AutocompleteBox = asFormField(AutocompleteBox);
AutocompleteBox = withChoices(AutocompleteBox);
export {AutocompleteBox as default}