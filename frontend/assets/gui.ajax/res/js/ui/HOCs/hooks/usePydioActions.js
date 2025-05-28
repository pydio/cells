import {useEffect} from "react";

const usePydioActions = ({pydio, loader}) => {
    useEffect(() => {
        pydio.getController().updateGuiActions(loader());
        return () => {
            loader(true).map(function(key){
                pydio.getController().deleteFromGuiActions(key);
            }.bind(this));
        }
    }, [loader]);

}

export {usePydioActions}