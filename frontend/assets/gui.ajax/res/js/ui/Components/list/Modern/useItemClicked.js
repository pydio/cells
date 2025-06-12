/*
 * Copyright 2025 Abstrium SAS <team (at) pyd.io>
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

import {useCallback} from "react";
import PropTypes from 'prop-types';

const UseItemClickedPropTypes = {
    entryHandleClicks:PropTypes.func
}

/**
 *
 * @param props useItemClickedPropTypes
 * @returns {{handleItemClick: ((function(*, *): void)|*), handleItemDoubleClick: ((function(*, *): void)|*)}}
 */
const useItemClicked = ({pydio, dataModel, items, updateSelectionFromItemEvent}) => {

    const mobile = pydio.UI.MOBILE_EXTENSIONS

    const handleItemClick = useCallback((item, event) => {
        const {node, isParent} = item;
        if (!node) return;
        // Parent case - simple click go up
        if (isParent && node.isBrowsable()) {
            pydio.goTo(node)
        } else {
            updateSelectionFromItemEvent(items, item, event)
        }

    }, [dataModel, items, updateSelectionFromItemEvent]);

    const handleItemDoubleClick = useCallback((item, event) => {
        const {node} = item;
        if (!node) return;
        if (node.isBrowsable()) {
            pydio.goTo(node);
        } else {
            dataModel.setSelectedNodes([node]);
            pydio.Controller.fireAction("open_with_unique");
        }



    }, [dataModel]);

    return {handleItemClick, handleItemDoubleClick}
}


export {useItemClicked, UseItemClickedPropTypes}