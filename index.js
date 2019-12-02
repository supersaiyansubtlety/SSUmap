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
    searchHeight: 30,
    nodeDepth: 300,
    nodeHeight: 50
};

// For use in "Map" code.
var zoom;
var svg;
var mapSVG;
var alreadyZoomed = false;

// For use in "Tree" code.
var i = 0,
    duration = 750,
    root,
    treemap,
    svg,
    nodeEnter,
    nodes,
    links,
    lastClicked = null;

var margin = {top: 20, right: 90, bottom: 30, left: 90};

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
	.attr('height', c.mapVBHeight)
	.attr('class', 'Map');
    // zoom = d3.zoom()
    //   .scaleExtent([c.minZoomScale, c.maxZoomScale])
    //   .translateExtent([[0,0],[c.mapWidth,c.mapHeight]])
    //   .on('zoom', function () {
    //     svg.attr('transform', d3.event.transform)
    //   })
    // d3.select('body svg').call(zoom)

    d3.xml('map.svg', function(data) { console.log(data) })
	.then(data => {
	    d3.select('.Map').node().append(data.documentElement);
	    mapSVG = svg.select('svg');
	    console.log('Map should be loaded here!');
	    main();
	});
}

function main()
{
    zoom = d3.zoom()
	.scaleExtent([c.minZoomScale, c.maxZoomScale])
	.translateExtent([[0,0],[c.mapWidth,c.mapHeight]])
	.on('zoom', function () {
	    d3.select('.Map').attr('transform', d3.event.transform)
	    // if(d3.zoomTransform(d3.select('.Map').node()).k !== c.maxZoomScale)
	    // {
		  //   d3.selectAll('.Tree')
		  //   //.attr('transform', `translate(${c.mapWidth},0)`)
  		//     .transition()
  		//     .duration(250)
  		//     .attr('opacity', 0);
	    // }
	    // else
	    // {
		  //   d3.selectAll('.Tree')
		  //   //.attr('transform', `translate(${c.mapWidth},0)`)
  		//     .transition()
  		//     .duration(250)
  		//     .attr('opacity', 1);
	    // }

      var zoomed = d3.zoomTransform(d3.select('.Map').node()).k === c.maxZoomScale;
      if(zoomed)
      {
        if (!alreadyZoomed)
        {
          console.log('max zoomage');
          alreadyZoomed = true;
          // d3.selectAll('.Tree')
  		    // //.attr('transform', `translate(${c.mapWidth},0)`)
    		  //   .transition()
    		  //   .duration(250)
    		  //   .attr('opacity', 1);

            // window.setTimeout(function()
            // {
            //   // console.log('nodes[10]: ', nodes[10])
            //   // console.log('name: ', nodes[10].data.name)
            //
            //   // nodes[n].data.name
            //
            //   click(nodes[10]);
            //   // console.log('boiler: ', svg.selectAll('g.node #Boiler-Plant').data);
            // },250);
        }
      }
      else
      {
        if(alreadyZoomed)
        {
          alreadyZoomed = false;
        console.log("unzooming");
          resetTree();

          // window.setTimeout(function()
          // {
          //   if(lastClicked !== null)
          //   {
          //     click(lastClicked);
          //     lastClicked = null;
          //   }
          // },250);
        }
      }


  });


    var dbgZoom = d3.selectAll('.Map').call(zoom);
    console.log('Zoom should be implemented here! = ', dbgZoom);
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

function zoomToSelection(sel, xRat, yRat)
{
    var rect = sel.node().getBBox()
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

    d3.select('.Map').transition().duration(500).call(zoom.transform, translation);
    window.setTimeout(()=>
    {
      setTreeOpacity(1);
      console.log("sel node: ", sel.node());
      clickNodeByName(sel.node().id.replace('-Bounds', '').replace(/-/g, ' '));
    }, 500);

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
    outString = outString.replace(/ /g, '-')
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
  // clickNodeByName(event.path[0].value);
    // nodes[n].data.name

    // click(nodes[10]);
  // })
    }
}

