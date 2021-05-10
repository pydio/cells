/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Color from 'color'
const colorsCache = {};

export default function colorsFromString(s){
    if (s.length === 0) {
        return {};
    }
    if(colorsCache[s]){
        return colorsCache[s];
    }
    let hash = 0, i, chr, len;
    for (i = 0, len = s.length; i < len; i++) {
        chr   = s.charCodeAt(i) * 1000;
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    const hex = "00000".substring(0, 6 - c.length) + c;
    let color = new Color('#' + hex).hsl();
    const hue = color.hue();
    const bg = new Color({h: hue, s: color.saturationl(), l: 90});
    const fg = new Color({h: hue, s: color.saturationl(), l: 40});
    const result = {color: fg.string(), backgroundColor:bg.string()};
    colorsCache[s] = result;
    return result;
}
