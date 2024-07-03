import assert from 'assert'
import { describe, it } from 'mocha'
import { generateChartSvg } from './generateChart.js'
import { mockHealthSummaryData } from '../tests/mocks/healthSummaryData.js'

describe('generateChart', () => {
  it('should generate the same chart on mock data', () => {
    const data = mockHealthSummaryData()
    const svg = generateChartSvg(
      data.vitals.bodyWeight,
      { width: 258, height: 193.5 },
      { top: 20, right: 40, bottom: 40, left: 40 },
      267.5,
    )
    assert.equal(
      svg,
      '<svg width="258" height="193.5" xmlns="http://www.w3.org/2000/svg"><g transform="translate(40, 20)"><g class="x axis axis-grid" style="stroke-width: 0.5; stroke: rgb(211, 211, 211);" transform="translate(0,133.5)" fill="none" font-size="10" font-family="sans-serif" text-anchor="middle"><path class="domain" stroke="currentColor" d="M0.5,-133.5V0.5H178.5V-133.5"></path><g class="tick" opacity="1" transform="translate(7.916666666666666,0)"><line stroke="currentColor" y2="-133.5"></line><text fill="currentColor" y="3" dy="0.71em" style="text-anchor: end;" transform="rotate(-45)">01/24</text></g><g class="tick" opacity="1" transform="translate(30.166666666666664,0)"><line stroke="currentColor" y2="-133.5"></line><text fill="currentColor" y="3" dy="0.71em" style="text-anchor: end;" transform="rotate(-45)">01/25</text></g><g class="tick" opacity="1" transform="translate(52.41666666666667,0)"><line stroke="currentColor" y2="-133.5"></line><text fill="currentColor" y="3" dy="0.71em" style="text-anchor: end;" transform="rotate(-45)">01/26</text></g><g class="tick" opacity="1" transform="translate(74.66666666666667,0)"><line stroke="currentColor" y2="-133.5"></line><text fill="currentColor" y="3" dy="0.71em" style="text-anchor: end;" transform="rotate(-45)">01/27</text></g><g class="tick" opacity="1" transform="translate(96.91666666666666,0)"><line stroke="currentColor" y2="-133.5"></line><text fill="currentColor" y="3" dy="0.71em" style="text-anchor: end;" transform="rotate(-45)">01/28</text></g><g class="tick" opacity="1" transform="translate(119.16666666666666,0)"><line stroke="currentColor" y2="-133.5"></line><text fill="currentColor" y="3" dy="0.71em" style="text-anchor: end;" transform="rotate(-45)">01/29</text></g><g class="tick" opacity="1" transform="translate(141.41666666666666,0)"><line stroke="currentColor" y2="-133.5"></line><text fill="currentColor" y="3" dy="0.71em" style="text-anchor: end;" transform="rotate(-45)">01/30</text></g><g class="tick" opacity="1" transform="translate(163.66666666666666,0)"><line stroke="currentColor" y2="-133.5"></line><text fill="currentColor" y="3" dy="0.71em" style="text-anchor: end;" transform="rotate(-45)">01/31</text></g></g><g class="y axis" style="stroke-width: 0.5; stroke: rgb(211, 211, 211);" fill="none" font-size="10" font-family="sans-serif" text-anchor="end"><path class="domain" stroke="currentColor" d="M178,134H0.5V0.5H178"></path><g class="tick" opacity="1" transform="translate(0,114.92857142857123)"><line stroke="currentColor" x2="178"></line><text fill="currentColor" x="-3" dy="0.32em">265</text></g><g class="tick" opacity="1" transform="translate(0,91.08928571428561)"><line stroke="currentColor" x2="178"></line><text fill="currentColor" x="-3" dy="0.32em">266</text></g><g class="tick" opacity="1" transform="translate(0,67.25)"><line stroke="currentColor" x2="178"></line><text fill="currentColor" x="-3" dy="0.32em">267</text></g><g class="tick" opacity="1" transform="translate(0,43.410714285714384)"><line stroke="currentColor" x2="178"></line><text fill="currentColor" x="-3" dy="0.32em">268</text></g><g class="tick" opacity="1" transform="translate(0,19.571428571428772)"><line stroke="currentColor" x2="178"></line><text fill="currentColor" x="-3" dy="0.32em">269</text></g></g><path fill="none" stroke="rgb(57, 101, 174)" stroke-width="2" d="M178,19.071L155.75,66.75L133.5,66.75L111.25,114.429L89,42.911L66.75,42.911L44.5,90.589L22.25,90.589L0,66.75"></path><path fill="none" stroke-dasharray="4,4" stroke="rgb(255, 0, 0)" stroke-width="2" d="M178,54.83L0,54.83"></path></g></svg>',
    )
  })

  it('should generate an empty chart the same way', () => {
    const svg = generateChartSvg(
      [],
      { width: 258, height: 193.5 },
      { top: 20, right: 40, bottom: 40, left: 40 },
    )
    assert.equal(
      svg,
      '<svg width="258" height="193.5" xmlns="http://www.w3.org/2000/svg"><g transform="translate(40, 20)"></g></svg>',
    )
  })
})
