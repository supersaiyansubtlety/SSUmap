// Constants for use throughout the program.
const c = {
    mapWidth: 1000,
    mapHeight: 800,
    minZoomScale: 1,
    maxZoomScale: 6,
};

var zoom;

function loadSVG()
{
    // Resize body.
    // Call D3's zoom function which also handles translating.
    // Not sure if this will conflict with clicks.
    var svg = d3.select('body')
	.append("svg")
	.attr('width', c.mapWidth)
	.attr('height', c.mapHeight)
	.call(zoom = d3.zoom()
	      .scaleExtent([c.minZoomScale, c.maxZoomScale])
              .translateExtent([[0,0],[c.mapWidth,c.mapHeight]])
	      .on('zoom', function () {
		  svg.attr('transform', d3.event.transform)
	      }))
	.append("g")

    d3.xml('19-050_campus_map_revise_v6.svg', function(data) { console.log(data) })
        .then(data => {
            d3.select('svg g').node().append(data.documentElement)
            main()
        })

}

function main()
{
    makeClickables();
}

function makeNest(jsonObject)
{
    const nestedFalcultyCategories = d3.nest()
	  .key(d => d['Building'])
	  .key(d => d['Department'])
	  .key(d => d['L_Name'])
	  .entries(jsonObject);
    
    console.log("nested categories" , nestedFalcultyCategories);
}

function BackButtonLMB(d)
{
    console.log("BackButtonLMB entered: ", d);
}

function BuildingHandlerLMB(building, x, y)
{
    // Delete any pre-existing back buttons
    d3.select('.back-button').remove();
    // Only scale if current scale is maxed out.
    var newX = -x * c.maxZoomScale;
    var newY = -y * c.maxZoomScale;
    console.log("BuildingHandler entered: ", building, newX, newY);
    // Zoom into the building that was clicked, either by manually setting the translate or
    // making a call using D3's zoom function.

    building.call(zoom.transform, `translate(${newX}, ${newY}) scale(${c.maxZoomScale})`);
    
    d3.select('svg g')
    //.attr('transform', `translate(${newX}, ${newY}) scale(${c.maxZoomScale})`)
    	.append('text')
	.text('<- Back')
	.attr('font-weight', 100)    
	.attr('stroke', '#ffdc00')
	.attr('font-size', '50px')
	.attr('dy', '0.25em')
	.attr('text-anchor', 'middle')
	.attr('transform', `translate(${newX}, ${newY})`)
	.attr('class', 'back-button')
	.on('click', function(d) {
	    BackButtonLMB(d);
	});    
}

function makeClickables()
{
    var sel = d3.selectAll('#Buidlings')
    sel.on('click', function(d) {
	var x = d3.mouse(this)[0];
	var y = d3.mouse(this)[1];
	BuildingHandlerLMB(d3.select(this), x, y);
    });    
}
