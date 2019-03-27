/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
 * The latest code can be found at <https://pydio.com/>.
 *
 */
/**
 * Utilitary class for language specific methods
 */
export default class DOMUtils {

    static getBeziersTransition(){
        return 'all 550ms cubic-bezier(0.23, 1, 0.32, 1) 0ms';
    }

    static getBoxShadowDepth(depth = 1){
        return '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)';
    }

    static getUrlFromBase(){
        return document.getElementsByTagName('base').length ? document.getElementsByTagName('base')[0].href : '';
    }

    static getViewportWidth(){
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    }

    static getViewportHeight(){
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }

    static imageLoader(imageUrl, onLoad, onError){
        let loader = document.createElement('img');
        loader.onload = onLoad.bind(loader);
        loader.onerror = onError.bind(loader);
        loader.src = imageUrl;
    }

    static observeWindowResize(callback){
        if(window.addEventListener){
            window.addEventListener('resize', callback);
        }else{
            window.attachEvent('onresize', callback);
        }
    }

    static stopObservingWindowResize(callback){
        if(window.removeEventListener){
            window.removeEventListener('resize', callback);
        }else{
            window.detachEvent('onresize', callback);
        }
    }

    static selectBaseFileName(htmlInput){
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
}
