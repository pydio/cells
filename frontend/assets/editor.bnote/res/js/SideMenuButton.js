import {useCallback} from 'react'
import {
    useBlockNoteEditor,
    useComponentsContext,
    RemoveBlockItem,
    BlockColorsItem,
    TableRowHeaderItem,
    TableColumnHeaderItem,
    useDictionary
} from "@blocknote/react";
import {MdDelete, MdMoreVert} from "react-icons/md";

// Custom Side Menu button to remove the hovered block.
export function SideMenuButton(props) {
    const editor = useBlockNoteEditor();

    const isTitle = useCallback((b) => {
        return b.type === 'title'
    }, []);
    const Components = useComponentsContext();
    const dict = useDictionary();
    const {block} = props;
    const previous = editor.getPrevBlock(block)
    const next = editor.getNextBlock(block)

    return (
        <Components.Generic.Menu.Root
            position={"left"}
            onOpenChange={(open) => {
                if (open) {
                    props.freezeMenu();
                } else {
                    props.unfreezeMenu();
                }
            }}
        >
            <Components.Generic.Menu.Trigger>
                <Components.SideMenu.Button
                    label={"Options"}
                    className={"bn-button"}
                    icon={<MdMoreVert size={24}/>}
                />
            </Components.Generic.Menu.Trigger>
            <Components.Generic.Menu.Dropdown
                className={"bn-menu-dropdown bn-drag-handle-menu"}
            >
                {props.children || (
                    <>
                        {previous && !isTitle(previous) &&
                            <Components.Generic.Menu.Item
                                className={"bn-menu-item"}
                                onClick={() => {
                                    editor.removeBlocks([block])
                                    editor.insertBlocks([block], previous, "before")
                                }}
                            >
                                Move Up
                            </Components.Generic.Menu.Item>
                        }
                        {next && !isTitle(block) &&
                            <Components.Generic.Menu.Item
                                className={"bn-menu-item"}
                                onClick={() => {
                                    editor.removeBlocks([block])
                                    editor.insertBlocks([block], next, "after")
                                }}
                            >
                                Move Down
                            </Components.Generic.Menu.Item>
                        }
                        {!isTitle(block) &&
                            <RemoveBlockItem {...props}>
                                {dict.drag_handle.delete_menuitem}
                            </RemoveBlockItem>
                        }
                        <BlockColorsItem {...props}>
                            {dict.drag_handle.colors_menuitem}
                        </BlockColorsItem>
                        <TableRowHeaderItem {...props}>
                            {dict.drag_handle.header_row_menuitem}
                        </TableRowHeaderItem>
                        <TableColumnHeaderItem {...props}>
                            {dict.drag_handle.header_column_menuitem}
                        </TableColumnHeaderItem>
                    </>
                )}
            </Components.Generic.Menu.Dropdown>

        </Components.Generic.Menu.Root>

    )

}


