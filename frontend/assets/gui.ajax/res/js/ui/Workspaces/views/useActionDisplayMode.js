import React, {useCallback} from "react";
import Pydio from 'pydio';
import Action from 'pydio/model/action'
const {useUserPreference} = Pydio.requireLib('hoc');

const useActionDisplayMode = ({fixedDisplayMode, preferencePrefix = 'FSTemplate.FilesList'}) => {

    const [displayMode, setDisplayMode] = useUserPreference(preferencePrefix+'.DisplayMode','list', fixedDisplayMode);

    const buildDisplayModeItems = useCallback( () => {
        const list = [
            {name:Pydio.getMessages()['ajax_gui.list.display-mode.list'],title:227,icon_class:'mdi mdi-view-list',value:'list',hasAccessKey:true,accessKey:'list_access_key'},
            {name:Pydio.getMessages()['ajax_gui.list.display-mode.details'],title:461,icon_class:'mdi mdi-view-headline',value:'detail',hasAccessKey:true,accessKey:'detail_access_key'},
            {name:Pydio.getMessages()['ajax_gui.list.display-mode.thumbs'],title:229,icon_class:'mdi mdi-view-grid',value:'grid-160',hasAccessKey:true,accessKey:'thumbs_access_key', highlight:(v)=>v.indexOf('grid-')===0}
        ];

        if(displayMode.indexOf('grid-') === 0) {
            list.push(
                {
                    name:Pydio.getMessages()['ajax_gui.list.display-mode.thumbs-large'],
                    icon_class:'mdi mdi-arrow-up',
                    value:'grid-320'
                },
                {
                    name:Pydio.getMessages()['ajax_gui.list.display-mode.thumbs-small'],
                    icon_class:'mdi mdi-arrow-down',
                    value:'grid-80'
                },
            )
        }
        list.push(
            {
                name:Pydio.getMessages()['ajax_gui.list.display-mode.masonry'],
                icon_class:'mdi mdi-view-dashboard',
                value:'masonry',
                highlight:(v)=>v.indexOf('masonry')===0
            },
        )
        if(displayMode.indexOf('masonry') === 0) {
            list.push(
                {
                    name:Pydio.getMessages()['ajax_gui.list.display-mode.thumbs-large'],
                    icon_class:'mdi mdi-arrow-up',value:'masonry-440'
                },
                {
                    name:Pydio.getMessages()['ajax_gui.list.display-mode.thumbs-small'],
                    icon_class:'mdi mdi-arrow-down',value:'masonry-100'
                }
            )
        }

        if(Pydio.getInstance().Registry.findEditorById('editor.bnote') && pydio.getPluginConfigs('editor.bnote').get('BNOTE_PAGES_META')) {
            list.push(
                {
                    name: 'Pages',
                    icon_class: 'mdi mdi-file-document-multiple',
                    value: 'pages',
                }
            )
        }

        return list.map(item => {
            const i = {...item};
            const value = item.value;
            i.callback = () => {setDisplayMode(i.value)};
            if(value === displayMode || (i.highlight && i.highlight(displayMode))){
                i.name = (
                    <span style={{fontWeight: 500, display: 'flex'}}>
                        <span style={{flex: 1}}>{i.name}</span>
                        {value === displayMode && <span className="mdi mdi-checkbox-marked-circle-outline"/>}
                    </span>
                )
            }
            return i;
        });

    }, [displayMode]);

    const buildAction = useCallback(() => {
        return new Action({
            name:'switch_display_mode',
            icon_class:'mdi mdi-view-list',
            text_id:150,
            title_id:151,
            text:Pydio.getMessages()[150],
            title:Pydio.getMessages()[151],
            hasAccessKey:false,
            subMenu:true,
            subMenuUpdateImage:true
        }, {
            selection:false,
            dir:true,
            actionBar:true,
            actionBarGroup:'display_toolbar',
            contextMenu:false,
            infoPanel:false
        }, {}, {}, {
            dynamicBuilder:buildDisplayModeItems,
        });

    }, [displayMode])

    return {displayMode, buildAction}

}

export {useActionDisplayMode}