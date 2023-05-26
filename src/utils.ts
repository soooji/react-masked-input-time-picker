import { Moment } from "moment";

const onlyDigitCheckerRegex = new RegExp(/^[0-9]*$/);
export const amPmTimeRegex = /^(0?[1-9]|1[012])(:[0-5]\d) [APap][mM]$/;

// Time formating + masking
const formatHour = (hour: string) => {
  let formattedHour = hour;
  if (hour.length === 1 && parseInt(hour[0]) > 2) {
    formattedHour = `0${hour[0]}`;
  } else if (hour.length === 2) {
    if (Number(hour) === 0) {
      formattedHour = `01`;
    } else if (Number(hour) > 12) {
      formattedHour = "12";
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

export function getFormattedAMPMTimeFromStringValue(inputValue: string) {
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

  let hour = formatHour(hourChunk);
  let minute = formatMinute(minuteChunk);
  let ampm = formatAmPm(ampmChunk);

  return `${hour}${minute ? ":" + minute : ""}${ampm ? " " + ampm : ""}`;
}

// Time suggestions
const roundUpTimeToNearestHalfHour = (time: Moment) => {
  const minutes = time.minutes();
  if (minutes === 0) {
    return time;
  }
  if (minutes <= 30) {
    return time.set("m", 30);
  }
  return time.clone().add(1, "h").startOf("hour");
};

export const getTimeSelectionSuggestions = (time: Moment) => {
  const sameHourOptions = [];
  const startOfHour = roundUpTimeToNearestHalfHour(time);
  const endOfHour = startOfHour.clone().add(3, "h");
  const intervalMinutes = 30;
  for (
    let timeOption = startOfHour;
    timeOption <= endOfHour;
    timeOption.add(intervalMinutes, "minutes")
  ) {
    sameHourOptions.push(timeOption.clone());
  }
  return sameHourOptions;
};
