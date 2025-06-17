/*
 * Copyright 2025 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

// The types of alerts that users can choose from.
import {useCallback} from "react";
import {BlockMenu} from "./BlockMenu";
import {MdCancel, MdCheckCircle, MdError, MdInfo} from "react-icons/md";
import "./styles/AlertStyles.less";

export const alertTypes = [
    {
        title: "Warning",
        value: "warning",
        icon: MdError,
        color: "#e69819",
        backgroundColor: {
            light: "#fff6e6",
            dark: "#805d20",
        },
    },
    {
        title: "Error",
        value: "error",
        icon: MdCancel,
        color: "#d80d0d",
        backgroundColor: {
            light: "#ffe6e6",
            dark: "#802020",
        },
    },
    {
        title: "Info",
        value: "info",
        icon: MdInfo,
        color: "#507aff",
        backgroundColor: {
            light: "#e6ebff",
            dark: "#203380",
        },
    },
    {
        title: "Success",
        value: "success",
        icon: MdCheckCircle,
        color: "#0bc10b",
        backgroundColor: {
            light: "#e6ffe6",
            dark: "#208020",
        },
    },
];
export const AlertBlock = ({editor, block, contentRef}) => {
    const alertType = alertTypes.find(
        (a) => a.value === block.props.type
    );
    const Icon = alertType.icon;
    const menuTarget = (
        <div className={"alert-icon-wrapper"} contentEditable={false}>
            <Icon
                className={"alert-icon"}
                data-alert-icon-type={block.props.type}
                size={32}
            />
        </div>
    );
    const menuHandler = useCallback((value) => {
        editor.updateBlock(block, {
            type: "alert",
            props: {type: value},
        })
    }, [])

    return (
        <div className={"alert"} data-alert-type={block.props.type}>
            {/*Icon which opens a menu to choose the Alert type*/}
            <BlockMenu groups={[{title: 'Alert Type', values: alertTypes, onValueSelected: menuHandler}]} target={menuTarget} position={'bottom-start'}/>
            {/*Rich text field for user to type in*/}
            <div className={"inline-content"} ref={contentRef}/>
        </div>
    );

}