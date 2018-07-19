var teamColors = {
  Colorado: "#330072",
  "LA Dodgers": "#002F6C",
  Arizona: "#A71930",
  "San Diego": "#041E42",
  "San Francisco": "#FA4616",
  Washington: "#BA122B",
  "NY Mets": "#002D72",
  Miami: "#ED6F2E",
  Philadelphia: "#BA0C2F",
  Atlanta: "#132650",
  "Chi Cubs": "#002F6C",
  "St. Louis": "#BA0C2F",
  Pittsburgh: "#FFC72C",
  Milwaukee: "#13294B",
  Cincinnati: "#D50032",
  Boston: "#C8102E",
  Toronto: "#134A8E",
  "NY Yankees": "#003087",
  "Tampa Bay": "#092C5C",
  Cleveland: "#D50032",
  Detroit: "#FA4616",
  "Kansas City": "#1A4784",
  "Chi White Sox": "#27251F",
  Minnesota: "#BA0C2F",
  Texas: "#002D72",
  Seattle: "#0C2340",
  Houston: "#002D62",
  "LA Angels": "#BA0021",
  Oakland: "#034638",
  Baltimore: "#FC4C02"
};
var divisions = [
  "national-league-east",
  "national-league-central",
  "national-league-west",
  "american-league-east",
  "american-league-central",
  "american-league-west"
];

var years = _.range(1994, 2019).reverse();
var defaultYear = 2017;

// Set the dimensions of the canvas / graph
var margin = { top: 0, right: 30, bottom: 0, left: 50 },
  fullWidth = 500,
  lineChartWidth = 370,
  height = 180 - margin.top - margin.bottom,
  yMax = 60,
  yMin = -60,
  xMax = 162, // always 162 games
  labelsWidth = 200,
  labelsHeight = 25,
  labelPadding = 5,
  teamNameWidth = 90,
  teamRecordWidth = 20;

var speed = 350;

// Scales and Extent
var xScale = d3
  .scaleLinear()
  .domain([0, xMax]) // fixed domain because seasons always have about 162 games
  .range([0, lineChartWidth]);

var yScale = d3
  .scaleLinear()
  .domain([yMin, yMax]) // fixed domain so that center stays fixed as data changes
  .range([height, 10]);

var flatLine = d3
  .line()
  .x((d, i) => xScale(i))
  .y(d => yScale(d));

var flatLineValues = Array(163).fill(0);

function addTeamLines(division, divisionChart) {
  var teamRecordLine = d3
    .line()
    .x(d => xScale(d.games_played))
    .y(d => yScale(d.y_pt));

  var teamLines = divisionChart
    .selectAll("path")
    .data(division.values, d => d.key);

  teamLines.exit().remove();

  var teamLinesEnter = teamLines
    .enter()
    .append("path")
    .attr("class", "line")
    .style("stroke", d => teamColors[d.key])
    .attr("d", d => flatLine(flatLineValues));

  teamLines
    .merge(teamLinesEnter)
    .transition()
    .duration(speed)
    .ease(d3.easeLinear)
    .attr("d", d => teamRecordLine(d.values));
}

