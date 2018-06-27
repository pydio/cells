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

class DownloadApp extends React.Component{

    render(){

        const styles = {
            smallIcon: {
                fontSize: 40,
                width: 40,
                height: 40,
            },
            small: {
                width: 80,
                height: 80,
                padding: 20,
            }
        };

        const {pydio, iconClassName, tooltipId, configs, configHref} = this.props;

        return (
            <MaterialUI.IconButton
                iconClassName={iconClassName}
                tooltip={pydio.MessageHash[tooltipId]}
                tooltipStyles={{marginTop: 40}}
                style={styles.small}
                iconStyle={{...styles.smallIcon, color: this.props.iconColor}}
                onTouchTap={() => { window.open(configs.get(configHref)) }}
            />);

    }

}

DownloadApp.propTypes = {
    pydio: React.PropTypes.instanceOf(Pydio),
    id:React.PropTypes.string,
    configs:React.PropTypes.object,
    configHref:React.PropTypes.string,
    iconClassName:React.PropTypes.string,
    iconColor:React.PropTypes.string,
    messageId:React.PropTypes.string,
    tooltipId:React.PropTypes.string
};

export {DownloadApp as default}