import * as d3 from 'd3'
import { JSDOM } from 'jsdom'
import { type KccqScore } from '../models/kccqScore.js'

export function generateSpeedometerSvg(
  scores: KccqScore[],
  width: number,
): string {
  const baselineScore = scores.length >= 1 ? scores[0] : undefined
  const recentScore = scores.length >= 1 ? scores[scores.length - 1] : undefined
  const previousScore =
    scores.length >= 2 ? scores[scores.length - 2] : undefined
  const generator = new SpeedometerSvgGenerator(width)
  const markers: Array<{
    percentage: number
    color: string
    isDashed: boolean
  }> = []
  if (baselineScore) {
    markers.push({
      percentage: baselineScore.overallScore,
      color: generator.secondaryColor,
      isDashed: true,
    })
  }
  if (recentScore) {
    generator.addCurrentScoreLabel(recentScore.overallScore)
    markers.push({
      percentage: recentScore.overallScore,
      color: generator.primaryColor,
      isDashed: false,
    })
    if (previousScore) {
      generator.addTrendLabel(
        recentScore.overallScore - previousScore.overallScore,
      )
      markers.push({
        percentage: previousScore.overallScore,
        color: generator.secondaryColor,
        isDashed: false,
      })
    }
  }
  generator.addArc(markers)
  generator.addZeroLabel()
  generator.addLegend()
  return generator.finish()
}

class SpeedometerSvgGenerator {
  primaryColor = 'rgb(0,121,251)'
  secondaryColor = 'rgb(145,145,145)'
  positiveColor = 'rgb(0,127,63)'
  negativeColor = 'rgb(255,0,31)'
  trendFontSize = 10

  dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
  body = d3.select(this.dom.window.document).select('body')
  svg: d3.Selection<SVGGElement, unknown, null, undefined>
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>

  margins: { top: number; right: number; bottom: number; left: number }
  size: { width: number; height: number }
  innerSize: { width: number; height: number }
  legendHeight = 20
  arcWidth: number
  innerArcRadius: number
  outerArcRadius: number
  markerLineWidth: number

  constructor(width: number) {
    this.margins = {
      top: width * 0.01,
      right: width * 0.1,
      bottom: width * 0.05,
      left: width * 0.1,
    }
    const innerWidth = width - this.margins.left - this.margins.right
    this.innerSize = {
      width: innerWidth,
      height: innerWidth / 2,
    }
    this.size = {
      width,
      height:
        this.margins.top +
        this.innerSize.height +
        this.legendHeight +
        this.margins.bottom,
    }
    this.arcWidth = width * 0.05
    this.markerLineWidth = this.arcWidth / 3.5
    this.outerArcRadius = Math.min(
      this.innerSize.width / 2,
      this.innerSize.height,
    )
    this.innerArcRadius = this.outerArcRadius - this.arcWidth
    this.svg = this.body
      .append('svg')
      .attr('width', this.size.width)
      .attr('height', this.size.height)
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .append('g')
    this.defs = this.svg.append('defs')
  }

  addArc(
    markers: Array<{ percentage: number; color: string; isDashed: boolean }>,
  ) {
    const gradientId = 'gradient'
    const gradient = this.defs.append('linearGradient').attr('id', gradientId)
    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgb(255,0,31)')
    gradient
      .append('stop')
      .attr('offset', '50%')
      .attr('stop-color', 'rgb(255,191,47)')
    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgb(0,127,63)')

    console.log(this.innerArcRadius, ' ', this.outerArcRadius, this.size.width)
    this.svg
      .append('path')
      .attr(
        'transform',
        `translate(${this.margins.left + this.innerSize.width / 2}, ${this.margins.top + this.innerSize.height})`,
      )
      .style('fill', `url(#${gradientId})`)
      .attr(
        'd',
        d3.arc()({
          innerRadius: this.innerArcRadius,
          outerRadius: this.outerArcRadius,
          startAngle: -Math.PI / 2,
          endAngle: Math.PI / 2,
        }),
      )

    const arcWidth = this.arcWidth
    const middleArcRadius = this.innerArcRadius + arcWidth / 2
    const arcCenter = {
      x: this.margins.left + this.innerSize.width / 2,
      y: this.margins.top + this.innerSize.height,
    }
    for (const marker of markers) {
      console.log(marker)
      const path = `M ${arcCenter.x - arcWidth} ${arcCenter.y} L ${arcCenter.x + arcWidth} ${arcCenter.y}`
      const rotation = (marker.percentage / 100) * 180 - 180
      const translationX =
        middleArcRadius * Math.cos((rotation * Math.PI) / 180)
      const translationY =
        middleArcRadius * Math.sin((rotation * Math.PI) / 180)
      const transform = `translate(${translationX},${translationY}) rotate(${rotation},${arcCenter.x},${arcCenter.y})`
      this.svg
        .append('path')
        .attr('d', path)
        .attr(
          'stroke-dasharray',
          marker.isDashed ?
            `${this.markerLineWidth},${this.markerLineWidth}`
          : 'none',
        )
        .attr('stroke-width', this.markerLineWidth)
        .attr('stroke', marker.color)
        .attr('fill', 'none')
        .attr('transform', transform)
    }
  }

