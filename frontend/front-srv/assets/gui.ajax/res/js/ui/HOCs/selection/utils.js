export const mapStateToProps = (state, props) => {
    const {editor, tabs} = state

    const tab = tabs.reduce((current, tab) => tab.id === editor.activeTabId ? tab : current, {})

    return {
        ...props,
        tab
    }
}
