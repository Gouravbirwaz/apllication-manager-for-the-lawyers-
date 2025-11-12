import { mockHearings } from "@/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { CalendarIcon } from "lucide-react"

export function UpcomingHearings() {
  const upcoming = mockHearings
    .filter(h => h.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  if (upcoming.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <CalendarIcon className="w-12 h-12 text-muted-foreground mb-4"/>
        <h3 className="text-lg font-semibold">No Upcoming Hearings</h3>
        <p className="text-sm text-muted-foreground">Your schedule is clear for now.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {upcoming.map((hearing) => (
        <div key={hearing.hearing_id} className="flex items-center">
          <div className="flex flex-col items-center justify-center p-2 mr-4 bg-muted rounded-md">
            <span className="text-sm font-bold">{hearing.date.toLocaleString('default', { month: 'short' })}</span>
            <span className="text-xl font-headline">{hearing.date.getDate()}</span>
          </div>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{hearing.case_title}</p>
            <p className="text-sm text-muted-foreground">
              Courtroom {hearing.court_room}
            </p>
          </div>
          <div className="ml-auto font-medium text-sm">
            {hearing.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ))}
    </div>
  )
}
