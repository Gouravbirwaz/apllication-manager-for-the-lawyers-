"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { mockCases } from "@/lib/mock-data"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  total: {
    label: "Cases",
  },
  open: {
    label: "Open",
    color: "var(--color-chart-1)",
  },
  "in-progress": {
    label: "In Progress",
    color: "var(--color-chart-2)",
  },
  closed: {
    label: "Closed",
    color: "var(--color-chart-3)",
  },
} satisfies ChartConfig

export function CaseStatusChart() {
  const data = [
    { name: "Open", total: mockCases.filter(c => c.status === 'open').length, fill: "var(--color-chart-1)" },
    { name: "In Progress", total: mockCases.filter(c => c.status === 'in-progress').length, fill: "var(--color-chart-2)" },
    { name: "Closed", total: mockCases.filter(c => c.status === 'closed').length, fill: "var(--color-chart-3)" },
  ]

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} accessibilityLayer>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <ChartTooltip
              cursor={{fill: 'hsl(var(--muted))'}}
              content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
