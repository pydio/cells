import React, {useState} from 'react'
import Pydio from 'pydio'
const {Stepper} = Pydio.requireLib("components");
const {Dialog, PanelBigButtons} = Stepper;
import Templates from './Templates'

export const PolicyPicker = ({open, onRequestClose, onPick, m}) => {

    const [filter, setDialogFilter] = useState('')

    const model ={Sections:[]};

    const manualSection = {
        title: 'Manual Policy',
        Actions: [
            {
                title: m('type.acl.title'),
                description: m('type.acl.legend'),
                icon: 'mdi mdi-folder-lock-open-outline',
                tint: "#607d8b",
                value: {manual: true, ResourceGroup: 'acl'}
            },
            {
                title: m('type.rest.title'),
                description: m('type.rest.legend'),
                icon: 'mdi mdi-api',
                tint: "#607d8b",
                value: {manual: true, ResourceGroup: 'rest'}
            }
        ]
    }
    model.Sections.push(manualSection)

    const tplSection = {
        title:'Templates',
        Actions: Templates.map(tpl => {
            const {Icon, ...template} = tpl;
            return {
                title: tpl.Name,
                tag:"preset",
                description: tpl.Description,
                icon:  'mdi mdi-' + Icon,
                value: {template}
            }
        }).filter(a => (
            !filter
            || a.title.toLowerCase().indexOf(filter.toLowerCase())>-1
            ||a.description.toLowerCase().indexOf(filter.toLowerCase())>-1
        ))
    }

    if(tplSection.Actions.length) {
        model.Sections.push(tplSection)
    }


    return (
        <Dialog
            title={'Create Policy'}
            open={open}
            dialogProps={{bodyStyle:{overflowY:'auto'}}}
            onDismiss={()=>{onRequestClose()}}
            onFilter={setDialogFilter}
            filterHint={'Find template'}
        ><PanelBigButtons
            model={model}
            onPick={(value) => {onPick(value)}}
        />
        </Dialog>
    )

}