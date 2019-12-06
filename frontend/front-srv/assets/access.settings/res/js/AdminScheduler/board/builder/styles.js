import {Blue, Orange} from "../graph/Configs";

const styles =  {
    paper: {
        position: 'absolute',
        zIndex:2,
        border:'2px solid #ffcc8f',// + Orange,
        borderRadius: 5,
    },
    header : {
        padding: 10,
        fontSize: 15,
        fontWeight: 500,
        display:'flex',
        alignItems: 'center',
    },
    body: {
        padding: 10
    },
    close: {
        color: '#9e9e9e',
        cursor: 'pointer'
    }
};

function position(width, sourceSize, sourcePosition, scrollLeft) {

    let top, left;
    left = sourcePosition.x + (sourceSize.width - width) / 2 - scrollLeft;
    top = sourcePosition.y + sourceSize.height + 10;
    return {top, left, width};

}

export {styles, position}