interface DataItem {
  [key: string]: any // Allows for any additional fields
}

export default function (data: DataItem[], categoryField: keyof DataItem, itemField? : keyof DataItem): { labels: string[], counts: number[] } {
  const histogram: Record<string, number> = {}

  data.forEach(item => {
    const category = item[categoryField]
    if (category in histogram) {
      histogram[category] += typeof(itemField) !== 'undefined' ? (item[itemField!] ?? 0) : 1
    } else {
      histogram[category] = typeof(itemField) !== 'undefined' ? (item[itemField!] ?? 0) : 1
    }
  })

  const labels = Object.keys(histogram)
  const counts = Object.values(histogram)

  return { labels, counts }
}

