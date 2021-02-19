const PropTypes = require('prop-types');
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

const {
    Component
} = require('react')
const {FlatButton} = require('material-ui')
const {muiThemeable} = require('material-ui/styles')

export default function(PydioComponent, displayName, gridDimension = {gridWidth:4,gridHeight:12}, builderFields = undefined){

    const originalDisplayName = PydioComponent.displayName || PydioComponent.name;
    PydioComponent = muiThemeable()(PydioComponent);

    class GridItem extends Component{

        constructor(props, context){
            super(props, context)
            this.state = {focus:false, showCloseAction: false};
        }

        focusItem(){
            this.setState({focus:true});
        }

        blurItem(){
            this.setState({focus:false});
        }

        mergeStyleWithFocus(){
            return {...this.props.style, zIndex: this.state.focus ? 1 : null};
        }

        toggleEditMode(value = undefined){
            if(value === undefined){
                this.setState({showCloseAction:!(this.state && this.state.showCloseAction)});
            }else{
                this.setState({showCloseAction:value});
            }
        }

        getCloseButton(){
            let closeAction = ()=>{}
            if(this.props.onCloseAction){
                closeAction = this.props.onCloseAction;
            }
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
                        label={this.props.pydio.MessageHash['ajxp_admin.home.48']}
                        className="card-close-button"
                        onClick={closeAction}
                        style={{color:'white'}}
                    />
                </div>
            );
        }

        render(){
            const props = {
                ...this.props,
                style : this.mergeStyleWithFocus(),
                closeButton : this.state.showCloseAction ? this.getCloseButton() : null,
                onFocusItem : this.focusItem.bind(this),
                onBlurItem  : this.blurItem.bind(this)
            };
            return (
                <PydioComponent {...props}/>
            )
        }

    }

    GridItem.propTypes = {
        onCloseAction   : PropTypes.func
    }

    GridItem.displayName = originalDisplayName;
    GridItem.builderDisplayName = displayName;

    GridItem.getGridLayout = function(x, y){
        return {
            x:x||0,
            y:y||0,
            w:gridDimension.gridWidth || 4,
            h:gridDimension.gridHeight || 12,
            isResizable:false
        };
    };

    GridItem.hasBuilderFields = function(){
        return (builderFields !== undefined) ;
    }
    GridItem.getBuilderFields = function(){
        return builderFields;
    }

    return GridItem;

}