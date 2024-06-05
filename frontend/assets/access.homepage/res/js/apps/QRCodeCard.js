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

const React = require('react')
const ReactQRCode = require('qrcode.react')
const {asGridItem} = require('pydio').requireLib('components')

class QRCodeCard extends React.Component {
    render() {

        let jsonData = {
            "server"    : window.location.href.split('welcome').shift(),
            "user"      : this.props.pydio.user ? this.props.pydio.user.id : null
        }

        return (
            <div {...this.props} style={{...this.props.style,display:'flex'}} closeButton={this.props.closeButton}>
                <div style={{padding: 16, fontSize: 16, paddingRight: 8, overflow:'hidden'}}>{this.props.pydio.MessageHash['user_home.74']}</div>
                <div className="home-qrCode" style={{display:'flex', justifyContent:'center', alignItems:'center', marginRight:16}}>
                    <ReactQRCode fgColor={'#ffffff'} value={JSON.stringify(jsonData)} size={80}/>
                </div>
            </div>
        );

    }
}

QRCodeCard = asGridItem(QRCodeCard,global.pydio.MessageHash['user_home.72'],{gridWidth:2,gridHeight:10},[]);

export {QRCodeCard as default}