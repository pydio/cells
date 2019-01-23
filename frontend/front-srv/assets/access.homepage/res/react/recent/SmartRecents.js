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

import React from 'react'
import Pydio from 'pydio'
import {Paper} from 'material-ui'
const { PydioContextConsumer } = Pydio.requireLib('boot');
const {ASClient} = Pydio.requireLib('PydioActivityStreams');

class RecentCard extends React.Component{
    render(){
        return (
            <Paper zDepth={1} style={{width: 120, height: 140, margin: 16, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', backgroundColor:'rgb(236, 239, 241)'}}>
                <span style={{flex: 1}}/>
                <div style={{fontSize:14}}>File name.jpg</div>
                <div style={{fontSize: 11, fontWeight: 500, color: '#9E9E9E'}}>Consulté hier à 10:30</div>
            </Paper>
        );
    }
}

class SmartRecents extends React.Component{

    render(){

        const {pydio, style} = this.props;

        if (!(pydio.user && !pydio.user.lock && ASClient)) {
            return <div></div>;
        }
        const cards = [];
        for (let i = 0; i < 8; i++) {
            cards.push(<RecentCard key={i}/>)
        }

        return (
            <div style={{display:'flex', flexWrap: 'wrap', justifyContent:'center', ...style}}>
                {cards}
            </div>
        );


    }

}

SmartRecents = PydioContextConsumer(SmartRecents);
export {SmartRecents as default};