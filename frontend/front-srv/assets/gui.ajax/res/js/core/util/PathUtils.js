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
import Pydio from '../Pydio'
/**
 * Utilitary class for manipulating file/folders pathes
 */
export default class PathUtils{

    static getBasename(fileName)
    {
        if(fileName == null) {
            return null;
        }
        let separator = "/";
        if(fileName.indexOf("\\") !== -1) {
            separator = "\\";
        }
        return fileName.substr(fileName.lastIndexOf(separator)+1, fileName.length);
    }

    static getDirname(fileName)
    {
        return fileName.substr(0, fileName.lastIndexOf("/"));
    }

    static getAjxpMimeType(item){
        if(!item) {
            return "";
        }
        if(item instanceof Map){
            return (item.get('ajxp_mime') || PathUtils.getFileExtension(item.get('filename')));
        }else if(item.getMetadata){
            return (item.getMetadata().get('ajxp_mime') || PathUtils.getFileExtension(item.getPath()));
        }else{
            return (item.getAttribute('ajxp_mime') || PathUtils.getFileExtension(item.getAttribute('filename')));
        }
    }

    static getFileExtension(fileName)
    {
        if(!fileName || fileName === "") {
            return "";
        }
        const split = PathUtils.getBasename(fileName).split('.');
        if(split.length > 1) {
            return split[split.length-1].toLowerCase();
        }
        return '';
    }

    static roundFileSize(filesize){
        const messages = Pydio.getMessages();
        const sizeUnit = messages["byte_unit_symbol"] || "B";
        let size = filesize;
        if (filesize >= 1073741824) {size = Math.round(filesize / 1073741824 * 100) / 100 + " G"+sizeUnit;}
        else if (filesize >= 1048576) {size = Math.round(filesize / 1048576 * 100) / 100 + " M"+sizeUnit;}
        else if (filesize >= 1024) {size = Math.round(filesize / 1024 * 100) / 100 + " K"+sizeUnit;}
        else {size = filesize + " "+sizeUnit;}
        return size;
    }

    /**
     *
     * @param dateObject Date
     * @param format String
     * @returns {*}
     */
    static formatModifDate(dateObject, format){
        let f = format;
        if(!format && pydio && pydio.MessageHash) {
            f = Pydio.getMessages()["date_format"];
        }
        if(!f) {
            return 'no format';
        }
        f = f.replace("d", (dateObject.getDate()<10?'0'+dateObject.getDate():dateObject.getDate()));
        f = f.replace("D", dateObject.getDay());
        f = f.replace("Y", dateObject.getFullYear());
        f = f.replace("y", dateObject.getYear());
        const month = dateObject.getMonth() + 1;
        f = f.replace("m", (month<10?'0'+month:month));
        f = f.replace("H", (dateObject.getHours()<10?'0':'')+dateObject.getHours());
        // Support 12 hour f compatibility
        f = f.replace("h", (dateObject.getHours() % 12 || 12));
        f = f.replace("p", (dateObject.getHours() < 12 ? "am" : "pm"));
        f = f.replace("P", (dateObject.getHours() < 12 ? "AM" : "PM"));
        f = f.replace("i", (dateObject.getMinutes()<10?'0':'')+dateObject.getMinutes());
        f = f.replace("s", (dateObject.getSeconds()<10?'0':'')+dateObject.getSeconds());
        return f;
    }

}