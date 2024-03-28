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


const ellispsis = {
    whiteSpace:'nowrap',
    overflow:'hidden',
    textOverflow:'ellipsis'
};

const cssStyle = `
.react-mui-context .main-layout-nav-to-stack .pydio-form-panel.row-flex .pydio-form-group {
    box-shadow: none !important;
    border-radius: 6px !important;
    border: 1px solid rgba(30, 58, 74, 0.14);
}

.react-mui-context .pydio-form-panel>.pydio-form-group .pydio-form-group {
    border-width: 0 !important;
}

.react-mui-context .pydio-form-panel.row-flex>.pydio-form-group>h3 {
    background-color:#fbfbfc;
    color:#607D8B;
    border-bottom: 1px solid #eceff1;
}
`;

function cssFormStyle() {
    return <style type={"text/css"} dangerouslySetInnerHTML={{__html:cssStyle}}/>;
}

const cssGroup = `
.react-mui-context .app-canvas .pydio-form-group {
    width: 100% !important;
    margin: 16px !important;
    margin-top: 0 !important;
}
`;

function cssFormGroupFullStyle() {
    return <style type={"text/css"} dangerouslySetInnerHTML={{__html:cssGroup}}/>;
}

const cssFormSimple = `
.react-mui-context .pydio-form-panel.form-panel-odd > .pydio-form-group {
    margin: 2px 10px -16px;
}
.react-mui-context .pydio-form-panel.form-panel-odd >.pydio-form-group > h1 {
    background-color:#fbfbfc;
    color:#607D8B;
    border-bottom: 1px solid #eceff1;
    font-size: 13px;
    font-weight: 500;
    margin: -16px -16px 8px;
    letter-spacing: initial;
    padding: 12px 20px;}

`;

function cssFormSimpleStyle() {
    return <style type={"text/css"} dangerouslySetInnerHTML={{__html:cssFormSimple}}/>;
}



export default function(palette = {}) {
    return {
        props: {
            leftNav: {
                zDepth: 0,
                rounded: false
            },
            header: {
                flatButton:{
                    backgroundColor:palette.primary1Color,
                    hoverColor:palette.accent2Color,
                    labelStyle:{
                        color:'white',
                        textTransform: 'none'
                    },
                    style:{
                        height: 32,
                        lineHeight: '30px',
                        borderRadius: 20,
                        marginLeft: 5
                    }
                },
                flatButtonDisabled:{
                    backgroundColor:'#e0e0e0',
                    labelStyle:{
                        color:'white',
                        textTransform: 'none'
                    },
                    style:{
                        height: 32,
                        lineHeight: '30px',
                        borderRadius: 20,
                        marginLeft: 5
                    }
                },
                iconButton:{
                    style:{
                        height: 32,
                        width: 32,
                        borderRadius: '50%',
                        backgroundColor: palette.primary1Color,
                        padding: 7,
                        marginLeft: 5,
                        display:'flex',
                        justifyContent:'center'
                    },
                    iconStyle:{
                        fontSize: 20,
                        color:'white'
                    }
                }
            }
        },
        menu: {
            header : {
                container: {
                    backgroundColor:'rgb(50, 74, 87)',
                    display: 'flex',
                    alignItems: 'center',
                    height: 64,
                    width: 256,
                    boxShadow:'rgba(0, 0, 0, 0.2) 0px 1px 2px',
                    position:'fixed',
                    zIndex: 100,
                },
                title: {
                    fontSize: 18,
                    fontWeight: 500,
                    color: 'white',
                    flex: 1,
                    paddingLeft: 24
                },
                userWidget:{
                    height: 56,
                    lineHeight: '16px',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    display:'flex',
                    alignItems:'center',
                    width: 'auto',
                    marginRight: 10,
                },
            },
            leftNav: {
                backgroundColor: '#1F3B4A',
                position: 'fixed',
                width: 256,
                top: 0,
                bottom: 0,
                zIndex: 9,
                overflow: 'hidden',
            },
            listStyle: {
                backgroundColor: 'transparent',
                display: 'block',
                maxWidth: 256,
                overflowY: 'auto',
                position: 'absolute',
                top: 64,
                bottom: 0
            },
            menuItem: {
                fontSize: 13,
                padding: '3px 0px',
                color: 'rgba(255,255,255,0.73)'
            },
            menuLabel: {
                opacity: 0.9,
                ...ellispsis
            },
            flag: {
                display: 'inline',
                backgroundColor: palette.accent1Color,
                color: 'white',
                height: 22,
                borderRadius: 10,
                padding: '0 5px',
                marginLeft: 5
            },
            subHeader: {
                fontSize: 12,
                color: 'rgba(255,255,255,0.25)',
                /*textTransform: 'uppercase'*/
            },
            iconStyle: {
                height: 20,
                width: 20,
                top: 0,
                fontSize: 20,
                transition:'none',
                color: 'inherit' /*'rgba(255,255,255,0.73)'*/
            },
        },
        body:{
            mainPanel : {
                position: 'absolute',
                top: 0,
                left: 256, // can be changed by leftDocked state
                right: 0,
                bottom: 0,
                backgroundColor:'#eceff1'
            },
            block: {
                container:{
                    border: '1px solid rgba(30, 58, 74, 0.14)',
                    borderRadius: 6,
                    margin:16,
                    overflow:'hidden'
                },
                header:{
                    backgroundColor:'#fbfbfc',
                    color:'#607D8B'
                },
                headerFull:{
                    backgroundColor:'#fbfbfc',
                    color:'#607D8B',
                    fontSize: 12,
                    fontWeight: 500,
                    borderBottom: '1px solid #eceff1',
                    height: 48,
                    lineHeight: '48px',
                    padding: '0 16px'
                },
                props:{
                    zDepth:0,
                    style:{
                        border: '1px solid rgba(30, 58, 74, 0.14)',
                        borderRadius: 6,
                        margin:16,
                        overflow:'hidden'
                    }
                },
            },
            legend: {
                color: 'rgba(31, 58, 74, 0.74)',
                fontStyle:'italic'
            },
            lineColor: '#eceff1',
            tableMaster: {
                row:{
                    borderBottomColor: '#eceff1'
                },
                head:{
                    backgroundColor:'#fbfbfc',
                    color:'#607D8B'
                },
                expanderRow:{
                    backgroundColor:'#e0e0e0',
                    fontWeight: 500,
                    borderLeft: '2px solid #1e96f3'
                },
                expandedRow:{
                    borderLeft: '2px solid #1e96f3'
                }
            }
        },
        formCss:cssFormStyle,
        formCssForceGroup:cssFormGroupFullStyle,
        formSimpleCss:cssFormSimpleStyle,
    }
}