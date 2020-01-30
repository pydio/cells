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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var ellispsis = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
};

exports['default'] = function () {
    var palette = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return {
        props: {
            leftNav: {
                zDepth: 0,
                rounded: false
            },
            header: {
                flatButton: {
                    backgroundColor: palette.accent2Color,
                    hoverColor: palette.accent1Color,
                    labelStyle: {
                        color: 'white'
                    },
                    style: {
                        height: 34,
                        lineHeight: '34px'
                    }
                },
                iconButton: {
                    iconStyle: {
                        color: palette.accent2Color
                    }
                }
            }
        },
        menu: {
            header: {
                container: {
                    backgroundColor: 'rgb(50, 74, 87)',
                    display: 'flex',
                    alignItems: 'center',
                    height: 64,
                    width: 256,
                    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 2px',
                    position: 'fixed',
                    zIndex: 100
                },
                title: {
                    fontSize: 18,
                    fontWeight: 500,
                    color: 'white',
                    flex: 1,
                    paddingLeft: 24
                },
                userWidget: {
                    height: 56,
                    lineHeight: '16px',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    width: 'auto',
                    marginRight: 10,
                    zoom: 0.8
                }
            },
            leftNav: {
                backgroundColor: '#1F3B4A',
                position: 'fixed',
                width: 256,
                top: 0,
                bottom: 0,
                zIndex: 9,
                overflow: 'hidden'
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
            menuLabel: _extends({
                opacity: 0.9
            }, ellispsis),
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
                color: 'rgba(255,255,255,0.25)'
            },
            /*textTransform: 'uppercase'*/
            iconStyle: {
                height: 20,
                width: 20,
                top: 0,
                fontSize: 20,
                transition: 'none',
                color: 'inherit' /*'rgba(255,255,255,0.73)'*/
            }
        },
        body: {
            mainPanel: {
                position: 'absolute',
                top: 0,
                left: 256, // can be changed by leftDocked state
                right: 0,
                bottom: 0,
                backgroundColor: '#eceff1'
            },
            block: {
                container: {
                    border: '1px solid rgba(30, 58, 74, 0.14)',
                    borderRadius: 6,
                    margin: 16,
                    overflow: 'hidden'
                },
                header: {
                    backgroundColor: '#fbfbfc',
                    color: '#607D8B'
                },
                props: {
                    zDepth: 0
                }
            },
            legend: {
                color: 'rgba(31, 58, 74, 0.74)',
                fontStyle: 'italic'
            },
            lineColor: '#eceff1',
            tableMaster: {
                row: {
                    borderBottomColor: '#eceff1'
                },
                head: {
                    backgroundColor: '#fbfbfc',
                    color: '#607D8B'
                }
            }
        }

    };
};

module.exports = exports['default'];
