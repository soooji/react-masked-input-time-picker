import moment, { Moment } from "moment";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import {
  getFormattedAmPmTimeFromStringValue,
  getTimeSelectionSuggestions,
  getUppercaseValue,
  isValidTimeFormat,
  TimeSelectionSuggestionProps,
  TimingFormatType,
} from "./utils";
import {
  DropDownListItem,
  DropDownOptionsContainer,
  InputContainer,
  StyledInput,
  TimeInputAdornment,
} from "./components";
import { useClickOutside } from "./useClickOutside";

export interface TimePickerProps {
  value?: Moment | undefined;
  timingFormat?: TimingFormatType;
  minTime?: Moment;
  maxTime?: Moment;
  timeSuggestionProps?: Omit<
    TimeSelectionSuggestionProps,
    "fromTime" | "toTime"
  >;
  onChange?: (value: Moment | undefined) => void;
}

export const TimePicker: FC<TimePickerProps> = ({
  value,
  timingFormat = "12h",
  minTime = moment().startOf("day"),
  maxTime = moment().endOf("day"),
  timeSuggestionProps = {},
  onChange,
}) => {
  // FIxing passed time constraints not to have seconds
  const timeConstraintsWithoutSeconds = useMemo(
    () => ({
      minTime: minTime
        ? moment(`${minTime.hour()}:${minTime.minute()}:00`, "H:mm:ss")
        : undefined,
      maxTime: maxTime
        ? moment(`${maxTime.hour()}:${maxTime.minute()}:00`, "H:mm:ss")
        : undefined,
    }),
    [minTime, maxTime]
  );

  // Configs
  const momentFormat = useMemo(
    () => (timingFormat === "12h" ? "hh:mm a" : "HH:mm"),
    [timingFormat]
  );
  const defaultValue = useMemo(
    () => (value ? value.format(momentFormat) : ""),
    [value, momentFormat]
  );

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const adornmentRef = useRef<HTMLDivElement>(null);

  // Value and onChange
  const [timeInputValue, setTimeInputValue] = useState("");

  const onChangeInputValue = (typedValue: string) => {
    setTimeInputValue(
      getFormattedAmPmTimeFromStringValue(typedValue, timingFormat) ??
        timeInputValue
    );
  };

  const isSameTimeAsValue = (internalTimeValue: Moment | undefined) =>
    (!value && !internalTimeValue) ||
    (value && internalTimeValue && value.isSame(internalTimeValue, "minute"));

  const onChangeValueIfChanged = (momentValue: Moment | undefined) => {
    if (isSameTimeAsValue(momentValue)) {
      return;
    }
    onChange?.(momentValue?.clone()?.set("seconds", 0));
  };

  // Effects
  useEffect(() => {
    setTimeInputValue(
      getUppercaseValue(value ? value.format(momentFormat) : "")
    );
  }, [value, momentFormat]);

  // DropDown
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);

  const suggestedTimeOptions = useMemo(
    () =>
      getTimeSelectionSuggestions({
        ...timeSuggestionProps,
        fromTime: timeConstraintsWithoutSeconds.minTime,
        toTime: timeConstraintsWithoutSeconds.maxTime,
      }),
    [timeInputValue, momentFormat, timeConstraintsWithoutSeconds, maxTime]
  );

  const onSelectSuggestedTime = (timeOption: Moment) => {
    setIsDropDownOpen(false);
    onChangeValueIfChanged?.(timeOption);
  };

  // Validations
  const isValidTime = (timeValue: string) => {
    if (!isValidTimeFormat(timeValue, { timeFormat: timingFormat })) {
      return false;
    }
    const momentValue = moment(timeValue, momentFormat);
    const isInMinMaxRange =
      (!timeConstraintsWithoutSeconds.minTime ||
        momentValue.isSameOrAfter(
          timeConstraintsWithoutSeconds.minTime,
          "minute"
        )) &&
      (!timeConstraintsWithoutSeconds.maxTime ||
        momentValue.isSameOrBefore(
          timeConstraintsWithoutSeconds.maxTime,
          "minute"
        ));
    return isInMinMaxRange;
  };

  const validateTimeAndOnChange = () => {
    if (!timeInputValue) {
      return onChangeValueIfChanged?.(undefined);
    }
    if (!isValidTime(timeInputValue)) {
      return setTimeInputValue(getUppercaseValue(defaultValue));
    }
    onChangeValueIfChanged?.(moment(timeInputValue, momentFormat));
  };

  const openDropDownAndFocusOnInput = () => {
    setIsDropDownOpen(true);
    inputRef?.current?.focus();
  };

  useClickOutside(containerRef, () => {
    setIsDropDownOpen(false);
  });

  // Constants
  const isDropDownOpenVisible = suggestedTimeOptions?.length && isDropDownOpen;

  return (
    <InputContainer ref={containerRef}>
      <StyledInput
        ref={inputRef}
        value={timeInputValue}
        placeholder={moment().format(momentFormat).toUpperCase()}
        onBlur={validateTimeAndOnChange}
        className={
          isValidTime(timeInputValue)
            ? "--valid"
            : isValidTimeFormat(timeInputValue, { timeFormat: timingFormat })
            ? "--invalid"
            : ""
        }
        onChange={(event) => onChangeInputValue(event.target.value)}
      />

      <TimeInputAdornment
        ref={adornmentRef}
        onClick={openDropDownAndFocusOnInput}
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
      >
        <img src="/clock.svg" alt="clock icon" />
      </TimeInputAdornment>

      <DropDownOptionsContainer
        className={isDropDownOpenVisible ? "--visible" : ""}
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
      >
        {suggestedTimeOptions.map((timeOption) => (
          <DropDownListItem
            key={timeOption.toString()}
            onClick={() => onSelectSuggestedTime(timeOption)}
          >
            {getUppercaseValue(timeOption.format(momentFormat))}
          </DropDownListItem>
        ))}
      </DropDownOptionsContainer>
    </InputContainer>
  );
};
