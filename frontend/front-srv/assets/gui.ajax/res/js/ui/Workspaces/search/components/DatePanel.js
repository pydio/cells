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

import React from 'react';
const {PydioContextConsumer} = require('pydio').requireLib('boot');

import {Subheader, DropDownMenu, MenuItem, DatePicker, TextField, Toggle, FlatButton} from 'material-ui';

class SearchDatePanel extends React.Component {

    static get styles() {
        return {
            dropdownLabel: {
                padding: 0
            },
            dropdownUnderline: {
                marginLeft: 0,
                marginRight: 0
            },
            dropdownIcon: {
                right: 0
            },
            datePickerGroup: {
                display: "flex",
                justifyContent: "space-between"
            },
            datePicker: {
                flex: 1
            },
            dateInput: {
                width: "auto",
                flex: 1
            },
            dateClose: {
                lineHeight: "48px",
                right: 5,
                position: "relative"
            }
        }
    }

    constructor(props) {
        super(props)

        this.state = {
            value:'custom',
            startDate: null,
            endDate: null
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState != this.state) {
            let {value, startDate, endDate} = this.state

            if (value === 'custom') {
                if (!startDate && !endDate) {
                    this.props.onChange({ajxp_modiftime: null})
                } else {
                    if(!startDate) startDate = new Date(0);
                    if(!endDate) {
                        // Next year
                        endDate = new Date();
                        endDate.setFullYear(endDate.getFullYear()+1);
                    }
                    const format = (d) => {
                        return d.getFullYear() + "" + ("0"+(d.getMonth()+1)).slice(-2) + "" +  ("0" + d.getDate()).slice(-2);
                    }
                    this.props.onChange({ajxp_modiftime: '['+format(startDate)+' TO '+format(endDate)+']'})
                }
            } else {
                this.props.onChange({ajxp_modiftime: value})
            }
        }
    }

    render() {
        const today = new Date();

        const {dropdownLabel, dropdownUnderline, dropdownIcon, datePickerGroup, datePicker, dateInput, dateClose} = SearchDatePanel.styles
        const {inputStyle, getMessage} = this.props
        const {value, startDate, endDate} = this.state;

        return (
            <div>
                <DatePickerFeed pydio={this.props.pydio}>
                {items =>
                    <DropDownMenu autoWidth={false} labelStyle={dropdownLabel} underlineStyle={dropdownUnderline} iconStyle={dropdownIcon} style={inputStyle} value={value} onChange={(e, index, value) => this.setState({value})}>
                        {items.map((item) => <MenuItem value={item.payload} label={item.text} primaryText={item.text} />)}
                    </DropDownMenu>
                }
                </DatePickerFeed>

                {value === 'custom' &&
                    <div style={{...datePickerGroup, ...inputStyle}}>
                        <DatePicker
                            textFieldStyle={dateInput}
                            style={datePicker}
                            value={startDate}
                            onChange={(e, date) => this.setState({startDate: date})}
                            hintText={getMessage(491)}
                            autoOk={true}
                            maxDate={endDate || today}
                            defaultDate={startDate}
                        />
                        <span className="mdi mdi-close" style={dateClose} onClick={() => this.setState({startDate: null})} />
                        <DatePicker
                            textFieldStyle={dateInput}
                            style={datePicker}
                            value={endDate}
                            onChange={(e, date) => this.setState({endDate: date})}
                            hintText={getMessage(492)}
                            autoOk={true}
                            minDate={startDate}
                            maxDate={today}
                            defaultDate={endDate}
                        />
                        <span className="mdi mdi-close" style={dateClose} onClick={() => this.setState({endDate: null})} />
                    </div>
                }
            </div>
        );
    }
}

let DatePickerFeed = ({pydio, getMessage, children}) => {

    const items = [
        {payload: 'custom', text: getMessage('612')},
        {payload: 'PYDIO_SEARCH_RANGE_TODAY', text: getMessage('493')},
        {payload: 'PYDIO_SEARCH_RANGE_YESTERDAY', text: getMessage('494')},
        {payload: 'PYDIO_SEARCH_RANGE_LAST_WEEK', text: getMessage('495')},
        {payload: 'PYDIO_SEARCH_RANGE_LAST_MONTH', text: getMessage('496')},
        {payload: 'PYDIO_SEARCH_RANGE_LAST_YEAR', text: getMessage('497')}
    ];

    return children(items)
};

SearchDatePanel = PydioContextConsumer(SearchDatePanel);
DatePickerFeed = PydioContextConsumer(DatePickerFeed);
export default SearchDatePanel
