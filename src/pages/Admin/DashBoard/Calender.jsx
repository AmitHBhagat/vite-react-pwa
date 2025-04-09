import React, { useState, useEffect } from "react";
import { Calendar, Popover, Whisper, Badge, List, HStack, Text } from "rsuite";
import { FaInfoCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import parse from "html-react-parser";
import {
  formatDate,
  formatTime,
  getDayMonthYear,
} from "../../../utilities/formatDate";
import "./Dashboard.css";

// EventPopover Component
const EventPopover = React.forwardRef(({ day, events, ...props }, ref) => {
  return (
    <Popover ref={ref} title={formatDate(events[0].meetingDate)} {...props}>
      {" "}
      {events.length > 0 ? (
        <List className="meetList" bordered>
          {events.map((event, index) => (
            <List.Item key={index}>
              <HStack justifyContent="space-between">
                <strong>{event.meetingType}</strong>
                <Text muted size="sm">
                  {formatTime(event.meetingDate)}
                </Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text className="two-line-ellipsis">
                  {parse(event?.meetingAgenda)}
                </Text>
                <Text muted size="sm">
                  <Link to={`/meetings/details/${event._id}`}>
                    <FaInfoCircle className="meetInfo" />
                  </Link>
                </Text>
              </HStack>
            </List.Item>
          ))}
        </List>
      ) : (
        <Text>No meetings for this day.</Text>
      )}
    </Popover>
  );
});

// CalendarWithTodo Component
const CalendarWithTodo = ({ events = [] }) => {
  const [groupedEvents, setGroupedEvents] = useState({});

  useEffect(() => {
    const grouped = events.reduce((acc, event) => {
      const { day, month, year } = getDayMonthYear(event?.meetingDate);
      const key = `${year}-${month}-${day}`;

      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {});

    setGroupedEvents(grouped);
  }, [events]);

  const renderCell = (date) => {
    const { day, month, year } = getDayMonthYear(date);
    const dateKey = `${year}-${month}-${day}`;
    const dayEvents = groupedEvents[dateKey] || [];
    const hasEvents = dayEvents.length > 0;

    return (
      <div className="calenderEvent">
        {hasEvents && (
          <Whisper
            trigger="click"
            placement="top"
            speaker={<EventPopover day={day} events={dayEvents} />}
          >
            <Badge className="calendar-event-badge" />
          </Whisper>
        )}
      </div>
    );
  };

  return (
    <div style={{ width: 550, height: 300 }}>
      <Calendar compact renderCell={renderCell} />
    </div>
  );
};

export default CalendarWithTodo;
