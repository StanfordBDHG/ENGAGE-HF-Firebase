
import assert from 'assert'
import { describe, it } from 'mocha'
import { mockHealthSummaryData } from '../tests/mocks/healthSummaryData.js'
import { generateSpeedometerSvg } from './generateSpeedometer.js'

describe('generateSpeedometer', () => {
  it('should generate the same chart on mock data', () => {
    const data = mockHealthSummaryData()
    const svg = generateSpeedometerSvg(
      data.symptomScores,
      258
    )
    assert.equal(
      svg,
      '<svg width="258" height="138.67999999999998" xmlns="http://www.w3.org/2000/svg"><g><defs><linearGradient id="gradient"><stop offset="0%" stop-color="rgb(255,0,31)"></stop><stop offset="50%" stop-color="rgb(255,191,47)"></stop><stop offset="100%" stop-color="rgb(0,127,63)"></stop></linearGradient></defs><text x="129" y="71.77999999999999" style="text-anchor: middle; font-size: 36pt; font-weight: bold; fill: rgb(0,121,251);">75<tspan style="font-size: 18pt;">  %</tspan></text><text x="129" y="101.77999999999999" style="text-anchor: middle; font-size: 10pt;"><tspan style="fill: rgb(0,127,63);">▲+31%</tspan><tspan> from previous</tspan></text><path transform="translate(129, 105.77999999999999)" style="fill: url(#gradient);" d="M-103.2,0A103.2,103.2,0,1,1,103.2,0L90.3,0A90.3,90.3,0,1,0,-90.3,0Z"></path><path d="M 116.1 105.77999999999999 L 141.9 105.77999999999999" stroke-dasharray="3.685714285714286,3.685714285714286" stroke-width="3.685714285714286" stroke="rgb(145,145,145)" fill="none" transform="translate(-29.897394205776152,-92.01471795155611) rotate(-108,129,105.77999999999999)"></path><path d="M 116.1 105.77999999999999 L 141.9 105.77999999999999" stroke-dasharray="none" stroke-width="3.685714285714286" stroke="rgb(0,121,251)" fill="none" transform="translate(68.41258107979847,-68.41258107979846) rotate(-45,129,105.77999999999999)"></path><path d="M 116.1 105.77999999999999 L 141.9 105.77999999999999" stroke-dasharray="none" stroke-width="3.685714285714286" stroke="rgb(145,145,145)" fill="none" transform="translate(-18.12914218616883,-95.03629150800062) rotate(-100.8,129,105.77999999999999)"></path><text x="42.7" y="101.77999999999999" style="text-anchor: left; font-size: 8pt; font-weight: bold; stroke: rgb(145,145,145);">0%</text><text x="48.83571428571429" y="125.77999999999999" style="text-anchor: left; font-size: 8pt;">Baseline</text><path d="M 25.8 121.77999999999999 L 45.150000000000006 121.77999999999999" stroke-dasharray="3.685714285714286,3.685714285714286" stroke-width="3.685714285714286" stroke="rgb(145,145,145)" fill="none"></path><text x="117.63571428571427" y="125.77999999999999" style="text-anchor: left; font-size: 8pt;">Previous</text><path d="M 94.6 121.77999999999999 L 113.94999999999999 121.77999999999999" stroke-dasharray="none" stroke-width="3.685714285714286" stroke="rgb(145,145,145)" fill="none"></path><text x="186.43571428571428" y="125.77999999999999" style="text-anchor: left; font-size: 8pt;">Current</text><path d="M 163.4 121.77999999999999 L 182.75 121.77999999999999" stroke-dasharray="none" stroke-width="3.685714285714286" stroke="rgb(0,121,251)" fill="none"></path></g></svg>',
    )
  })

  it('should generate an empty chart the same way', () => {
    const svg = generateSpeedometerSvg(
      [],
      258
    )
    assert.equal(
      svg,
      '<svg width="258" height="138.67999999999998" xmlns="http://www.w3.org/2000/svg"><g><defs><linearGradient id="gradient"><stop offset="0%" stop-color="rgb(255,0,31)"></stop><stop offset="50%" stop-color="rgb(255,191,47)"></stop><stop offset="100%" stop-color="rgb(0,127,63)"></stop></linearGradient></defs><path transform="translate(129, 105.77999999999999)" style="fill: url(#gradient);" d="M-103.2,0A103.2,103.2,0,1,1,103.2,0L90.3,0A90.3,90.3,0,1,0,-90.3,0Z"></path><text x="42.7" y="101.77999999999999" style="text-anchor: left; font-size: 8pt; font-weight: bold; stroke: rgb(145,145,145);">0%</text><text x="48.83571428571429" y="125.77999999999999" style="text-anchor: left; font-size: 8pt;">Baseline</text><path d="M 25.8 121.77999999999999 L 45.150000000000006 121.77999999999999" stroke-dasharray="3.685714285714286,3.685714285714286" stroke-width="3.685714285714286" stroke="rgb(145,145,145)" fill="none"></path><text x="117.63571428571427" y="125.77999999999999" style="text-anchor: left; font-size: 8pt;">Previous</text><path d="M 94.6 121.77999999999999 L 113.94999999999999 121.77999999999999" stroke-dasharray="none" stroke-width="3.685714285714286" stroke="rgb(145,145,145)" fill="none"></path><text x="186.43571428571428" y="125.77999999999999" style="text-anchor: left; font-size: 8pt;">Current</text><path d="M 163.4 121.77999999999999 L 182.75 121.77999999999999" stroke-dasharray="none" stroke-width="3.685714285714286" stroke="rgb(0,121,251)" fill="none"></path></g></svg>',
    )
  })
})
