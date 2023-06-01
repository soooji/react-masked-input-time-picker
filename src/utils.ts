import moment, { Moment } from "moment";

export type TimingFormatType = "12h" | "24h";

const onlyDigitCheckerRegex = new RegExp(/^[0-9]*$/);
export const amPmTimeRegex = /^(0?[1-9]|1[012])(:[0-5]\d) [APap][mM]$/;
export const twentyFourHourTimeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Time formatting + masking
const formatHour = (hour: string, format: TimingFormatType) => {
  let formattedHour = hour;
  const maxHour = format === "12h" ? 12 : 23;
  if (hour.length === 1 && parseInt(hour[0]) > Math.floor(maxHour / 10)) {
    formattedHour = `0${hour[0]}`;
  } else if (hour.length === 2) {
    if (Number(hour) === 0) {
      formattedHour = `01`;
    } else if (Number(hour) > maxHour) {
      formattedHour = `${maxHour}`;
    }
  }
  return formattedHour;
};

const formatMinute = (minute: string) => {
  let formattedMinute = minute;
  if (minute.length === 1 && parseInt(minute[0]) > 5) {
    formattedMinute = `0${minute[0]}`;
  } else if (minute.length === 2) {
    if (Number(minute) === 0) {
      formattedMinute = `00`;
    } else if (Number(minute) > 59) {
      formattedMinute = "59";
    }
  }
  return formattedMinute;
};

const formatAmPm = (ampm: string) => {
  let formattedAmPm = ampm;
  if (!ampm || ["A", "P"].indexOf(ampm[0]) === -1) {
    return "";
  }
  if (ampm?.[1] !== "M") {
    formattedAmPm = ampm[0];
  }
  return formattedAmPm;
};

export function getFormattedAmPmTimeFromStringValue(
  inputValue: string,
  format: TimingFormatType = "12h"
) {
  if (inputValue === "") return "";
  const cleanedTimeValue = inputValue
    .toUpperCase()
    .trim()
    .split(":")
    .flatMap((v) => v.split(" "))
    .join("");

  const hourChunk = cleanedTimeValue.substring(0, 2);
  const minuteChunk = cleanedTimeValue.substring(2, 4);
  const ampmChunk = cleanedTimeValue.substring(4, 6);

  const hourOrMinuteHasNonNumericChar = !onlyDigitCheckerRegex.test(
    `${hourChunk}${minuteChunk}`
  );
  if (hourOrMinuteHasNonNumericChar) {
    return;
  }

  let hour = formatHour(hourChunk, format);
  let minute = formatMinute(minuteChunk);

  if (format === "24h") {
    return `${hour}${minute ? ":" + minute : ""}`;
  }

  let ampm = formatAmPm(ampmChunk);
  return `${hour}${minute ? ":" + minute : ""}${ampm ? " " + ampm : ""}`;
}

// Time validation
export const isValidTimeFormat = (
  timeValue: string,
  { timeFormat }: { timeFormat: TimingFormatType }
) => {
  if (!timeValue) {
    return false;
  }
  if (timeFormat === "12h") {
    return amPmTimeRegex.test(timeValue);
  }
  return twentyFourHourTimeRegex.test(timeValue);
};

// Time suggestions
const roundUpTimeToNearestHalfHour = (time: Moment) => {
  const fixedTime = time.clone();
  const minutes = time.minutes();
  if (minutes === 0) {
    return fixedTime;
  }
  if (minutes <= 30) {
    return fixedTime.set("m", 30);
  }
  return fixedTime.add(1, "h").startOf("hour");
};

// export const getTimeSelectionSuggestionsBetweenMinAndMaxDate = (
//   time: Moment,
//   {
//     minDate,
//     maxDate,
//   }: {
//     minDate?: Moment;
//     maxDate?: Moment;
//   }
// ) => {
//   const sameHourOptions = [];
//   const startTime = roundUpTimeToNearestHalfHour(
//     minDate ? moment.max(minDate, time) : time
//   );
//   const endTime = moment.min(
//     maxDate.clone().endOf("day"),
//     startTime.clone().add(3, "h")
//   );
//   const intervalMinutes = 30;
//   for (
//     let timeOption = startTime;
//     timeOption <= endTime;
//     timeOption.add(intervalMinutes, "minutes")
//   ) {
//     sameHourOptions.push(timeOption.clone());
//   }
//   return sameHourOptions;
// };

export const getTimeSelectionSuggestions = (
  time: Moment,
  {
    minTime,
    maxTime,
  }: {
    minTime?: Moment;
    maxTime?: Moment;
  }
) => {
  const sameHourOptions = [];
  const startTime = roundUpTimeToNearestHalfHour(
    minTime ? moment.max(time, minTime) : time
  );
  const endTime = moment.min(
    ...[
      moment().endOf("day"),
      startTime.clone().add(3, "h"),
      ...(maxTime ? [maxTime] : []),
    ]
  );
  const intervalMinutes = 30;
  for (
    let timeOption = startTime;
    timeOption <= endTime;
    timeOption.add(intervalMinutes, "minutes")
  ) {
    sameHourOptions.push(timeOption.clone());
  }
  return sameHourOptions;
};

// String
export const getUppercaseValue = (value: string) => value.toUpperCase();
