import * as d3 from 'd3'
import { JSDOM } from 'jsdom'
import { type KccqScore } from '../models/kccqScore.js'

export function generateSpeedometerSvg(
  scores: KccqScore[],
  width: number,
): string {
  const recentScore = scores.length >= 1 ? scores[scores.length - 1] : undefined
  const previousScore =
    scores.length >= 2 ? scores[scores.length - 2] : undefined
  const generator = new SpeedometerSvgGenerator(width)
  const markers: Array<{ percentage: number; color: string }> = []
  if (recentScore) {
    generator.addCurrentScoreLabel(recentScore.overallScore)
    markers.push({
      percentage: recentScore.overallScore,
      color: generator.primaryColor,
    })
    if (previousScore) {
      generator.addTrendLabel(
        recentScore.overallScore - previousScore.overallScore,
      )
      markers.push({
        percentage: previousScore.overallScore,
        color: generator.secondaryColor,
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

  constructor(width: number) {
    this.margins = {
      top: width * 0.05,
      right: width * 0.05,
      bottom: width * 0.05,
      left: width * 0.05,
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

  addArc(markers: Array<{ percentage: number; color: string }>) {
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
        .attr('stroke-width', 4)
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
    const legendFontSize = 8
    const legendMargin = this.legendHeight - legendFontSize
    const legendBaselineY =
      this.margins.top + this.innerSize.height + legendFontSize + legendMargin
    const legendLineLength = this.size.width * 0.075
    const legendLinesY = legendBaselineY - legendFontSize / 2

    this.svg
      .append('text')
      .attr('x', this.margins.left + this.size.width * 0.1)
      .attr('y', legendBaselineY)
      .style('text-anchor', 'left')
      .style('font-size', `${legendFontSize}pt`)
      .text('Previous')

    const previousPath = `M ${this.margins.left} ${legendLinesY} L ${this.margins.left + legendLineLength} ${legendLinesY}`
    this.svg
      .append('path')
      .attr('d', previousPath)
      .attr('stroke-width', 2)
      .attr('stroke', this.secondaryColor)
      .attr('fill', 'none')

    this.svg
      .append('text')
      .attr('x', this.size.width * 0.6)
      .attr('y', legendBaselineY)
      .style('text-anchor', 'left')
      .style('font-size', `${legendFontSize}pt`)
      .text('Current')

    const currentPath = `M ${this.size.width / 2} ${legendLinesY} L ${this.size.width / 2 + legendLineLength} ${legendLinesY}`
    this.svg
      .append('path')
      .attr('d', currentPath)
      .attr('stroke-width', 2)
      .attr('stroke', this.primaryColor)
      .attr('fill', 'none')
  }

  finish(): string {
    const result = this.body.html()
    console.log(result)
    return result
  }
}
