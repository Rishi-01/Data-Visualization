$( document ).ready(function() {
var width = 1200,
    height = 900;

var nodeSize = 9;
var strokeWidth = 2;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-630)
    .linkStrength(0.6)
    .gravity(.05)
    .linkDistance(40)
    .size([width, height]);

var title = d3.select("body").append("div")
    .attr('width', width)
    .style('text-align', 'center')
    .style('font-size', '17px')
    .text("American football games between Division IA colleges during regular season Fall 2000.")

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var groups = d3.nest()
  .key(function(d) { return d.value; })
  .key(function(d) { return data.groups[d.value].name;})
  .entries(data.nodes);

groups.forEach(function(o, i)  {
  o.active = false;
});

var groupPath = function(d) {
    return "M" +
      d3.geom.hull(d.values[0].values.map(function(i) { return [i.x, i.y]; }))
        .join("L")
    + "Z";
};

var groupFill = function(d, i) { return color(i); };


var graph = data;
  force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

  var link = svg.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", strokeWidth);

  var nodes = svg.selectAll(".node")
      .data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", function(node) { return node.weight * 1.1; })
      .style("fill", function(node) { return color(node.value); })
      .call(force.drag);

  nodes.append("title")
      .text(function(d) { return d.label  + " \nlinks: " + d.weight; });

  // Legend
  var legendBox = svg.append("g");

  var legend = legendBox.selectAll(".legend")
    .data(groups)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + (60+ (i * 20))  + ")"; })
      .style('fill', function(d) { return d.active ? '#000' : "#CCC"})
      .style("cursor", "pointer");

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d) { return color(d.key) ; } );

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d.values[0].key; });

  legend.on("click", function(d){
    // Determine if current line is visible

    var active   = d.active ? false : true,
    newOpacity = active ? 0.2 : 0;

    d3.select(this).style("fill", !active ? "#CCC" : "000")
    // Hide or show the elements based on the ID
    d3.select("#node_id_"+d.key).style("opacity", newOpacity);
    // Update whether or not the elements are active
    d.active = active;
  })

  // mouse events

  nodes.on('mouseover', function(node){
    // grow node by 1.2 on hoovering.
    d3.select(this).transition()
      .duration(200)
      .attr('r', (node.weight * 1.1 * 1.2));

     // grow ancient links stroke and stroke width.
     link.style('stroke-width', function(l) {
        if (node === l.source || node === l.target)
          return 3;
        else
          return strokeWidth;
        });
      link.style('stroke', function(l) {
        if (node === l.source || node === l.target)
          return color(node.value);
      else
          return "#999";
      });
   });

  nodes.on('mouseout', function(node){
    d3.select(this).attr('r', node.weight * 1.1 ) ;
    link.style('stroke-width', strokeWidth);
    link.style('stroke', "#999");
   });


  force.on("tick", function(e) {
    var k = 10 * e.alpha;
     nodes.forEach(function(o, i) {
      o.x += i & 2 ? k : -k;
      o.y += i & 1 ? k : -k;
     });

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    nodes.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

  svg.selectAll("path")
    .data(groups)
      .attr("d", groupPath)
    .enter().insert("path", "circle")
      .attr("id", function(group) { return "node_id_" + group.key; })
      .style("fill", groupFill)
      .style("stroke", groupFill)
      .style("stroke-width", 40)
      .style("opacity", function(d){ return  d.active ? 0.2 : 0} )
      .style("stroke-linejoin", "round")
      .attr("d", groupPath);
  });
});
