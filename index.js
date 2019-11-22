// Constants for use throughout the program.
const c = {
    mapWidth: 1000,
    mapHeight: 800,
    minZoomScale: 1,
    maxZoomScale: 6,
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
	.append("svg")
	.attr('width', c.mapWidth)
	.attr('height', c.mapHeight)
	.append("g")
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
      main()
    })

}

function main()
{
  zoom = d3.zoom()
    .scaleExtent([c.minZoomScale, c.maxZoomScale])
    .translateExtent([[0,0],[c.mapWidth,c.mapHeight]])
    .on('zoom', function () {
      d3.select('body svg g').attr('transform', d3.event.transform)
    })
  d3.select('body svg').call(zoom)
  makeClickables();
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

function BuildingHandlerLMB(bound)
{
  var centroid = getCentroid(bound.node().getBBox())

  d3.select(bound.node().parentNode).append("circle").attr("cx", centroid.x).attr("cy", centroid.y).attr("r", 3).style("fill", "purple").attr('opacity', 1);


  var winWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  var winHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  // console.log('w: ', winWidth,'h: ', winHeight)
  // console.log('centroid before: ', centroid)
  var mapDims = mapSVG.node().viewBox.baseVal
  // centroid.x = ((centroid.x) - mapDims.width)// / mapDims.width * winWidth
  // centroid.y =  ((centroid.y) - mapDims.height)// / mapDims.height * winHeight
  // console.log('body selection/node: ', d3.zoomTransform(d3.select('body svg').node()).k)
  var curZoom = d3.zoomTransform(d3.select('body svg').node())
  console.log('curZoom: k=', curZoom.k, ' x: ', curZoom.x, ' y: ', curZoom.y )
  console.log('centroid-pre: ', centroid)
  centroid.x = (centroid.x - curZoom.x)/curZoom.k
  centroid.y = (centroid.y - curZoom.y)/curZoom.k
  console.log('centroid-post: ', centroid)
  // console.log('centroid after: ', centroid)
  var translation = d3.zoomIdentity.scale(c.maxZoomScale).translate(-centroid.x, -centroid.y)

  d3.select('body svg').transition().duration(2000).call(zoom.transform, translation)

}

function makeClickables()
{
    var sel = d3.select('svg').selectAll('*').filter(function()
    {
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

    sel.on('click', function () { BuildingHandlerLMB(d3.select(this)) })
}

function getCentroid(rect) { return { x:rect.x + rect.width/2, y:rect.y + rect.height/2} }
