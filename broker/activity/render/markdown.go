/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package render

import (
	"fmt"
	"html"
	"net/url"
	"path"
	"strings"

	"github.com/pydio/cells/v4/broker/activity/lang"
	"github.com/pydio/cells/v4/common/proto/activity"
)

type ServerUrlType string

const (
	ServerUrlTypeDocs       ServerUrlType = "DOCUMENTS"
	ServerUrlTypeUsers      ServerUrlType = "USERS"
	ServerUrlTypeWorkspaces ServerUrlType = "WORKSPACES"
)

type ServerLinks struct {
	URLS     map[ServerUrlType]*url.URL
	UrlFuncs map[ServerUrlType]func(object *activity.Object) string
}

func NewServerLinks() *ServerLinks {
	s := &ServerLinks{}
	s.URLS = make(map[ServerUrlType]*url.URL)
	s.UrlFuncs = make(map[ServerUrlType]func(object *activity.Object) string)
	return s
}

func (s *ServerLinks) objectURL(urlType ServerUrlType, object *activity.Object) string {
	if fu, o := s.UrlFuncs[urlType]; o {
		return fu(object)
	} else if sUrl, ok := s.URLS[urlType]; ok {
		objectId := url.PathEscape(object.Id)
		if sUrl.Host == "" {
			return sUrl.Scheme + "://" + strings.TrimLeft(objectId, "/")
		} else {
			return sUrl.String() + strings.TrimLeft(objectId, "/")
		}
	} else {
		return ""
	}
}

func makeMarkdownLink(url string, label string) string {
	return fmt.Sprintf("[%s](%s)", label, url)
}

