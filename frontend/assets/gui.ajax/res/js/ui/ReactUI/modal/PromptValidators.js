import Pydio from 'pydio'
import PathUtils from 'pydio/util/path'

export default {
    ApplyChecks: (errs, warns, value) => {
        try {
            errs.forEach(er => er(value))
        }catch(e){
            return {error: e.message}
        }
        try {
            warns.forEach(wr => wr(value))
        }catch(e) {
            return {warning: e.message}
        }
        return {}
    },

    Empty: (value) => {
        if(!value) {
            throw new Error('filename.forbidden.empty')
        }
    },
    NoSlash: (value) => {
        if(value && value.indexOf('/') > -1 ) {
            throw new Error('filename.forbidden.slash')
        }
    },
    MustDifferFrom: (original) => {
        return (value) => {
            if(value && value.toLowerCase() === original.toLowerCase()) {
                throw new Error('rename.newvalue.error.similar')
            }
        }
    },
    MustDifferSiblings: (siblings = undefined) => {
        if(siblings === undefined) {
            siblings = []
            Pydio.getInstance().getContextNode().getChildren().forEach(c => siblings.push(PathUtils.getBasename(c.getPath()).toLowerCase()))
        }
        return (value) => {
            if(value && siblings.indexOf(value.toLowerCase()) > -1) {
                throw new Error('125')
            }
        }
    },
    WarnSpace: (value) => {
        if(value.length) {
            if(value[0] === ' ' || value[value.length-1] === ' ') {
                throw new Error('filename.trailing-leading.spaces')
            }
        }
    }
}