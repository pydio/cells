/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {Dialog, Checkbox, RadioButtonGroup, RadioButton, RaisedButton, FlatButton} from 'material-ui'

class ConfirmExists extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            value: 'rename-folders',
            saveValue: false
        }
    }

    cancel(){
        this.props.onCancel();
    }

    submit(){
        const {value, saveValue} = this.state;
        this.props.onConfirm(value, saveValue);
    }

    checkChange(e, newValue){
        this.setState({saveValue: newValue});
    }

    radioChange(e, newValue) {
        this.setState({value: newValue});
    }

    render() {

        const pydio = Pydio.getInstance();
        const {value, saveValue} = this.state;

        return (
            <Dialog
                title={pydio.MessageHash[124]}
                actions={[
                    <FlatButton label={pydio.MessageHash[54]} onClick={()=> this.cancel()}/>,
                    <FlatButton label={pydio.MessageHash[48]} onClick={() => this.submit()} primary={true}/>
                ]}
                modal={true}
                open={true}
                bodyStyle={{paddingBottom: 0}}
                contentStyle={{width: 420, maxWidth:'100%', background: 'var(--md-sys-color-surface-3)', borderRadius:20}}
            >
                <div>
                    <RadioButtonGroup ref="group" name="shipSpeed" defaultSelected={value}
                                      onChange={this.radioChange.bind(this)}>
                        <RadioButton value="rename-folders"
                                     label={pydio.MessageHash['html_uploader.confirm.rename.all']}
                                     style={{paddingBottom: 8}}/>
                        <RadioButton value="rename" label={pydio.MessageHash['html_uploader.confirm.rename.merge']}
                                     style={{paddingBottom: 8}}/>
                        <RadioButton value="overwrite"
                                     label={pydio.MessageHash['html_uploader.confirm.overwrite']}/>
                    </RadioButtonGroup>
                    <div style={{marginTop:30}}>
                        <Checkbox label={pydio.MessageHash['html_uploader.confirm.save.choice']} checked={saveValue} onCheck={(e,v) => this.checkChange(e,v)}/>
                    </div>
                </div>
            </Dialog>
        );
    }

}

export {ConfirmExists as default}