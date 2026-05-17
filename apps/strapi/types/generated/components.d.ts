import type { Schema, Struct } from "@strapi/strapi";

export interface CalendarEntryCalendarEntry extends Struct.ComponentSchema {
  collectionName: "components_calendar_entry_calendar_entries";
  info: {
    displayName: "Calendar Entry";
    icon: "clock";
  };
  attributes: {
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    day: Schema.Attribute.Enumeration<
      [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ]
    > &
      Schema.Attribute.Required;
    endTime: Schema.Attribute.Time;
    startTime: Schema.Attribute.Time;
    withDate: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
  };
}

export interface ContentCalendar extends Struct.ComponentSchema {
  collectionName: "components_content_calendars";
  info: {
    displayName: "Calendar";
    icon: "calendar";
  };
  attributes: {
    entries: Schema.Attribute.Component<"calendar-entry.calendar-entry", true> &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface ContentChip extends Struct.ComponentSchema {
  collectionName: "components_content_chips";
  info: {
    displayName: "Chip";
    icon: "bulletList";
  };
  attributes: {
    content: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
  };
}

export interface ContentEventDateTime extends Struct.ComponentSchema {
  collectionName: "components_content_event_date_times";
  info: {
    displayName: "Event Date & Time";
    icon: "clock";
  };
  attributes: {
    endDateTime: Schema.Attribute.DateTime;
    startDateTime: Schema.Attribute.DateTime & Schema.Attribute.Required;
  };
}

export interface ContentLocation extends Struct.ComponentSchema {
  collectionName: "components_content_locations";
  info: {
    displayName: "Location";
    icon: "pinMap";
  };
  attributes: {
    content: Schema.Attribute.Enumeration<["s1.38", "s2.41", "s3.20", "s4.21"]>;
  };
}

export interface ContentSectionTitle extends Struct.ComponentSchema {
  collectionName: "components_content_section_titles";
  info: {
    displayName: "Section Title";
    icon: "information";
  };
  attributes: {
    content: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
  };
}

export interface ContentText extends Struct.ComponentSchema {
  collectionName: "components_content_texts";
  info: {
    displayName: "Text";
    icon: "file";
  };
  attributes: {
    content: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
  };
}

declare module "@strapi/strapi" {
  export module Public {
    export interface ComponentSchemas {
      "calendar-entry.calendar-entry": CalendarEntryCalendarEntry;
      "content.calendar": ContentCalendar;
      "content.chip": ContentChip;
      "content.event-date-time": ContentEventDateTime;
      "content.location": ContentLocation;
      "content.section-title": ContentSectionTitle;
      "content.text": ContentText;
    }
  }
}
