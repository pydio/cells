import {Component} from 'react'

import PathUtils from 'pydio/util/path'
import XMLUtils from 'pydio/util/xml'
import DOMUtils from 'pydio/util/dom'

class BackgroundImage{

    /**
     *
     * @param pydio {Pydio}
     * @param configName string
     * @return {*}
     */
    static backgroundFromConfigs(pydio, configName){

        if (BackgroundImage.PARSED) {
            return BackgroundImage.PARSED;
        }

        let bgrounds,paramPrefix,bStyles,index, i;

        let exp = configName.split("/");
        let plugin = exp[0];
        paramPrefix = exp[1];
        const registry = pydio.getXmlRegistry();
        const configs = XMLUtils.XPathSelectNodes(registry, "plugins/*[@id='"+plugin+"']/plugin_configs/property[contains(@name, '"+paramPrefix+"')]");
        const defaults = XMLUtils.XPathSelectNodes(registry, "plugins/*[@id='"+plugin+"']/server_settings/global_param[contains(@name, '"+paramPrefix+"')]");

        bgrounds = {};
        configs.map(function(c){
            bgrounds[c.getAttribute("name")] = c.firstChild.nodeValue.replace(/"/g, '');
        });

        defaults.map(function(d){
            if(!d.getAttribute('defaultImage')) {
                return;
            }
            let n = d.getAttribute("name");
            if (bgrounds[n]) {
                if (PathUtils.getBasename(bgrounds[n]) === bgrounds[n]) {
                    const str = bgrounds[n];
                    bgrounds[n] = {
                        orig: pydio.Parameters.get('ENDPOINT_REST_API') + "/frontend/binaries/GLOBAL/" + str,
                        resize: (size) => pydio.Parameters.get('ENDPOINT_REST_API') + "/frontend/binaries/GLOBAL/" + str + '?dim=' + size,
                    };
                }
            } else {
                const defaultImage = d.getAttribute("defaultImage");
                bgrounds[n] = {
                    orig: defaultImage,
                    resize: (size) => {
                        const dir = PathUtils.getDirname(defaultImage);
                        const base = PathUtils.getBasename(defaultImage);
                        return dir + '/' + size + '/' + base;
                    }
                };
            }
        });

        const bgArr = [];
        index = 1;
        while(bgrounds[paramPrefix+index]){
            bgArr.push(bgrounds[paramPrefix+index]);
            index++;
        }
        i = Math.floor( Math.random() * bgArr.length);
        BackgroundImage.PARSED = bgArr[i];
        return BackgroundImage.PARSED;
    }

    static screenResize(){
        let resize = 0;
        const windowWidth = DOMUtils.getViewportWidth();
        const isRetina = matchMedia("(-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2), (min-resolution: 192dpi)").matches;
        if(windowWidth <= 600) {
            resize = 800;
            if(isRetina) {
                resize = 1200;
            }
        } else if(windowWidth <= 1200 && !isRetina) {
            resize = 1200;
        }
        return resize
    }


}

export default function(PydioComponent) {

    class ProgressiveBgComponent extends Component {

        constructor(props){
            super(props);
            let {pydio, imageBackgroundFromConfigs} = props;
            if(imageBackgroundFromConfigs){
                const background = BackgroundImage.backgroundFromConfigs(pydio, imageBackgroundFromConfigs);
                this.state = {background, loaded: false}
            }
        }

        componentWillMount(){
            const {background} = this.state;
            if(!background){
                return;
            }
            const img = new Image();
            img.onload = () => {
                this.setState({loaded: true});
            };
            const resize = BackgroundImage.screenResize();
            let url;
            if(resize){
                url = background.resize(resize);
            } else {
                url = background.orig;
            }
            img.src = url;
        }

        render(){

            const {background, loaded} = this.state;
            const {pydio} = this.props;
            let bgStyle = {};
            if(background){
                let url, blur;
                if(loaded) {
                    const resize = BackgroundImage.screenResize();
                    if(resize){
                        url = background.resize(resize);
                    } else {
                        url = background.orig;
                    }
                } else if (!pydio.user) { // if user is logged, do not load small version of background
                    url = background.resize(40);
                    blur = {filter: 'blur(50px)'};
                }
                if(url){
                    bgStyle = {
                        backgroundImage:"url('"+url+"')",
                        backgroundSize:"cover",
                        backgroundPosition:"center center",
                        ...blur
                    };
                }
            }
            return <PydioComponent {...this.props} bgStyle={bgStyle}/>

        }

    }

    return ProgressiveBgComponent;

}