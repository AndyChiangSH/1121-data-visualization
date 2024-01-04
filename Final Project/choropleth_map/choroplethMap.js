var start = false;
var addDays = 0;
var currentDataType = true;

var allData = {};
var allHandled = {};
var countries = [];
var idList = {};

var processedData = {};
var countryMapping = {};

var intervalId;

var totalNumberRange = [0,100000, 1000000, 10000000, 50000000, 300000000, 1000000000];
var totalNumberRangeText = [0,100000, "1M", "10M", "50M", "300M", "1B"];

var dailyNumberRange = [0,30000, 100000, 500000, 1000000, 5000000, 10000000];
var dailyNumberRangeText = [0,30000, 100000, 500000, "1M", "5M", "10M"];

const globalStartDate = new Date("2020-12-02");

var dateSlider = document.getElementById('dateSlider');

dateSlider.addEventListener('input', function() {

    var selectedValue = +dateSlider.value;
    addDays = selectedValue;
    if(start == false)
    {
        drawChoropleth();
    }
});


d3.csv("country_vaccinations.csv").then(function(csvData) 
{
    for(var i = 0; i < csvData.length; i++)
    {
      if(!allData.hasOwnProperty(csvData[i].date))
      {
          var dateObj = {};
          var temp = {};
          temp['id'] = csvData[i].iso_code;
          temp['total_vaccinations'] = +csvData[i].total_vaccinations;
          temp['daily_vaccinations'] = +csvData[i].daily_vaccinations;
          dateObj[temp['id']] = temp;
          allData[csvData[i].date] = dateObj;
      }
      else
      {
          var temp = {};
          temp['id'] = csvData[i].iso_code;
          temp['total_vaccinations'] = +csvData[i].total_vaccinations;
          temp['daily_vaccinations'] = +csvData[i].daily_vaccinations;
          allData[csvData[i].date][temp['id']] = temp;
      }
      if(!(idList.hasOwnProperty(csvData[i].iso_code)))
      {
        idList[csvData[i].iso_code] = 0;
      }
      if(!(countryMapping.hasOwnProperty(csvData[i].iso_code)))
      {
        countryMapping[csvData[i].iso_code] = csvData[i].country;
      }
    }

    d3.json("worldGeo.json").then(function(jsonData)
    {
      const startDate = new Date('2020-12-02');
      const endDate = new Date('2022-03-29');

      const currentDate = new Date(startDate);
      while (currentDate <= endDate) 
      {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1; 
          const day = currentDate.getDate();

          const dateString = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
          
          let copyArray = JSON.parse(JSON.stringify(jsonData['features']));

          for(var i = 0; i < copyArray.length; i++)
          {
            copyArray[i].daily = 0;
            var haveData = false;
            for (var key of Object.keys(allData[dateString])) 
            {
              if(key == copyArray[i].id)
              {
                if(allData[dateString][key]['total_vaccinations'] == 0)
                {
                  idList[key] += allData[dateString][key]['daily_vaccinations']
                  copyArray[i].total = idList[key];
                }
                else
                {
                  idList[key] = allData[dateString][key]['total_vaccinations'];
                  copyArray[i].total = allData[dateString][key]['total_vaccinations'];
                }
                copyArray[i].daily = allData[dateString][key]['daily_vaccinations'];
                haveData = true;
                break;
              }
            }
            if(haveData == false)
            {
              copyArray[i].total = idList[copyArray[i].id];
            }
          }
          processedData[dateString] = copyArray;
          currentDate.setDate(currentDate.getDate() + 1);
      }
      drawChoropleth();

    });
});

// The svg
const svg = d3.select("#worldMap"),
width = +svg.attr("width"),
height = +svg.attr("height");

// Map and projection
const path = d3.geoPath();
const projection = d3.geoMercator()
.scale(140)
.center([0,37])
.translate([width / 2, height / 2]);

