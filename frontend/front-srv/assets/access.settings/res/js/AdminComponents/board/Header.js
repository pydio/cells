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

import {Component} from 'react'
import {Paper, FontIcon, IconButton, RefreshIndicator} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import DOMUtils from 'pydio/util/dom'

class Header extends Component{

    render(){

        const {reloadAction, loading, backButtonAction, scrolling,
            title, centerContent, actions, tabs, tabValue, onTabChange, muiTheme} = this.props;


        let styles = {
            base: {
                padding: '0 16px',
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: 'transparent',
            },
            container: {
                display:'flex',
                width: '100%',
                height: 63,
                alignItems: 'center'
            },
            title: {
                fontSize: 20
            },
            legend: {

            },
            icon: {
                color: 'rgba(0,0,0,0.24)',
                marginRight: 6
            },
            refresh: {
                display: 'inline-block',
                position: 'relative',
                marginRight: 9,
                marginLeft: 9
            },
            tabs : {
                tab : {
                    fontSize: 15,
                    marginBottom: 0,
                    paddingBottom: 13,
                    paddingLeft: 20,
                    paddingRight: 20,
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    cursor: 'pointer',
                    color: 'rgba(0, 0, 0, 0.73)',
                    transition: DOMUtils.getBeziersTransition(),
                    borderBottom: '2px solid transparent'
                },
                tabIcon: {
                    fontSize: 14,
                    color: 'inherit',
                    marginRight: 5
                },
                tabActive: {
                    borderBottom: '2px solid ' + muiTheme.palette.primary1Color,
                    color: muiTheme.palette.primary1Color,
                }
            }
        };
        styles.scrolling = {
            ...styles.base,
            backgroundColor: 'rgba(236,239,241,0.8)',
            borderBottom: 0,
            position: 'absolute',
            zIndex: 8,
            left: 0,
            right: 0,
        };

        let icon;
        if(this.props.icon) {
            icon = <FontIcon className={this.props.icon} style={styles.icon} />
        } else if(backButtonAction) {
            icon = <IconButton style={{marginLeft: -18}} iconClassName={"mdi mdi-chevron-left"} onTouchTap={backButtonAction}/>
        }
        let reloadButton;
        if(reloadAction){
            reloadButton = <IconButton iconClassName={"mdi mdi-reload"} onTouchTap={reloadAction}/>;
        }

        let headTitle = <h3 style={styles.title}>{title}</h3>;
        if (tabs) {
            headTitle = <div style={{display:'flex'}}>{tabs.map(tab => {
                let st = styles.tabs.tab;
                if(tab.Value === tabValue){
                    st = {...st, ...styles.tabs.tabActive};
                }
                const icon = tab.Icon ? <FontIcon className={tab.Icon} style={styles.tabs.tabIcon}/> : null;
                return <h3 style={st} onClick={()=>onTabChange(tab.Value)}>{icon}{tab.Label}</h3>
            })}</div>
        }
        return (
            <Paper style={scrolling?styles.scrolling:styles.base} zDepth={scrolling?1:0}>
                <div style={styles.container}>
                    {icon}
                    {headTitle}
                    <div style={{flex:1}}>{centerContent}</div>
                    <div style={{display:'flex', alignItems:'center'}}>
                        {actions}
                        {!loading && reloadButton}
                        {loading &&
                            <RefreshIndicator
                                size={30}
                                left={0}
                                top={0}
                                status='loading'
                                style={styles.refresh}
                            />
                        }
                    </div>
                </div>
            </Paper>
        );

    }

}

Header = muiThemeable()(Header);
export {Header as default}