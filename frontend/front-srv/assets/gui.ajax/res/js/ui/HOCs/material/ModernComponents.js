/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React from 'react'
import {TextField, SelectField} from 'material-ui'

const noWrap = {
    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
};

const styles = {
    textField:{
        inputStyle:{backgroundColor:'rgba(224, 224, 224, 0.33)',height: 34, borderRadius: 3, marginTop: 6, padding: 7},
        hintStyle:{paddingLeft: 7, color:'rgba(0,0,0,0.5)', ...noWrap, width: '100%'},
        underlineStyle:{opacity:0},
        underlineFocusStyle:{opacity:1, borderRadius: '0px 0px 3px 3px'},
    },
    selectField:{
        style:{backgroundColor:'rgba(224, 224, 224, 0.33)',height: 34, borderRadius: 3, marginTop: 6, padding: 7, paddingRight: 0, overflow:'hidden'},
        menuStyle:{marginTop: -12},
        hintStyle:{paddingLeft: 0, marginBottom: -7, paddingRight:56, color:'rgba(0,0,0,0.34)', ...noWrap, width: '100%'},
        underlineShow: false
    },
    div:{
        backgroundColor:'rgba(224, 224, 224, 0.33)', color:'rgba(0,0,0,.5)',
        height: 34, borderRadius: 3, marginTop: 6, padding: 7, paddingRight: 0
    }
};

function withModernTheme(formComponent) {

    class ModernThemeComponent extends React.Component {

        mergedProps(styleProps){
            const props = this.props;
            Object.keys(props).forEach((k) => {
                if(styleProps[k]){
                    styleProps[k] = {...styleProps[k], ...props[k]};
                }
            });
            return styleProps;
        }

        componentDidMount(){
            if (this.props.focusOnMount && this.refs.component){
                this.refs.component.focus();
            }
        }

        render() {

            if (formComponent === TextField) {
                const styleProps = this.mergedProps({...styles.textField});
                return <TextField {...this.props} {...styleProps} ref={"component"} />
            } else if (formComponent === SelectField) {
                const styleProps = this.mergedProps({...styles.selectField});
                return <SelectField {...this.props} {...styleProps} ref={"component"}/>
            } else {
                return null;
            }
        }
    }

    return ModernThemeComponent;

}

const ModernTextField = withModernTheme(TextField);
const ModernSelectField = withModernTheme(SelectField);
export {ModernTextField, ModernSelectField, withModernTheme, styles as ModernStyles}