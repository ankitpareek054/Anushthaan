//+ more digit non inclusion fix handled through index.css
import React, { useRef } from 'react';
import { DateContentRow } from 'react-big-calendar/lib/DateContentRow';
import * as DateContentRowUtils from 'react-big-calendar/lib/utils/eventLevels';

const CustomDateContentRow = ({ events, ...props }) => {
  const containerRef = useRef();

  // Patch getRowLimit to use filtered events for count only
  const getRowLimit = (rowHeight) => {
    const eventLimit = DateContentRowUtils.getRowLimit(
      containerRef.current,
      rowHeight
    );

    return eventLimit;
  };

  // Pass full events (including spans) to render visuals
  return (
    <div ref={containerRef}>
      <DateContentRow
        {...props}
        events={events}
        getRowLimit={getRowLimit}
        // Provide filtered events just for internal row calculations
        renderHeader={() => null}
        components={{
          eventWrapper: (eventWrapperProps) => {
            // Show spans for layout
            return props.components?.eventWrapper
              ? props.components.eventWrapper(eventWrapperProps)
              : <div>{eventWrapperProps.children}</div>;
          }
        }}
        // filters only for row display logic, not visual
        range={props.range}
        resourceId={props.resourceId}
        renderForMeasure={props.renderForMeasure}
        rtl={props.rtl}
        accessors={props.accessors}
        localizer={props.localizer}
        selected={props.selected}
        onShowMore={props.onShowMore}
        onSelect={props.onSelect}
        onDoubleClick={props.onDoubleClick}
        onKeyPress={props.onKeyPress}
        resource={props.resource}
        slotMetrics={{
          ...props.slotMetrics,
          levels: DateContentRowUtils.eventLevels(
            events.filter(e => !e._duplicateSpan),  // filter duplicates for counting and "+n"
            props.accessors,
            props.slotMetrics.range
          ),
        }}
      />
    </div>
  );
};

export default CustomDateContentRow;
