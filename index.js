// Constants for use throughout the program.
const c = {
  // Old width and height were 1000 and 800, respectively.
  mapWidth: 792,
  mapHeight: 612,
  minZoomScale: 1,
  maxZoomScale: 6,
  mapVBWidth: 792,
  mapVBHeight: 612
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
  .attr('width', c.mapVBWidth)
  .attr('height', c.mapVBHeight);

  d3.xml('map.svg', function(data) { console.log(data) })
  .then(data => {
      svg.node().append(data.documentElement)
      mapSVG = svg.select('svg')
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
  zoomByName('Salazar Hall')
}

function makeNest(jsonObject)
{
  const nestedFalcultyCategories = d3.nest()
  .key(d => d['Building'])
  .key(d => d['Department'])
  .key(d => d['L_Name'])
  .entries(jsonObject)
  console.log("nested categories" , nestedFalcultyCategories)
}

function BackButtonLMB(d)
{
  console.log("BackButtonLMB entered: ", d)
}

function zoomToSelection(bound, xRat, yRat)
{
  var rect = bound.node().getBBox()
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
  sel.on('click', function () { zoomToSelection(d3.select(this), 1/3, 1/2) })
}

function zoomByName(buildingName)
{
  var buildingId = formatToBoundId(buildingName)
  zoomToSelection(d3.select(`svg g svg #${buildingId}`), 2/3, 1/2)
}

function formatToBoundId(buildingName)
{
  var outString = buildingName + '-Bounds'
  outString = outString.replace(' ', '-')
  console.log('outstring: ', outString)
  return outString
}
