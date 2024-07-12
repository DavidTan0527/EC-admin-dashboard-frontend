interface DataItem {
  [key: string]: any // Allows for any additional fields
}

enum Aggregator {
  SUM,
  AVG
}

/**
 * Generates a histogram based on the input and bucket fields, where the histogram values are either a summation of a given fields or an aggregator
 *
 * @param {DataItem[]} input The input table to get generate from.
 * @param {string|string[]} categoryField If it is a string, the histogram buckets are labelled by the value of that field in each `DataItem` in `input`. Otherwise, an array of field names are used for the buckets, with their aggregated values to be the histogram values.
 * @param {string|Aggregator} itemField If it is a string, it is the target field to be aggregated to the histogram values. Otherwise, an `Aggregator` can be specified when `categoryField` is an array.
 */
export default function (input: DataItem[], categoryField: keyof DataItem | string[], itemField? : keyof DataItem | Aggregator): { labels: string[], data: number[] } {
  const histogram: Record<string, number> = {}

  if (categoryField instanceof Array) {
    for (let field of categoryField) {
      histogram[field] = 0
    }

    if (input.length === 0) {
      return { labels: [], data: [] }
    }

    const normalize = (value : any) => typeof value !== "number" || isNaN(value) ? 0 : value
    switch (itemField) {
      case Aggregator.SUM:
        input.forEach(item => {
          for (let field of categoryField) {
            histogram[field] += normalize(item[field])
          }
        })
        break

      case Aggregator.AVG:
        input.forEach(item => {
          for (let field of categoryField) {
            histogram[field] += normalize(item[field])
          }
        })

        for (let field of categoryField) {
          histogram[field] /= input.length
          histogram[field] = parseFloat(histogram[field].toFixed(3))
        }

        break
    }



  } else {
    input.forEach(item => {
      const category = item[categoryField]
      if (category in histogram) {
        histogram[category] += typeof(itemField) !== 'undefined' ? (item[itemField!] ?? 0) : 1
      } else {
        histogram[category] = typeof(itemField) !== 'undefined' ? (item[itemField!] ?? 0) : 1
      }
    })
  }


  const labels = Object.keys(histogram) ?? []
  const data = Object.values(histogram) ?? []

  return { labels, data }
}

