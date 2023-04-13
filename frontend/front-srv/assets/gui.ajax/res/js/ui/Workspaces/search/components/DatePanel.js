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
import Pydio from 'pydio';
import {muiThemeable} from 'material-ui/styles'
const {ModernSelectField, ThemedModernStyles, DatePicker} = Pydio.requireLib('hoc');
const {PydioContextConsumer} = Pydio.requireLib('boot');
import {MenuItem} from 'material-ui';

class SearchDatePanel extends React.Component {

    static get styles() {
        return {
            datePickerGroup: {
                display: "flex",
                justifyContent: "space-between"
            },
            datePicker: {
                flex: 1,
                position:"relative",
            },
            dateInput: {
                width: "auto",
                flex: 1
            },
            dateClose: {
                position: "absolute",
                lineHeight: "50px",
                right: 5,
                top: 0,
                cursor: 'pointer',
                color: 'rgba(0,0,0,0.5)'
            }
        }
    }

    constructor(props) {
        super(props);

        this.state = {
            value:'',
            startDate: null,
            endDate: null
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {name, onChange} = this.props;

        if (prevState !== this.state) {
            let {value, startDate, endDate} = this.state;
            if (!value) {
                onChange({[name]: null})
            }
            const startDay = (date) => {
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(1);
                return date;
            };
            const endDay = (date) => {
                date.setHours(23);
                date.setMinutes(59);
                date.setSeconds(59);
                return date;
            };

            if (value === 'custom') {
                if(!startDate) {
                    startDate = new Date(0);
                }
                if(!endDate) {
                    // Next year
                    endDate = new Date();
                    endDate.setFullYear(endDate.getFullYear()+1);
                }
                onChange({[name]: {from: startDate, to: endDate}});
            } else if(value === 'PYDIO_SEARCH_RANGE_TODAY') {
                onChange({[name]: {
                    from: startDay(new Date()),
                    to: endDay(new Date())
                }})
            } else if(value === 'PYDIO_SEARCH_RANGE_YESTERDAY') {
                const y = new Date();
                y.setDate(y.getDate() - 1);
                const e = new Date();
                e.setDate(e.getDate() - 1);
                onChange({[name]: {
                    from: startDay(y),
                    to: endDay(e)
                }})
            } else if(value === 'PYDIO_SEARCH_RANGE_LAST_WEEK') {
                const s = new Date();
                s.setDate(s.getDate() - 7);
                const e = new Date();
                onChange({[name]: {
                    from: s,
                    to: e
                }})
            } else if(value === 'PYDIO_SEARCH_RANGE_LAST_MONTH') {
                const s = new Date();
                s.setMonth(s.getMonth() - 1);
                const e = new Date();
                onChange({[name]: {
                    from: s,
                    to: e
                }});
            } else if(value === 'PYDIO_SEARCH_RANGE_LAST_YEAR') {
                const s = new Date();
                s.setFullYear(s.getFullYear() - 1);
                const e = new Date();
                onChange({[name]: {
                    from: s,
                    to: e
                }});
            }
        }
    }

    render() {
        const today = new Date();

        const {datePickerGroup, datePicker, dateClose} = SearchDatePanel.styles;
        const {inputStyle, getMessage, values, name, muiTheme} = this.props;
        let {value, startDate, endDate} = this.state;

        if(!value && values[name]) {
            value = 'custom'
            startDate = values[name].from
            endDate = values[name].to
        }

        const ModernStyles = ThemedModernStyles(muiTheme)

        return (
            <div>
                <div>
                    <DatePickerFeed pydio={this.props.pydio}>
                    {items =>
                        <ModernSelectField
                            hintText={getMessage(490)}
                            value={value}
                            fullWidth={true}
                            onChange={(e, index, value) => this.setState({value})}>
                            {items.map((item) => <MenuItem value={item.payload} label={item.text} primaryText={item.text} />)}
                        </ModernSelectField>
                    }
                    </DatePickerFeed>
                </div>
                {value === 'custom' &&
                    <div style={{...datePickerGroup, ...inputStyle}}>
                        <div style={{...datePicker, marginRight: 2}}>
                            <DatePicker
                                {...ModernStyles.textField}
                                fullWidth={true}
                                value={startDate}
                                onChange={(e, date) => this.setState({startDate: date})}
                                hintText={getMessage(491)}
                                autoOk={true}
                                maxDate={endDate || today}
                                defaultDate={startDate}
                                container={"inline"}
                            />
                            <span className="mdi mdi-close" style={dateClose} onClick={() => this.setState({startDate: null})} />
                        </div>
                        <div style={{...datePicker, marginLeft: 2}}>
                            <DatePicker
                                {...ModernStyles.textField}
                                fullWidth={true}
                                value={endDate}
                                onChange={(e, date) => this.setState({endDate: date})}
                                hintText={getMessage(492)}
                                autoOk={true}
                                minDate={startDate}
                                maxDate={today}
                                defaultDate={endDate}
                                container={"inline"}
                            />
                            <span className="mdi mdi-close" style={dateClose} onClick={() => this.setState({endDate: null})} />
                        </div>
                    </div>
                }
            </div>
        );
    }
}

let DatePickerFeed = ({pydio, getMessage, children}) => {

    const items = [
        {payload: '', text: ''},
        {payload: 'custom', text: getMessage('612')},
        {payload: 'PYDIO_SEARCH_RANGE_TODAY', text: getMessage('493')},
        {payload: 'PYDIO_SEARCH_RANGE_YESTERDAY', text: getMessage('494')},
        {payload: 'PYDIO_SEARCH_RANGE_LAST_WEEK', text: getMessage('495')},
        {payload: 'PYDIO_SEARCH_RANGE_LAST_MONTH', text: getMessage('496')},
        {payload: 'PYDIO_SEARCH_RANGE_LAST_YEAR', text: getMessage('497')}
    ];

    return children(items)
};

SearchDatePanel = muiThemeable()(SearchDatePanel)
SearchDatePanel = PydioContextConsumer(SearchDatePanel);
DatePickerFeed = PydioContextConsumer(DatePickerFeed);
export default SearchDatePanel