func Markdown(object *activity.Object, pointOfView activity.SummaryPointOfView, language string, links ...*ServerLinks) string {

	T := lang.T(language)

	sLinks := new(ServerLinks)
	if len(links) > 0 {
		sLinks = links[0]
	}

	templateData := map[string]interface{}{}
	if object.Actor != nil {
		templateData["Actor"] = Markdown(object.Actor, pointOfView, language, links...)
	}
	if object.Object != nil {
		templateData["Object"] = Markdown(object.Object, pointOfView, language, links...)
	}

	switch object.Type {
	case activity.ObjectType_Digest:

		output := "" //T("DigestTitle") Do not add sentence, already in mail template
		for _, item := range object.Items {
			output += Markdown(item, pointOfView, language, links...)
		}
		return output

	case activity.ObjectType_Workspace, activity.ObjectType_Cell:

		var workspaceString string
		var wsIdentifier string
		if link := sLinks.objectURL(ServerUrlTypeWorkspaces, object); link != "" {
			wsIdentifier = makeMarkdownLink(link, object.Name)
		} else {
			wsIdentifier = object.Name
		}
		wsLang := T("Workspace")
		if object.Type == activity.ObjectType_Cell {
			wsLang = T("Cell")
		}
		if len(object.Items) > 0 {
			workspaceString = "\n\n## " + wsLang + " " + html.EscapeString(wsIdentifier)
			for _, item := range object.Items {
				workspaceString += "\n - " + Markdown(item, pointOfView, language, links...)
			}
		} else {
			workspaceString = strings.ToLower(wsLang) + " " + html.EscapeString(wsIdentifier)
		}
		return workspaceString

	case activity.ObjectType_Create:

		if pointOfView == activity.SummaryPointOfView_ACTOR {
			return T("CreatedObject", templateData)
		} else if pointOfView == activity.SummaryPointOfView_SUBJECT {
			return T("CreatedBy", templateData)
		} else {
			return T("CreatedObjectBy", templateData)
		}

	case activity.ObjectType_Move:

		if pointOfView == activity.SummaryPointOfView_ACTOR {
			return T("MovedObject", templateData)
		} else if pointOfView == activity.SummaryPointOfView_SUBJECT {
			return T("MovedBy", templateData)
		} else {
			return T("MovedObjectBy", templateData)
		}

	case activity.ObjectType_Delete:

		if pointOfView == activity.SummaryPointOfView_ACTOR {
			return T("DeletedObject", templateData)
		} else if pointOfView == activity.SummaryPointOfView_SUBJECT {
			return T("DeletedBy", templateData)
		} else {
			return T("DeletedObjectBy", templateData)
		}

	case activity.ObjectType_Update:

		if pointOfView == activity.SummaryPointOfView_ACTOR {
			return T("ModifiedObject", templateData)
		} else if pointOfView == activity.SummaryPointOfView_SUBJECT {
			return T("ModifiedBy", templateData)
		} else {
			return T("ModifiedObjectBy", templateData)
		}

	case activity.ObjectType_UpdateMeta:

		if pointOfView == activity.SummaryPointOfView_ACTOR {
			return T("MetaModifiedObject", templateData)
		} else if pointOfView == activity.SummaryPointOfView_SUBJECT {
			return T("MetaModifiedBy", templateData)
		} else {
			return T("MetaModifiedObjectBy", templateData)
		}

	case activity.ObjectType_UpdateComment:

		if pointOfView == activity.SummaryPointOfView_ACTOR {
			return T("CommentedObject", templateData)
		} else if pointOfView == activity.SummaryPointOfView_SUBJECT {
			return T("CommentedBy", templateData)
		} else {
			return T("CommentedObjectBy", templateData)
		}

	case activity.ObjectType_Read:

		if pointOfView == activity.SummaryPointOfView_ACTOR {
			return T("AccessedObject", templateData)
		} else if pointOfView == activity.SummaryPointOfView_SUBJECT {
			return T("AccessedBy", templateData)
		} else {
			return T("AccessedObjectBy", templateData)
		}

	case activity.ObjectType_Share:
		if pointOfView == activity.SummaryPointOfView_ACTOR {
			return T("SharedWs", templateData)
		} else if pointOfView == activity.SummaryPointOfView_SUBJECT {
			return T("SharedWs", templateData)
		} else {
			return T("SharedWsWithYou", templateData)
		}

	case activity.ObjectType_Folder:

		var docIdentifier string
		sBase := html.EscapeString(path.Base(object.Name))
		if link := sLinks.objectURL(ServerUrlTypeDocs, object); link != "" {
			docIdentifier = makeMarkdownLink(link, sBase)
		} else {
			docIdentifier = sBase
		}
		prefix := T("Folder") + " "
		if pointOfView == activity.SummaryPointOfView_ACTOR {
			prefix = strings.ToLower(prefix)
		}
		return prefix + docIdentifier

	case activity.ObjectType_Document:

		var docIdentifier string
		sBase := html.EscapeString(path.Base(object.Name))
		if link := sLinks.objectURL(ServerUrlTypeDocs, object); link != "" {
			docIdentifier = makeMarkdownLink(link, sBase)
		} else {
			docIdentifier = sBase
		}
		prefix := T("Document") + " "
		if pointOfView == activity.SummaryPointOfView_ACTOR {
			prefix = strings.ToLower(prefix)
		}
		return prefix + docIdentifier

	case activity.ObjectType_Person:

		var userIdentifier string
		uName := html.EscapeString(object.Name)
		if link := sLinks.objectURL(ServerUrlTypeUsers, object); link != "" {
			userIdentifier = makeMarkdownLink(link, uName)
		} else {
			userIdentifier = path.Base(uName)
		}
		return userIdentifier

	case activity.ObjectType_Event:

		if md := object.GetMarkdown(); md != "" {
			if actor, ok := templateData["Actor"]; ok && strings.Contains(md, "[Actor]") {
				md = strings.ReplaceAll(md, "[Actor]", actor.(string))
			}
			if ob, ok := templateData["Object"]; ok && strings.Contains(md, "[Object]") {
				md = strings.ReplaceAll(md, "[Object]", ob.(string))
			}
			return md
		} else if sum := object.GetSummary(); sum != "" {
			return sum
		} else {
			return object.GetName()
		}

	default:

		return ""
	}

}
