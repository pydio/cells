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

import React, {Component} from 'react'
import {muiThemeable} from 'material-ui/styles'
import ShareContextConsumer from '../ShareContextConsumer'
import Pydio from 'pydio'
import {IconButton} from 'material-ui'
import ShareHelper from "../main/ShareHelper";
const {ModernTextField, DatePicker, ThemedModernStyles} = Pydio.requireLib('hoc')

class CellBaseFields extends Component {

    formatDate = (dateObject) => {
        const {pydio} = this.props;
        const dateFormatDay = pydio.MessageHash['date_format'].split(' ').shift();
        return dateFormatDay
            .replace('Y', dateObject.getFullYear())
            .replace('m', dateObject.getMonth() + 1)
            .replace('d', dateObject.getDate());
    };

    render() {
        const {pydio, model, muiTheme, labelFocus, labelEnter, createLabels, style} = this.props;
        const m = (id) => pydio.MessageHash['share_center.' + id];
        const ModernStyles = ThemedModernStyles(muiTheme)

        let expDate, maxDate, onDateChange, dateExpired, removeDateIcon
        if(model && model.cell) {
            const auth = ShareHelper.getAuthorizations();
            if(auth.cells_max_expiration){
                maxDate = new Date((Math.round(new Date() / 1000) + parseInt(auth.cells_max_expiration) * 60 * 60 * 24)*1000);
            }
            onDateChange = (e,v) => {
                if(v === null) {
                    model.cell.AccessEnd = "-1";
                } else {
                    const date2 = Date.UTC(v.getFullYear(), v.getMonth(), v.getDate());
                    model.cell.AccessEnd = Math.floor(date2/1000);
                }
                model.notifyDirty();
            }

            if(model.cell.AccessEnd && parseInt(model.cell.AccessEnd) > 0) {
                expDate = new Date(parseInt(model.cell.AccessEnd) * 1000)
                removeDateIcon = (
                    <IconButton
                        iconStyle={{color:'var(--md-sys-color-secondary)'}}
                        style={{position:'absolute', right: 0, bottom: 0, zIndex: 1}}
                        iconClassName="mdi mdi-close-circle"
                        onClick={() => {onDateChange(null, null)}}
                    />);
            }
        }


        return (
            <div style={{padding:'0 8px', ...style}}>
                <ModernTextField
                    floatingLabelText={m(createLabels?276:267)}
                    value={model.getLabel()}
                    onChange={(e,v)=>{model.setLabel(v)}}
                    fullWidth={true}
                    variant={"v2"}
                    focusOnMount={labelFocus}
                    onKeyPress={(ev) => {
                        if (labelEnter && ev.key === 'Enter' && model.getLabel()) {
                            labelEnter();
                        }
                    }}

                />
                <ModernTextField
                    floatingLabelText={m(createLabels?277:268)}
                    value={model.getDescription()}
                    onChange={(e,v)=>{model.setDescription(v)}}
                    fullWidth={true}
                    variant={"v2"}
                />
                <div style={{position:'relative'}}>
                    <DatePicker
                        ref="expirationDate"
                        key="start"
                        value={expDate}
                        minDate={new Date()}
                        maxDate={maxDate}
                        autoOk={true}
                        onChange={onDateChange}
                        showYearSelector={true}
                        floatingLabelText={m(dateExpired?'21b':'21')}
                        mode="landscape"
                        formatDate={this.formatDate}
                        fullWidth={true}
                        {...ModernStyles.textFieldV2}
                        style={{flex: 1}}
                        textFieldStyle={{...ModernStyles.textFieldV2.style, flex: 1}}
                    />
                    {removeDateIcon}
                </div>
            </div>
        )
    }
}

CellBaseFields = ShareContextConsumer(muiThemeable()(CellBaseFields));
export {CellBaseFields as default}