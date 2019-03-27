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

const {Component} = require('react');
const {MuiThemeProvider} = require('material-ui')
const {muiThemeable, getMuiTheme} = require('material-ui/styles')

export default function (palette){

    return function(PydioComponent){

        class PaletteModifier extends Component{

            render(){

                const currentPalette = this.props.muiTheme.palette;
                const newPalette = {...currentPalette, ...palette};
                const muiTheme = getMuiTheme({palette:newPalette});
                const props = {...this.props, muiTheme};
                return (
                    <MuiThemeProvider muiTheme={muiTheme}>
                        <PydioComponent {...props}/>
                    </MuiThemeProvider>
                )

            }

        }

        PaletteModifier = muiThemeable()(PaletteModifier);


        return PaletteModifier;
    }

}