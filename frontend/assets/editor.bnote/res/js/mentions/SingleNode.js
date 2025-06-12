import {useContext, useState, useEffect, useCallback, useMemo} from 'react'
import Pydio from 'pydio'
import {ListContext} from "../blocks/ChildrenList";
import {HoverCard, Paper} from "@mantine/core";
const {FilePreview} = Pydio.requireLib('workspaces');
import PathUtils from 'pydio/util/path'
import LangUtils from 'pydio/util/lang'
import AjxpNode from 'pydio/model/node';
import {
    MdFullscreen,
    MdList,
    MdPreview, MdShortText,
} from "react-icons/md";
import {BlockMenu} from "../blocks/BlockMenu";
import {useBlockNoteEditor} from "@blocknote/react";


const Preview = ({node, rich, border, filePreviewStyle, isCurrentFolder, openFile, openFolder, onUpdateRatio}) => {
    if(!node) {
        return null
    }
    const buttonStyle = {
        borderRadius:20,
        color:'var(--md-sys-color-primary)',
        border:'1px solid var(--md-sys-color-primary)',
        padding: '0 8px',
        marginLeft: 4,
        fontWeight:500,
        cursor: 'pointer',
    }

    const iconButtonStyle = {
        fontSize: 15,
        opacity:0.5,
        cursor: 'pointer',
        height: 16,
        width: 16,
        borderRadius: 16,
        marginLeft: 8
    }

    return (
        <div style={{
            borderRadius:8,
            border: border ? "1px solid var(--md-sys-color-mimefont-background)" : '',
            overflow:'hidden',
            backgroundColor:'var(--md-sys-color-surface)',
            color:'var(--md-sys-color-on-surface)',
            boxShadow:!rich && 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px'
        }}>
            <FilePreview
                node={node}
                style={{width: 220, height: 170,display: 'flex', alignItems:'center', justifyContent:'center', fontSize: 40, ...filePreviewStyle}}
                loadThumbnail={true}
                richPreview={rich}
                processing={false}
                lightBackground={true}
                displayLarge={true}
                mimeFontOverlay={false}
                onUpdateRatio={onUpdateRatio}
            />
            {!rich &&
                <div style={{display:'flex', justifyContent:'end', padding: 8, borderTop:'1px solid var(--md-sys-color-mimefont-background)'}}>
                    {node.isLeaf() && <div style={buttonStyle} onClick={openFile}>Preview</div>}
                    {node.isLeaf() && !isCurrentFolder() && <div style={buttonStyle} onClick={openFolder}>Open in parent</div>}
                    {!node.isLeaf() && !isCurrentFolder() &&
                        <div style={buttonStyle} onClick={openFolder}>Open Folder</div>
                    }
                </div>
            }
            {rich &&
                <div style={{display:'flex', justifyContent:'end', padding: 8, fontSize:13, borderTop:'1px solid var(--md-sys-color-mimefont-background)'}}>
                    <div style={{flex: 1, fontWeight:600}}>{node.getLabel()}</div>
                    {node.isLeaf() && <div style={iconButtonStyle} onClick={openFile} className={"mdi mdi-eye"} title={"Preview"}/>}
                    {node.isLeaf() && !isCurrentFolder() && <div className={'mdi mdi-open-in-new'} style={iconButtonStyle} onClick={openFolder} title={"Open in Parent"}/>}
                    {!node.isLeaf() && !isCurrentFolder() &&
                        <div style={iconButtonStyle} onClick={openFolder} className={'mdi mdi-open-in-new'} title={"Open Folder"}/>
                    }
                </div>
            }
        </div>
    )
}

