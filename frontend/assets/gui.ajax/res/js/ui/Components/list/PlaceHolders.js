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
import Pydio from 'pydio'
import React from 'react'
const {PlaceHolder, PhRoundShape, PhTextRow} = Pydio.requireLib('hoc');


export default function PlaceHolders(props) {

    const {displayMode, elementHeight, tableKeys} = props;
    let customPH, multiplePH = [];
    if(displayMode === 'grid') {
        // Create thumbs like PH
        const tSize = Math.max(40, elementHeight)
        customPH = (
            <div style={{width: tSize, height: tSize, display:'flex', flexDirection: 'column', alignItems: 'center', margin: 2}}>
                <div style={{flex: 1, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <PhRoundShape style={{width: 40, height: 40, borderRadius: 6}}/>
                </div>
                <PhTextRow style={{fontSize: 20}}/>
            </div>
        );
        for (let i = 0; i <10; i++) {
            multiplePH.push(customPH);
        }
        multiplePH = <div style={{display:'flex', flexWrap:'wrap'}}>{multiplePH}</div>
    } else if (tableKeys) {
        // Create table lines PH
        customPH = (
            <div style={{width: '100%', display:'flex', alignItems:'baseline', height: 42, borderBottom:'1px solid rgba(0,0,0,.03)'}}>
                {Object.keys(tableKeys).map(k => {
                    if(k === 'ajxp_label'){
                        return (
                            <span className={"cell cell-"+k} style={{display:'flex', fontSize:16, paddingTop: 6, marginBottom:2, paddingLeft:16, paddingRight: 10}}>
                                <PhTextRow style={{display:'inline-block', width:16, marginRight: 16}}/>
                                <PhTextRow style={{flex: 1}}/>
                            </span>
                        );
                    } else {
                        return <span className={"cell cell-"+k} style={{display:'inline-block', paddingTop: 6, marginBottom:2, paddingLeft:10, paddingRight: 10}}><PhTextRow/></span>
                    }
                })}
            </div>
        )
        for (let i = 0; i <5; i++) {
            multiplePH.push(customPH);
        }
    } else {
        customPH = (
            <div style={{display:'flex', padding: '0 16px', alignItems:'center', height:elementHeight, borderBottom: '1px solid rgba(0,0,0,.03)'}}>
                <PhRoundShape style={{width: 40, height: 40, marginRight:20, borderRadius: 6}}/>
                <div style={{flex:1}}>
                    <PhTextRow style={{fontSize: 16, width: '80%', marginTop: 0}}/>
                    <PhTextRow style={{fontSize: 13, width: '70%'}}/>
                </div>
            </div>
        );
        for (let i = 0; i <5; i++) {
            multiplePH.push(customPH);
        }
    }



    return <PlaceHolder showLoadingAnimation customPlaceholder={multiplePH}/>;

}