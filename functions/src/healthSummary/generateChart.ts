import * as d3 from 'd3'
import { JSDOM } from 'jsdom'

export function generateChartSvg(
  data: Observation[],
  size: { width: number; height: number },
  margins: { top: number; right: number; bottom: number; left: number },
): string {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
  const body = d3.select(dom.window.document).select('body')

  const primaryColor = 'rgb(57, 101, 174)'
  const secondaryColor = 'rgb(211, 211, 211)'
  const gridLineWidth = 0.5
  const innerWidth = size.width - margins.left - margins.right
  const innerHeight = size.height - margins.top - margins.bottom

  const svg = body
    .append('svg')
    .attr('width', size.width)
    .attr('height', size.height)
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .append('g')
    .attr('transform', `translate(${margins.left}, ${margins.top})`)

  const xAxisScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date) as [Date, Date])
    .range([0, innerWidth])
  const xAxis = d3
    .axisBottom(xAxisScale)
    .tickFormat((date) => d3.timeFormat('%m/%d')(date as Date))
    .tickSize(-innerHeight)
    .ticks(data.length)
  svg
    .append('g')
    .attr('class', 'x axis axis-grid')
    .style('stroke-width', gridLineWidth)
    .style('stroke', secondaryColor)
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('transform', 'rotate(-45)')

  const yAxisExtent = d3.extent(data, (d) => d.value) as [number, number]
  const yAxisExtentSize = yAxisExtent[1] - yAxisExtent[0]
  const yAxisScale = d3
    .scaleLinear()
    .domain([
      yAxisExtent[0] - yAxisExtentSize * 0.2,
      yAxisExtent[1] + yAxisExtentSize * 0.2,
    ])
    .range([innerHeight, 0])
  const yAxis = d3.axisLeft(yAxisScale).ticks(5).tickSize(-innerWidth)
  svg
    .append('g')
    .attr('class', 'y axis')
    .style('stroke-width', gridLineWidth)
    .style('stroke', secondaryColor)
    .call(yAxis)

  const line = d3
    .line<Observation>()
    .x((d) => xAxisScale(d.date))
    .y((d) => yAxisScale(d.value))
  svg
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', primaryColor)
    .attr('stroke-width', 2)
    .attr('d', line)

  return body.html()
}