function addTeamLabels(finalRecordsSorted, divisionChart) {
  var teamLabels = divisionChart
    .selectAll("g")
    .data(finalRecordsSorted.values, d => d.team_short_name);

  teamLabels.exit().remove();
  // teamLabels.remove();

  var teamLabelsEnter = teamLabels
    .enter()
    .append("g")
    .attr("class", d => d.team_short_name.toLowerCase().replace(/\s+/g, "-"))
    .attr("height", labelsHeight)
    .attr("width", labelsWidth)
    .attr("fill", d => teamColors[d.team_short_name])
    .attr(
      "transform",
      "translate(" + xScale(xMax + labelPadding) + "," + yScale(0) + ")"
    );

  teamLabelsEnter
    .append("text")
    .attr("class", "win-diff")
    .attr("text-anchor", "end")
    .attr("width", 15)
    .attr("x", 10)
    .text(d => {
      var winDiff = d.wins - d.losses;
      return winDiff > 0 ? `+${winDiff}` : winDiff;
    });

  teamLabelsEnter
    .append("text")
    .attr("class", "team-name")
    .attr("x", 18)
    .text(d => d.team_short_name);

  teamLabelsEnter
    .append("text")
    .attr("class", "record")
    .attr("x", 100)
    .text(d => `${d.wins}-${d.losses}`);

  teamLabelsEnter
    .append("text")
    .attr("class", "pct")
    .attr("x", 146)
    .text(d => d.pct);

  teamLabels = teamLabels
    .merge(teamLabelsEnter)
    .transition()
    .duration(speed)
    .ease(d3.easeLinear)
    .attr("transform", function(d, i, arr) {
      var currYPt = d.y_pt;
      if (i > 0 && i < arr.length) {
        var previousTeam = arr[i - 1].__data__;
        var previousTeamYPt = previousTeam.y_pt;
        if (previousTeamYPt - currYPt <= 10) {
          d.y_pt = previousTeamYPt - 10;
        }
      }
      return `translate(${xScale(xMax + labelPadding)}, ${yScale(d.y_pt)})`;
    });

  // Update labels with new data
  teamLabels.select(".pct").text(d => d.pct);
  teamLabels.select(".record").text(d => `${d.wins}-${d.losses}`);
  teamLabels.select(".win-diff").text(d => {
    var winDiff = d.wins - d.losses;
    return winDiff > 0 ? `+${winDiff}` : winDiff;
  });
}

function updateChart(year) {
  d3.csv(`data/${year}-cumulative-season-games.csv`, function(error, data) {
    data.forEach(function(d) {
      d.games_played = +d.games_played;
      d.wins = +d.wins;
      d.losses = +d.losses;
      d.y_pt = d.wins - d.losses;
    });

    // Nest the data 2-levels by division and team
    var divisions = d3
      .nest()
      .key(d => d.division)
      .sortKeys()
      .key(d => d.team_short_name)
      .entries(data);

    // debugger;

    divisions.forEach(function(division) {
      var divisionChart = d3.select(
        `.${division.key.toLowerCase().replace(/\s+/g, "-")}`
      );
      var finalRecords = {
        key: division.key,
        values: division.values.map(team => team.values[team.values.length - 1])
      };
      var finalRecordsSorted = {
        key: finalRecords.key,
        values: _.orderBy(finalRecords.values, d => +d.pct, ["desc"])
      };

      var title = divisionChart
        .selectAll("text")
        .transition()
        .duration(speed)
        .attr("opacity", 1);

      // Teams
      addTeamLines(division, divisionChart);

      // Team Labels
      addTeamLabels(finalRecordsSorted, divisionChart);
    });
  });
}

function initCharts(year) {
  var divisionCharts = d3.select(".charts").selectAll("svg");

  var buttons = d3
    .select(".year-selector")
    .selectAll("button")
    .data(years);

  // Add year buttons
  buttons
    .enter()
    .append("button")
    .attr("data-year", d => d)
    .text(d => d)
    .attr("class", d => d == year && "selected");

  // Add flat .500 line
  divisionCharts
    .append("line")
    .style("stroke", "black")
    .attr("stroke-width", 0.2)
    .attr("opacity", 0)
    .attr("x1", xScale(0))
    .attr("x2", xScale(xMax + 1))
    .attr("y1", yScale(0))
    .attr("y2", yScale(0))
    .transition()
    .duration(speed)
    .attr("opacity", 1);
}

// Load the initial chart
initCharts(defaultYear);
updateChart(defaultYear);

const buttons = Array.from(document.querySelectorAll("button"));
buttons.forEach(button =>
  button.addEventListener("click", function(event) {
    document.querySelector(".selected").classList.remove("selected");
    this.classList.add("selected");
    var year = event.target.dataset.year;
    updateChart(year);
  })
);
