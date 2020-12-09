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
import {Chip, Avatar, Paper, Subheader} from 'material-ui'

class Facet extends React.Component {

    select(){
        const {onSelect, facet} = this.props;
        onSelect(facet, true)
    }

    clear(){
        const {onSelect, facet} = this.props;
        onSelect(facet, false)
    }

    render() {
        const {facet, selected} = this.props;
        let requestSelect, requestDelete;
        if(selected){
            requestDelete = () => this.clear()
        } else {
            requestSelect = () => this.select()
        }
        const cc = {
            chip:{
                backgroundColor:selected?'#03a9f4':null,
                labelColor:selected?'white':null
            },
            avatar:{
                backgroundColor:selected?'#0288D1':null,
                color:selected?'white':null
            }
        };
        return (
            <Chip
                style={{margin:4}}
                onRequestDelete={requestDelete}
                onTouchTap={requestSelect}
                {...cc.chip}
            ><Avatar {...cc.avatar}>{facet.Count}</Avatar> {facet.Label}</Chip>
        );
    }
}

class Facets extends React.Component {

    isSelected(selected, facet){
        return selected.filter(s => (s.FieldName === facet.FieldName && s.Label === facet.Label)).length > 0
    }

    render() {
        const {facets, onSelectFacet, selected=[]} = this.props;
        const groups = {}
        const groupKeys = {
            'NodeType':'Type',
            'Extension':'Extension',
            'Size':'Size',
            'ModifTime':'Modified',
            'Basename':'Found in...',
            'Meta':'Metadata',
        }
        facets.forEach(f => {
            let fName = f.FieldName;
            if(fName.indexOf('Meta.') === 0) {
                fName = 'Meta';
            }
            if(fName === 'TextContent'){ // Group basename / TextContent
                fName = 'Basename'
            }
            if (!groups[fName]) {
                groups[fName] = [];
            }
            groups[fName].push(f);
        })
        const styles = {
            container: {
                position: 'absolute',
                top: 90,
                right: 'calc(50% + 350px)',
                bottom: 10,
                overflowY: 'auto',
                width: 200,
                borderRadius: 6,
                paddingBottom: 10
            },
            header : {
                fontWeight: 500,
                color: '#5c7784',
                padding: 10,
                fontSize: 15
            },
            subHeader:  {
                fontWeight: 500,
                padding: '5px 10px',
                color: 'rgba(92, 119, 132, 0.7)'
            }
        }

        return (
            <Paper style={styles.container}>
                <div style={styles.header}>Filter Results</div>
                {Object.keys(groupKeys)
                    .filter(k => groups[k])
                    .filter(k => {
                        const hasSelected = groups[k].filter(f => this.isSelected(selected, f)).length > 0
                        return hasSelected || groups[k].length > 1
                    })
                    .map(k => {
                    return(
                        <div style={{marginBottom:10}}>
                            <div style={styles.subHeader}>{groupKeys[k]}</div>
                            <div style={{zoom: .8, marginLeft:10}}>
                                {groups[k].sort((a,b) => a.Label.localeCompare(b.Label)).map((f)=> {
                                    return (<Facet facet={f} selected={this.isSelected(selected, f)} onSelect={onSelectFacet}/>);
                                })}
                            </div>
                        </div>
                    );
                })}
            </Paper>
        );
    }

}

export default Facets