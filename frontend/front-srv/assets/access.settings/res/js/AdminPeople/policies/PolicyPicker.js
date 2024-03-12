/*
 * Copyright 2024 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {useState} from 'react'
import Pydio from 'pydio'
const {Stepper} = Pydio.requireLib("components");
const {Dialog, PanelBigButtons} = Stepper;
import Templates from './Templates'

export const PolicyPicker = ({open, onRequestClose, onPick, m}) => {

    const mt = (id) => Pydio.getMessages()['tpl_policies.PolicyGroup.' + id] || id;
    const [filter, setDialogFilter] = useState('')

    const model ={Sections:[]};

    const manualSection = {
        title: mt('Create.Manual'),
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
        title: mt('Create.Templates'),
        Actions: Templates.map(tpl => {
            const {Icon, ...template} = tpl;
            template.Name = mt(template.Name)
            template.Description = mt(template.Description)
            template.Policies.forEach(p => {
                p.description = mt(p.description);
            })
            return {
                title: template.Name,
                description: template.Description,
                icon:  'mdi mdi-' + Icon,
                tag:"preset",
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
            title={mt('Create')}
            open={open}
            dialogProps={{bodyStyle:{overflowY:'auto'}}}
            onDismiss={()=>{onRequestClose()}}
            onFilter={setDialogFilter}
            filterHint={mt('Filter')}
        ><PanelBigButtons
            model={model}
            onPick={(value) => {onPick(value)}}
        />
        </Dialog>
    )

}