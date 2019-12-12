import {BIND_PAPER_TO_DOM, EMPTY_MODEL_ACTION, RESIZE_PAPER, TOGGLE_EDITOR_MODE} from "../actions/editor";
import {dia, linkTools} from 'jointjs'
import Link from "../graph/Link";

/**
 * @param paper {dia.Paper}
 * @param action
 * @return {*}
 */
export default function paperReducer(paper = null, action) {
    switch (action.type) {
        case BIND_PAPER_TO_DOM:
            paper = new dia.Paper({
                el: action.element,
                model: action.graph,
                width: 10,
                height: 10,
                linkPinning: false,
                interactive: false,
                validateConnection: (cellViewS, magnetS, cellViewT, magnetT, end, linkView) => {
                    console.log(cellViewS, magnetS.attr, cellViewT, magnetT, end);
                    if(cellViewS === cellViewT) {
                        return false;
                    }
                    return true;
                },
                validateMagnet(cellView, magnet) {
                    if(magnet === false || magnet === 'passive') {
                        return false;
                    }
                    return true;
                }
            });
            Object.keys(action.events).filter(e => e !== 'link:remove').forEach(eventName => {
                paper.on(eventName, action.events[eventName]);
            });
            if(action.events['link:remove']){
                // this is a link tool - bind to existing ones
                action.graph.getCells().filter(c => c instanceof Link).forEach(link => {
                    const linkView = link.findView(paper);
                    linkView.addTools(new dia.ToolsView({tools:[action.events['link:remove']()]}));
                    linkView.hideTools();
                });
            }
            break;
        case RESIZE_PAPER:
            if (paper === null) {
                return paper;
            }
            paper.setDimensions(action.width, action.height);
            break;
        case EMPTY_MODEL_ACTION:
            const {model} = action;
            const bbox = paper.viewport.getBBox();
            model.position({x: bbox.width, y: bbox.height / 2});
            paper.setDimensions(bbox.width + 300, bbox.height + 40);
            break;
        case TOGGLE_EDITOR_MODE:
            const {edit} = action;
            if(edit){
                paper.setInteractivity({
                    addLinkFromMagnet: edit,
                    elementMove: edit
                });
            } else {
                paper.setInteractivity(false);
            }
            if(edit){
                paper.setGridSize(16);
                paper.drawGrid();
                paper.showTools();
            } else {
                paper.clearGrid();
                paper.hideTools();
            }
            break;
        default:
            break;
    }
    return paper;
}