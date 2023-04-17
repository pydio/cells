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
import React, {createRef} from 'react'
import PropTypes from 'prop-types'
import {TextField, SelectField, AutoComplete} from 'material-ui'


const styles = (muiTheme) => {

    const noWrap = {
        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
    };

    const v1BgColor ='rgba(224, 224, 228, 0.33)'//var(--md-sys-color-surface-variant)'
    const hintColor='var(--md-sys-color-outline)'

    const isMUI3 = muiTheme.userTheme === 'mui3'

    const v2Block = {
        backgroundColor:isMUI3?'var(--md-sys-color-surface-variant)':'rgb(246, 246, 248)',
        borderRadius:'3px 3px 0 0',
        height:52,
        marginTop: 8
    }

    const underline = {
        idle: {borderBottom:isMUI3?'1px solid var(--md-sys-color-field-underline-idle)':'1px solid #e0e0e0'},
        focus: {borderBottom:'2px solid var(--md-sys-color-primary)'}
    }


    return {
        textField: {
            inputStyle: {backgroundColor: v1BgColor, height: 34, borderRadius: 3, marginTop: 6, padding: 7},
            hintStyle: {paddingLeft: 7, color: muiTheme.darkMode?'#aaa':'#454545', ...noWrap, width: '100%'},
            underlineStyle: {opacity: 0},
            underlineFocusStyle: {opacity: 1, borderRadius: '0px 0px 3px 3px'},
            errorStyle: {bottom: -4}
        },
        textFieldV1Search: {
            inputStyle: {backgroundColor: v1BgColor, height: 34, borderRadius: '0 20px 20px 0', marginTop: 6, padding: 7, fontSize:13},
            hintStyle: {fontSize: 13, paddingLeft: 7, color: muiTheme.darkMode?'#aaa':'#454545', ...noWrap, width: '100%'},
            underlineStyle: {opacity: 0},
            underlineFocusStyle: {opacity: 1, borderRadius: 0, width: '96%'},
            errorStyle: {bottom: -4}
        },
        textFieldV2: {
            style: {...v2Block},
            inputStyle: {position: 'absolute', height: 30, marginTop: 0, bottom: 2, paddingLeft: 8, paddingRight: 8},
            hintStyle: {bottom: 4, paddingLeft: 7, color: hintColor, ...noWrap, width: '100%'},
            underlineStyle: {opacity: 1, bottom: 0, ...underline.idle},
            underlineFocusStyle: {opacity: 1, borderRadius: 0, bottom: 0, ...underline.focus},
            floatingLabelFixed: true,
            floatingLabelStyle: {top: 26, left: 8, width: '127%', ...noWrap},
            floatingLabelShrinkStyle: {top: 26, left: 8},
            errorStyle: {
                position: 'absolute', bottom: 8, right: 8,
                maxWidth: '60%', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'
            }
        },
        textareaField: {
            rows: 4,
            rowsMax: 4,
            inputStyle: {backgroundColor: v1BgColor, height: 106, borderRadius: 3, marginTop: 6, padding: 7},
            textareaStyle: {marginTop: 0, marginBottom: 0},
            hintStyle: {paddingLeft: 7, color: hintColor, ...noWrap, width: '100%', top: 12, bottom: 'inherit'},
            underlineStyle: {opacity: 0},
            underlineFocusStyle: {opacity: 1, borderRadius: '0px 0px 3px 3px'},
            errorStyle: {bottom: -3}
        },
        textareaFieldV1Search: {
            rows: 4,
            rowsMax: 4,
            inputStyle: {backgroundColor: v1BgColor, height: 106, borderRadius: '0 20px 20px 0', marginTop: 6, padding: 7, fontSize:13},
            textareaStyle: {marginTop: 0, marginBottom: 0},
            hintStyle: {paddingLeft: 7, color: hintColor, ...noWrap, width: '100%', top: 12, bottom: 'inherit', fontSize:13},
            underlineStyle: {opacity: 0},
            underlineFocusStyle: {opacity: 1, borderRadius: 0, width:'96%'},
            errorStyle: {bottom: -3}
        },
        textareaFieldV2: {
            rows: 4,
            rowsMax: 4,
            style: {height: 128},
            inputStyle: {
                backgroundColor: v2Block.backgroundColor,
                height: 120,
                borderRadius: v2Block.borderRadius,
                marginTop: 8,
                paddingLeft: 8
            },
            textareaStyle: {marginTop: 24, marginBottom: 0},
            floatingLabelFixed: true,
            floatingLabelStyle: {top: 35, left: 6, width: '127%', ...noWrap},
            floatingLabelShrinkStyle: {top: 35, left: 6},
            hintStyle: {paddingLeft: 7, color: hintColor, ...noWrap, width: '100%', top: 12, bottom: 'inherit'},
            underlineStyle: {opacity: 1, bottom: 0, ...underline.idle},
            underlineFocusStyle: {opacity: 1, bottom: 0, borderRadius: '0px 0px 3px 3px', ...underline.focus},
            errorStyle: {position: 'absolute', bottom: 8, right: 8}
        },
        selectField: {
            style: {
                backgroundColor: v1BgColor,
                height: 34,
                borderRadius: 3,
                marginTop: 6,
                padding: 7,
                paddingRight: 0,
                overflow: 'hidden'
            },
            menuStyle: {marginTop: -12},
            hintStyle: {paddingLeft: 0, marginBottom: -7, paddingRight: 56, color: muiTheme.darkMode?'#ccc':hintColor, ...noWrap, width: '100%'},
            underlineShow: false
        },
        selectFieldV1Search: {
            style: {
                backgroundColor: v1BgColor,
                height: 34,
                borderRadius: '0 20px 20px 0',
                marginTop: 6,
                padding: 7,
                paddingRight: 0,
                overflow: 'hidden',
                fontSize: 13
            },
            menuStyle: {marginTop: -12},
            hintStyle: {
                fontSize: 13,
                paddingLeft: 0,
                marginBottom: -7,
                paddingRight: 56,
                color: muiTheme.darkMode?'#ccc':hintColor,
                ...noWrap,
                width: '100%'
            },
            underlineShow: false
        },
        selectFieldV2: {
            style: {...v2Block, padding: 8, paddingRight: 0, overflow: 'hidden'},
            menuStyle: {marginTop: -6},
            hintStyle: {paddingLeft: 0, marginBottom: -7, paddingRight: 56, color: hintColor, ...noWrap, width: '100%'},
            underlineStyle: {opacity: 1, bottom: 0, left: 0, right: 0, ...underline.idle},
            underlineFocusStyle: {opacity: 1, borderRadius: 0, bottom: 0, ...underline.focus},
            floatingLabelFixed: true,
            floatingLabelStyle: {top: 26, left: 8, width: '127%', ...noWrap},
            floatingLabelShrinkStyle: {top: 26, left: 8},
            dropDownMenuProps: {
                iconStyle: {right: 0, fill: '#9e9e9e'},
                menuStyle: {background: isMUI3?'var(--md-sys-color-surface-4)':'white'}
            }
        },
        div: {
            backgroundColor: v1BgColor, color: 'rgba(0,0,0,.5)',
            height: 34, borderRadius: 3, marginTop: 6, padding: 7, paddingRight: 0
        },
        toggleField: {
            style: {
                backgroundColor: v1BgColor,
                padding: '7px 5px 4px',
                borderRadius: 3,
                fontSize: 15,
                margin: '6px 0 7px'
            }
        },
        toggleFieldV1Search: {
            style: {
                backgroundColor: v1BgColor,
                padding: '7px 5px 4px',
                borderRadius: '0 20px 20px 0',
                fontSize: 13,
                margin: '6px 0 7px'
            }
        },
        toggleFieldV2: {
            style: {
                ...v2Block,
                borderRadius: 4,
                fontSize: 15,
                padding: '15px 10px 4px'
            }
        },
        fillBlockV2Right: {
            ...v2Block,
            borderRadius: '0 4px 0 0',
            ...underline.idle
        },
        fillBlockV2Left: {
            ...v2Block,
            borderRadius: '4px 0 0 0',
            ...underline.idle
        },
        v2BlockBase:{
            backgroundColor:isMUI3?'var(--md-sys-color-surface-variant)':'rgb(246, 246, 248)',
            borderRadius:'3px 3px 0 0',
            ...underline.idle
        }
    };
}

