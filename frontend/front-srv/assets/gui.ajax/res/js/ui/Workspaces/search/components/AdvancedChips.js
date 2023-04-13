/*
 * Copyright 2007-2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Renderer from "./Renderer";
import {muiThemeable} from "material-ui/styles";

class AdvancedChips extends React.Component{

    constructor(props) {
        super(props)
        const {searchTools:{getSearchOptions}} = this.props;
        this.state={indexedMeta: []}
        getSearchOptions().then(oo => this.setState({...oo}))
    }

    render() {
        const {searchTools:{advancedValues, values, setValues}, containerStyle, tagStyle, title, titleTagStyle, showRemove=true, append, muiTheme} = this.props;

        const advanced = advancedValues()
        const {indexedMeta} = this.state;

        const styles = {
            container:{
                display:'flex',
                flexWrap: 'wrap',
                ...containerStyle
            },
            tag: {
                borderRadius: 20,
                background: muiTheme.palette.mui3['surface-variant'],
                color: muiTheme.palette.mui3['on-surface-variant'],
                display: 'flex',
                alignItems: 'center',
                padding: '2px 5px 2px 11px',
                marginRight: 5, marginBottom: 5,
                ...tagStyle
            },
            tagRemove: {
                backgroundColor: muiTheme.darkMode?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.1)',
                cursor: 'pointer',
                height: 16, width: 16, lineHeight: '17px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                color: 'white',
                marginLeft: 7
            }
        }

        let blocks = advanced.map(a => {
            const cc = []
            const meta = indexedMeta.filter(i => i.namespace === a.key.replace('ajxp_meta_', '')).shift()
            const {label, value} = Renderer.blockRenderer(this.props, {...a, ...meta}, a.value)
            label && cc.push(<span style={{fontWeight: 500, marginRight: 5}}>{label}</span>);
            value && cc.push(value);
            (label || value) && showRemove && cc.push(<span className={"mdi mdi-close"} style={styles.tagRemove} onClick={() => {
                const newValues = {...values}
                if(a.key === 'scope') {
                    newValues['scope'] = 'all'
                } else {
                    delete(newValues[a.key])
                }
                setValues(newValues);
            } }/>)
            return cc
        }).filter(cc => cc.length)

        if(append && append.length > 0) {
            blocks = [...blocks, ...append]
        }

        if(!blocks.length) {
            return null
        }

        return(
            <div style={styles.container}>
                {title && <div style={{...styles.tag,...titleTagStyle}}>{title}</div>}
                {blocks.map(cc => <div style={styles.tag}>{cc}</div>)}
            </div>
        )
    }
}

AdvancedChips = muiThemeable()(AdvancedChips)
export default AdvancedChips