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

import {Component} from "react";
import SmartBanner from "smart-app-banner";
const {PydioContextConsumer} = require('pydio').requireLib('boot');

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
        const {pydio} = this.props;
        const configs = pydio.getPluginConfigs("gui.mobile");
        if(configs.get('IOS_APP_ID') && configs.get('IOS_APP_ICON')){
            const meta = document.createElement('meta');
            meta.setAttribute("name", "apple-itunes-app");
            meta.setAttribute("content", "app-id=" + configs.get('IOS_APP_ID'));
            meta.setAttribute("id", "apple-itunes-app-element");
            const link = document.createElement('link');
            link.setAttribute("rel", "apple-touch-icon");
            link.setAttribute("href", configs.get('IOS_APP_ICON'));
            link.setAttribute("id", "apple-touch-icon-element");
            document.head.appendChild(meta);
            document.head.appendChild(link);
        }
        if(configs.get('ANDROID_APP_ID') && configs.get('ANDROID_APP_ICON')) {
            const meta = document.createElement('meta');
            meta.setAttribute("name", "google-play-app");
            meta.setAttribute("content", "app-id=" + configs.get('ANDROID_APP_ID'));
            meta.setAttribute("id", "android-app-element");
            const link = document.createElement('link');
            link.setAttribute("rel", "android-touch-icon");
            link.setAttribute("href", configs.get('ANDROID_APP_ICON'));
            link.setAttribute("id", "android-touch-icon-element");
            document.head.appendChild(meta);
            document.head.appendChild(link);
        }


        pydio.UI.MOBILE_EXTENSIONS = true;
        pydio.UI.pydioSmartBanner = new SmartBanner({
            daysHidden: 15,   // days to hide banner after close button is clicked (defaults to 15)
            daysReminder: 90, // days to hide banner after "VIEW" button is clicked (defaults to 90)
            appStoreLanguage: 'us', // language code for the App Store (defaults to user's browser language)
            title: 'Pydio',
            author: 'Abstrium SAS',
            button: 'VIEW',
            store: {
                ios: 'On the App Store',
                android: 'In Google Play'
            },
            price: {
                ios: 'FREE',
                android: 'FREE'
            },
            //, theme: '' // put platform type ('ios', 'android', etc.) here to force single theme on all device
            // , icon: '' // full path to icon image if not using website icon image
            //, force: 'android' // Uncomment for platform emulation
        });

    }

    componentWillUnmount(){
        ["apple-itunes-app-element", "apple-touch-icon-element", "android-app-element", "android-touch-icon-element"].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.parentNode.removeChild(el);
            }
        });
    }

    render(){
        return null;
    }

}

MobileExtensions = PydioContextConsumer(MobileExtensions);
export {MobileExtensions as default}