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
import React from 'react'
import PydioApi from 'pydio/http/api'
const {Uppy:UppyObject, Webcam, Audio, ScreenCapture, Dashboard, AwsS3} = window.Uppy;

import German from './locale/de_DE'
import French from './locale/fr_FR'
import Spanish from './locale/es_ES'
import Italian from './locale/it_IT'
import Brasil from './locale/pt_BR'
//import Portugues from './locale/pt_PT'
import Russian from './locale/ru_RU'
import Viet from './locale/vi_VN'
import Chinese from './locale/zh_CN'

const locales = {
    'fr': French,
    'de': German,
    'es-es': Spanish,
    'it': Italian,
    'pt-br': Brasil,
    'ru': Russian,
    'vi-vn': Viet,
    'zh-cn': Chinese

}

const customCSS = `
.uppy-Dashboard-AddFiles {
    background-color: rgb(245, 245, 245);
}
.uppy-DashboardContent-title{
    display:none;
}
.uppy-Webcam-button {
    zoom: 0.8;
    margin: 0 10px !important;
}
.uppy-Audio-button {
    zoom: .8;
    margin: 10px !important;
}
.uppy-ScreenCapture-button--video{
    zoom: .8;
}
`;

export default class extends React.Component {

    constructor(props) {
        super(props)
        this.container = React.createRef();
    }

    getLocale() {
        const {pydio} = this.props;
        const loc = locales[pydio.currentLanguage] || null
        if(loc) {
            loc.strings.importFiles = pydio.MessageHash['upload.capture.importFiles']
        }
        return loc
    }

    componentDidMount() {
        const {pydio} = this.props;
        const configs = pydio.getPluginConfigs('uploader.uppy')
        const locale = this.getLocale(pydio.currentLanguage);

        this.uppy = new UppyObject()
            .use(Dashboard, {
                target: this.container.current,
                inline: true,
                height: 480,
                disableLocalFiles: true,
                proudlyDisplayPoweredByUppy: false,
                locale,
            })
            .use(AwsS3, {
                getUploadParameters: (file) => this.getUploadParameters(file)
            })

        if (configs.get('UPPY_ENABLE_WEBCAM')){
            this.uppy.use(Webcam, {
                title: pydio.MessageHash['upload.capture.title.camera'],
                target: Dashboard,
                showVideoSourceDropdown: true,
                preferredVideoMimeType: 'video/webm; codecs=vp9',
                locale,
            })
        }
        if (configs.get('UPPY_ENABLE_SCREEN')) {
            this.uppy.use(ScreenCapture, {
                title: pydio.MessageHash['upload.capture.title.screencast'],
                target: Dashboard,
                userMediaConstraints: {
                    audio: false,
                },
                preferredVideoMimeType: 'video/webm; codecs=vp9',
                locale,
            })
        }
        if (configs.get('UPPY_ENABLE_AUDIO')) {
            this.uppy.use(Audio, {
                title: pydio.MessageHash['upload.capture.title.audio'],
                target: Dashboard,
                locale,
            })
        }
    }

    componentWillUnmount() {
        this.uppy.close();
    }

    getUploadParameters(file) {
        const {pydio} = this.props;
        const slug = pydio.user.getActiveRepositoryObject().getSlug()
        let targetPath = slug + pydio.getContextHolder().getContextNode().getPath() + '/' + file.name
        targetPath = targetPath.replace('//', '/')
        return PydioApi.getClient().buildPresignedPutUrl(targetPath, {}).then(({url, headers}) => {
            return {
                method: 'PUT',
                url,
                headers,
                fields: {}
            }
        })
    }

    render() {
        return (
            <React.Fragment>
                <div ref={this.container} className={"uppy-Container"}/>
                <style type={"text/css"} dangerouslySetInnerHTML={{__html:customCSS}}/>
            </React.Fragment>
            )

    }
}

