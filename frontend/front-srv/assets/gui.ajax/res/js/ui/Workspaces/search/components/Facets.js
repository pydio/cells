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
import {Paper, Checkbox} from 'material-ui'

class BoxFacet extends React.Component {

    select(){
        const {onSelect, facet} = this.props;
        onSelect(facet, true)
    }

    clear(){
        const {onSelect, facet} = this.props;
        onSelect(facet, false)
    }

    render() {
        const {facet, selected, m} = this.props;
        let requestSelect, requestDelete;
        const mFacet = (id) => {
            const key = 'facet.label.' + id;
            return m(key) === key ? id : m(key);
        }
        if(selected){
            requestDelete = () => this.clear()
        } else {
            requestSelect = () => this.select()
        }
        return (
            <Checkbox
                label={mFacet(facet.Label) + ' (' + facet.Count + ') '}
                labelPosition={"right"}
                style={{padding: '5px 0', marginLeft: -2}}
                iconStyle={{opacity: .8, marginRight: 10}}
                labelStyle={{fontSize: 14, fontWeight: 500, color:'inherit'}}
                checked={selected}
                onCheck={(e,v) => {
                    if(v){
                        requestSelect()
                    } else {
                        requestDelete()
                    }
                }}
            />
        )
    }
}


class Facets extends React.Component {

    isSelected(selected, facet){
        return selected.filter(s => (s.FieldName === facet.FieldName && s.Label === facet.Label)).length > 0
    }

    render() {
        const {pydio, facets, onToggleFacet, activeFacets=[], zDepth=1, styles = {}, emptyStateView} = this.props;
        const m = (id) => pydio.MessageHash['user_home.' + id] || id
        const groups = {}
        const groupKeys = {
            'NodeType':'type',
            'Extension':'extension',
            'Size':'size',
            'ModifTime':'modified',
            'Basename':'found',
            'Meta':'metadata',
        }
        const hasContentSelected = activeFacets.filter(f => f.FieldName === 'TextContent').length > 0
        facets.forEach(f => {
            let fName = f.FieldName;
            if(fName.indexOf('Meta.') === 0) {
                fName = 'Meta';
            }
            if (fName === 'Basename' && hasContentSelected) {
                return // Exclude Basename when TextContent is selected
            }
            if(fName === 'TextContent'){ // Group basename / TextContent
                fName = 'Basename'
            }
            if (!groups[fName]) {
                groups[fName] = [];
            }
            groups[fName].push(f);
        })

        let hasFacets = true;
        if (!Object.keys(groupKeys).filter(k => groups[k]).filter(k => {
            const hasSelected = groups[k].filter(f => this.isSelected(activeFacets, f)).length > 0
            return hasSelected || groups[k].length > 1
        }).length){
            hasFacets = false;
        }

        return (
            <Paper zDepth={zDepth} style={styles.container}>
                {!hasFacets && emptyStateView}
                {hasFacets && <div style={styles.header}>{m('search.facets.title')}</div>}
                {hasFacets && Object.keys(groupKeys)
                    .filter(k => groups[k])
                    .filter(k => {
                        const hasSelected = groups[k].filter(f => this.isSelected(activeFacets, f)).length > 0
                        return hasSelected || groups[k].length > 1
                    })
                    .map(k => {
                    return(
                        <div>
                            <div style={styles.subHeader}>{m('search.facet.' + groupKeys[k])}</div>
                            <div style={{zoom: 1}}>
                                {groups[k].sort((a,b) => a.Label.localeCompare(b.Label)).map((f)=> {
                                    return (<BoxFacet key={f.Label} m={m} facet={f} selected={this.isSelected(activeFacets, f)} onSelect={onToggleFacet}/>);
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