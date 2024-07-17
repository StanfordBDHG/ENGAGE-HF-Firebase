//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

// Average

export function average(values: number[]): number | undefined {
  return values.length === 0 ?
      undefined
    : values.reduce((a, b) => a + b, 0) / values.length
}

// Median

export function median(values: number[]): number | undefined {
  return presortedPercentile(
    [...values].sort((a, b) => a - b),
    0.5,
  )
}

export function presortedMedian(values: number[]): number | undefined {
  return presortedPercentile(values, 0.5)
}

export function percentile(
  values: number[],
  percentile: number,
): number | undefined {
  return presortedPercentile(
    [...values].sort((a, b) => a - b),
    percentile,
  )
}

export function presortedPercentile(
  values: number[],
  percentile: number,
): number | undefined {
  if (values.length === 0) return undefined
  const index = values.length * percentile
  const lowerIndex = Math.floor(index)
  const upperIndex = Math.ceil(index)

  if (lowerIndex === upperIndex) {
    return values[lowerIndex]
  } else {
    const weight = index - lowerIndex
    return values[lowerIndex] * (1 - weight) + values[upperIndex] * weight
  }
}

// Percentage

export function percentage<T>(
  values: T[],
  filter: (value: T) => boolean,
): number | undefined {
  const total = values.length
  if (total === 0) return undefined
  const count = values.filter(filter).length
  return (count / total) * 100
}
