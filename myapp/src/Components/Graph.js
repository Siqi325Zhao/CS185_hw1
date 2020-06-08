import React, { Component } from 'react';

import config from '../config';

const firebase = require('firebase');
var d3 = require("d3");

const data={
		"nodes": [
		  {
			"id": 1,
			"name": "Andy",
			"gender": "male"
		  },
		  {
			"id": 2,
			"name": "Betty",
			"gender": "female"
		  },
		  {
			"id": 3,
			"name": "Cate",
			"gender": "female"
		  },
		  {
			"id": 4,
			"name": "Dave",
			"gender": "male"
		  },
		  {
			"id": 5,
			"name": "Ellen",
			"gender": "female"
		  },
		  {
			"id": 6,
			"name": "Fiona",
			"gender": "female"
		  },
		  {
			"id": 7,
			"name": "Garry",
			"gender": "male"
		  },
		  {
			"id": 8,
			"name": "Holly",
			"gender": "female"
		  },
		  {
			"id": 9,
			"name": "Iris",
			"gender": "female"
		  },
		  {
			"id": 10,
			"name": "Jane",
			"gender": "female"
		  }
		],
		"links": [
		  {
			"source": 1,
			"target": 2
		  },
		  {
			"source": 1,
			"target": 5
		  },
		  {
			"source": 1,
			"target": 6
		  },
	  
		  {
			"source": 2,
			"target": 3
		  },
		  {
			"source": 2,
			"target": 7
		  }
		,
	  
		  {
			"source": 3,
			"target": 4
		  },
		  {
			"source": 8,
			"target": 3
		  }
		,
		  {
			"source": 4,
			"target": 5
		  }
		,
	  
		  {
			"source": 4,
			"target": 9
		  },
		  {
			"source": 5,
			"target": 10
		  }
		]
}

export class Graph extends Component {
	constructor() {
		super();
		this.state = {
			movies: [],
			nodes: [],
			links: [],
			data: {}
		};
	}

	drag = (simulation) => {
		function dragStarted(d) {
			if(!d3.event.active) simulation.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
		}

		function dragged(d) {
			d.fx = d3.event.x;
			d.fy = d3.event.y;
		}

		function dragEnded(d) {
			if(!d3.event.active) simulation.alphaTarget(0);
			d.fx = null;
			d.fy = null;
		}

		return d3.drag()
			.on("start", dragStarted)
			.on("drag", dragged)
			.on("end", dragEnded)
	}

	chart(nodes, links) {
		const width = 1920;
		const height = 1080;

		const obj_links = links.map(d => Object.create(d));
		const obj_nodes = nodes.map(d => Object.create(d));

		const svg = d3.create("svg")
			.attr("viewBox", [0, 0, width, height]);

		const link = svg.append("g")
			.attr("stroke", "#999")
			.attr("stroke-opacity", 0.6)
			.selectAll("line")
			.data(obj_links)
			.join("line")
			.attr("stroke-width", d => Math.sqrt(d.value))

		const radius = (node) => {
			if (node.group ==1)
				return 20;
			return 70;
		}

		const image = (node) => {
			if(node.group ===1)
				return d3.color("blue");
			else if(node.group ===2)
				return 'url(#' + node.name.replace(/[^\w\s]/gi, "").split(' ').join('');
		}

		const handleMouseOver = (d, i) => {
			if(d.group === 1) {
				const text = svg.select( "#text_"+d.name.split(' ').join(''))
				text.style("display", "block")
			}
		}

		const handleMouseOut = (d, i) => {
			if(d.group === 1) {
				const text = svg.select( "#text_"+d.name.split(' ').join(''))
				text.style("display", "none")
			}
		}

		const simulation = d3.forceSimulation(obj_nodes)
			.force("link", d3.forceLink().links(links).id(d => { return d.index; }).distance(200))
			.force("charge", d3.forceManyBody())
			.force("center", d3.forceCenter(width/2, height/2));

		svg.append("g")
			.selectAll("circle")
			.data(obj_nodes)
			.join("g")
			.attr("class", "node")
			.append("circle")
			.attr("r", radius)
			.call(this.drag(simulation));


		const node =svg.selectAll("circle")
			.style("fill", image)
			.attr("stroke", "#fff")
			.attr("stoke-width", 1.5)

		svg.selectAll(".node")
			.on("mouseover", handleMouseOver)
			.on("mouseout", handleMouseOut)
			.append('defs')
		    .append('pattern')
		    .attr('id', function(d,i){
		      return  d.name.replace(/[^\w\s]/gi, "").split(' ').join('');
		    })
		    .attr('height',1)
		    .attr('width',1)
		    .attr('x',0)
		    .attr('y',0)
		    .append('image')
		    .attr('xlink:href',function(d,i){
		      return d.poster;
		    })
		    .attr('height',300)
		    .attr('width',200)
		    .attr('x',0)
		    .attr('y',-50)

		 const text = svg.selectAll(".node")
		 	.append("text")
            .text((d, i) => { return d.name})
            .attr("id", (d, i) =>  { return "text_"+d.name.split(' ').join('')})
            .attr("x", (d, i) => {return  d.x - 100})  
            .attr("y", (d, i) => {return d.y + 50})
            .style("fill", "white")
            .style("display", "none")
            .style("font-size", "15px")

		simulation.on("tick", () => {
			link
				.attr("x1", d => d.source.x)
				.attr("y1", d => d.source.y)
				.attr("x2", d => d.target.x)
				.attr("y2", d => d.target.y);

			node
				.attr("cx", d => d.x)
				.attr("cy", d => d.y);

			text.attr("x", d => d.x + 25)
				.attr("y", d => d.y + 25);
		});
		return svg.node();
	}

	componentDidMount(){
	    if(!firebase.apps.length) {
	    	firebase.initializeApp(config);
		}

		let currentNodeID = -1;
		let nodes = [];
		let links = [];
		let currentLinkID = -1;

    	const moviesRef = firebase.database().ref('lists').child('Graph');
	    moviesRef.on('value', snapshot => {
	    	snapshot.forEach(movie => {
	    		let title = movie.val().Title;
	    		let actors = movie.val().Actors;
	    		let imdbID = movie.val().imdbID;
	    		let poster = movie.val().Poster
	    		currentNodeID++;
	    		let currentMovieID = currentNodeID;
	    		nodes = nodes.concat([{
					name: title,
					group: 2,
					poster: poster
				}]);

	    		let actorsSplit = actors.split(', ');
	    		actorsSplit.map((actor) => {
	    			if(!nodes.some(item => item.name === actor)){		    			
		    			currentNodeID++;
		    			currentLinkID++;

		    			nodes = nodes.concat({
		    				name: actor,
		    				group: 1
		    			});
		    			links = links.concat({
		    				target: currentMovieID,
		    				source: currentNodeID,
		    				value: 5
		    			})
	    			}
	    			else {
	    				const index = nodes.findIndex(obj => obj.name === actor);
	    				links = links.concat({
	    					target: currentMovieID,
	    					source: index,
	    					value: 3
	    				})
	    			}
				});
				
	    		this.setState(prevState => ({
	      			movies: {
	      				...prevState.movies,
	      				[imdbID]: movie.val()
	      			}
	     		}));
	    	});
	    const elem = document.getElementById("mysvg");
    	elem.appendChild(this.chart(data.nodes, data.links));
    	});
	}

	render() {
		return ( 
			<div id="mysvg">
			</div>
		)
	}
}
export default Graph;