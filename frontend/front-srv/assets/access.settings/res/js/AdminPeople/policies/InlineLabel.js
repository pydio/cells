/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {TextField} from 'material-ui'

class InlineLabel extends React.Component{


    constructor(props){
        super(props);
        this.state = {edit: false, hover: false, label: props.label};
    }

    onChange(event, value){
        this.setState({label: value});
    }

    onEnter(event){
        if(event.key === "Enter"){
            this.setState({edit: false});
            this.props.onChange(this.state.label);
        }
    }

    cancel(){
        this.setState({edit:false, hover: false, label: this.props.label});
    }

    open(event){
        this.setState({
            edit:true,
            elementWidth: Math.max(event.target.offsetWidth, 256)
        }, ()=>{this.refs.text.select();})
    }

    render(){

        const {edit, hover, label} = this.state;

        if(edit){
            return <div style={{backgroundColor: '#f4f4f4'}}>
                <TextField
                fullWidth={this.state.elementWidth}
                style={{marginTop: -20, width: this.state.elementWidth}}
                value={label}
                onChange={this.onChange.bind(this)}
                onKeyDown={this.onEnter.bind(this)}
                underlineShow={false}
                ref="text"
                inputStyle={this.props.inputStyle}
                onBlur={this.cancel.bind(this)}
            /> <span style={{fontStyle:'italic', opacity: 0.8}}>(Hit enter to save)</span></div>
        } else {
            let editIcon;
            if (hover){
                editIcon = <span className="mdi mdi-pencil" style={{color: '#e0e0e0'}} onMouseOver={()=>{this.setState({hover:true})}}/>;
            }
            return (
                <span>
                    <span
                        style={{pointer: 'cursor'}}
                        title="Click to edit"
                        onClick={this.open.bind(this)}
                        onMouseOver={()=>{this.setState({hover:true})}}
                        onMouseOut={()=>{this.setState({hover:false})}}
                    >{label} {editIcon} </span>
                    {this.props.legend}
                </span>
            )
        }

    }

}

export {InlineLabel as default}