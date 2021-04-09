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
        const makeRadio = (value, label, subTitle) => {
            const lab = (
                <div>
                    <div>{label}</div>
                    <div style={{opacity:.67, margin:'5px 0 10px'}}>{subTitle}</div>
                </div>
            );
            return (
                <RadioButton value={value} label={lab}/>
            );
        }
        const actions = [
            <FlatButton label={"Cancel"} onClick={() => {onRequestClose()}} primary={true}/>,
            <FlatButton label={"Setup DataSource"} primary={true} onClick={() => this.submit()}/>
        ];

        return (
            <Dialog
                open={open}
                title={"Create Data Source"}
                onRequestClose={onRequestClose}
                actions={actions}
            >
                <div style={{marginBottom: 20}}>DataSources are mount points allowing you to attach actual storage to the application. First select the way data is organized inside storage.</div>
                <RadioButtonGroup valueSelected={value} onChange={(e, v) => this.setState({value: v})}>
                    {makeRadio('flat', 'Flat Storage', 'Best for performances, files are stored as blob binaries inside the storage. Files and folders structure is kept in Cells internal DB only.')}
                    {makeRadio('structured', 'Import existing data', 'Files and folders are stored as-is : a real-time synchronisation maintains storage structure and Cells indexes.')}
                    {makeRadio('internal', 'Cells internals', 'Used to store Cells internal binaries (e.g. files versions). Limited features, data is not indexed in search engines.')}
                </RadioButtonGroup>
            </Dialog>
        );
    }

}

export default CreateDSDialog