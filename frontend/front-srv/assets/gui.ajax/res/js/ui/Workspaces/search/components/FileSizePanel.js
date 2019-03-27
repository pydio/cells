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

import React from 'react';
import Pydio from 'pydio';
const {ModernTextField, ModernSelectField} = Pydio.requireLib('hoc');
const {PydioContextConsumer} = Pydio.requireLib('boot');
import {MenuItem} from 'material-ui'

class SearchFileSizePanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            from:false,
            to: null,
            fromUnit: 'k',
            toUnit: 'k'
        }
    }

    multiple(v, u){
        switch(u){
            case "k":
                return v * 1024;
            case "M":
                return v * 1024 * 1024;
            case "G":
                return v * 1024 * 1024 * 1024;
            case "T":
                return v * 1024 * 1024 * 1024 * 1024;
            default:
                return v
        }
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState === this.state) {
            return;
        }

        const {from, to, fromUnit, toUnit} = nextState;

        this.props.onChange({
            ajxp_bytesize: (from || to) ? {
                from:this.multiple(from, fromUnit),
                to: this.multiple(to, toUnit)
            } : null
        })
    }

    render() {
        const sizeUnit = Pydio.getMessages()['byte_unit_symbol'] || 'B';
        const {getMessage} = this.props;
        const blockStyle={display:'flex', margin:'0 16px'};
        return (
            <div>
                <div style={blockStyle}>
                    <ModernTextField
                        style={{flex: 2, marginRight: 4}}
                        type={"number"}
                        hintText={getMessage(613)}
                        onChange={(e,v) => {
                            this.setState({from:v || 0})
                        }}
                    />
                    <ModernSelectField
                        value={this.state.fromUnit}
                        onChange={(e,i,v) => {this.setState({fromUnit: v})}}
                        style={{marginLeft: 4, flex: 1}}
                    >
                        <MenuItem value={''} primaryText={sizeUnit}/>
                        <MenuItem value={'k'} primaryText={'K' + sizeUnit}/>
                        <MenuItem value={'M'} primaryText={'M' + sizeUnit}/>
                        <MenuItem value={'G'} primaryText={'G' + sizeUnit}/>
                        <MenuItem value={'T'} primaryText={'T' + sizeUnit}/>
                    </ModernSelectField>
                </div>
                <div style={blockStyle}>
                    <ModernTextField
                        style={{flex: 2, marginRight: 4}}
                        type={"number"}
                        hintText={getMessage(614)}
                        onChange={(e,v) => {
                            this.setState({to:v || 109951162})
                        }}
                    />
                    <ModernSelectField
                        style={{marginLeft: 4, flex: 1}}
                        value={this.state.toUnit}
                        onChange={(e,i,v) => {this.setState({toUnit: v})}}
                    >
                        <MenuItem value={''} primaryText={sizeUnit}/>
                        <MenuItem value={'k'} primaryText={'K' + sizeUnit}/>
                        <MenuItem value={'M'} primaryText={'M' + sizeUnit}/>
                        <MenuItem value={'G'} primaryText={'G' + sizeUnit}/>
                        <MenuItem value={'T'} primaryText={'T' + sizeUnit}/>
                    </ModernSelectField>
                </div>
            </div>
        );
    }
}

SearchFileSizePanel = PydioContextConsumer(SearchFileSizePanel);
export default SearchFileSizePanel