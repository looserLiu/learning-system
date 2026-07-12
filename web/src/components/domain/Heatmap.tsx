interface HeatmapData {
  date: string
  count: number
  level: number
}

interface Props {
  data: HeatmapData[]
}

const LEVEL_COLORS = [
  'bg-gray-100',
  'bg-primary-200',
  'bg-primary-400',
  'bg-primary-600',
]

export function Heatmap({ data }: Props) {
  // Get last 52 weeks of data
  const weeks = getWeeks(data)
  
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                className={`w-3 h-3 rounded-sm ${day ? LEVEL_COLORS[day.level] : 'bg-gray-50'}`}
                title={day ? `${day.date}: ${day.count} sessions` : ''}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
        <span>Less</span>
        {LEVEL_COLORS.map((color, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

function getWeeks(data: HeatmapData[]): (HeatmapData | null)[][] {
  const result: (HeatmapData | null)[][] = []
  const today = new Date()
  const map = new Map(data.map((d) => [d.date, d]))

  // Generate last 18 weeks (about 4 months)
  for (let w = 0; w < 18; w++) {
    const week: (HeatmapData | null)[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (17 - w) * 7 - (6 - d))
      const key = date.toISOString().split('T')[0]
      week.push(map.get(key) || null)
    }
    result.push(week)
  }

  return result
}
