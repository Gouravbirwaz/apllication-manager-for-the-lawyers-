'use client';

import { ListTodo, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type AgendaItemType = 'hearing' | 'task';

interface AgendaItem {
    id: string;
    type: AgendaItemType;
    date: Date;
    title: string;
    details?: string;
}

interface AgendaProps {
    items: AgendaItem[];
}

const getIcon = (type: AgendaItemType) => {
    switch (type) {
        case 'hearing':
            return <CalendarClock className="h-5 w-5 text-primary" />;
        case 'task':
            return <ListTodo className="h-5 w-5 text-accent" />;
        default:
            return null;
    }
}

const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
    }
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}


export function Agenda({ items }: AgendaProps) {

    if (items.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                <CalendarClock className="mx-auto h-12 w-12 mb-4" />
                <p className="font-semibold">Your agenda is clear.</p>
                <p className="text-sm">No upcoming hearings or pending tasks.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {items.map(item => (
                <div key={item.id} className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">
                        {getIcon(item.type)}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold">{item.title}</p>
                            <Badge variant={item.type === 'hearing' ? 'default' : 'secondary'} className="capitalize">{item.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.details}</p>
                    </div>
                    <div className="text-sm text-muted-foreground text-right w-28">
                       <p>{formatDate(item.date)}</p>
                       {item.type === 'hearing' && <p>{item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
}