const defaultStyles = styles({
    palette:{
        mui3: {}
    }
})

function getV2WithBlocks(styles, hasLeft, hasRight){
    if(styles.style){
        styles.style.borderRadius = (hasLeft?'0 ':'4px ') + (hasRight?'0 ':'4px ') + '0 0';
    }
    return styles;
}

function selectBaseFileName(htmlInput){
    const value = htmlInput.value;
    let rangeEnd = value.lastIndexOf('.');
    if(rangeEnd === -1){
        rangeEnd = value.length;
    }
    if (htmlInput.setSelectionRange){
        htmlInput.setSelectionRange(0, rangeEnd);
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(htmlInput, 0);
        range.setEnd(htmlInput, rangeEnd);
        selection.removeAllRanges();
        selection.addRange(range);
    } else if(htmlInput.select){
        htmlInput.select();
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
}


function withModernTheme(formComponent) {

    class ModernThemeComponent extends React.Component {

        constructor(props, context) {
            super(props, context);
            this.compRef = createRef()
            this.muiTheme = context.muiTheme || {palette:{mui3:{}}};
        }

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
            const {focusOnMount, selectBaseOnMount} = this.props;
            if (focusOnMount && this.compRef.current){
                this.compRef.current.focus();
            } else if(selectBaseOnMount && this.compRef.current){
                selectBaseFileName(this.compRef.current.input)
                this.compRef.current.focus();
            }
        }

        focus(){
            if(this.compRef.current){
                this.compRef.current.focus();
            }
        }

        getInput(){
            if(this.compRef.current){
                return this.compRef.current.input;
            }
        }

        getValue(){
            if(this.compRef.current){
                return this.compRef.current.getValue();
            }else {
                return ''
            }
        }

        render() {

            let {variant, hasLeftBlock, hasRightBlock, ...otherProps} = this.props;
            const muiTheme = this.muiTheme

            if(variant === 'v2' || formComponent === AutoComplete) {
                if(!otherProps.floatingLabelText){
                    otherProps.floatingLabelText = otherProps.hintText
                    delete(otherProps.hintText);
                }
            } else {
                if(otherProps.floatingLabelText){
                    otherProps.hintText = otherProps.floatingLabelText;
                    delete(otherProps.floatingLabelText);
                }
            }

            if (formComponent === TextField) {
                let styleProps;
                if(this.props.multiLine){
                    if(variant === 'v2') {
                        styleProps = this.mergedProps({...styles(muiTheme).textareaFieldV2});
                    } else {
                        styleProps = this.mergedProps({...styles(muiTheme).textareaField});
                    }
                } else {
                    if(variant === 'v2') {
                        styleProps = this.mergedProps(getV2WithBlocks({...styles(muiTheme).textFieldV2}, hasLeftBlock, hasRightBlock));
                    } else {
                        styleProps = this.mergedProps({...styles(muiTheme).textField});
                    }
                }
                return <TextField {...otherProps} {...styleProps} ref={this.compRef} />
            } else if (formComponent === SelectField) {
                let styleProps;
                if (variant === 'v2') {
                    styleProps = this.mergedProps(getV2WithBlocks({...styles(muiTheme).selectFieldV2}, hasLeftBlock, hasRightBlock));
                } else {
                    styleProps = this.mergedProps({...styles(muiTheme).selectField});
                }
                return <SelectField {...otherProps} {...styleProps} ref={this.compRef}/>
            } else if (formComponent === AutoComplete) {

                const {style, ...tfStyles} = getV2WithBlocks({...styles(muiTheme).textFieldV2}, hasLeftBlock, hasRightBlock)
                return <AutoComplete
                    {...otherProps}
                    ref={"component"}
                    textFieldStyle={style}
                    menuStyle={muiTheme.palette.mui3?{background:muiTheme.menuContainer.background}:null}
                    {...tfStyles}
                />

            } else {
                return formComponent;
            }
        }
    }
    ModernThemeComponent.contextTypes = {
        muiTheme: PropTypes.object.isRequired
    }

    return ModernThemeComponent;

}

const ModernTextField = withModernTheme(TextField);
const ModernSelectField = withModernTheme(SelectField);
const ModernAutoComplete = withModernTheme(AutoComplete);
export {ModernTextField, ModernSelectField, ModernAutoComplete, withModernTheme, defaultStyles as ModernStyles, styles as ThemedModernStyles}