import { defaultProps, insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Menu } from "@mantine/core";
import { MdCancel, MdCheckCircle, MdError, MdInfo } from "react-icons/md";
import { RiAlertFill } from "react-icons/ri";


import "./alert-styles.css";

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
            return (
                <div className={"alert"} data-alert-type={props.block.props.type}>
                    {/*Icon which opens a menu to choose the Alert type*/}
                    <Menu withinPortal={false} position={"bottom-start"}>
                        <Menu.Target>
                            <div className={"alert-icon-wrapper"} contentEditable={false}>
                                <Icon
                                    className={"alert-icon"}
                                    data-alert-icon-type={props.block.props.type}
                                    size={32}
                                />
                            </div>
                        </Menu.Target>
                        {/*Dropdown to change the Alert type*/}
                        <Menu.Dropdown>
                            <Menu.Label>Alert Type</Menu.Label>
                            <Menu.Divider />
                            {alertTypes.map((type) => {
                                const ItemIcon = type.icon;

                                return (
                                    <Menu.Item
                                        key={type.value}
                                        leftSection={
                                            <ItemIcon
                                                className={"alert-icon"}
                                                data-alert-icon-type={type.value}
                                            />
                                        }
                                        onClick={() =>
                                            props.editor.updateBlock(props.block, {
                                                type: "alert",
                                                props: { type: type.value },
                                            })
                                        }>
                                        {type.title}
                                    </Menu.Item>
                                );
                            })}
                        </Menu.Dropdown>
                    </Menu>
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
    group: "Other",
    icon: <RiAlertFill size={18} />,
    subtext: "Capture reader's attention with a warning",
});
