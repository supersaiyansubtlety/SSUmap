// Constants for use throughout the program.
const c = {
    mapWidth: 1000,
    mapHeight: 800,
    minZoomScale: 1,
    maxZoomScale: 6,
    svgVBWidth: 3300,
    svgVBHeight: 2550,
    zDuration: 1000,
    zEase: d3.easeCubicOut
};

var zoom;
var nestedSSUData;
var mapSVG;
var mouseX;
var mouseY;

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
    d3.xml('19-050_campus_map_revise_v6.svg', function(data) { console.log(data); })
        .then(data => {
            svg.node().append(data.documentElement);
	    mapSVG = svg.select('svg')
	    //.attr('viewBox', `0 0 6600 5100`)
		.attr('preserveAspectRatio', "")
	    //.attr('width', 1000)
	    //.attr('height', 800);
		.attr('style', "")
		.attr('xml:space', "default")	    
            main();
        });
}

function Save()
{
    var body = d3.select('body')
	.attr('width', c.mapWidth)
	.attr('height', c.mapHeight);
    d3.xml('19-050_campus_map_revise_v6.svg', function(data)
	   {
	       console.log(data)
	   })
        .then(data => {
	    body.node().append(data.documentElement);
	    var svg = body.selectAll('svg')
	    //.attr('width', c.mapWidth)
	    //.attr('height', c.mapHeight)
		.attr('transform', `translate(0, 0)`)
		.call(zoom = d3.zoom()
		      .scaleExtent([c.minZoomScale, c.maxZoomScale])
		      .translateExtent([[0,0],[c.mapWidth,c.mapHeight]])
		      .on('zoom', function () {
			  svg.attr('transform', d3.event.transform)
		      }));
            main();
        });
}

function main()
{
    makeClickables();
}

function makeNest(jsonObject)
{
    nestedSSUData = d3.nest()
	.key(d => d['Building'])
	.key(d => d['Department'])
	.key(d => d['L_Name'])
	.entries(jsonObject);
    
    console.log("nested categories" , nestedSSUData);
}

function BuildingHandlerLMB(bound)
{
    // Save the bound's ID to a variable
    var id = bound.attr('id');

    /* TESTING NESTED DATA RETRIEVAL */
    
    // Remove the bounds from the ID
    id = id.replace("-Bounds", "");
    // Remove the hyphens from the ID
    id = id.replace("-", " ");
    var i;
    for(i = 0; i < nestedSSUData.length; i++) {
	if(nestedSSUData[i].key == id) {
	    console.log("Match found for", id);
	    // Break to keep the index of the matching key
	    break;
	}
    }
    // At this point, if the index is valid, display the relevant majors for the
    // target building. 
    if(i < nestedSSUData.length) {
	console.log("LISTING MAJORS/AREAS");
	for(j = 0; j < nestedSSUData[i].values.length; j++) {
	    console.log(nestedSSUData[i].values[j]);
	}
    }
    console.log('id: ', id);
    console.log("Mouse Coords: (", mouseX, ", ", mouseY, ")");
    var boundRect = bound.select('rect').node();
    console.log("Bound Rect: ", boundRect);
    
    /* PRIMITIVE ZOOM - We still need to get the centroid/proper bounding box coords... */
    var newX = (mouseX * -1.5);
    var newY = (mouseY * -1.5);
    //var newX = (mouseX * -1) - (c.mapWidth / 2);
    //var newY = (mouseY * -1) - (c.mapHeight / 2);
    bound.call(zoom.transform, `translate(${newX}, ${newY}) scale(${c.maxZoomScale})`);
}

function makeClickables()
{    
    var sel = d3.select('svg').selectAll('*').filter(function(d, dd, ddd)
    {
      id = d3.select(this).attr('id')
      if((id) && (id.indexOf('-Bounds') !== -1) && (id.indexOf('-Bounds') === (id.length - 7)))
        return true
      return false
    })
    console.log('sel: ', sel)
    
    sel.on('click', function (e, i, p) {
	var coords = d3.mouse(mapSVG.node());
	mouseX = coords[0];
	mouseY = coords[1];
	//console.log("Click: (", mouseX, ", ", mouseY, ")");
	BuildingHandlerLMB(d3.select(this));
    });   
}