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

const createReactClass = require('create-react-class');
import ActionDialogMixin from './ActionDialogMixin'
import moment from '../Moment'

/**
 * Sample Dialog class used for reference only, ready to be
 * copy/pasted :-)
 */
export default createReactClass({

    mixins:[
        ActionDialogMixin
    ],

    getInitialState: function(){
        return {...this.props.activityState};
    },

    componentDidMount: function(){
        this._observer = (activityState) => {
            this.setState(activityState);
        };

        this.props.pydio.observe('activity_state_change', this._observer);
    },

    componentWillUnmount: function(){
        this.props.pydio.stopObserving('activity_state_change', this._observer);
    },

    getDefaultProps: function(){
        return {
            dialogTitleId: '375t',
            dialogIsModal: false
        };
    },
    render: function(){
        const {MessageHash} = this.props.pydio;
        const {lastActiveSeconds, timerSeconds} = this.state;
        const since = moment.duration(lastActiveSeconds, 'seconds');
        const warn = moment.duration(timerSeconds, 'seconds');
        const sentence = MessageHash['375'].replace('__IDLE__', since.humanize()).replace('__LOGOUT__', warn.humanize());
        return (
            <div onClick={() => {this.props.pydio.notify('user_activity');}}>
                <div style={{display:'flex', alignItems:'center'}}>
                    <div className="mdi mdi-security" style={{fontSize:70,paddingRight:10}}/>
                    <p>{sentence}</p>
                </div>
                <p style={{textAlign:'right', fontWeight: 500, color: '#607D8B', fontSize: 14}}>{MessageHash['376']}</p>
            </div>
        );
    }

});

