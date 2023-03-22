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

import DOMUtils from 'pydio/util/dom'
import { getMuiTheme } from 'material-ui/styles';
import { createTheme } from '@mui/material/styles'
import Color from 'color'
import { argbFromHex, hexFromArgb, themeFromSourceColor, applyTheme, argbFromRgb, QuantizerCelebi, Score } from "@material/material-color-utilities";

/**
 *
 * @param target {}
 * @param scheme
 * @param suffix
 */
function extractSchemeProperties(target, scheme, suffix = '') {
    for (const [key, value] of Object.entries(scheme.toJSON())) {
        const token = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        target[`${token}${suffix}`] = hexFromArgb(value);
    }
}

function theme3ToColors(theme, options) {
    const isDark = options.dark || false;
    const scheme = isDark ? theme.schemes.dark : theme.schemes.light;
    const all = {}
    extractSchemeProperties(all, scheme);
    return all
}


async function getImageData(blob, ctx) {
    const bitmap = await createImageBitmap(blob);
    const [width, height] = [bitmap.width, bitmap.height];
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, width, height);
}

const createImageBitmap = window.createImageBitmap ||
    ((blob) =>
        new Promise((resolve) => {
            let img = document.createElement("img");
            img.addEventListener("load", () => resolve(this));
            img.src = URL.createObjectURL(blob);
        }))

async function image_bufferToPixels(buffer) {
    const imageBytes = new Uint8Array(buffer);
    const  ctx = document.createElement("canvas").getContext("2d");
    const blobData = new Blob([imageBytes])
    const imageData = await getImageData(blobData, ctx)
    const pixels = [];
    for (let i = 0; i < imageData.data.length; i += 4){
        255 > imageData.data[i + 3] || pixels.push(argbFromRgb(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]));
    }
    return pixels
}

async function image_downloadImage(url) {
    return fetch(url).then(res=>res.arrayBuffer())
}
async function image_sourceColorsFromImage(image) {
    const imageBuffer = typeof image === "string" ? await image_downloadImage(image) : image ;
    const pixels = await image_bufferToPixels(imageBuffer);
    const result = QuantizerCelebi.quantize(pixels, 10);
    return Score.score(result).slice(0, 5).map(hexFromArgb).map(val=>val.toUpperCase())
}

let DETECTED_BACKGROUND;
let builderInstance;

/*
.mimefont {
  &.mdi-file-pdf,&.mdi-file-image{
    color: #f44336 !important;
  }
  &.mdi-file-word, &.mdi-file-document{
    color: #2196f3 !important;
  }
  &.mdi-file-excel{
    color: #4caf50 !important;
  }
  &.mdi-file-music{
    color: #ff9800 !important;
  }
  &.mdi-file-video, &.mdi-movie{
    color: #ff5722 !important;
  }
  &.mdi-file-powerpoint{
    color:#3f51b5 !important;
  }
  &.mdi-archive{
    color:#fbc02d !important;
  }
}

 */

const customTypesColors = {
    'pdf':'#f44336',
    'doc':'#2196f3',
    'xls':'#4caf50',
    'music':'#ff9800',
    'video':'#ff5722',
    'ppt':'#3f51b5',
    'archive':'#fbc02d'
}

export default class ThemeBuilder {

    static getInstance(pydio, requireRefresh=()=>{}){
        if(!builderInstance){
            builderInstance = new ThemeBuilder(pydio, requireRefresh)
        }
        return builderInstance
    }

    constructor(pydio, requireRefresh=()=>{}) {
        this.pydio = pydio;
        this.loadUserData(pydio.user)
        this.loadBreakpoint()
        this.requireRefresh = () => {
            this.invalidate();
            requireRefresh()
        }

        this._userObserver = (user)  => {
            this.loadUserData(user) && this.requireRefresh()
        }
        pydio.observe('user_logged', this._userObserver)
        DOMUtils.observeWindowResize(() => {
            this.loadBreakpoint() && this.requireRefresh()
        })
        //this.detectBackground('orbit_content')
    }

    detectBackground(elementId) {
        if(DETECTED_BACKGROUND) {
            return
        }
        let imgUrl;
        try{
            const bg = document.getElementById(elementId).style.backgroundImage
            imgUrl = bg.replace('url("', '').replace('")', '')
        }catch(e){
            console.warn('cannot find bg', e)
            return
        }
        image_sourceColorsFromImage(imgUrl).then(result => {
            DETECTED_BACKGROUND = result;
            this.invalidate();
            this.requireRefresh();
        }).catch(e => {
            console.warn('cannot load bg for color detection', e)
            return
        })
    }


