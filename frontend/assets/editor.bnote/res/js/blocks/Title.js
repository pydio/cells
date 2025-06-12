import {useContext} from 'react'
import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import {ListContext} from './ChildrenList'
import Pydio from 'pydio'
const { moment } = Pydio.requireLib('boot');
const {ButtonMenu} = Pydio.requireLib('components');
const LangUtils = require('pydio/util/lang')


// The Title block.
export const Title = createReactBlockSpec(
    {
        type: "title",
        propSchema: {
            textAlignment: defaultProps.textAlignment,
            textColor: defaultProps.textColor
        },
        content: "inline",
    },
    {
        render: (props) => {
            const {dataModel} = useContext(ListContext)
            const node = dataModel.getContextNode();
            const date = moment(new Date(parseInt(node.getMetadata().get('ajxp_modiftime'))*1000)).fromNow()
            let description
            const activeRepo = Pydio.getInstance().user.getActiveRepositoryObject()
            if(node.getMetadata().has('ws_root')) {
                description = activeRepo.getDescription() || '';
            }
            const pydio = Pydio.getInstance()
            const newButtonProps = {
                buttonStyle:{height: 30, lineHeight: '26px', marginLeft: 6},
                buttonLabelStyle:{fontSize: 20, paddingLeft: 6, paddingRight: 6}
            };

            let segments = [];
            if(node.getPath().replace('/', '') !== '') {
                segments.push(<span className={"segment first"} style={{cursor:'pointer'}} onClick={() => pydio.goTo('/')}>{activeRepo.getLabel()}</span>)
            }
            let rebuilt = '';
            // Remove last part
            const parts = LangUtils.trimLeft(node.getPath(), '/').split('/')
            parts.pop()
            parts.forEach((seg, i) => {
                if(!seg) {
                    return;
                }
                const last = (i===parts.length-1)
                rebuilt += '/' + seg;
                const rebuiltCopy = rebuilt;
                segments.push(<span key={'bread_sep_' + i} className="separator"> / </span>);
                segments.push(<span key={'bread_' + i} style={{cursor:'pointer'}} className={"segment"+(last?' last':'')} onClick={(e)=> {e.stopPropagation(); console.log(rebuiltCopy); pydio.goTo(rebuiltCopy)}}>{seg}</span>);
            });

            return (
                <div style={{paddingBottom: 20}}>
                    {segments && <div style={{fontSize: '0.8em'}}>{segments}</div>}
                    <h1 style={{fontSize:'2em', fontWeight:700, display:'flex'}}>
                        {/*Rich text field for user to type in*/}
                        <div className={"inline-content"} style={{flexGrow:'initial', width:'auto'}} ref={props.contentRef} />
                        <ButtonMenu
                            pydio={pydio}
                            {...newButtonProps}
                            id="create-button-menu-inline"
                            toolbars={["upload", "create"]}
                            buttonTitle={"+"}
                            controller={pydio.Controller}
                        />
                    </h1>
                    <div style={{color:'gray'}}>{description?description+' - ':null}Created {date}</div>
                </div>

            );
        },
    }
);
