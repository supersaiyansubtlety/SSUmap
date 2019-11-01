// Constants for use throughout the program.
const c = {
    mapWidth: 1000,
    mapHeight: 800,
    minZoomScale: 1,
    maxZoomScale: 6,
};

function loadSVG()
{
    // Resize body.
    // Call D3's zoom function which also handles translating.
    // Not sure if this will conflict with clicks.
    var svg = d3.select('body')
	.append("svg")
	.attr('width', c.mapWidth)
	.attr('height', c.mapHeight)
	.call(d3.zoom()
	      .scaleExtent([c.minZoomScale, c.maxZoomScale])
	      .on('zoom', function () {
		  svg.attr('transform', d3.event.transform)
		  /*
		  var coord = zoom.translate(),
		      xcoord = coord[0],
		      ycoord = coord[1];
		  */
	      }))
	.append("g")
    
    d3.xml('19-050_campus_map_revise_v6.svg')
        .then(data => {
            d3.select('svg g').node().append(data.documentElement)
        })    
}