    invalidate() {
        this._theme = undefined;
    }

    loadBreakpoint() {
        const w = DOMUtils.getViewportWidth()
        let bp = 'md';
        if(w <= 420) {
            bp = 'xs'
        } else if(w <= 758) {
            bp = 's'
        }
        if(bp !== this.bp) {
            this.bp = bp
            return true
        }
        return false
    }

    loadUserData(user) {
        let userTheme = pydio.getPluginConfigs('gui.ajax').get('GUI_THEME');
        if(user && user.getPreference('theme') && user.getPreference('theme') !== 'default'){
            userTheme = user.getPreference('theme');
        }
        let dark = false
        if(userTheme === 'mui3') { // Detect
            dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        } else if(userTheme === 'mui3-dark') {
            dark = true;
            userTheme = 'mui3'
        } else if (userTheme === 'mui3-light') {
            userTheme = 'mui3'
        }

        if(this.userTheme !== userTheme || dark !== this.dark) {
            this.userTheme = userTheme
            this.dark = dark
            return true
        }
        return false
    }

    buildTheme(customPalette = undefined) {

        if(this._theme && !customPalette) {
            return this._theme
        }

        let palette = {
            primary1Color       : '#134e6c',
            primary2Color       : '#f44336',
            accent1Color        : '#f44336',
            accent2Color        : '#018dcc',
            avatarsColor        : '#438db3',
            sharingColor        : '#4aceb0',
        }
        if(customPalette) {
            palette = {...palette, ...customPalette}
        } else {
            if (pydio.Parameters.has('other') && pydio.Parameters.get('other')['vanity']) {
                const customPalette = pydio.Parameters.get('other')['vanity']['palette'] || {};
                palette = {...palette, ...customPalette}
            }
            if(DETECTED_BACKGROUND && DETECTED_BACKGROUND.length) {
                palette.primary1Color = DETECTED_BACKGROUND[0]
            }
        }



        // Check if the user has dark mode turned on
        const systemDark = this.dark;
        const styleTarget = document.body;

        let mui3 = {}, isMUI3

        if(this.userTheme === 'mui3') {
            // Get the theme from a hex color, prepare blended custom colors
            const customs = Object.keys(customTypesColors).map(k => {return {name:k, value: argbFromHex(customTypesColors[k]), blend: true}})
            const theme3 = themeFromSourceColor(argbFromHex(palette.primary1Color), customs);
            console.log(theme3);
            // Apply the theme to the body by updating custom properties for material tokens
            if(styleTarget.className && styleTarget.className.indexOf('mui3-token') === -1) {
                styleTarget.className += ' mui3-token'
            }
            if(!customPalette){
                applyTheme(theme3, {target: styleTarget, dark: systemDark});
            }
            mui3 = theme3ToColors(theme3, {dark: systemDark})

            const add = (key, value) => {
                mui3[key] = value
                if(!customPalette){
                    styleTarget.style.setProperty(`--md-sys-color-${key}`, value);
                }
            }

            // Build alt surfaces
            const mui3Primary = Color(mui3['primary'])
            const surfaces = [.05, .08, .11, .12, .14];
            const bg = mui3['background']
            surfaces.map((op, idx) => {
                const color = mui3Primary.alpha(op).toString()
                const background = `linear-gradient(${color}, ${color}), linear-gradient(${bg}, ${bg})`;
                add(`surface-${idx+1}`, background)
            })

            const customKeys = ['color', 'onColor', 'colorContainer', 'onColorContainer']
            theme3.customColors.forEach(c => {
                const name = c.color.name;
                customKeys.forEach(k => {
                    add(`custom-${name}-${k}`, hexFromArgb(systemDark?c.dark[k]:c.light[k]))
                })
            })

            // Build a lighter outline-variant
            add('outline-variant-50', Color(mui3['outline-variant']).fade(systemDark?.2:.5).toString())
            add('field-underline-idle', systemDark?mui3['outline']:mui3['outline-variant'])

            add('mimefont-background', Color(mui3['primary-container']).fade(systemDark?.1:.7).toString())
            add('mimefont-color', mui3['on-primary-container'])
            add('fstemplate-master-margin', '8px')
            add('paper-border-radius', '20px')
            add('card-border-radius', '12px')
            add('hover-background', systemDark ?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)')

            isMUI3 = true
            palette = {
                ...palette,
                primary1Color: mui3['primary'],
                disabledColor: Color(mui3['on-surface']).fade(.62).toString(),
                // Used for Dividers
                borderColor: systemDark?mui3['outline-variant']:mui3['outline-variant-50'],
                textColor: mui3['on-background'],
                primaryTextColor:mui3['on-primary'],
                secondaryTextColor:mui3['on-secondary']
            }

        } else {

            // Legacy colors, emulate some subparts of mui3
            const colorHue = Color(palette.primary1Color).hsl().array()[0];
            const superLightBack = new Color({h:colorHue,s:35,l:98});
            const infoPanelBg = new Color({h:colorHue,s:30,l:96});
            mui3.background = 'white';
            mui3['surface-3'] = superLightBack.toString()
            mui3['surface-2'] = infoPanelBg.toString()
            mui3['on-surface-variant'] = palette.primary1Color
            mui3['on-surface'] = palette.primary1Color
            mui3['hover-background'] = 'rgba(0,0,0,.08)'

            // For Forms, pass theming via CSS props
            if(!customPalette){
                styleTarget.style.setProperty('--md-sys-color-surface-variant', 'rgb(246, 246, 248)')
                styleTarget.style.setProperty('--md-sys-color-outline-variant', '#e0e0e0')
                styleTarget.style.setProperty('--md-sys-color-on-surface-variant', palette.primary1Color)
                styleTarget.style.setProperty('--md-sys-color-hover-background', 'rgba(0,0,0,.1)')
                styleTarget.style.setProperty('--md-sys-color-field-underline-idle', '#e0e0e0')
            }

        }


        palette = {
            ...palette,
            mui3,
        }

        const themeCusto = {
            palette,
            borderRadius: isMUI3?20:undefined,
            darkMode:systemDark,
            breakpoint: this.bp,
            userTheme: this.userTheme,
            buildFSTemplate:(sizingInfos) => this.buildFSTemplate(themeCusto, sizingInfos),
            button: {
                textColor: mui3['primary'],
                textTransform: 'none',
                minWidth: 60
            },
            flatButton : {
                textColor:mui3['primary'],
                primaryTextColor:mui3['on-primary-container'],
                secondaryTextColor:mui3['on-secondary-container']
            },
            iconButton:{
                iconStyle:{
                    color:isMUI3?mui3['primary']:mui3['on-surface']
                }
            },
            listItem:{
                secondaryTextColor: 'inherit'
            },
            raisedButton : {
                color:mui3['secondary-container'],
                textColor:mui3['on-secondary-container'],
                primaryColor:mui3['primary-container'],
                primaryTextColor:mui3['on-primary-container'],
                secondaryColor:mui3['secondary-container'],
                secondaryTextColor:mui3['on-secondary-container'],

                disabledColor:Color(mui3['primary']).fade(.88).toString(),
                disabledTextColor:Color(mui3['on-surface']).fade(.42).toString(),

                boxShadow: 0
            },
            toggle : {
                thumbOffColor           : mui3['primary'],
                thumbOnColor            : palette.accent2Color
            },
            menuItem : {
                selectedTextColor       : palette.accent2Color
            },
            dialog: {
                containerBackground: mui3['surface-4'],
                bodyColor:mui3['on-surface-variant']
            },
            datePicker:this.userTheme === 'mui3' ? {
                calendarTextColor:mui3['on-surface'],
                calendarYearBackgroundColor:mui3['surface'],
                headerColor:mui3['primary-container'],
                selectColor:mui3['tertiary-container'],
                selectTextColor:mui3['on-tertiary-container'],
                textColor:mui3['on-primary-container'],
            }:{},
            paper : this.userTheme === 'mui3' ? {
                backgroundColor:'transparent'
            } : {},
            menuContainer: {
                background:mui3['surface-2'],
                color:mui3['on-surface-variant'],
                overflowY: 'auto'
            },
            textField: {
                floatingLabelColor:mui3['on-surface-variant'],
                errorColor:mui3['error']
            },
            snackbar: {
                backgroundColor:mui3['inverse-surface'],
                textColor:mui3['inverse-on-surface']
            },
            tabs:{
                backgroundColor:'transparent',
                textColor:mui3['on-surface-variant'],
                selectedTextColor:mui3['primary'],
            },
            hoverBackgroundColor:mui3['hover-background']
        };

        if(this.userTheme !== 'mui3') {
            // Re-patch
            delete(themeCusto.button)
            delete(themeCusto.flatButton)
            delete(themeCusto.raisedButton)
            delete(themeCusto.tabs)
        }

        themeCusto['@mui'] = createTheme({
            typography: {
                fontSize: 13
            },
            palette: {
                mode: systemDark?'dark':'light',
                primary:{main:palette.primary1Color},
                secondary:{main:palette.mui3.secondary||palette.primary2Color},
                background:{
                    paper:mui3['surface-variant']||'white'
                }
            },
            shape:{
                borderRadius:themeCusto.borderRadius
            },
        })

        if(customPalette) {
            return getMuiTheme(themeCusto);
        }

        this._theme = getMuiTheme(themeCusto);
        console.log(this._theme)
        return this._theme;

    }

