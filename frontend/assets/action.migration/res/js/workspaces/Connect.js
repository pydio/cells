import React from 'react'

class Connect extends React.Component {

    constructor(props) {
        super(props)
    }

    getLeftGridY(){
        const {dotsRadius, subheaderHeight, leftGridHeight, leftGridOffset} = this.props;
        return (leftGridHeight/2) + dotsRadius + subheaderHeight + leftGridOffset;
    }

    getRightGridY(){
        const {dotsRadius, subheaderHeight, rightGridHeight, rightGridOffset} = this.props;
        return (rightGridHeight/2) + dotsRadius + subheaderHeight + rightGridOffset;
    }

    /**
     *
     * @param ctx {CanvasRenderingContext2D}
     * @param offsetX int
     * @param offsetY int
     * @param gridHeight int
     * @param dotsNumber int
     */
    drawGrid(ctx, offsetX, offsetY, gridHeight, dotsNumber) {
        const {dotsRadius} = this.props;
        ctx.strokeStyle = 'rgba(204, 204, 204, 0.6)';
        ctx.beginPath();
        for (let i = 0; i < dotsNumber; i ++) {
            const centerX = offsetX;
            const centerY = offsetY + i * gridHeight;
            ctx.moveTo(centerX + dotsRadius, centerY);
            ctx.arc(centerX, centerY, dotsRadius, 0, Math.PI * 2, true);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
        }
        ctx.stroke();
    }

    /**
     *
     * @param ctx {CanvasRenderingContext2D}
     * @param leftDotIndex int
     * @param rightDotIndex int
     * @param color
     */
    linkDots(ctx, leftDotIndex, rightDotIndex, color = undefined) {
        const {leftGridX, rightGridX, dotsRadius, leftGridHeight, rightGridHeight} = this.props;
        const leftGridY = this.getLeftGridY();
        const rightGridY = this.getRightGridY();

        ctx.strokeStyle = color || '#9e9e9e';
        ctx.beginPath();
        const leftDotCenterX = leftGridX + dotsRadius;
        const leftDotCenterY = leftGridY + leftDotIndex * leftGridHeight;

        const rightDotCenterX = rightGridX - dotsRadius;
        const rightDotCenterY = rightGridY + rightDotIndex * rightGridHeight;
        ctx.moveTo(leftDotCenterX, leftDotCenterY);
        const cpointDiff = (rightDotCenterX - leftDotCenterX) * 3 / 5;
        ctx.bezierCurveTo(leftDotCenterX + cpointDiff, leftDotCenterY, rightDotCenterX - cpointDiff, rightDotCenterY, rightDotCenterX, rightDotCenterY);
        ctx.stroke();
    }

    componentDidMount() {
        this.buildCanvas(this.props)
    }

    componentWillReceiveProps(nextProps) {
        this.buildCanvas(nextProps)
    }

    buildCanvas(props) {
        const canvas = this.canvas;
        if (!canvas.getContext){
            return null;
        }

        const {leftGridX, rightGridX, leftGridHeight, rightGridHeight} = props;
        const leftGridY = this.getLeftGridY();
        const rightGridY = this.getRightGridY();

        const {leftNumber, rightNumber, links} = props;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#757575';

        this.drawGrid(ctx, leftGridX, leftGridY, leftGridHeight, leftNumber);
        this.drawGrid(ctx, rightGridX, rightGridY, rightGridHeight, rightNumber);

        for (let i=0; i < links.length; i++) {
            this.linkDots(ctx, links[i].left, links[i].right, links[i].color);
        }
    }

    render(){
        const {dotsRadius, rightGridX, leftGridHeight, rightGridHeight, subheaderHeight, leftGridOffset, rightGridOffset} = this.props;
        const {leftNumber, rightNumber, style} = this.props;

        const width = rightGridX + dotsRadius + 2;
        const height = Math.max((leftNumber * leftGridHeight + leftGridOffset), (rightNumber * rightGridHeight + rightGridOffset)) + subheaderHeight;

        return <canvas style={{...style, background: "transparent", width, height}} ref={(canvas) => this.canvas = canvas} height={height} width={width}/>
    }
}

Connect.defaultProps = {
    dotsRadius: 4,
    subheaderHeight: 40,
    leftGridX: 10,
    leftGridHeight: 72,
    leftGridOffset: 0,
    rightGridX: 140,
    rightGridHeight: 72,
    rightGridOffset: 0,
};

export {Connect as default}
