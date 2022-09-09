/*
 * Copyright 2007-2022 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {Component, Fragment, createRef} from 'react'
import {muiThemeable} from 'material-ui/styles'

class Item extends Component {

    constructor(props) {
        super(props);
        this.root = createRef()
    }

    componentDidMount() {
        if(this.props.selected && this.root.current) {
            this.root.current.scrollIntoView({behavior:'smooth'});
        }
    }

    render() {
        const {item, prev, next, itemUuid, itemMoment, itemDesc, itemAnnotations, itemActions, selected, onSelect, color} = this.props;

        const date = itemMoment(item)
        let className = 'tl-block';
        let sepClassName = 'sep-date';
        let similar = false

        if(prev){
            const prevDate = itemMoment(prev);
            if(date.format('L') === prevDate.format('L')){
                className += ' similar';
                similar = true
            } else {
                className += ' newday';
                sepClassName += ' newday';
            }
        }
        const annotations = itemAnnotations(item, prev, next);
        const actions = itemActions(item, prev, next);
        let onClick;
        if(onSelect) {
            onClick = () => {onSelect(itemUuid(item))}
        }
        if(selected){
            className += ' tl-selected'
        }

        const aStyle = {
            fontWeight:500,
            color,
            cursor:'pointer',
            display:'inline-block',
            marginLeft: 6
        }

        return (
            <Fragment>
                {!similar &&
                    <div className={sepClassName}>
                        <div className={"daymonth"}>{date.format('DD')}</div>
                        <div className={"dayweek"}>{date.format('ddd')}</div>
                    </div>
                }
                <div className={className} ref={this.root}>
                    <div className={"tl-date"}>
                        <div className={"daymonth"}>{date.format('DD')}</div>
                        <div className={"dayweek"}>{date.format('ddd')}</div>
                    </div>
                    <div className={"tl-dot"}></div>
                    <div className={"tl-card" + (onClick?' tl-selectable':'')} onClick={onClick}>
                        <div className={"tl-desc"}>
                            <div className={"desc-date"}>{date.format(similar?'LT':'llll')}</div>
                            {itemDesc(item, prev, next)}
                        </div>
                        <div className={"tl-actions"}>
                            {annotations}
                            {selected && prev && actions &&
                                <div>
                                    {actions.map(a => <a onClick={a.onClick} style={aStyle}>{a.label}</a>)}
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </Fragment>
        )

    }

}

class Timeline extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    makeStyle(color) {
        const style = `
        .timeline .tl-timeline .tl-block .tl-dot{
            background-color: ${color};
            box-shadow: ${color} 0px 0px 4px;
        }
        .timeline .tl-timeline .tl-block .tl-dot:before{
            border-color: ${color}
        }
        .timeline .tl-timeline .tl-block.tl-selected .tl-card {
            box-shadow: ${color} 0px 0px 12px;
        }
        .timeline .tl-timeline .daymonth{
            color: ${color}
        }
        `
        return (<style type="text/css">{style}</style>)
    }

    render() {
        const {muiTheme} = this.props;
        const {items, className='', color=muiTheme.palette.accent2Color, useSelection=false, preSelection} = this.props;
        const {itemUuid, itemMoment, itemActions, itemAnnotations, itemDesc, onItemSelect} = this.props;
        const {loadMoreAction, loadMoreLabel, loadMoreDisabled} = this.props;
        const {selection=preSelection} = this.state;
        let onSelect;
        if(onItemSelect) {
            onSelect = onItemSelect
        } else if (useSelection) {
            onSelect = (itemUuid) => {this.setState({selection:itemUuid})}
        }

        return(
            <div className={"timeline " + className}>
                <div className={"tl-line"}></div>
                <div className={"tl-timeline"}>
                    {items.map((item,i) => {
                        return(
                            <Item
                                item={item}
                                prev={i>0?items[i-1]:null}
                                next={i<items.length-1?items[i+1]:null}
                                selected={useSelection? (itemUuid(item) === selection) : false}
                                onSelect={onSelect}
                                itemUuid={itemUuid}
                                itemMoment={itemMoment}
                                itemActions={itemActions}
                                itemAnnotations={itemAnnotations}
                                itemDesc={itemDesc}
                                color={color}
                            />)
                    })}
                    {loadMoreAction &&
                        <div className={"tl-block tl-more"}>
                            <div className={"tl-date"}/>
                            <div className={"tl-dot"}/>
                            <div className={"tl-card tl-selectable"} style={{color:muiTheme.palette.accent2Color}} onClick={loadMoreDisabled?null:loadMoreAction}>{loadMoreLabel}</div>
                        </div>
                    }
                </div>
                {this.makeStyle(color)}
            </div>
        )

    }
}

Timeline = muiThemeable()(Timeline)
export default Timeline