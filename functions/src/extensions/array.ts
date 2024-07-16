// Average

export function average(values: number[]): number | undefined {
  return values.length === 0 ?
      undefined
    : values.reduce((a, b) => a + b, 0) / values.length
}

// Median

export function median(values: number[]): number | undefined {
  return presortedMedian([...values].sort((a, b) => a - b))
}

export function presortedMedian(values: number[]): number | undefined {
  if (values.length === 0) return undefined
  const middle = Math.floor(values.length * 0.5)
  return values.length % 2 === 0 ?
      (values[middle - 1] + values[middle]) * 0.5
    : values[middle]
}

export function upperMedian(values: number[]): number | undefined {
  return presortedUpperMedian([...values].sort((a, b) => a - b))
}

export function presortedUpperMedian(values: number[]): number | undefined {
  if (values.length === 0) return undefined
  const middle = Math.floor(values.length * 0.75)
  return values.length % 2 === 0 ?
      (values[middle - 1] + values[middle]) * 0.75
    : values[middle]
}

export function lowerMedian(values: number[]): number | undefined {
  return presortedLowerMedian([...values].sort((a, b) => a - b))
}

export function presortedLowerMedian(values: number[]): number | undefined {
  if (values.length === 0) return undefined
  const middle = Math.floor(values.length * 0.25)
  return values.length % 2 === 0 ?
      (values[middle - 1] + values[middle]) * 0.25
    : values[middle]
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
