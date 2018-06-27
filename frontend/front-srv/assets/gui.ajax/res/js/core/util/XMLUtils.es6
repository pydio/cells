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
import wgxpath from 'wicked-good-xpath'
wgxpath.install();
/**
 * Utilitary class for manipulating XML
 */
export default class XMLUtils{

    /**
     * Selects the first XmlNode that matches the XPath expression.
     *
     * @param element {Element | Document} root element for the search
     * @param query {String} XPath query
     * @return {Element} first matching element
     * @signature function(element, query)
     */
    static XPathSelectSingleNode(element, query){
        try{
            if(element['selectSingleNode']  && typeof element.selectSingleNode === "function"){
                var res = element.selectSingleNode(query);
                if(res) return res;
            }
        }catch(e){}

        if(!XMLUtils.__xpe && window.XPathEvaluator) {
            try{
                XMLUtils.__xpe = new XPathEvaluator();
            }catch(e){}
        }

        if(!XMLUtils.__xpe){
            query = document.createExpression(query, null);
            var result = query.evaluate(element, 7, null);
            return (result.snapshotLength?result.snapshotItem(0):null);
        }

        var xpe = XMLUtils.__xpe;

        try {
            return xpe.evaluate(query, element, xpe.createNSResolver(element), XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        } catch(err) {
            throw new Error("selectSingleNode: query: " + query + ", element: " + element + ", error: " + err);
        }
    }


    /**
     * Selects a list of nodes matching the XPath expression.
     *
     * @param element {Element | Document} root element for the search
     * @param query {String} XPath query
     * @return {Element[]} List of matching elements
     * @signature function(element, query)
     */
    static XPathSelectNodes(element, query){
        try{
            if(typeof element.selectNodes === "function"){
                try{
                    if(element.ownerDocument && element.ownerDocument.setProperty){
                        element.ownerDocument.setProperty("SelectionLanguage", "XPath");
                    }else if(element.setProperty){
                        element.setProperty("SelectionLanguage", "XPath");
                    }
                }catch(e){}
                var res = Array.from(element.selectNodes(query));
                if(res) return res;
            }
        }catch(e){}

        var xpe = XMLUtils.__xpe;

        if(!xpe && window.XPathEvaluator) {
            try {
                XMLUtils.__xpe = xpe = new XPathEvaluator();
            }catch(e){}
        }
        var result, nodes = [], i;
        if(!XMLUtils.__xpe){
            query = document.createExpression(query, null);
            result = query.evaluate(element, 7, null);
            nodes = [];
            for (i=0; i<result.snapshotLength; i++) {
                if(Element.extend){
                    nodes[i] = Element.extend(result.snapshotItem(i));
                }else{
                    nodes[i] = result.snapshotItem(i);
                }
            }
            return nodes;
        }

        try {
            result = xpe.evaluate(query, element, xpe.createNSResolver(element), XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        } catch(err) {
            throw new Error("selectNodes: query: " + query + ", element: " + element + ", error: " + err);
        }

        for (i=0; i<result.snapshotLength; i++) {
            nodes[i] = result.snapshotItem(i);
        }

        return nodes;
    }


    /**
     * Selects the first XmlNode that matches the XPath expression and returns the text content of the element
     *
     * @param element {Element|Document} root element for the search
     * @param query {String}  XPath query
     * @return {String} the joined text content of the found element or null if not appropriate.
     * @signature function(element, query)
     */
    static XPathGetSingleNodeText(element, query){
        var node = XMLUtils.XPathSelectSingleNode(element, query);
        return XMLUtils.getDomNodeText(node);
    }

    static getDomNodeText(node, includeCData=false){
        if(!node || !node.nodeType) {
            return null;
        }

        switch(node.nodeType)
        {
            case 1: // NODE_ELEMENT
                var i, a=[], nodes = node.childNodes, length = nodes.length;
                for (i=0; i<length; i++) {
                    a[i] = XMLUtils.getDomNodeText(nodes[i], includeCData);
                }

                return a.join("");

            case 2: // NODE_ATTRIBUTE
                return node.value;

            case 3: // NODE_TEXT
                return node.nodeValue;

            case 4: // CDATA
                if(includeCData) return node.nodeValue;
                break;
        }

        return null;
    }

    /**
     * @param xmlStr
     * @returns {*}
     */
    static parseXml(xmlStr){

        if(typeof window.DOMParser != "undefined"){
            return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
        }
        if(typeof window.ActiveXObject != "undefined" &&
            new window.ActiveXObject("MSXML2.DOMDocument.6.0")){
            var xmlDoc = new window.ActiveXObject("MSXML2.DOMDocument.6.0");
            xmlDoc.validateOnParse = false;
            xmlDoc.async = false;
            xmlDoc.loadXML(xmlStr);
            xmlDoc.setProperty('SelectionLanguage', 'XPath');
            return xmlDoc;
        }
        throw new Error('Cannot parse XML string');

    }

}
