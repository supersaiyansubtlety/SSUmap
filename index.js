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
    nodeDepth: 792,
    nodeHeight: 50
};

// For use in "Map" code.
var zoom;
var svg;
var mapSVG;
var alreadyZoomed = false;
var treeDepth;

// For use in "Tree" code.
var i = 0,
    duration = 750,
    root,
    treemap,
    svg,
    nodeEnter,
    nodes,
    links;

var margin = {top: 20, right: 90, bottom: 30, left: 90};

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
  	.attr('height', c.mapVBHeight)
  	.attr('class', 'Map');

  d3.xml('map.svg')
    .then(data =>
    {
      d3.select('.Map').node().append(data.documentElement);
      d3.select('.Map').selectAll('text')
        .style('-webkit-touch-callout', 'none')
        .style('-webkit-user-select', 'none')
        .style('-khtml-user-select', 'none')
        .style('-moz-user-select', 'none')
        .style('-ms-user-select', 'none')
        .style('user-select', 'none')

      mapSVG = svg.select('svg');
      console.log('Map should be loaded here!');
      main();
    });
}

function main()
{
  zoom = d3.zoom()
  	.scaleExtent([c.minZoomScale, c.maxZoomScale])
  	.translateExtent([[0, 0],[c.mapWidth, c.mapHeight]])
  	.on('zoom', function () {
	    d3.select('.Map').attr('transform', d3.event.transform)

      var zoomed = d3.zoomTransform(d3.select('.Map').node()).k === c.maxZoomScale;
      if(zoomed)
      {
        if (!alreadyZoomed)
          alreadyZoomed = true;
      }
      else
      {
        if(alreadyZoomed)
        {
          alreadyZoomed = false;
          resetTree();
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

  sel.on('click', function ()
  {
    building = d3.select(this);
    zoomToSelection(building, 1/3, 1/2);
    var found = findNode(building.attr('id').replace('-Bounds', '').replace(/-/g, ' '))
    if(found) expandNodeDelayed(found);
  });
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
}

function zoomByName(buildingName, xRat, yRat)
{
  var buildingId = formatToBoundId(buildingName)
  if(buildingName.indexOf('@') !== -1) return
  var sel = d3.select(`svg g svg #${buildingId}`);
  if(!sel.empty())
    zoomToSelection(sel, xRat, yRat);
}

function formatToBoundId(buildingName)
{
  var outString = buildingName + '-Bounds'
  outString = outString.replace(/ /g, '-')
  return outString
}

function makeSearchBox()
{
  d3.select('body')
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
  	.style('font-size', '12px')
  	.attr('type', 'text')
  	.attr('name', 'textField')
  	.attr('placeholder', 'Enter search here...')
  	.attr('onkeypress', 'textInputHandler(event)');
}

function textInputHandler(event)
{
  if(event.code === 'Enter')
  {
    resetTree();
    var foundNode = findNode(event.path[0].value);
    if(foundNode)
    {
      var stack = [];

      while (foundNode && !(foundNode.data && (foundNode.data.name === 'Sonoma State')))
      {
        stack.push(foundNode);
        foundNode = foundNode.grandParent;
      }
      if(stack.length)
      {
        zoomByName(stack[stack.length - 1].data.name, 1/3, 1/2);
        function doDelays()
        {
          window.setTimeout( () =>
          {
            var cur = stack.pop()
            console.log('cur: ', cur)
            expandNode(findNode((cur.data ? cur.data.name : cur.name )), true);
            setTreeOpacity(1);
            if(stack.length) doDelays();
          }, 500);
        }
        doDelays();
      }
    }
    else
      zoomByName(event.path[0].value, 1/3, 1/2);
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
    .append('svg')
    .style('position', 'fixed')
    .attr('width', c.mapWidth)
    .attr('height', c.mapHeight * 2)
    .append("g")
    .attr('width', c.mapWidth)
    .attr('height', c.mapHeight)
    .attr("transform", "translate(" + (-c.mapWidth / 2) + "," + 5 + ")")
    .attr('class', 'Tree');

  // declares a tree layout and assigns the size
  treemap = d3.tree().size([height, width]);

  // Assigns parent, children, height, depth
  root = d3.hierarchy(treeData, function (d) { return d.children; });
  root.x0 = height / 2;
  root.y0 = 0;

  // Collapse after the second level
  var treeData = treemap(root);

  // Compute the new tree layout.
  nodes = treeData.descendants();
  links = treeData.descendants().slice(1);

  resetTree();
  //recursively set all nodes' grandParents
  nodes.forEach((e) => {recursiveGrandparenting(e.data.children, e)});
}

// Toggle children on click.
function expandNode(d) {
  d3.select('body')
    .append('text')
    .text('Collapse Tree')
    .style('x', c.mapWidth + 50)
    .style('y', c.mapHeight - 50)
    .style('width', '126px')
    .style('height', '20px')
    .style('background-color', 'rgba(255, 255, 255, 0.87)')
    .style('border-color', 'rgba(225, 225, 225, 0.7)')
    .style('border-radius', '6px')
    .style('border-width', '3px')
    .style('border-style', 'solid')
    .style('font-family', 'sans-serif')
    .style('font-size', '20px')
    .attr('class', 'Back-Text')
    .on('click', function() {
      resetTree();
      d3.selectAll('.Back-Text').remove();
    });

  if (d.children)
  {
    d._children = d.children;
    d.children = null;
  }
  else
  {
    d.children = d._children;
    d._children = null;
  }

  // d3.select('.Tree')
  //   .transition()
  //   .duration(250)
  //   .attr('transform', `translate(${(-c.mapWidth / 4) * d.depth}, ${margin.top})`);
  console.log('Inner display!');
  d3.selectAll('.Tree')
    .transition()
    .duration(250)
    .attr('transform', `translate(${((-d.depth) * c.nodeDepth - (c.mapWidth / 2))},${5})`);

  update(d);
  console.log('d at end of expansion = ', d);
  if(d.depth < 1) {
    console.log('Setting to transparent');
    window.setTimeout(()=> {
      setTreeOpacity(0);
    },250);
  }
  else
  {
    console.log('Setting to opaque');
    window.setTimeout(()=> {
      setTreeOpacity(1);
    },250);
  }
}

// Collapse the node and all it's children
function collapse(d)
{
  if (d.children)
  {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }

}

function update(source) {

    // console.log('Update was called');
    // console.log('nodes start: ', nodes);
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
        .on('click', expandNode);

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
    // console.log('nodes end: ', nodes);
}

function setTreeOpacity(op)
{
  d3.selectAll('.Tree')
    .transition()
    .duration(250)
    .attr('opacity', op);
}

function resetTree()
{
  root.children.forEach(collapse);
  update(root);
  setTreeOpacity(0);
}

function recursiveGrandparenting(parent, grandParent)
{
  if(parent)
  {
    parent.forEach((e) =>
    {
      e.grandParent = grandParent;
      if(e.children && e.children.length)
        recursiveGrandparenting(e.children, e);
    });
  }
}

function findNode(name)
{
  var stack1 = [nodes];
  var stack2 = [];
  var curStack = stack1;
  var nextStack = stack2;
  var tail;
  var res;

  var getChildren;
  var children;

  var depth = 0;

  while(curStack.length)
  {
    //handle top-level case, where everything is contained in array elements' .data's
    getChildren = (curStack[0][0].data ? (e) => { return e.data.children; } : (e) => { return e.children; });

    while(curStack.length)
    {
      tail = curStack.pop();
      console.log('depth: ', depth)
      res = fallBackSearch(tail, name); //arrayBinarySearch(tail, name);//(depth < 2 ? arrayBinarySearch(tail, name) :
      if(res)
      {
        console.log('depth: ', depth);
        return res;
      }

      for(child of tail)
      {
        if(children = getChildren(child))
          nextStack.push(children);
      }
    }
    [curStack, nextStack] = swap(curStack, nextStack);
    depth++;
  }

  return null;
}

function arrayBinarySearch(array, name)
{
  var localArray = array.slice();
  var start = 0;
  var end = localArray.length - 1;
  var mid = Math.round((start + end)/2);
  var prevMid = 0;
  var next;
  //handle top-level case, where everything is contained in localArray elements' .data's
  var getName = (localArray[0].data ? (i) => { return localArray[i].data.name+'' } : (i) => { return localArray[i].name+'' });
  next = (getName(mid)).localeCompare(name);
  while(next && (prevMid != mid))//(next = (getName(mid)).localeCompare(name))
  {
    if(next > 0)
    { // localArray[mid].name comes BEFORE name
      end = mid;
    }
    else
    { // localArray[mid].name comes AFTER name
      start = mid;
    }
    prevMid = mid;
    mid = Math.round((start + end)/2);
    next = (getName(mid)).localeCompare(name);
  }
  if(prevMid == mid && mid != 0)
    next = (getName(--mid)).localeCompare(name)

  if(next) // not found
    return null;

  if(array[mid].grandParent && array[mid].grandParent.children)
      return array[mid].grandParent.children[mid]
  else
    return array[mid]
}

function fallBackSearch(array, name)
{
  var getName = (array[0].data ? (e) => { return e.data.name+'' } : (e) => { return e.name+'' });
  console.log('fall array: ', array)
  for (item of array)
  {
    if(getName(item).search(new RegExp(name, 'i')) != -1)//.search(/nopic/i
      return item;
  }
  return null;
}

// function arrayBinarySearch(array, name)
// {
//   var getName = (array[0].data ? (e) => { return e.data.name } : (e) => { return e.name });
//   for (item of array)
//   {
//     if(getName(item)===name)
//       return item;
//   }
//   return null;
// }

function expandNodeDelayed(node, delay)
{
  if(delay === null) { delay = 500; }
  setTreeOpacity(1);
  window.setTimeout(()=>
  {
    expandNode(node);
    setTreeOpacity(1);
  }, delay);
}

function swap(a, b) {
  return [b, a]
}
