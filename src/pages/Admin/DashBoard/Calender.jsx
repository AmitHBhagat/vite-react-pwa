import React, { useState } from "react";
import { Calendar, Popover, Whisper, Badge } from "rsuite";

// EventPopover Component
const EventPopover = React.forwardRef(({ day, events, ...props }, ref) => (
  <Popover ref={ref} title={`Meeting for Day ${day}`} {...props}>
    {events && events.length > 0 ? (
      events.map((event, index) => (
        <p key={index}>
          <strong>{event.time}</strong>: {event.title}
        </p>
      ))
    ) : (
      <p>No events for this day.</p>
    )}
  </Popover>
));

// CalendarWithTodo Component
const CalendarWithTodo = ({ events = {} }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSelect = (date) => {
    setSelectedDate(date);
  };

  const renderCell = (selectedDate) => {
    const day = selectedDate.getDate(); // Get day of the month
    const dayEvents = events[day] || []; // Fetch events for the specific day
    const hasEvents = dayEvents.length > 0; // Check if the day has events

    if (hasEvents) {
      return (
        <Whisper
          trigger="click"
          placement="top"
          speaker={<EventPopover day={day} events={dayEvents} />}
        >
          <Badge
            className="calendar-event-badge"
            style={{
              cursor: "pointer",
              backgroundColor: "red", // Custom color for badge
            }}
          />
        </Whisper>
      );
    }

    return null;
  };

  return (
    <div style={{ width: 500 }}>
      <Calendar
        compact
        renderCell={(selectedDate) => renderCell(selectedDate, events)}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default CalendarWithTodo;
