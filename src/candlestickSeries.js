import { candlestick } from 'd3fc-shape';
import fc from 'd3fc';
import * as d3 from 'd3';

/**
 * Function to create candlestick series creator
 * @return {Function} - Series render function
 */
export default function() {
  let xScale = d3.scaleTime();
  let yScale = d3.scaleLinear();
  
  // Generator candlestick.
  const generator = candlestick()
    .x((d, i) => xScale(d.u))
    .open((d) => yScale(d.o))
    .high((d) => yScale(d.h))
    .low((d) => yScale(d.l))
    .close((d) => yScale(d.c));

  /**
   * Use the generator with the given data to draw to the canvas
   */
  const drawCanvas = (upData, downData, generator, canvas) => {
    const ctx = canvas.getContext('2d');
    generator.context(ctx);

    // Clear canvas
    canvas.width = canvas.width;

    //Draw upData.
    ctx.beginPath();
    generator(upData);
    ctx.strokeStyle = '#52CA52';
    ctx.stroke();
    ctx.closePath();
	ctx.fillStyle = "#52CA52";
	ctx.fill();

	//Draw downData.
    ctx.beginPath();
    generator(downData);
    ctx.strokeStyle = '#E6443B';
    ctx.stroke();
    ctx.closePath();
	ctx.fillStyle = "#E6443B";
	ctx.fill();
  }

  /**
   * Render the candlestick chart on the given elements via a D3 selection
   */
  var candlestickSeries = (selection) => {
    selection.each(function(data) {
      const element = this;
      const upData = data.filter(d => d.o <= d.c);
      const downData = data.filter(d => d.o > d.c);
	  
      drawCanvas(upData, downData, generator, element);
    });
  };

  candlestickSeries.xScale = (...args) => {
    if (!args.length) {
        return xScale;
    }
    xScale = args[0];
    return candlestickSeries;
  };
  
  candlestickSeries.yScale = (...args) => {
    if (!args.length) {
        return yScale;
    }
    yScale = args[0];
    return candlestickSeries;
  };

  return candlestickSeries;
};
