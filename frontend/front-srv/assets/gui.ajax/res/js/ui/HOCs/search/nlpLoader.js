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

const Extensions = {
    "archive": ["7z", "a", "apk", "ar", "bz2", "cab", "cpio", "deb", "dmg", "egg", "gz", "iso", "jar", "lha", "mar", "pea", "rar", "rpm", "s7z", "shar", "tar", "tbz2", "tgz", "tlz", "war", "whl", "xpi", "zip", "zipx", "xz", "pak"],
    "audio": ["aac", "aiff", "ape", "au", "flac", "gsm", "it", "m3u", "m4a", "mid", "mod", "mp3", "mpa", "pls", "ra", "s3m", "sid", "wav", "wma", "xm"],
    "book": ["mobi", "epub", "azw1", "azw3", "azw4", "azw6", "azw", "cbr", "cbz"],
    "code": ["1.ada", "2.ada", "ada", "adb", "ads", "asm", "bas", "bash", "bat", "c", "c++", "cbl", "cc", "class", "clj", "cob", "cpp", "cs", "csh", "cxx", "d", "diff", "e", "el", "f", "f77", "f90", "fish", "for", "fth", "ftn", "go", "groovy", "h", "hh", "hpp", "hs", "html", "htm", "hxx", "java", "js", "jsx", "jsp", "ksh", "kt", "lhs", "lisp", "lua", "m", "m4", "nim", "patch", "php", "pl", "po", "pp", "py", "r", "rb", "rs", "s", "scala", "sh", "swg", "swift", "v", "vb", "vcxproj", "xcodeproj", "xml", "zsh"],
    "exec": ["exe", "msi", "bin", "command", "sh", "bat", "crx", "bash", "csh", "fish", "ksh", "zsh"],
    "font": ["eot", "otf", "ttf", "woff", "woff2"],
    "image": ["3dm", "3ds", "max", "bmp", "dds", "gif", "jpg", "jpeg", "png", "psd", "xcf", "tga", "thm", "tif", "tiff", "yuv", "ai", "eps", "ps", "svg", "dwg", "dxf", "gpx", "kml", "kmz", "webp"],
    "sheet": ["ods", "xls", "xlsx", "csv", "ics", "vcf"],
    "slide": ["ppt", "odp"],
    "text": ["doc", "docx", "ebook", "log", "md", "msg", "odt", "org", "pages", "pdf", "rtf", "rst", "tex", "txt", "wpd", "wps"],
    "video": ["3g2", "3gp", "aaf", "asf", "avchd", "avi", "drc", "flv", "m2v", "m4p", "m4v", "mkv", "mng", "mov", "mp2", "mp4", "mpe", "mpeg", "mpg", "mpv", "mxf", "nsv", "ogg", "ogv", "ogm", "qt", "rm", "rmvb", "roq", "srt", "svi", "vob", "webm", "wmv", "yuv"],
    "web": ["html", "htm", "css", "js", "jsx", "less", "scss", "wasm", "php"]
};

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
            Object.keys(Extensions).map(k => Extensions[k].map(ext => cc.push(ext)))
            loaded = {
                nlp,
                nlpLanguage,
                cc,
                extensions: '(' + cc.join('|') + ')'
            }
            return loaded;
        })
    })

}