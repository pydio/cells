import React, {useCallback} from "react";
import Pydio from 'pydio';
import Action from 'pydio/model/action'
import PathUtils from 'pydio/util/path'
const {useUserPreference} = Pydio.requireLib('hoc');

const useActionExtensionsPin = ({preferencePrefix = 'FSTemplate.FilesList'}) => {

    const [showExtensions, setShowExtensions] = useUserPreference(preferencePrefix+'.ShowExtensions',false);
    const [pinBookmarks, setPinBookmarks] = useUserPreference(preferencePrefix+'.PinBookmarks',false);

    const buildShowExtensionsItems = useCallback(() => {
        return [
            {name:Pydio.getMessages()['ajax_gui.list.extensions.show'], icon_class:showExtensions?'mdi mdi-toggle-switch':'mdi mdi-toggle-switch-off', callback:()=>{
                    setShowExtensions(!showExtensions)
                }},
            {name:Pydio.getMessages()['ajax_gui.list.pin.bookmarks'], icon_class:pinBookmarks?'mdi mdi-toggle-switch':'mdi mdi-toggle-switch-off', callback:()=>{
                    setPinBookmarks(!pinBookmarks)
                }}
        ]
    }, [showExtensions, pinBookmarks]);

    const computeLabel = useCallback((node) => {
        let label = node.getLabel();
        if(node.isLeaf() && label[0] !== "."){
            let ext = PathUtils.getFileExtension(label);
            if(ext){
                ext = '.' + ext;
                label = <span>{label.substring(0, label.length-ext.length)}<span className={"label-extension"} style={{opacity:0.33, display:showExtensions?null:'none'}}>{ext}</span></span>;
            }
        }
        return label;
    }, [showExtensions]);


    const buildAction = useCallback(() => {
        return new Action(
            {
                name:'toggle_show_extensions',
                icon_class:'mdi mdi-format-size',
                text_id:'ajax_gui.list.extensions.action',
                text:Pydio.getMessages()['ajax_gui.list.extensions.action'],
                subMenu:true,
                subMenuUpdateImage:true
            },
            {
                selection: false,
                dir: true,
                actionBar: true,
                actionBarGroup:'display_toolbar',
                contextMenu: false,
                infoPanel: false
            }, {}, {},
            {
                dynamicBuilder: buildShowExtensionsItems
            }
        );
    }, [buildShowExtensionsItems])

    return {showExtensions, pinBookmarks, computeLabel, buildAction}

}

export {useActionExtensionsPin}