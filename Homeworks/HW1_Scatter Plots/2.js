// 散點圖一
// 先取資料
async function getData() {
  // const cors = "https://secret-ocean-49799.herokuapp.com/";
  // const url = 'https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv'

  // dataGet = await d3.csv(`${cors}${url}`);

  const url = "./iris.csv"

  let data = await d3.csv(url);

  scatter1(data)
}

// 建立圖表
function scatter1(data) {
  // RWD 清除原本的圖型
  d3.select(".scatter1").select('svg').remove()

  // 建立 svg
  const svgWidth = parseInt(d3.select('.scatter1').style('width'))
  const svgHeight = svgWidth
  const margin = 50
  const svg = d3.select('.scatter1')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)

  const x_label = "sepal length"
  const y_label = "sepal width"

  // 找出 X 和 Y 的最大值
  let x_max = 0
  let y_max = 0
  for(let i = 0; i < data.length; i++) {
    if(data[i][x_label] > x_max) {
      x_max = data[i][x_label]
    }
    if(data[i][y_label] > y_max) {
      y_max = data[i][y_label]
    }
  }
  console.log(x_max, y_max)

  // 建立X軸線
  const xScale = d3.scaleLinear()
    .domain([0, Math.ceil(x_max)])
    .range([0, (svgWidth - margin * 2)])

  const xAxis = d3.axisBottom(xScale)

  svg.append('g')
    .attr('transform', `translate(${margin}, ${svgHeight - margin / 2})`)
    .call(xAxis)

  // Add X axis label:
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", svgWidth)
    .attr("y", svgHeight + margin + 20)
    .text("X axis title");

  // 建立Y軸線
  console.log(data)
  const yScale = d3.scaleLinear()
    .domain([0, Math.ceil(y_max)])
    .range([(svgHeight - margin), 0])

  const yAxis = d3.axisLeft(yScale)

  svg.append('g')
    .attr('transform', `translate(${margin}, ${margin / 2})`)
    .call(yAxis)

  // Y axis label:
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin+20)
    .attr("x", -margin)
    .text("Y axis title")

  // 加上點點
  svg.append('g')
    .selectAll('dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d[x_label]))
    .attr('cy', d => yScale(d[y_label]))
    .attr('r', 2)
    .style('fill', d => {
      if(d["class"] == "Iris-setosa") return "red";
      if(d["class"] == "Iris-versicolor") return "green";
      if(d["class"] == "Iris-virginica") return "blue";
    })
}

getData()