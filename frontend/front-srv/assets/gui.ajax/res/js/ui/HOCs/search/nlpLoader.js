/*
 * Copyright 2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import ResourcesManager from 'pydio/http/resources-manager'

let sentenceCache = {}
/** memoize tagger per-sentence */
const keyPress = function (text, lex, opts = {}) {
    const nlp = this
    const splitSentences = this.methods().one.tokenize.splitSentences
    let arr = splitSentences(text, this.world())

    let list = []
    arr.forEach(str => {
        //do we already have it parsed?
        if (sentenceCache.hasOwnProperty(str) === true) {
            //use the cache
            list.push(sentenceCache[str].data)
            sentenceCache[str].used = true
            // console.log('used cache: ', str, '\n')
        } else {
            //otherwise, parse it!
            if (opts.verbose) {
                console.log(`parsing: '${str}'\n`)//eslint-disable-line
            }
            let json = nlp(str, lex).json(0)
            //cache it
            sentenceCache[str] = {
                data: json,
                used: true,
            }
            list.push(json)
        }
    })
    // delete any unused cache
    Object.keys(sentenceCache).forEach(k => {
        if (sentenceCache[k].used === true) {
            sentenceCache[k].used = null
        } else {
            delete sentenceCache[k]
        }
    })
    if (opts.verbose) {
        console.log(`${Object.keys(sentenceCache).length}' sentences in cache\n`)//eslint-disable-line
    }
    return nlp(list)
}


let loaded;

export default () => {

    // Load NLP if language is supported
    const lang = Pydio.getInstance().currentLanguage

    let libName, nlpLanguage;
    switch (lang) {
        case 'en-us':
            nlpLanguage = 'en'
            libName = 'nlp'
            break
        case 'fr':
            return Promise.reject('french not supported yet');
        default:
            return Promise.reject('not supported');
    }

    if(loaded && loaded.nlpLanguage === nlpLanguage) {
        return Promise.resolve(loaded)
    }

    return import('compromise').then(({default: nlp}) => {
        return import('compromise-dates').then(({default:cdates}) => {
            nlp.plugin(cdates);
            nlp.extend(keyPress);
            const cc = [];
            const exts = nlp.Extensions
            Object.keys(exts).map(k => exts[k].map(ext => cc.push(ext)))

            loaded = {
                nlp,
                nlpLanguage,
                cc,
                extensions: '(' + cc.join('|') + ')'
            }
            return loaded;
        })
    })

    /*
    return ResourcesManager.loadClass(libName).then(() => {
        const {[libName]:nlp, compromiseDates} = window;
        nlp.plugin(compromiseDates);
        nlp.extend(keyPress);

        const cc = [];
        const exts = nlp.Extensions
        Object.keys(exts).map(k => exts[k].map(ext => cc.push(ext)))

        loaded = {
            nlp,
            nlpLanguage,
            cc,
            extensions: '(' + cc.join('|') + ')'
        }
        return loaded;
    })*/

}