  addCurrentScoreLabel(score: number) {
    const scoreText = this.svg
      .append('text')
      .attr('x', this.margins.left + this.innerSize.width / 2)
      .attr(
        'y',
        this.margins.top + this.innerSize.height - this.trendFontSize - 24,
      )
      .style('text-anchor', 'middle')
      .style('font-size', '36pt')
      .style('font-weight', 'bold')
      .style('fill', this.primaryColor)
      .text(score.toFixed(0))

    scoreText.append('tspan').style('font-size', '18pt').text('  %')
  }

  addTrendLabel(trend: number) {
    const trendIcon = trend >= 0 ? '▲' : '▼'
    const trendText = this.svg
      .append('text')
      .attr('x', this.margins.left + this.innerSize.width / 2)
      .attr('y', this.margins.top + this.innerSize.height - 4)
      .style('text-anchor', 'middle')
      .style('font-size', `${this.trendFontSize}pt`)
    trendText
      .append('tspan')
      .style('fill', trend >= 0 ? this.positiveColor : this.negativeColor)
      .text(
        trendIcon + (trend >= 0 ? '+' : '-') + Math.abs(trend).toFixed(0) + '%',
      )
    trendText.append('tspan').text(' from previous')
  }

  addZeroLabel() {
    this.svg
      .append('text')
      .attr('x', this.margins.left + this.arcWidth + 4)
      .attr('y', this.margins.top + this.innerSize.height - 4)
      .style('text-anchor', 'left')
      .style('font-size', '8pt')
      .style('font-weight', 'bold')
      .style('stroke', this.secondaryColor)
      .text('0%')
  }

  addLegend() {
    this.addLegendItem(0, 3, 'Baseline', this.secondaryColor, true)
    this.addLegendItem(1, 3, 'Previous', this.secondaryColor)
    this.addLegendItem(2, 3, 'Current', this.primaryColor)
  }

  addLegendItem(
    index: number,
    count: number,
    title: string,
    color: string,
    isDashed = false,
  ) {
    const legendFontSize = 8
    const legendMargin = this.legendHeight - legendFontSize
    const legendBaselineY =
      this.margins.top + this.innerSize.height + legendFontSize + legendMargin
    const legendLineLength = this.arcWidth * 1.5
    const legendLinePadding = this.markerLineWidth
    const legendLinesY = legendBaselineY - legendFontSize / 2
    const itemWidth = this.innerSize.width / count

    const lineStartX = this.margins.left + itemWidth * index
    const lineEndX = lineStartX + legendLineLength
    const textStartX = lineEndX + legendLinePadding
    this.svg
      .append('text')
      .attr('x', textStartX)
      .attr('y', legendBaselineY)
      .style('text-anchor', 'left')
      .style('font-size', `${legendFontSize}pt`)
      .text(title)

    const currentPath = `M ${lineStartX} ${legendLinesY} L ${lineEndX} ${legendLinesY}`
    this.svg
      .append('path')
      .attr('d', currentPath)
      .attr(
        'stroke-dasharray',
        isDashed ? `${this.markerLineWidth},${this.markerLineWidth}` : 'none',
      )
      .attr('stroke-width', this.markerLineWidth)
      .attr('stroke', color)
      .attr('fill', 'none')
  }

  finish(): string {
    const result = this.body.html()
    console.log(result)
    return result
  }
}
