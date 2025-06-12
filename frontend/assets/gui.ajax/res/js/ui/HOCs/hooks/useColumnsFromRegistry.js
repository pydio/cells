import {useEffect, useState} from "react";
import {ListColumnsParser} from "./ListColumnsParser";

const useColumnsFromRegistry = ({pydio, fixedColumns=undefined}) => {
    const [columns, setColumns] = useState(fixedColumns || {})
    useEffect(() => {
        if(!fixedColumns) {
            const configParser = new ListColumnsParser();
            configParser.loadConfigs('FilesList').then((columns) => {
                setColumns(columns)
            })
        }
    }, [pydio.repositoryId, fixedColumns]);

    return {columns}
}

export {useColumnsFromRegistry}