function loadVisual(jsonObject)
{
    var treeData = jsonObject;

    // Set the dimensions and margins of the diagram
    var margin = {top: 20, right: 90, bottom: 30, left: 90},
	width = c.mapWidth - margin.left - margin.right,
	height = c.mapWidth - margin.top - margin.bottom;

    // append the svg object to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    svg = d3.select("body svg")
    //.attr("width", width + margin.right + margin.left)
    //.attr("height", height + margin.top + margin.bottom)
        .append("g")
      	.attr("transform", "translate(" + (- c.mapWidth / 4) + "," + margin.top + ")")
      	.attr('class', 'Tree');

    // declares a tree layout and assigns the size
    treemap = d3.tree().size([height, width]);

    // Assigns parent, children, height, depth
    root = d3.hierarchy(treeData, function (d) {
        return d.children;
    });
    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse after the second level

    resetTree();

    // root.children.forEach(collapse);
    // console.log('root: ', root);
    // console.log('root.children: ', root.children);
    //
    // update(root);
    // setTreeOpacity(0);
}

// Toggle children on click.
function click(d, i , p) {
    // console.log('Click was called');
    // console.log('d: ', d)
    // console.log('i: ', i)
    // console.log('p: ', p)
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    d3.select('.Tree')
	.transition()
	.duration(250)
	.attr('transform', `translate(${(-c.mapWidth / 4) * d.depth},${margin.top})`);
    update(d);
}

// Collapse the node and all it's children
function collapse(d) {
    console.log('Collapse was called');
    if (d.children) {
        d._children = d.children
        d._children.forEach(collapse)
        d.children = null
    }
}

function update(source) {

    console.log('Update was called');
    // Assigns the x and y position for the nodes
    var treeData = treemap(root);

    // Compute the new tree layout.
    nodes = treeData.descendants();
    links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        // console.log("d: ", d);
        // console.log("d.y: ", d.y);
        d.y = d.depth * c.nodeDepth;
        // console.log("d.y: ", d.y);
    });

    // ****************** Nodes section ***************************

    // Update the nodes...
    var node = svg.selectAll('g.node')
        .data(nodes, function (d) {
	    return d.id || (d.id = ++i);
        });

    // Enter any new modes at the parent's previous position.

    nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('id', function(d) {return d.data.name.replace(/ /g, '-')})
        .attr("transform", function (d) {
	    return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on('click', click);

    // Add Circle for the nodes
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style("fill", function (d) {
	    return d._children ? "lightsteelblue" : "#fff";
        });

    // Add labels for the nodes
    nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("x", function (d) {
	    return d.children || d._children ? -13 : 13;
        })
        .attr("text-anchor", function (d) {
	    return d.children || d._children ? "end" : "start";
        })
        .text(function (d) {
	    return d.data.name;
        });

    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
        .duration(duration)
        .attr("transform", function (d) {
	    return "translate(" + d.y + "," + d.x + ")";
        });

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
        .attr('r', 10)
        .style("fill", function (d) {
	    return d._children ? "lightsteelblue" : "#fff";
        })
        .attr('cursor', 'pointer');


    // Remove any exiting nodes
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) {
	    return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
        .attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text')
        .style('fill-opacity', 1e-6);

    // ****************** links section ***************************

    /*

    // Update the links...
    var link = svg.selectAll('path.link')
        .data(links, function (d) {
	    return d.id;
        });

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', function (d) {
	    var o = {x: source.x0, y: source.y0}
	    return diagonal(o, o)
        });

    // UPDATE
    var linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
        .duration(duration)
        .attr('d', function (d) {
	    return diagonal(d, d.parent)
        });

    // Remove any exiting links
    var linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', function (d) {
	    var o = {x: source.x, y: source.y}
	    return diagonal(o, o)
        })
        .remove();

    */

    // Store the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {
        path = `M ${s.y} ${s.x}
        C ${(s.y + d.y) / 2} ${s.x},
          ${(s.y + d.y) / 2} ${d.x},
          ${d.y} ${d.x}`
        return path;
    }
}

function clickNodeByName(name)
{
  nodes.forEach((node) => {
    if (node.data.name === name)
    {
      window.setTimeout(()=>
      {
        lastClicked = node;
        click(node);
      },250);
    }
  });
}

function setTreeOpacity(op)
{
  var tree = d3.selectAll('.Tree');

  console.log("setting tree opacity: ", op);
  d3.selectAll('.Tree')
  //.attr('transform', `translate(${c.mapWidth},0)`)
    .transition()
    .duration(250)
    .attr('opacity', op);
}

function resetTree()
{
  root.children.forEach(collapse);
  // console.log('root: ', root);
  // console.log('root.children: ', root.children);

  update(root);
  setTreeOpacity(0);
}