// Data and color scale
const totalColorScale = d3.scaleThreshold()
.domain([100000, 1000000, 10000000, 50000000, 300000000, 1000000000])
.range(d3.schemeGreens[7]);

const dailyColorScale = d3.scaleThreshold()
.domain([30000, 100000, 500000, 1000000, 5000000, 10000000])
.range(d3.schemeOranges[7]);

var tooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);


function drawChoropleth()
{
  var originalSVG = d3.select("#worldMap");
  originalSVG.selectAll("*").remove();

  var currentDate = new Date("2020-12-02");
  currentDate.setDate(currentDate.getDate() + addDays);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; 
  const day = currentDate.getDate();
  const dateStr = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;

  var mapData = processedData[dateStr];

  var dataMapping = new Map();


  for(var i = 0; i < mapData.length; i++)
  {
    if(currentDataType == true)
    {
      dataMapping.set(mapData[i].id, mapData[i].total);
    }
    else
    {
      dataMapping.set(mapData[i].id, mapData[i].daily);
    }
    
  }

  svg.append("text")
  .attr("x", width - 20)
  .attr("y", 30)
  .attr("text-anchor", "end")
  .attr("font-size", "24px")   
  .text(dateStr);

  var totalButtonGroup = svg.append("g")
    .attr("cursor", "pointer")
    .on("mouseover", function() {
      if(currentDataType == false)
      {
        totalButton.attr("fill", "rgb(242,242,242)");
      }
    })
    .on("mouseout", function() {
      if(currentDataType == false)
      {
        totalButton.attr("fill", "white");
      }
    })
    .on("mousedown", function() {
      if(currentDataType == false)
      {
        totalButton.attr("fill", "rgb(200,200,200)");
      }
    })
    .on("click", function() {
      if(currentDataType == false)
      {
        currentDataType = true;
        totalButton.attr("fill", "rgb(173, 255, 232)");
        dailyButton.attr("fill",  "white");
        drawChoropleth();
      }
    });

  var totalButton = totalButtonGroup.append("rect")
    .attr("x", 10)
    .attr("y", 10)
    .attr("width", 70)
    .attr("height", 30)
    .attr("rx", 15)  // 圓角半徑 x
    .attr("ry", 15)  // 圓角半徑 y
    .attr("fill", currentDataType ? "rgb(173, 255, 232)" : "white")
    .attr("stroke", "black")  // 邊框顏色
    .attr("stroke-width", 2);  // 邊框寬度

  totalButtonGroup.append("text")
    .attr("x", 45)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("fill", "rgb(110,110,110)")
    .text("Total");


var dailyButtonGroup = svg.append("g")
    .attr("cursor", "pointer")
    .on("mouseover", function() {
      if(currentDataType == true)
      {
        dailyButton.attr("fill", "rgb(242,242,242)");
      }
    })
    .on("mouseout", function() {
      if(currentDataType == true)
      {
        dailyButton.attr("fill", "white");
      }
    })
    .on("mousedown", function() {
      if(currentDataType == true)
      {
        dailyButton.attr("fill", "rgb(200,200,200)");
      }
    })
    .on("click", function() {
      if(currentDataType == true)
      {
        currentDataType = false;
        dailyButton.attr("fill", "rgb(173, 255, 232)");
        totalButton.attr("fill",  "white");
        drawChoropleth();
      }
    });

var dailyButton = dailyButtonGroup.append("rect")
    .attr("x", 90)
    .attr("y", 10)
    .attr("width", 70)
    .attr("height", 30)
    .attr("rx", 15)  // 圓角半徑 x
    .attr("ry", 15)  // 圓角半徑 y
    .attr("fill", currentDataType ? "white" : "rgb(173, 255, 232)")
    .attr("stroke", "black")  // 邊框顏色
    .attr("stroke-width", 2);  // 邊框寬度

dailyButtonGroup.append("text")
    .attr("x", 125)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("fill", "rgb(110,110,110)")
    .text("Daily");

  for(var i = 0; i < 7; i++)
  {
    svg.append("rect")
      .attr("x", i*100 + 100)
      .attr("y", 625)
      .attr("width", 100)
      .attr("height", 15)
      .attr("stroke", "#333")
      .attr("fill", currentDataType  ? totalColorScale(totalNumberRange[i]) : dailyColorScale(dailyNumberRange[i]) );
    svg.append("text")
      .text(currentDataType ? totalNumberRangeText[i] : dailyNumberRangeText[i])  
      .attr("x", i * 100 + 100)   // 調整 x 位置以使文本位於矩形開頭
      .attr("y", 615)             // 調整 y 位置以使文本位於矩形上方中心
      .attr("text-anchor", "middle")  // 設置 text-anchor 為 start，使文本位於指定 x 位置的開頭
      .attr("fill", "#333");
  }

  svg.append("rect")
  .attr("x", width - 20)
  .attr("y", 30)
  .attr("text-anchor", "end")
  .attr("font-size", "24px")   
  .text(dateStr);
  
  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(mapData)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        
        if(currentDataType)
        {
          d.total = dataMapping.get(d.id) || 0;
          return totalColorScale(d.total);
        }
        else
        {
          d.daily = dataMapping.get(d.id) || 0;
          return dailyColorScale(d.daily);
        }
      })
      .style("stroke", "rgba(0, 0, 0, 0.1)")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
      .on("mouseover", function (event, d){ 
          d3.selectAll(".Country")
          .style("opacity", .5)
          .style("stroke", "rgba(0, 0, 0, 0.1)")
          d3.select(this)
            .style("opacity", 1)
            .style("stroke", "black")
          
          var tooltipText =  "<span>Country: " + countryMapping[d.id] + "</span>";
          if(currentDataType == true)
          {
              tooltipText += "<span>Total Vaccinations: " + d.total + "</span>";
          }
          else
          {
              tooltipText += "<span>Daily Vaccinations: " + d.daily + "</span>";
          }
          

          var xPosition = event.pageX  + 10; 
          var yPosition = event.pageY  - 90; 

          tooltip.html(tooltipText)
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .style("opacity", 1);
      })
      .on("mouseleave", function(event, d){
        d3.selectAll(".Country")
          .style("opacity", 1)
          .style("stroke", "rgba(0, 0, 0, 0.1)")
        tooltip.style("opacity", 0);
      })
      .on("mousemove", function(event, d){
          d3.selectAll(".Country")
          .style("opacity", .5)
          .style("stroke", "rgba(0, 0, 0, 0.1)")
          d3.select(this)
          .style("opacity", 1)
          .style("stroke", "black")

          var tooltipText =  "<span>Country: " + countryMapping[d.id] + "</span>";
          if(currentDataType == true)
          {
              tooltipText += "<span>Total Vaccinations: " + d.total + "</span>";
          }
          else
          {
              tooltipText += "<span>Daily Vaccinations: " + d.daily + "</span>";
          }

          var xPosition = event.pageX  + 10; 
          var yPosition = event.pageY  - 90; 

          tooltip.html(tooltipText)
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .style("opacity", 1);
      })
}

function updateChoropleth()
{
  drawChoropleth();
  dateSlider.value = addDays;

  if(addDays == 482) //stop
  {
    clearInterval(intervalId);
    var buttonImage = document.getElementById('buttonImage');
    buttonImage.src = 'play-button.png';
    start = false;
  }
  else
  {
      addDays++;
  }
}


function startDate() 
{
  var buttonImage = document.getElementById('buttonImage');
  if(start == true)
  {
    buttonImage.src = 'play-button.png';
    clearInterval(intervalId);
  }
  else
  {
    buttonImage.src = 'stop-button.png'; 
    intervalId = setInterval(updateChoropleth, 100);
  }
  start  = !start;
}
