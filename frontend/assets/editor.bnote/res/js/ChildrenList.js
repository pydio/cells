import React, {useState, useCallback} from 'react'
import { createReactBlockSpec } from "@blocknote/react";
const {FilePreview} = Pydio.requireLib('workspaces');
const { useDataModelContextNodeAsItems, useDataModelSelection } = Pydio.requireLib('components')
import {muiThemeable} from 'material-ui/styles';
import Pydio from 'pydio'


const Item = muiThemeable()(({dataModel, node, muiTheme}) => {

    const [hover, setHover] = useState(false);
    const selected = useDataModelSelection(dataModel, node)

    const select = useCallback((event) => {
        dataModel.setSelectedNodes([node])
        event.stopPropagation()
    }, [node])

    return (
        <div style={{display:'flex', paddingLeft: 4}} onClick={select} onMouseEnter={()=>setHover(true)} onMouseLeave={() => setHover(false)}>
            <span className={"mdi mdi-subdirectory-arrow-right"}/>
            <div style={{
                flex: 1, display:'flex', alignItems:'center',
                margin:3,
                cursor:'pointer',
                border: (hover || selected)?'1px solid var(--md-sys-color-primary)':'1px solid var(--md-sys-color-outline-variant)',
                backgroundColor:selected?'var(--md-sys-color-primary)':'inherit',
                color:selected?'var(--md-sys-color-on-primary)':'inherit',
                borderRadius:6, paddingRight:8
            }}>
                <div style={{marginRight: 2}}>
                    <FilePreview
                        node={node}
                        loadThumbnail={false}
                        style={{
                            height: 22, width:22, fontSize: 16,
                            borderRadius: 2, alignItems:'center',
                        }}
                        mimeFontStyle={{margin:'0 auto'}}
                    />
                </div>
                <div style={{flex: 1, fontSize: 12, fontWeight:600}}>{node.getLabel()}</div>
            </div>
        </div>
    )
})

const List = ({dataModel, node}) => {

    if(!node) {
        return null;
    }

    const {items} = useDataModelContextNodeAsItems(dataModel, (n) => {
        const nn = []
        n.getChildren().forEach(child => nn.push(<Item dataModel={dataModel} node={child}/>))
        return nn;
    })
    return (
        <div>
            <h2 style={{fontWeight: 600}}><span className={"mdi mdi-folder-open-outline"} style={{marginRight: 3}}/>{node.getLabel()}</h2>
            <div className={"bn-children-list"}>{items}</div>
        </div>
    );
}

// Inline listing block.
export const ChildrenList = createReactBlockSpec(
    {
        type: "childrenList",
        propSchema: {
            node:{default:null},
        },
        content: "inline",
    },
    {
        render: (props) => {
            return <List dataModel={Pydio.getInstance().getContextHolder()} node={props.block.props.node}/>
        },
    }
);
