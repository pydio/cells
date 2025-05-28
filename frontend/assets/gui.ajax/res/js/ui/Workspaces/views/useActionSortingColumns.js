import {useCallback, useEffect} from "react";
import Pydio from 'pydio';
import Action from 'pydio/model/action'
const {useSortingColumns} = Pydio.requireLib('components');

const useActionSortingColumns = ({columns, sortingInfo, handleSortChange}) => {

    useEffect(() => {
        Pydio.getInstance().getController().notify('actions_refreshed')
    }, [sortingInfo]);

    const {listColumns} = useSortingColumns({columns, sortingInfo, onSortingInfoChanged: handleSortChange})

    const buildActionItems = useCallback(() => {
        return listColumns('menu_data')
    }, [listColumns])

    const buildAction = useCallback(() => {
        return new Action({
            name:'sort_action',
            icon_class:'mdi mdi-sort-descending',
            text_id:450,
            title_id:450,
            text:Pydio.getMessages()[450],
            title:Pydio.getMessages()[450],
            hasAccessKey:false,
            subMenu:true,
            subMenuUpdateImage:true,
            weight: 50
        }, {
            selection:false,
            dir:true,
            actionBar:true,
            actionBarGroup:'display_toolbar',
            contextMenu:false,
            infoPanel:false
        }, {}, {}, {
            dynamicBuilder:buildActionItems
        });

    }, [buildActionItems])

    return {buildAction}

}

export {useActionSortingColumns}