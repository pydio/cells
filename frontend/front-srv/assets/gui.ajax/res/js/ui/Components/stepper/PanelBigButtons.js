/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
const {FileDropZone} = Pydio.requireLib('form')
import {Paper, FontIcon, IconButton} from 'material-ui'

const styles = {
    root:{
        paddingTop: 20
    },
    section:{
        container:{},
        title:{},
        description:{},
        actions:{}
    },
    action:{
        container:{},
        icon:{},
        title:{},
        description:{}
    },
    deleteButton:{

    },
    deleteIconProps:{
        style:{
            position:'absolute',
            top: 0,
            right:0,
        },
        iconStyle:{
            color:'#bdbdbd',
            hoverColor:'#9e9e9e'
        }
    }
};

const css = `
.react-mui-context .bbpanel .stepper-section-actions {
    display: flex;
    flex-wrap: wrap;
}

.react-mui-context .bbpanel .stepper-section-container {
    margin-bottom: 30px;
}

.react-mui-context .bbpanel .stepper-section-title {
    font-size: 13px;
    font-weight: 500;
    color: #455a64;
    padding-bottom: 20px;    
}

.react-mui-context .bbpanel .stepper-action-container {
    margin: 10px;
    width: 230px;
    height: 210px;
    display: flex;
    flex-direction: column;
    font-size: 15px;
    padding: 10px 20px;
    border-radius: 6px !important;
    box-shadow: 1px 10px 20px 0 rgba(40,60,75,.15);
    cursor: pointer;
    position:relative;
}

.react-mui-context .bbpanel .stepper-action-container:hover {
    box-shadow: 1px 10px 20px 0 rgba(40,60,75,.3)
}

.react-mui-context .bbpanel .stepper-action-icon {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.react-mui-context .bbpanel .stepper-tag {
    position: absolute;
    top: 15px;
    left: 16px;
    background-color: #B0BEC5;
    color: white;
    padding: 1px 5px;
    font-size: 12px;
    height: 19px;
    line-height: 16px;
    border-radius: 4px;
    font-weight: 500;
}

.react-mui-context .bbpanel .stepper-action-icon > span {
    font-size: 50px !important;
}

.react-mui-context .bbpanel .stepper-action-title {
    padding-bottom: 20px;
    font-weight: 500;
    text-align: center;
    font-size: 16px;
}

.react-mui-context .bbpanel .stepper-action-description {
    text-align: center;
    font-weight: 300;
    font-size: 13px;
    padding-bottom: 10px;   
}
`;

class PanelBigButtons extends React.Component {

    constructor(props){
        if (!props.model) {
            props.model = {Sections: []};
        }
        super(props);
    }

    stProps(a, b) {
        return {
            style:styles[a][b],
            className:'stepper-'+a+'-'+b
        }
    }

    render() {

        const {model, style, onPick} = this.props;

        return (
            <div style={{...styles.root, ...style}} className={"bbpanel"}>
                {model.Sections.map((ss) => {
                    return (
                        <div {...this.stProps('section', 'container')}>
                            <div {...this.stProps('section', 'title')}>{ss.title}</div>
                            <div {...this.stProps('section', 'description')}>{ss.description}</div>
                            <div {...this.stProps('section', 'actions')}>{ss.Actions.map(a => {
                                let d = a.description;
                                if(d && d.length > 70) {
                                    d = <span title={d}>{d.substr(0, 70) + "..."}</span>
                                }
                                const children = (
                                    <React.Fragment>
                                        {a.tag && <div className={"stepper-tag"}>{a.tag}</div>}
                                        {a.onDelete &&
                                            <div {...this.stProps('action', 'deleteButton')}>
                                                <IconButton
                                                    iconClassName={"mdi mdi-close"}
                                                    tooltip={"Remove"}
                                                    onClick={(e) => {e.stopPropagation();a.onDelete();}}
                                                    {...styles.deleteIconProps}
                                                />
                                            </div>
                                        }
                                        <div  {...this.stProps('action', 'icon')}><FontIcon color={a.tint||'#03A9F4'} className={a.icon}/></div>
                                        <div  {...this.stProps('action', 'title')}>{a.title}</div>
                                        <div  {...this.stProps('action', 'description')}>{d}</div>
                                    </React.Fragment>
                                )
                                if(a.dropProps) {
                                    return (
                                        <FileDropZone {...this.stProps('action', 'container')} {...a.dropProps}>{children}</FileDropZone>
                                    )
                                } else {
                                    return (
                                        <Paper zDepth={0} {...this.stProps('action', 'container')} onClick={()=>{onPick(a.value)}}>{children}</Paper>
                                    );

                                }
                            })}</div>
                        </div>
                    )
                })}
                <style type={"text/css"} dangerouslySetInnerHTML={{__html:css}}/>
            </div>
        );

    }

}

export default PanelBigButtons