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
import {Dialog, RadioButtonGroup, RadioButton, FlatButton} from 'material-ui'

class CreateDSDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {value: 'flat'}
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if(nextProps.open && !this.props.open) {
            this.setState({value: 'flat'});
        }
    }

    submit() {
        const {onSubmit, onRequestClose} = this.props;
        const {value} = this.state;
        onSubmit(value);
        onRequestClose();
    }

    render() {
        const {open, onRequestClose} = this.props
        const {value} = this.state;

        const m = (id) => Pydio.getMessages()['ajxp_admin.ds.format-picker.'+id] || id

        const makeRadio = (value) => {
            const lab = (
                <div>
                    <div>{m(value+'.title')}</div>
                    <div style={{opacity:.67, margin:'5px 0 10px'}}>{m(value+'.legend')}</div>
                </div>
            );
            return (
                <RadioButton value={value} label={lab}/>
            );
        }
        const actions = [
            <FlatButton label={Pydio.getMessages()['54']} onClick={() => {onRequestClose()}} primary={true}/>,
            <FlatButton label={m('submit')} primary={true} onClick={() => this.submit()}/>
        ];

        return (
            <Dialog
                open={open}
                title={m('title')}
                onRequestClose={onRequestClose}
                actions={actions}
            >
                <div style={{marginBottom: 20}}>{m('legend')}</div>
                <RadioButtonGroup valueSelected={value} onChange={(e, v) => this.setState({value: v})}>
                    {makeRadio('flat')}
                    {makeRadio('structured')}
                    {makeRadio('internal')}
                </RadioButtonGroup>
            </Dialog>
        );
    }

}

export default CreateDSDialog