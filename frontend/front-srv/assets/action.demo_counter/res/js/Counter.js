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

const STYLES = {
    counter: {
        position: 'absolute',
        zIndex: 10000,
        backgroundColor: 'rgba(255,255,255,0.33)',
        fontSize: 16,
        top: 0,
        left: '35%',
        width: '30%',
        padding: '8px 10px',
        borderRadius: '0 0 2px 2px',
        textAlign: 'center',
        color: '#ffffff'
    }
}

export default class Counter extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            timeLeft: ''
        }
    }

    tick() {
        // Compute next occurence of 0 or 30
        let d = new Date();
        let remainingMinutes = 29 - d.getMinutes() % 30;
        let remainingSeconds = 59 - d.getSeconds();
        if(remainingMinutes === 0) {
            this.setState({timeLeft: (remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds) + 's' });
        }else{
            this.setState({timeLeft: remainingMinutes + '\'' + (remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds) + 'mn' });
        }

    }

    componentDidMount(){
        this._ticker = setInterval(() => this.tick(), 1);
    }

    componentWillUnmount(){
        clearInterval(this._ticker);
        this._ticker = null;
    }

    render() {
        return <div style={STYLES.counter}><span className="icon-warning-sign"/> This demo will reset itself in {this.state.timeLeft}</div>;
    }
}
