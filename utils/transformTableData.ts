interface Table {
  data: Record<
    string,
    Record<
      string,
      Array<Record<string, any>>>> | undefined,
  rows: Array<{ [key: string]: any }> | undefined,
  [key: string]: any,
}

export default function (table: Table): Table {
  table.rows = []
  for (const [year, yearData] of Object.entries(table?.data ?? [])) {
    for (const [month, data] of Object.entries(yearData)) {
      table.rows = table.rows.concat(data.map(e => ({
        ...e,
        __DATA_TIMEBUCKET: new Date(parseInt(year), parseInt(month)-1, 1)
      })))
    }
  }
  return table
}
