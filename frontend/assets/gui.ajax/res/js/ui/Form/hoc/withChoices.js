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

const {Component} = require('react');
import Repository from 'pydio/model/repository'
import PydioApi from 'pydio/http/api'
const {PydioContextConsumer} = require('pydio').requireLib('boot')

export default function (PydioComponent){

    class FieldWithChoices extends Component{

        loadExternalValues(choices) {

            const {pydio} = this.props;
            let parsed = true;

            let list_action;
            if (choices instanceof Map) {
                if (this.onChoicesLoaded) {
                    this.onChoicesLoaded(choices);
                }
                return {choices, parsed};
            }

            let output = new Map();
            if (choices.indexOf('json_file:') === 0) {
                parsed = false;
                list_action = choices.replace('json_file:', '');
                output.set('0', pydio.MessageHash['ajxp_admin.home.6']);
                PydioApi.getClient().loadFile(list_action, (transport) => {
                    let newOutput = new Map();
                    if(transport.responseJSON){
                        transport.responseJSON.forEach(entry => {
                            newOutput.set(entry.key, entry.label);
                        });
                    } else if(transport.responseText){
                        try{
                            JSON.parse(transport.responseText).forEach(entry => {
                                newOutput.set(entry.key, entry.label);
                            });
                        }catch (e){
                            console.log('Error while parsing list ' + choices, e);
                        }
                    }
                    this.setState({choices: newOutput}, () => {
                        if (this.onChoicesLoaded) {
                            this.onChoicesLoaded(newOutput);
                        }
                    });
                });
            } else if (choices === "PYDIO_AVAILABLE_LANGUAGES") {
                pydio.listLanguagesWithCallback(function (key, label) {
                    output.set(key, label);
                });
                if (this.onChoicesLoaded) {
                    this.onChoicesLoaded(output);
                }
            } else if (choices === "PYDIO_AVAILABLE_REPOSITORIES") {
                if (pydio.user) {
                    const sorter = [];
                    const pages = [];
                    pydio.user.repositories.forEach(function (repository) {
                        if(Repository.isInternal(repository.getId())){
                            pages.push({id: repository.getId(), label: '['+pydio.MessageHash['331']+'] ' + repository.getLabel()});
                        } else if(repository.getRepositoryType() !== "cell"){
                            sorter.push({id:repository.getId(), label:repository.getLabel()});
                        }
                    });
                    sorter.sort((a,b)=> a.label.localeCompare(b.label, undefined, {numeric: true}));
                    sorter.push(...pages);
                    sorter.forEach(d => output.set(d.id, d.label));
                }
                if (this.onChoicesLoaded) {
                    this.onChoicesLoaded(output);
                }
            } else {
                // Parse string and return map
                choices.split(",").map(function (choice) {
                    let label, value;
                    const l = choice.split('|');
                    if (l.length > 1) {
                        value = l[0];
                        label = l[1];
                    } else {
                        value = label = choice;
                    }
                    if (pydio.MessageHash[label]) {
                        label = pydio.MessageHash[label];
                    }
                    output.set(value, label);
                });

            }
            return {choices: output, parsed};
        }

        constructor(props, context){
            super(props, context);
            let choices = new Map();
            choices.set('0', this.props.pydio ? this.props.pydio.MessageHash['ajxp_admin.home.6'] : ' ... ');
            this.state = {choices: choices, choicesParsed: false};
        }

        componentDidMount(){
            if(this.props.attributes['choices']) {
                const {choices, parsed} = this.loadExternalValues(this.props.attributes['choices']);
                this.setState({choices: choices, choicesParsed: parsed});
            }
        }

        componentWillReceiveProps(newProps){
            if(newProps.attributes['choices'] && newProps.attributes['choices'] !== this.props.attributes['choices']) {
                const {choices, parsed} = this.loadExternalValues(newProps.attributes['choices']);
                this.setState({
                    choices:choices,
                    choicesParsed: parsed
                });
            }
        }

        render(){
            return <PydioComponent {...this.props} {...this.state}/>
        }

    }

    return PydioContextConsumer(FieldWithChoices);

}