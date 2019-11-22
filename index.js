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
    .append('g')


  d3.xml('map.svg', function(data) { console.log(data) })
    .then(data => {
      svg.node().append(data.documentElement)
      mapSVG = svg.select('svg')
      main()
    })

}

function main()
{
  var mapRect = d3.select('svg g svg').node().viewBox.baseVal
  zoom = d3.zoom()
    .scaleExtent([c.minZoomScale, c.maxZoomScale])
    .translateExtent([[0,0],[c.mapWidth,c.mapHeight]])
    // .extent([[0,0],[c.mapWidth,c.mapHeight]])
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
  // console.log("nested categories" , nestedFalcultyCategories);
}

function BackButtonLMB(d)
{
  console.log("BackButtonLMB entered: ", d);
}

function BuildingHandlerLMB(bound)
{
  var transform = getZoomTransform(bound.node().getBBox())

  d3.select('body svg').transition().duration(2000).call(zoom.transform, transform)
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
    // console.log('sel: ', sel)

    sel.on('click', function () { BuildingHandlerLMB(d3.select(this)) })
}

function getZoomTransform(rect)
{
  var centroid = {
    x: rect.x + rect.width/2,
    y: rect.y + rect.height/2
  }

  mapRect = d3.select('svg g svg').node().viewBox.baseVal

// console.log('centroid-pre: ', centroid)
//   centroid.x = centroid.x * mapRect.width/c.mapWidth
//   centroid.y = centroid.y * mapRect.height/c.mapHeight
// console.log('centroid-post: ', centroid)
  var x = centroid.x/mapRect.width*c.mapWidth  //- centroid.x// * c.maxZoomScale
  var y = centroid.y/mapRect.height*c.mapHeight  //- centroid.y// * c.maxZoomScale

  // d3.select('body svg g').attr('transform-origin', `${x} ${y}`)

console.log('x: ', x, ', y: ', y)

  return d3.zoomIdentity
  .scale(c.maxZoomScale)
  .translate(-x, -y)

}
