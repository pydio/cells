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

import Pydio from 'pydio'
const {PromptValidators} = Pydio.requireLib('boot')
import {NodeServiceApiFactory} from "./hooks/NodeServiceApiFactory";
import LangUtils from 'pydio/util/lang'
import {saveMeta} from "./hooks/saveMeta";

async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        // modern asynchronous API
        try {
            await navigator.clipboard.writeText(text);
            //console.log('Copied via Clipboard API');
        } catch (err) {
            console.warn('Clipboard API failed, falling back', err);
            fallbackCopy(text);
        }
    } else {
        // older browsers
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    // Create a hidden textarea, paste the text into it, select it, and execCommand
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Prevent scrolling to bottom
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        console.log('Copied via execCommand fallback');
    } catch (err) {
        console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textarea);
}

export const Callbacks = {

    toggleKnowledgeBase() {
        const pydio = Pydio.getInstance()
        const ctxNode = pydio.getContextNode()
        const metaName = pydio.getPluginConfigs('editor.bnote').get('BNOTE_KNOWLEDGE_BASE')
        if(!metaName) {
            return
        }
        const meta = ctxNode.getMetadata()
        const enabled = meta.get(metaName) || false
        saveMeta(!enabled, metaName, ctxNode.getMetadata().get('uuid')).then(() => {
            meta.set(metaName, !enabled)
            ctxNode.setMetadata(meta, true)
        })

    },

    mkPage(){
        const pydio = Pydio.getInstance()

        let submit = value => {
            if(value.indexOf('/') !== -1) {
                const m = pydio.MessageHash['filename.forbidden.slash'];
                pydio.UI.displayMessage('ERROR', m);
                throw new Error(m);
            }

            const metaName = pydio.getPluginConfigs('editor.bnote').get('BNOTE_KNOWLEDGE_BASE')
            if(!metaName) {
                return
            }
            const slug = pydio.user.getActiveRepositoryObject().getSlug();
            const path = slug + LangUtils.trimRight(pydio.getContextNode().getPath(), '/') + '/' + value;

            NodeServiceApiFactory(pydio).then(api => {
                return api.create({Inputs:[{
                    Locator: {Path: path},
                    Type: 'COLLECTION',
                    Metadata:[{
                        Namespace: metaName,
                        JsonValue: "true",
                    }]
                }]}).then((res) => {
                    if(console) console.debug('Created nodes', res);
                })
            })
        };
        const validators = [
            PromptValidators.Empty,
            PromptValidators.NoSlash,
            PromptValidators.MustDifferSiblings(),
        ]
        pydio.UI.openComponentInModal('PydioReactUI', 'PromptDialog', {
            dialogTitleId:'bnote.mkpage',
            legendId:'bnote.mkpage.legend',
            fieldLabelId:'bnote.mkpage.placeholder',
            dialogSize:'sm',
            submitValue:submit,
            warnSpace: true,
            validate:(value) => {
                validators.forEach(v => v(value))
            }
        });

    },

    copyRef(){
        const pydio = Pydio.getInstance()
        const nodes = pydio.getContextHolder().getSelectedNodes()
        if(!nodes.length) {
            return
        }
        copyToClipboard('node://' + nodes[0].getMetadata().get('uuid')).catch(e =>{
            console.log(e)
        })
    }

}