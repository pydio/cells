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
import Pydio from 'pydio'
import ActionDialogMixin from './ActionDialogMixin'
import CancelButtonProviderMixin from './CancelButtonProviderMixin'
import SubmitButtonProviderMixin from './SubmitButtonProviderMixin'
import {Checkbox} from 'material-ui'

export default React.createClass({

    propTypes: {
        message: React.PropTypes.string.isRequired,
        validCallback: React.PropTypes.func.isRequired
    },

    mixins:[
        ActionDialogMixin,
        CancelButtonProviderMixin,
        SubmitButtonProviderMixin
    ],

    getDefaultProps: function(){
        return {
            dialogTitle: Pydio.getInstance().MessageHash['confirm.dialog.title'],
            dialogIsModal: true
        };
    },
    getInitialState(){
        return {};
    },
    submit(){
        const {validCallback, skipNext} = this.props;
        const {skipChecked} = this.state;
        if(skipNext && skipChecked){
            localStorage.setItem('confirm.skip.' + skipNext, 'true');
        }
        validCallback();
        this.dismiss();
    },
    render: function(){
        const {destructive, message, skipNext, pydio} = this.props;
        const {skipChecked} = this.state;
        const m = (id) => pydio.MessageHash['confirm.dialog.' + id] || id;
        let dMess, sMess;
        if(destructive && destructive.join){
            dMess = (
                <div style={{marginTop:12}}>
                    {m('destructive')} : <span style={{color: '#C62828'}}>{destructive.join(', ')}</span>.
                </div>
            );
        }
        if(skipNext) {
            if(localStorage.getItem('confirm.skip.' + skipNext)) {
                this.submit();
                return null;
            } else {
                sMess = (
                    <div style={{marginTop:24, marginBottom: -24}}>
                        <Checkbox
                            checked={skipChecked}
                            onCheck={(e,v) => {this.setState({skipChecked:v})}}
                            labelPosition={"right"}
                            label={m('skipNext')}
                            labelStyle={{color:'inherit'}}
                        />
                    </div>
                )
            }
        }
        return (
            <div>
                {message}
                {dMess && <br/>}
                {dMess}
                {sMess && <br/>}
                {sMess}
            </div>
        );
    }

});

