import {createReactInlineContentSpec, SuggestionMenuController} from "@blocknote/react";
import PydioApi from 'pydio/http/api';

export const Mention = createReactInlineContentSpec(
    {
        type: "mention",
        propSchema: {
            user: {
                default: "Unknown",
            },
        },
        content: "none",
    },
    {
        render: (props) => (
            <span style={{ backgroundColor: "#8400ff33",padding: '2px 5px', fontSize:15, borderRadius: 5 }}>@{props.inlineContent.props.user}</span>
        ),
    }
);

export const getMentionMenuItems = (editor, query) => {
    const api = PydioApi.getRestClient().getIdmApi();
    return api.listUsers("/", query, true, 0, 10).then(res => {
        const {Users = []} = res;
        return Users.map(user => {
            const label = (user.Attributes && user.Attributes['displayName']) ? user.Attributes['displayName'] : user.Login;
            return {
                title:label,
                onItemClick: () => {
                    editor.insertInlineContent([
                        { type: "mention", props: { user: label } },
                        " ", // add a space after the mention
                    ]);
                }
            }
        })
    })
}

export const MentionSuggestionMenu = ({editor}) => <SuggestionMenuController
    triggerCharacter={"@"}
    getItems={(query) => getMentionMenuItems(editor, query)}
/>
