import fc from 'd3fc';
import * as d3 from 'd3';
import { scaleLinear, scaleTime} from 'd3-scale';

import candlestickSeries from './candlestickSeries';
import '../sass/app.scss';

(function(){
	
  preProcessData(data);
  
  const xScale = d3.scaleTime();
  const yScale = d3.scaleLinear();
  const series = candlestickSeries();
  
  const xScaleArrary = fc.util.extent().fields(['u'])(data); 	//Get an array[{start_time}, {end_time}].
  const yScaleArrary = fc.util.extent().fields(['h', 'l']).pad(0.2)(data); 		//Get an array[{min_value}, {max_value}].
 
  const MIN_INTERVAL = 60*1000;  //In milliseconds.
  const COLUMN_NUMBER_WHEN_MAX_ZOOM = 20;
  const TOTAL_COLUMN_NUMBER = (xScaleArrary[1]-xScaleArrary[0])/MIN_INTERVAL;
  const xTimes = TOTAL_COLUMN_NUMBER/COLUMN_NUMBER_WHEN_MAX_ZOOM; //Max times that can be zoomed.
  
  const canvasElement = document.getElementById('canvas');
  const width = canvasElement.clientWidth;
  const height = canvasElement.clientHeight;
  
  givePaddingToYDirection(yScaleArrary); 	//Give padding to the max and min value.

  renderChart();

  /**
   * Main render function of the page.
   */
  function renderChart() {
    const svg = d3.select("body")
		.append("svg")
		.attr("width", width+100)
		.attr("height", height+20);

		  
	canvasElement.width = width;
	canvasElement.height = height;
		
    xScale
        .range([0, width])
        .domain(xScaleArrary);
		
    yScale
        .range([height, 0])
        .domain(yScaleArrary);

    const xAxis = d3.axisBottom(xScale);

    const yAxis = d3.axisLeft(yScale);

    const gX = svg.append("g")
		.attr("id","x-axis")
        .attr("transform", "translate(100,"+height+")")
        .call(xAxis);

    const gY = svg.append("g")
        .attr("transform", "translate(80,0)")
        .call(yAxis);
	
    const canvasZoom = d3.zoom()
        .scaleExtent([1,xTimes])
		.translateExtent([[-1, 0], [width+1, height]])
        .on('zoom', handleZoom);

    d3.select(canvasElement).call(canvasZoom);

    series
      .xScale(xScale)
      .yScale(yScale);

    d3.select("#canvas")
      .datum(data)
      .call(series);
	  
	canvasZoom.scaleTo(d3.select(canvasElement), xTimes);
	canvasZoom.translateTo(d3.select(canvasElement), width, height);
	refreshYDomain();

	/**
	 * Zoom event handler.
	 */
	function handleZoom() {
	  //Rescale x,y axis and candlestick chart.
	  d3.select("svg").attr("transform", d3.event.transform);
      gX.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
      refreshYDomain();
      refreshCandlesticks(d3.event.transform.rescaleX(xScale), yScale);
    }
	
	/**
	 * Refresh candlestick chart with new xScale and yScale.
	 */
	function refreshCandlesticks(xScale, yScale){
	  series
		.xScale(xScale)
        .yScale(yScale);
      d3.select("#canvas")
		.call(series);
	}
	
	/**
	 * Refresh the y axis domain by calculate the current min and max value.
	 */
	function refreshYDomain(){
	  //Find out current time range after zoom.
	  let startDate;
	  let endDate;
	  d3.select("#x-axis").selectAll(".tick").each(function(d) {
		  if(!startDate || d<startDate) {
			  startDate=d;
		  }
		  
		  if(!endDate || d>endDate) {
			  endDate=d;
		  }
	  });
	  
	  //Get the new value range to rescale y axis.
	  let yTop;
	  let yBottom;
	  data.forEach(function(d){
		  if(d.u >= startDate && d.u <=endDate) {
			  if(!yTop || d.h>yTop) {
				  yTop=d.h;
			  }
			  if(!yBottom || d.l<yBottom) {
				  yBottom=d.l;
			  }
		  }
	  });
	  
	  const newDomain = [yBottom, yTop]; 
	  givePaddingToYDirection(newDomain); //Give padding to the max and min value.
	  
	  //Refresh yScale domain with the current value range.
	  yScale.domain(newDomain);
	  
	  gY.call(yAxis.scale(yScale));
	}
  }

  /**
    * Pre-process data, format date type properties.
    */
  function preProcessData(data){
	data.forEach(function(d) {
      d.u = new Date(d.u*1000);
	});
  }
  
  /**
    * Give some value space at the top and bottom of the canvas.
    */
  function givePaddingToYDirection(yScaleArrary){
	  const domainPadding = 0.1*(yScaleArrary[1]-yScaleArrary[0]);
	  yScaleArrary[0] = yScaleArrary[0] - domainPadding;
	  yScaleArrary[1] = yScaleArrary[1] + domainPadding;
  }
})();
	

