"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { mockCases } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ChartTooltipContent } from "../ui/chart"

export function CaseStatusChart() {
  const data = [
    { name: "Open", total: mockCases.filter(c => c.status === 'open').length, fill: "var(--color-chart-1)" },
    { name: "In Progress", total: mockCases.filter(c => c.status === 'in-progress').length, fill: "var(--color-chart-2)" },
    { name: "Closed", total: mockCases.filter(c => c.status === 'closed').length, fill: "var(--color-chart-3)" },
  ]

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
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
        <Tooltip
            cursor={{fill: 'hsl(var(--muted))'}}
            content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
