/*
 * Copyright 2007-2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import React, {useState, useLayoutEffect, useRef} from 'react'
import Pydio from 'pydio'
import {IconButton} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import PydioApi from 'pydio/http/api'
import DOMUtils from 'pydio/util/dom'
import {ActivityServiceApi, ActivitySubscription, ActivityOwnerType} from 'cells-sdk'

const Sizeable = ({baseWidth, open, style, children}) => {
    const container = useRef(null)
    const [width, setWidth] = useState(baseWidth)
    useLayoutEffect(()=>{
        if(open && container.current) {
            setWidth(container.current.scrollWidth+5)
        } else {
            setWidth(baseWidth)
        }
    }, [open, children])

    return <div ref={container} style={{...style, opacity:open?1:0, overflow:'hidden', transition:DOMUtils.getBeziersTransition(), width}}>{children}</div>
}

class WatchSelectorMui3 extends React.Component{

    constructor(props){
        super(props);
        const {nodes} = this.props;
        this.state = this.valueFromNodes(nodes);
    }

    valueFromNodes(nodes = []) {

        let mixed =false, value = undefined;
        nodes.forEach(n => {
            const nVal = n.getMetadata().get('meta_watched') || '';
            if(value !== undefined && nVal !== value) {
                mixed = true;
            }
            value = nVal;
        });
        return {value, mixed};

    }


    onSelectorChange(value){

        if(value === 'mixed'){
            return;
        }

        const {pydio, nodes} = this.props;
        this.setState({saving: true});

        const proms = nodes.map(node => {
            const nodeUuid = node.getMetadata().get('uuid');
            const userId = pydio.user.id;
            let subscription = new ActivitySubscription();
            const type = new ActivityOwnerType();
            subscription.UserId = userId;
            subscription.ObjectId = nodeUuid;
            subscription.ObjectType = type.NODE;
            let events = [];
            if (value === 'META_WATCH_CHANGE' || value === 'META_WATCH_BOTH') {
                events.push('change');
            }
            if(value === 'META_WATCH_READ' || value === 'META_WATCH_BOTH'){
                events.push('read');
            }
            subscription.Events = events;
            const api = new ActivityServiceApi(PydioApi.getRestClient());
            return api.subscribe(subscription).then((outSub) => {
                let overlay = node.getMetadata().get('overlay_class') || '';
                if(value === '') {
                    node.getMetadata().delete('meta_watched');
                    node.getMetadata().set('overlay_class', overlay.replace('mdi mdi-bell', ''));
                } else {
                    node.getMetadata().set('meta_watched', value);
                    let overlays = overlay.replace('mdi mdi-bell', '').split(',');
                    overlays.push('mdi mdi-bell');
                    node.getMetadata().set('overlay_class', overlays.join(','));
                }
                node.notify('node_replaced');
            });
        });
        Promise.all(proms).then(() => {
            this.setState({value: value, mixed: false});
            setTimeout(()=>{
                this.setState({saving: false, animOpen: false});
            }, 50);
        }).catch(() => {
            this.setState({saving: false});
        });
    }

    render(){

        const {fullWidth, muiTheme, animatedButton, readPermissionOnly = false} = this.props;
        const {value, mixed, saving, animOpen = false} = this.state;
        const mm = Pydio.getInstance().MessageHash;

        let values = [];
        if(value) {
            values = [value];
            if(value === 'META_WATCH_BOTH') {
                values = ['META_WATCH_READ', 'META_WATCH_CHANGE']
            }
        }

        const toggle = (v) => {
            if(saving) {
                return
            }
            let newvalues;
            if(values.indexOf(v) > -1) {
                // Remove
                newvalues = values.filter(f => f !== v);
            } else {
                newvalues = [...values, v]
            }
            if(newvalues.length === 2) {
                this.onSelectorChange('META_WATCH_BOTH')
            } else if(newvalues.length === 1) {
                this.onSelectorChange(newvalues[0])
            } else {
                this.onSelectorChange('')
            }
        }

        const items = [{value:'META_WATCH_READ', primaryText:mm['meta.watch.selector.read.mui'], iconClass:'mdi mdi-eye'}]
        if(!readPermissionOnly) {
            items.push({value:'META_WATCH_CHANGE', primaryText:mm['meta.watch.selector.change.mui'], iconClass: 'mdi mdi-pencil'})
        }
        const styles = {
            root:{
                borderRadius: muiTheme.borderRadius,
                display:'flex',
                border: '1px solid ' + (animatedButton&&!animOpen?muiTheme.palette.mui3['primary']:muiTheme.palette.mui3['outline']),
                overflow:animatedButton?null:'hidden',
                alignItems:'center',
                margin:animatedButton?'0 6px':null,
                height: animatedButton?36:null
            },
            separator:{
                width: 1,
                height:'100%',
                backgroundColor:muiTheme.palette.mui3['outline'],
            },
            item:{
                flex: 1,
                padding:animatedButton?'7px 16px':'6px 16px',
                textAlign:'center',
                cursor:saving?'progress':'pointer',
                whiteSpace: 'nowrap'
            },
            itemSelected:{
                backgroundColor:muiTheme.palette.mui3['secondary-container'],
                color:muiTheme.palette.mui3['on-secondary-container']
            },
            icon:{
                marginRight: 10,
                fontSize: animatedButton? 14 : 12
            },
            primaryText:{
                fontWeight: 500,
                fontSize: animatedButton? 13 : 12
            },
            animButton:{
                root: {
                    borderRadius: '50%',
                    border: 0,
                    backgroundColor: 'transparent',
                    width: 36, height: 36,
                    padding: '8px 6px',
                    margin: '0 -1px',
                    zIndex: 0,
                },
                icon: {
                    color: muiTheme.palette.mui3.primary,
                    fontSize: 20,
                    lineHeight: '20px'
                }
            }
        }
        // Add seps
        let allItems = [];
        items.forEach((item, index) => {
            allItems.push(item)
            if(index < items.length - 1) {
                allItems.push({separator: true})
            }
        })

        let segmented;
        if(animatedButton) {
            segmented = (
                <div style={styles.root}>
                    {animatedButton &&
                        <IconButton
                            style={styles.animButton.root}
                            iconStyle={styles.animButton.icon}
                            iconClassName={"mdi mdi-bell" + (values.length?'':'-outline')}
                            tooltip={mm['meta.watch.selector.legend.mui']}
                            onClick={() => this.setState({animOpen:!animOpen})}
                        />
                    }
                    <Sizeable style={{...styles.root, border: 0, margin: 0, height: 34}} baseWidth={0} open={animOpen || !animatedButton}>
                    {allItems.map(item=> {
                        if(item.separator) {
                            return <div style={styles.separator}/>
                        }
                        let style = {...styles.item};
                        if(values.indexOf(item.value)>-1){
                            style = {...style, ...styles.itemSelected}
                        }
                        return (
                            <div style={style} onClick={() => toggle(item.value)}>
                                {item.iconClass && <span className={item.iconClass} style={styles.icon}/>}
                                <span style={styles.primaryText}>{item.primaryText}</span>
                            </div>
                        )
                    })}
                    </Sizeable>
                </div>

            )
        } else {
            segmented = (
                <div style={styles.root}>
                     {allItems.map(item=> {
                        if(item.separator) {
                            return <div style={styles.separator}/>
                        }
                        let style = {...styles.item};
                        if(values.indexOf(item.value)>-1){
                            style = {...style, ...styles.itemSelected}
                        }
                        return (
                            <div style={style} onClick={() => toggle(item.value)}>
                                {item.iconClass && <span className={item.iconClass} style={styles.icon}/>}
                                <span style={styles.primaryText}>{item.primaryText}</span>
                            </div>
                        )
                    })}
                </div>
            )
        }

        if(fullWidth) {
            return segmented
        } else {
            return <div style={{display:'flex'}}>{segmented}<div style={{flex:1}}/></div>
        }

    }

}

WatchSelectorMui3 = muiThemeable()(WatchSelectorMui3)
export default  WatchSelectorMui3