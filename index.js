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
    // Only scale if current scale is maxed out.
    //var newX = -x * c.maxZoomScale;
    //var newY = -y * c.maxZoomScale;
    //console.log("Old X = ", x, " and old Y = ", y);

    //console.log("BuildingHandler entered: ", building, newX, newY);
    // Zoom into the building that was clicked, either by manually setting the translate or
    // making a call using D3's zoom function.

    var bounds = d3.select(building).select('rect');
    console.log("Bounds: ", bounds.node());
    newX = bounds.node().x.animVal.value * -1;
    newY = bounds.node().y.animVal.value * -1;
    console.log("New X = ", newX, " and new Y = ", newY);
    console.log("building:", building);
    console.log("boundParent: ", d3.select(bounds.node().parentNode));
    d3.select(building).call(zoom.transform, `translate(${newX}, ${newY}) scale(${c.maxZoomScale})`);
}

function makeClickables()
{
    var sel = d3.selectAll('#Buidlings g')
    sel.on('click', function(d) {
	var x = d3.mouse(this)[0];
	var y = d3.mouse(this)[1];
	BuildingHandlerLMB(this, x, y);
    });

    // DEBUG Clickable
    // Only used to manually determine coordinates
    /*
    var coordSel = d3.select('body svg');
    coordSel.on('click', function(d) {
	var a = d3.mouse(this)[0];
	var b = d3.mouse(this)[1];
	console.log("Body-SVG Coords: (", a, ",", b, ")");
    });
    */
}