const SingleNode = (props) => {
    const {inline, path, repositoryId, inlineId, blockSize} = props
    const {dataModel} = useContext(ListContext);
    const [node, setNode] = useState(null)
    const [error, setError] = useState(null)
    const [open, setOpen] = useState(null)
    const [selection, setSelection] = useState([])
    const [ratio, setRatio] = useState(-1)

    const editor = useBlockNoteEditor();

    useEffect(()=>{
        const node = new AjxpNode(path)
        node.getMetadata().set('repository_id', repositoryId)
        dataModel.getAjxpNodeProvider().loadLeafNodeSync(node, (n)=>{
            n.getMetadata().set('repository_id', repositoryId)
            n.setParent(new AjxpNode()) // Add a fake parent to avoid errors when opening editors
            setNode(n)
        }, true, {}, (e)=>{setError(e || {message:'not found'})})
    }, [])

    useEffect(() => {
        if(!dataModel) {
            return;
        }
        // Observe DM
        const observer = () => {
            setSelection(dataModel.getSelectedNodes() || [])
        }
        dataModel.observe('selection_changed', observer)
        return () => {
            dataModel.stopObserving('selection_changed', observer)
        }
    }, [dataModel]);


    const openFolder = useCallback(() => {
        if(!node){
            return
        }
        Pydio.getInstance().goTo(node)
    }, [node])
    const openFile = useCallback(() => {
        if(!node){
            return
        }
        Pydio.getInstance().UI.openCurrentSelectionInEditor(null, node);
    }, [node, dataModel])
    const selectOnHover = useCallback(() => {
        setOpen(true);
    }, [node, dataModel])
    const selectNode = useCallback(() => {
        if(!node) {
            return
        }
        dataModel.setSelectedNodes([node]);
    }, [node, dataModel])
    const isCurrentFolder = useCallback(() => {
        const contextRepo = Pydio.getInstance().user.activeRepository;
        const nodeRepo = node.getMetadata().get('repository')
        if(nodeRepo && nodeRepo !== contextRepo) {
            return false
        }
        const contextNodePath = dataModel.getContextNode().getPath()
        let targetPath = node.getPath()
        if(node.isLeaf()) {
            targetPath = PathUtils.getDirname(targetPath)
        }
        return LangUtils.trim(contextNodePath, '/') === LangUtils.trim(targetPath, '/')
    }, [node, dataModel])


    const previewStyle = {width: 24, height: 24,display: 'flex', alignItems:'center', justifyContent:'center', fontSize: 16}
    let backgroundColor, color
    if(node && selection.indexOf(node) > -1) {
        backgroundColor = 'var(--md-sys-color-secondary)'
        color = 'var(--md-sys-color-on-secondary)'
    } else if(open) {
        backgroundColor = 'var(--md-sys-color-mimefont-background)'
    }

    const crtMenuValue = inline ? 'inline': (blockSize === 'lg' ? 'full' : 'block')
    const menuHandler = useCallback((value) => {
        if(value === crtMenuValue) {
            return
        }
        const {block, inlineContent, updateInlineContent} = props;
        if(value === 'inline') {
            editor.removeBlocks([block])
            editor.insertInlineContent([{type: "nodeRef", props: {...block.props}}], {updateSelection: true});
        } else if(blockSize) { // We already have a block size, it's a size toggle
            const newBlockSize = value === 'full' ? 'lg' : 'md'
            editor.updateBlock(block, {
                type: 'nodeBlock',
                props: {...block.props, blockSize: newBlockSize}
            })
        } else if(inlineId) {
            let zeBlock, zeBlockUnique;
            editor.forEachBlock((block) => {
                if(!block.content || !block.content.forEach) {
                    return
                }
                block.content.forEach((content) => {
                    if(content.type === "nodeRef" && content.props.inlineId === inlineId){
                        zeBlock = block
                        zeBlockUnique = block.content.length === 1
                    }
                });
            })
            if(zeBlock && node) {
                if(node.isLeaf()){
                    const newBlockSize = value === 'full' ? 'lg' : 'md'
                    editor.insertBlocks([{
                        type: "nodeBlock",
                        props: {...inlineContent.props, blockSize: newBlockSize},
                    }], zeBlock, 'after')
                } else {
                    editor.insertBlocks([{
                        type: 'childrenList',
                        props: {path, repositoryId}
                    }], zeBlock, 'after')
                }
                if(zeBlockUnique) {
                    editor.removeBlocks([zeBlock])
                } else {
                    updateInlineContent('')
                }
            }
        }

    }, [inline, editor, props, node, crtMenuValue])

    const displayMenuItems = useMemo(() =>  {
        const items =  [
        {value:'inline', title:'Inline', icon:MdShortText},
        {value:'block', title:node && node.isLeaf()?'Preview':'Contents', icon:node && node.isLeaf()?MdPreview:MdList},
    ]
        if(node && node.isLeaf()) {
            items.push({value: 'full', title: 'Full Page', icon: MdFullscreen})
        }
        return items;
    }, [node])

    if (!inline) {

        const width = blockSize === 'lg'?'100%':320
        return (
            <Paper shadow={'xs'} radius={'md'} withBorder={true} onClick={selectNode} style={{position:'relative', width}}>
                <Preview
                    node={node}
                    rich={true}
                    isCurrentFolder={isCurrentFolder}
                    openFile={openFile}
                    openFolder={openFolder}
                    filePreviewStyle={{width, height: 'auto', minHeight: 260}}
                    onUpdateRatio={(r) => setRatio(r)}
                />
                <BlockMenu
                    groups={[{title:'Display', crtValue:crtMenuValue, values:displayMenuItems, onValueSelected:menuHandler}]}
                    target={<span style={{cursor:'pointer', opacity:0.73, position:'absolute', top: 8, right:8}} className={"mdi mdi-dots-vertical-circle-outline"}/>}
                    position={'bottom-end'}
                />
            </Paper>
        )
    }

    return (
        <span
            onClick={selectNode}
            onContextMenu={(e) => {e.stopPropagation();e.preventDefault()}}
            style={{
                display:'inline-flex',
                alignItems:'center',
                color,
                backgroundColor,
                border: "1px solid var(--md-sys-color-mimefont-background)",
                fontSize:15,
                borderRadius: 5,
                cursor: 'pointer'
            }}
        >
        <HoverCard  openDelay={200} closeDelay={0} position={'bottom-start'} onOpen={selectOnHover} onClose={()=>setOpen(false)}>
            <HoverCard.Target>
                <span style={{display:'inline-flex'}}>
                    {node&& <FilePreview
                        node={node}
                        style={previewStyle}
                        loadThumbnail={false}
                        richPreview={false}
                    />}
                    {error &&
                        <>
                            <span style={{...previewStyle, backgroundColor:'var(--alert-error-bg)'}} className={'mdi mdi-alert-outline'}/>
                            <span style={{flex: 1, padding: '0 8px'}}>{open?'Original path: ' + path:'File not found'}</span>
                        </>
                    }
                    {!error &&
                        <span style={{flex: 1, padding: '0 8px'}}>{PathUtils.getBasename(path)}</span>
                    }
                </span>
            </HoverCard.Target>
            <HoverCard.Dropdown>
                <Preview border={true} node={node} rich={false} isCurrentFolder={isCurrentFolder} openFile={openFile} openFolder={openFolder}/>
            </HoverCard.Dropdown>
        </HoverCard>
        <BlockMenu
            groups={[{title:'Display', crtValue:inline?'inline':'block', values:displayMenuItems, onValueSelected:menuHandler}]}
            target={<span style={{cursor:'pointer', marginRight:8, opacity:0.73}} className={"mdi mdi-dots-vertical-circle-outline"}/>}
            position={'bottom-end'}
        />
        </span>
    )
}

export {SingleNode}