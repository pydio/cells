/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import asMetaForm from "../hoc/asMetaForm";
import {starsStyle} from "./StarsField"
const {ModernStyles} = Pydio.requireLib('hoc');
import {muiThemeable} from 'material-ui/styles'

class StarsFormPanel extends React.Component {

    render(){
        const {updateValue, value = 0, search, label, muiTheme} = this.props;
        let stars = [-1,0,1,2,3,4].map((v) => {
            const ic = 'star' + (v === -1 ? '-off' : (value > v ? '' : '-outline') );
            const style = (v === -1 ? {marginRight: 5, cursor:'pointer'} : {cursor: 'pointer'});
            return <span key={"star-" + v} onClick={() => updateValue(v+1, true)} className={"mdi mdi-" + ic} style={style}></span>;
        });
        if(search) {
            return (
                <div className="advanced-search-stars" style={{...ModernStyles.div, ...starsStyle}}>
                    <div>{stars}</div>
                </div>
            );
        } else {
            return (
                <div style={{...ModernStyles.textFieldV2.style, borderBottom:ModernStyles.fillBlockV2Right.borderBottom, marginBottom:6}}>
                    <div style={{color: muiTheme.palette.mui3['on-surface-variant'], fontSize: 12, padding: '3px 8px 0', lineHeight: '16px'}} >{label}</div>
                    <div style={{...starsStyle, paddingLeft: 6}}>{stars}</div>
                </div>
            )
        }
    }
}

export default asMetaForm(muiThemeable()(StarsFormPanel));