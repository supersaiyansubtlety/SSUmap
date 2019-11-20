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

function BuildingHandlerLMB(bound)
{
    console.log('id: ', bound.attr('id'))

}

function makeClickables()
{
    // var sel = d3.selectAll('#Buidlings g')
    var sel = d3.select('svg').selectAll('*').filter(function(d, dd, ddd)
    {
      id = d3.select(this).attr('id')
      if((id) && (id.indexOf('-Bounds') !== -1) && (id.indexOf('-Bounds') === (id.length - 7)))
        return true
      return false
    })
    console.log('sel: ', sel)

    sel.on('click', function (e, i, p)
    {
      // console.log('clicked this: ', d3.select(this))
      BuildingHandlerLMB(d3.select(this))
    })
}
