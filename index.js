// Constants for use throughout the program.
const c = {
    // Old width and height were 1000 and 800, respectively.
    mapWidth: 792,
    mapHeight: 612,
    minZoomScale: 1,
    maxZoomScale: 6,
    mapVBWidth: 792,
    mapVBHeight: 612,
    topMargin: 10,
    rightMargin: 10,
    searchWidth: 200,
    searchHeight: 30
};

var zoom;
var svg;
var mapSVG;

function loadSVG()
{
    // Resize body.
    // Call D3's zoom function which also handles translating.
    // Not sure if this will conflict with clicks.
    svg = d3.select('body')
    // .style('position', 'relative')
    // .style('padding', '30px')
	.append("svg")
	.attr('width', c.mapWidth)
	.attr('height', c.mapHeight)
	.append("g")
	.attr('width', c.mapVBWidth)
	.attr('height', c.mapVBHeight);
    // zoom = d3.zoom()
    //   .scaleExtent([c.minZoomScale, c.maxZoomScale])
    //   .translateExtent([[0,0],[c.mapWidth,c.mapHeight]])
    //   .on('zoom', function () {
    //     svg.attr('transform', d3.event.transform)
    //   })
    // d3.select('body svg').call(zoom)

    d3.xml('map.svg', function(data) { console.log(data) })
	.then(data => {
	    svg.node().append(data.documentElement)
	    mapSVG = svg.select('svg')
	    //.attr('width', 1000)
	    //.attr('height', 800)
	    //.attr('viewBox', '0 0 1000 800')
	    main();
	})
}

function main()
{
    zoom = d3.zoom()
	.scaleExtent([c.minZoomScale, c.maxZoomScale])
	.translateExtent([[0,0],[c.mapWidth,c.mapHeight]])
	.on('zoom', function () {
	    d3.select('body svg g').attr('transform', d3.event.transform)
	});
    d3.select('body svg').call(zoom);
    makeClickables();
    makeSearchBox();
}

function makeNest(jsonObject)
{
    const nestedFalcultyCategories = d3.nest()
	  .key(d => d['Building'])
	  .key(d => d['Department'])
	  .key(d => d['L_Name'])
	  .entries(jsonObject)
    console.log("nested categories" , nestedFalcultyCategories);
}

function BackButtonLMB(d)
{
    console.log("BackButtonLMB entered: ", d);
}


// function BuildingHandlerLMB(bound)
// {
//     var centroid = getCentroid(bound.node().getBBox())
//
//     //d3.select(bound.node().parentNode).append("circle").attr("cx", centroid.x).attr("cy", centroid.y).attr("r", 3).style("fill", "purple").attr('opacity', 1);
//
//
//     var winWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
//     var winHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
//     // console.log('w: ', winWidth,'h: ', winHeight)
//     // console.log('centroid before: ', centroid)
//     var mapDims = mapSVG.node().viewBox.baseVal;
//     // centroid.x = ((centroid.x) - mapDims.width)// / mapDims.width * winWidth
//     // centroid.y =  ((centroid.y) - mapDims.height)// / mapDims.height * winHeight
//     // console.log('body selection/node: ', d3.zoomTransform(d3.select('body svg').node()).k)
//     var curZoom = d3.zoomTransform(d3.select('body svg').node());
//     // curZoom.k is the current scale factor when clicked. x and y is presumably the
//     // top-left-most point visible at the zoom factor k.
//     //console.log('curZoom: k=', curZoom.k, ' x: ', curZoom.x, ' y: ', curZoom.y )
//     console.log('centroid-pre: ', centroid);
//     var offsetX = (c.mapVBWidth / 3);
//     var offsetY = (c.mapVBHeight / 2);
//     /*
//     if(curZoom.k == 1)
//     {
// 	console.log('Modifying centroid');
// 	centroid.x = (centroid.x - curZoom.x)/curZoom.k;
// 	centroid.y = (centroid.y - curZoom.y)/curZoom.k;
//     }
//     */
//     console.log('centroid-post: ', centroid);
//     //console.log('offsetX = ', offsetX, '; offsetY = ', offsetY);
//     // console.log('centroid after: ', centroid)
//     var translation = d3.zoomIdentity.scale(c.maxZoomScale).translate(-centroid.x, -centroid.y)
//     //console.log('translate = ', translation);
//     translation.x += offsetX;
//     translation.y += offsetY;
//     d3.select('body svg').transition().duration(1500).call(zoom.transform, translation);
// }

function makeClickables()
{
    var sel = d3.select('svg').selectAll('*').filter(function() {
	var id = d3.select(this).attr('id')
	var pos
	if(id)
	{
	    var pos = (id.indexOf('-Bounds'))
	    if ((pos !== -1) && (pos === (id.length - 7)))
		return true
	}
	return false
    })
    console.log('sel: ', sel)

    sel.on('click', function () { zoomToSelection(d3.select(this), 1/3, 1/2) })
}

function zoomToSelection(id, xRat, yRat)
{
  var rect = id.node().getBBox()
  var centroid =
  {
    x: rect.x + rect.width/2,
    y: rect.y + rect.height/2
  }

  if(xRat === null) xRat = 0.5
  else if (xRat < 0) xRat = 0
  else if(xRat > 1) xRat = 1

  if(yRat === null) yRat = 0.5
  else if (yRat < 0) yRat = 0
  else if(yRat > 1) yRat = 1

  var offsetX = (c.mapVBWidth * xRat)
  var offsetY = (c.mapVBHeight * yRat)

  var translation = d3.zoomIdentity.scale(c.maxZoomScale).translate(-centroid.x, -centroid.y)

  translation.x += offsetX
  translation.y += offsetY

  d3.select('body svg').transition().duration(500).call(zoom.transform, translation)

}

function zoomByName(buildingName, xRat, yRat)
{
  var buildingId = formatToBoundId(buildingName)
  var sel = d3.select(`svg g svg #${buildingId}`);
  if(!sel.empty())
    zoomToSelection(sel, xRat, yRat);
}

function formatToBoundId(buildingName)
{
  var outString = buildingName + '-Bounds'
  outString = outString.replace(' ', '-')
  console.log('outstring: ', outString)
  return outString
}


function makeSearchBox()
{
  d3.select('body')
    // .append('div')
    .append('input')
    .style('position', 'fixed')
    .style('z-index', 200)
	  .style('left', `${c.mapWidth - c.rightMargin - c.searchWidth}px`)
	  .style('top', `${c.topMargin + c.searchHeight}px`)
    .style('width', `${c.searchWidth}px`)
    .style('height', `${c.searchHeight}px`)
    .style('background-color', 'rgba(255, 255, 255, 0.87)')
    .style('border-color', 'rgba(225, 225, 225, 0.7)')
    .style('border-radius', '7px')
    .style('border-width', '2px')
    .style('border-style', 'solid')
    // .style('opacity', 0.5)
    .style('font-size', '12px')
    .attr('type', 'text')
	  .attr('name', 'textField')
	  .attr('placeholder', 'Enter search here...')
    .attr('onkeypress', 'textInputHandler(event)');
}

function getCentroid(rect) { return { x:rect.x + rect.width/2, y:rect.y + rect.height/2} }

function textInputHandler(event)
{
  if(event.code ==='Enter')
  {
    console.log('entered: ', event.path[0].value);
    // console.log('event: ', event)
    zoomByName(event.path[0].value, 1/3, 1/2);

  }
}