    /**
     * Todo : memoize ?
     * @param themeCusto
     * @param headerHeight
     * @param searchView
     * @param rightColumnClosed
     * @param displayMode
     * @return Object
     */
    buildFSTemplate(themeCusto, {headerHeight, searchView, rightColumnClosed=false, displayMode=''}) {

        const {mui3} = themeCusto.palette
        let infoPanelBg, appBarRounded, isMUI3, appBarBackColor, appBarTextColor, headerButtonsColor, iconButtonsColor
        let masterMargin = 8;
        if (this.userTheme === 'mui3') {
            isMUI3 = true
            masterMargin=8
            if (searchView) {
                // Replace with a padding
                appBarRounded = {
                    padding: masterMargin,
                }
            } else {
                appBarRounded = {
                    borderRadius: mui3['card-border-radius'],
                    margin: `${masterMargin}px ${masterMargin}px 0px ${masterMargin}px`,
                    border: '1px solid ' + mui3['outline-variant-50']
                }
            }
            appBarTextColor = Color(mui3['on-surface'])
            appBarBackColor = mui3['surface-2']
            iconButtonsColor = mui3['on-surface-variant']
        } else {
            infoPanelBg = mui3['surface-2']
            if(this.userTheme === 'material') {
                appBarBackColor = themeCusto.palette.primary1Color
                appBarTextColor = Color('white')
                headerButtonsColor = appBarTextColor.fade(0.03).toString()
            } else {
                appBarBackColor = mui3['surface-3']
                appBarTextColor = Color(mui3['on-surface'])
            }

        }

        const headerBase = 72
        const buttonsHeight = 24
        const buttonsFont = 13

        let listMarginRight = 0, listMarginTop = 0;
        if(this.userTheme === 'mui3' && (displayMode.indexOf('grid-')!==0 && displayMode !== 'masonry')){
            listMarginTop = masterMargin
        }
        const isGrid = !(displayMode==='list'||displayMode==='detail');
        if(rightColumnClosed) {
            if(!isGrid){
                listMarginRight = masterMargin
            }
        } else {
            if(isGrid){
                listMarginRight = -masterMargin
            }
        }

        let styles = {
            masterMargin,
            masterStyle:{
                display:'flex',
                backgroundColor: mui3.background,
                overflow:'hidden',
                color:isMUI3?undefined:'rgba(0,0,0,.87)'
            },
            appBarZDepth : (searchView||this.userTheme==='material')?1:0,
            appBarStyle : {
                zIndex: searchView?903:901,
                height: searchView?'auto':headerHeight,
                background: appBarBackColor,
                display:'flex',
                ...appBarRounded
            },
            listStyle: {
                flex: 1,
                marginRight:listMarginRight,
                marginTop:listMarginTop
            },
            buttonsStyle : {
                width: 40,
                height: 40,
                padding: 10,
                borderRadius: '50%',
                color: headerButtonsColor,
                transition: DOMUtils.getBeziersTransition()
            },
            buttonsIconStyle :{
                fontSize: 18,
                color:  headerButtonsColor || iconButtonsColor
            },
            activeButtonStyle: {
                backgroundColor: appBarTextColor.fade(0.9).toString()
            },
            activeButtonIconStyle: {
                color: headerButtonsColor || iconButtonsColor
            },
            raisedButtonStyle : {
                height: buttonsHeight,
                minWidth: 0
            },
            raisedButtonLabelStyle : {
                height: buttonsHeight,
                paddingLeft: 12,
                paddingRight: 8,
                lineHeight: buttonsHeight + 'px',
                fontSize: buttonsFont,
            },
            flatButtonStyle : {
                height: buttonsHeight,
                lineHeight: buttonsHeight + 'px',
                minWidth: 0
            },
            flatButtonLabelStyle : {
                height: buttonsHeight,
                fontSize: buttonsFont,
                paddingLeft: 12,
                paddingRight: 12,
                color: headerButtonsColor
            },
            infoPanel:{
                masterStyle : {
                    backgroundColor: infoPanelBg || 'transparent',
                    top: 0,
                    width: '100%'
                },
                card: {
                    zDepth: 0,
                    panel:{
                        background: isMUI3?mui3['surface-2']:"white",
                        boxShadow: isMUI3?'none':'rgb(0,0, 0, .15) 0px 0px 12px',
                        borderRadius: mui3['card-border-radius'] || 10,
                        margin: masterMargin,
                        overflow:'hidden',
                        border:'1px solid transparent'
                    },
                    panelOpen: {
                        border: isMUI3?'1px solid '+ Color(mui3['outline-variant-50']):undefined // or outline-variant-50 ? not sure
                    },
                    header:{
                        backgroundColor:'transparent',
                        position:'relative',
                        color:mui3['on-surface-variant'],
                        fontSize: 14,
                        fontWeight: 500,
                        padding: '12px 16px',
                        cursor:'pointer'
                    },
                    content:{
                        backgroundColor:'transparent',
                        paddingBottom: 0,
                        color:mui3['on-surface-variant']
                    },
                    headerIcon:{
                        position:'absolute',
                        top: -1,
                        right: 0,
                        color:'#ccc'
                    },
                    actions:{
                        padding: 2,
                        textAlign: 'right',
                        borderTop: '1px solid ' + mui3['outline-variant-50']
                    }
                },
                toolbar:{
                    container: {
                        backgroundColor:'transparent',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        position:'relative',
                        borderTop: mui3['outline-variant-50']
                    },
                    button: {
                        paddingRight: 8,
                        paddingLeft: 8
                    },
                    fabButton: {
                        backgroundColor: mui3['tertiary'],
                        color:mui3['on-tertiary']
                    },
                    flatButton:{
                        height: 34,
                        lineHeight: 32 + 'px',
                        minWidth: 0
                    }
                }
            },
            otherPanelsStyle: {
                backgroundColor: infoPanelBg || 'transparent',
                top: 0,
                borderLeft: 0,
                width: '100%'
            },
            breadcrumbStyle:{
                // todo:  change to theme var, adapt color for legacy theme
                color: appBarTextColor.toString()
            },
            searchForm:{
                mainStyle:{
                    backgroundColor:themeCusto.palette.mui3['surface-variant'],
                    border: isMUI3?0:'1px solid ' + appBarTextColor.fade(0.8).toString(),
                    borderRadius: 50
                },
                inputStyle:{color: themeCusto.palette.mui3['on-surface']},
                hintStyle:{color: themeCusto.palette.mui3['on-surface-variant']},
                magnifierStyle:{color: appBarTextColor.fade(0.1).toString()},
                filterButton:{color:appBarTextColor.toString(), margin: '2px 8px', height: 25, width: 25, padding:2, lineHeight:'22px', fontSize: 22}

            },
            paginatorStyle:{
                // For legacy, set 'color' to white here
            },
            leftPanel:{
                masterStyle:{
                    background: mui3['surface-3'],
                    color: mui3['on-surface-variant'],
                    borderRight: this.userTheme === 'mui3' ? undefined : '1px solid #e0e0e0'
                },
                workspacesList:{
                    // must be named style for WorkspacesList widget, will be applied to vertical scroller
                    style:searchView ? {
                        margin: 8,
                        marginRight:0,
                        width:220,
                        borderRadius: mui3['card-border-radius'],
                        border: '1px solid ' + mui3['outline-variant-50'],
                        background: mui3['surface-1'],
                        color: mui3['on-surface-variant'],
                    } : {},
                    workspaceEntryStyler:{
                        rootItemStyle:{
                            default: {},
                            context: {
                                color:mui3['on-secondary-container']
                            }
                        },
                        treeItemStyle:{
                            default: {},
                            context: {
                                color:mui3['on-secondary-container'],
                                fontWeight: 500,
                                backgroundColor:mui3['secondary-container']
                            },
                            selected: {
                                color:mui3['on-secondary-container'],
                                fontWeight: 500
                            }
                        }
                    }
                }
            },
            userWidgetStyle:{
                height: headerBase,
                display:'flex',
                alignItems:'center',
                color: themeCusto.palette.mui3['on-surface-variant'],
                boxShadow: 'none',
                backgroundColor: 'transparent',

            }
        };

        // Merge active styles
        styles.activeButtonStyle = {...styles.buttonsStyle, ...styles.activeButtonStyle};
        styles.activeButtonIconStyle = {...styles.buttonsIconStyle, ...styles.activeButtonIconStyle};

        if(this.userTheme === 'material') {
            // Invert uwidget
            styles.userWidgetStyle.backgroundColor = themeCusto.palette.primary1Color
            styles.userWidgetStyle.color = 'white'
            delete(styles.userWidgetStyle.boxShadow)

            const border = styles.leftPanel.masterStyle.borderRight
            delete(styles.leftPanel.masterStyle.borderRight)
            styles.leftPanel.workspacesList.style = {borderRight:border};
        }

        return styles;

    }

}