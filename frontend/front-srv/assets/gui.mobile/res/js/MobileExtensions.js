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

const {Component} = require('react')
const SmartBanner = require('smart-app-banner');
const {PydioContextConsumer} = require('pydio').requireLib('boot')

class MobileExtensions extends Component{

    componentDidMount(){

        // @TODO
        // PASS THIS URL TO THE NATIVE APP FOR AUTO REGISTRATION OF THE SERVER
        /*
        var currentHref = document.location.href;
        $("ajxpserver-redir").href = cleanURL(currentHref).replace("http://", "ajxpserver://").replace("https://", "ajxpservers://");
        if(currentHref.indexOf("#") > -1){
            currentHref = currentHref.substr(0, currentHref.indexOf("#"));
        }

        */

        this.props.pydio.UI.MOBILE_EXTENSIONS = true;
        this.props.pydio.UI.pydioSmartBanner = new SmartBanner({
            daysHidden: 15,   // days to hide banner after close button is clicked (defaults to 15)
            daysReminder: 90, // days to hide banner after "VIEW" button is clicked (defaults to 90)
            appStoreLanguage: 'us', // language code for the App Store (defaults to user's browser language)
            title: 'Pydio Pro',
            author: 'Abstrium SAS',
            button: 'VIEW',
            store: {
                ios: 'On the App Store',
                android: 'In Google Play'
            },
            price: {
                ios: '0,99€',
                android: '0,99€'
            }
            //, theme: '' // put platform type ('ios', 'android', etc.) here to force single theme on all device
            // , icon: '' // full path to icon image if not using website icon image
            //, force: 'android' // Uncomment for platform emulation
        });

    }

    render(){
        return null;
    }

}

MobileExtensions = PydioContextConsumer(MobileExtensions);
export {MobileExtensions as default}