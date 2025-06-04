import { defaultProps, insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { MdCancel, MdCheckCircle, MdError, MdInfo } from "react-icons/md";
import { RiAlertFill } from "react-icons/ri";


import "./AlertStyles.less";
import {BlockMenu} from "./BlockMenu";

// The types of alerts that users can choose from.
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

// The Alert block.
export const Alert = createReactBlockSpec(
    {
        type: "alert",
        propSchema: {
            textAlignment: defaultProps.textAlignment,
            textColor: defaultProps.textColor,
            type: {
                default: "warning",
                values: ["warning", "error", "info", "success"],
            },
        },
        content: "inline",
    },
    {
        render: (props) => {
            const alertType = alertTypes.find(
                (a) => a.value === props.block.props.type
            );
            const Icon = alertType.icon;
            const menuTarget = (
                <div className={"alert-icon-wrapper"} contentEditable={false}>
                    <Icon
                        className={"alert-icon"}
                        data-alert-icon-type={props.block.props.type}
                        size={32}
                    />
                </div>
            );
            const menuHandler = (value) => {
                props.editor.updateBlock(props.block, {
                    type: "alert",
                    props: { type: value },
                })
            }
            return (
                <div className={"alert"} data-alert-type={props.block.props.type}>
                    {/*Icon which opens a menu to choose the Alert type*/}
                    <BlockMenu
                        groups={[
                            {title:'Alert Type', values:alertTypes, onValueSelected:menuHandler}
                        ]}
                        target={menuTarget}
                    />

                    {/*Rich text field for user to type in*/}
                    <div className={"inline-content"} ref={props.contentRef} />
                </div>
            );
        },
    }
);

// Custom Slash Menu item to insert a block after the current one.
export const insertAlertItem = (editor) => ({
    title: "Insert Warning Block",
    onItemClick: () =>
        // If the block containing the text caret is empty, `insertOrUpdateBlock`
        // changes its type to the provided block. Otherwise, it inserts the new
        // block below and moves the text caret to it. We use this function with
        // a block containing 'Hello World' in bold.
        insertOrUpdateBlock(editor, {
            type: "alert",
            props: {type:'warning'},
            content: [{ type: "text", text: "", styles:{}}],
        }),
    aliases: ["alert", "al"],
    group: "Others",
    icon: <RiAlertFill size={18} />,
    subtext: "Capture reader's attention with a warning",
});
