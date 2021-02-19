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
import PropTypes from 'prop-types';

import Pydio from 'pydio';
import {FlatButton} from 'material-ui'

export default {

    propTypes:{
        showCloseAction:PropTypes.bool,
        onCloseAction:PropTypes.func
    },

    focusItem:function(){
        this.setState({focus:true});
    },

    blurItem:function(){
        this.setState({focus:false});
    },

    mergeStyleWithFocus:function(){
        return {...this.props.style, zIndex: this.state.focus ? 1 : null};
    },

    getInitialSate:function(){
        return {focus:false, showCloseAction: false};
    },

    toggleEditMode: function(value = undefined){
        if(value === undefined){
            this.setState({showCloseAction:!(this.state && this.state.showCloseAction)});
        }else{
            this.setState({showCloseAction:value});
        }
    },

    getCloseButton:function(){
        if(this.state && this.state.showCloseAction){
            const closeAction = this.props.onCloseAction || (()=>{});
            const overlayStyle = {
                position:'absolute',
                backgroundColor:'rgba(0,0,0,0.53)',
                zIndex:10,
                top:0,
                left:0,
                bottom:0,
                right:0,
                display:'flex',
                alignItems:'center',
                justifyContent:'center'
            };
            return(
                <div style={overlayStyle}>
                    <FlatButton
                        label={Pydio.getInstance().MessageHash['ajxp_admin.home.48']}
                        className="card-close-button"
                        onClick={closeAction}
                        style={{color:'white'}}
                    >
                    </FlatButton>
                </div>
            );
        }else{
            return null;
        }
    },

    statics:{
        getGridLayout:function(x, y){
            return {
                x:x||0,
                y:y||0,
                w:this.gridWidth || 4,
                h:this.gridHeight || 12,
                isResizable:false
            };
        },
        hasBuilderFields:function(){
            return this.builderFields?true:false;
        },
        getBuilderFields:function(){
            return this.builderFields;
        }
    }

};
