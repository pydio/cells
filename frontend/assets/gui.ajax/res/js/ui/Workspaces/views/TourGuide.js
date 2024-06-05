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

import {Component, Fragment} from 'react'
import Pydio from 'pydio'
import Joyride from 'react-joyride'
const {PydioContextConsumer} = Pydio.requireLib('boot');
import {muiThemeable} from "material-ui/styles";


class TourGuide extends Component{

    render(){

        const {muiTheme, getMessage} = this.props
        let bgColor = muiTheme.palette.mui3['surface-variant'] || 'white'
        bgColor = bgColor.replace('#','%23')

        const css = `
.react-mui-context .joyride-tooltip.bottom .joyride-tooltip__triangle,.react-mui-context .joyride-tooltip.bottom-left .joyride-tooltip__triangle,.react-mui-context .joyride-tooltip.bottom-right .joyride-tooltip__triangle {
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='${bgColor}' d='M24 12L12 0 0 12z'/%3E%3C/svg%3E");
}
.react-mui-context .joyride-tooltip.right .joyride-tooltip__triangle {
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='12' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='${bgColor}' d='M12 0L0 12l12 12z'/%3E%3C/svg%3E");
}

.react-mui-context .joyride-tooltip.left .joyride-tooltip__triangle {
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='12' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='${bgColor}' d='M0 24l12-12L0 0z'/%3E%3C/svg%3E");
      
        `;

        const message = (id) => {
            return getMessage('ajax_gui.tour.locale.' + id);
        };
        const locales = ['back','close','last','next','skip'];
        let locale = {};
        locales.forEach((k) => {
            locale[k] = message(k);
        });
        return (
            <Fragment>
                <Joyride
                    {...this.props}
                    locale={locale}
                    allowClicksThruHole={true}
                />
                <style type={"text/css"} dangerouslySetInnerHTML={{__html:css}}/>
            </Fragment>
    );

    }

}

TourGuide = muiThemeable()(TourGuide)
TourGuide = PydioContextConsumer(TourGuide);
export {TourGuide as default}