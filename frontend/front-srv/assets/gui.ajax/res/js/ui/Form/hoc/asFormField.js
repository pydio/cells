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

/**
 * React Mixin for Form Element
 */
export default (Field, skipBufferChanges = false) => {

    class FormField extends React.Component {

        // propTypes:{
        //     attributes:React.PropTypes.object.isRequired,
        //     name:React.PropTypes.string.isRequired,
        //
        //     displayContext:React.PropTypes.oneOf(['form', 'grid']),
        //     disabled:React.PropTypes.bool,
        //     multiple:React.PropTypes.bool,
        //     value:React.PropTypes.any,
        //     onChange:React.PropTypes.func,
        //     onChangeEditMode:React.PropTypes.func,
        //     binary_context:React.PropTypes.string,
        //     errorText:React.PropTypes.string
        // },

        constructor(props) {
            props = {displayContext:'form', disabled:false, ...props};
            super(props);
            this.state = {
                editMode:false,
                dirty:false,
                value:this.props.value
            };
        }

        isDisplayGrid(){
            return this.props.displayContext === 'grid';
        }

        isDisplayForm(){
            return this.props.displayContext === 'form';
        }

        toggleEditMode(){
            if(this.isDisplayForm()) {
                return;
            }
            const newState = !this.state.editMode;
            this.setState({editMode:newState});
            if(this.props.onChangeEditMode){
                this.props.onChangeEditMode(newState);
            }
        }

        enterToToggle(event){
            if(event.key === 'Enter'){
                this.toggleEditMode();
            }
        }

        bufferChanges(newValue, oldValue){
            this.triggerPropsOnChange(newValue, oldValue);
        }

        onChange(event, value){
            if(value === undefined) {
                value = event.currentTarget.getValue ? event.currentTarget.getValue() : event.currentTarget.value;
            }
            if(this.changeTimeout){
                clearTimeout(this.changeTimeout);
            }
            const newValue = value, oldValue = this.state.value;
            if(skipBufferChanges){
                this.triggerPropsOnChange(newValue, oldValue);
            }
            this.setState({
                dirty:true,
                value:newValue
            });
            if(!skipBufferChanges) {
                let timerLength = 250;
                if(this.props.attributes['type'] === 'password'){
                    timerLength = 1200;
                }
                this.changeTimeout = setTimeout(function () {
                    this.bufferChanges(newValue, oldValue);
                }.bind(this), timerLength);
            }
        }

        triggerPropsOnChange(newValue, oldValue){
            if(this.props.attributes['type'] === 'password'){
                this.toggleEditMode();
                this.props.onChange(newValue, oldValue, {type:this.props.attributes['type']});
            }else{
                this.props.onChange(newValue, oldValue);
            }
        }

        componentWillReceiveProps(newProps){
            this.setState({
                value:newProps.value,
                dirty:false,
            });
        }

        isValid() {
            if(this.refs['internal'] && this.refs['internal'].isValid) {
                return this.refs['internal'].isValid();
            } else {
                return true;
            }
        }

        render() {
            return (
                <Field
                    {...this.props} {...this.state}
                    ref={'internal'}
                    onChange={(e,v)=>this.onChange(e,v)}
                    toggleEditMode={()=>this.toggleEditMode()}
                    enterToToggle={(e)=>this.enterToToggle(e)}
                    isDisplayGrid={()=>this.isDisplayGrid()}
                    isDisplayForm={()=>this.isDisplayForm()}
                />
            );
        }
    }

    return FormField;

};