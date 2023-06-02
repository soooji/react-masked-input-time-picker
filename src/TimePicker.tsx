import { FC, useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import {
  getFormattedAmPmTimeFromStringValue,
  getTimeSelectionSuggestions,
  getTodayWithTime,
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
import dayjs, { Dayjs } from "dayjs";

export interface TimePickerProps {
  value?: Dayjs | undefined;
  timingFormat?: TimingFormatType;
  minTime?: Dayjs;
  maxTime?: Dayjs;
  timeSuggestionProps?: Omit<
    TimeSelectionSuggestionProps,
    "fromTime" | "toTime"
  >;
  onChange?: (value: Dayjs | undefined) => void;
}

export const TimePicker: FC<TimePickerProps> = ({
  value,
  timingFormat = "12h",
  minTime = dayjs().hour(0).minute(0).second(0),
  maxTime = dayjs().hour(23).minute(59).second(0),
  timeSuggestionProps = {},
  onChange,
}) => {
  const getTodayUpdateTimeWithDate = (t: Dayjs) =>
    t ? dayjs().hour(t.hour()).minute(t.minute()).second(0) : undefined;

  const timeConstraintsWithoutSeconds = useMemo(() => {
    return {
      minTime: minTime
        ? getTodayUpdateTimeWithDate(minTime)
        : dayjs().hour(0).minute(0).second(0),
      maxTime: maxTime
        ? getTodayUpdateTimeWithDate(maxTime)
        : dayjs().hour(23).minute(59).second(0),
    };
  }, [minTime, maxTime]);

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

  const isSameTimeAsValue = (internalTimeValue: Dayjs | undefined) =>
    (!value && !internalTimeValue) ||
    (value && internalTimeValue && value.isSame(internalTimeValue, "minute"));

  const onChangeValueIfChanged = (momentValue: Dayjs | undefined) => {
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
        fromTime: minTime,
        toTime: maxTime,
      }),
    [timeConstraintsWithoutSeconds, timeSuggestionProps]
  );

  const onSelectSuggestedTime = (timeOption: Dayjs) => {
    setIsDropDownOpen(false);
    onChangeValueIfChanged?.(timeOption);
  };

  // Validations
  const isValidTime = (timeValue: string) => {
    if (!isValidTimeFormat(timeValue, { timeFormat: timingFormat })) {
      return false;
    }
    const momentValue = getTodayWithTime(timeValue, momentFormat);
    const isInMinMaxRange =
      momentValue.isSameOrAfter(
        timeConstraintsWithoutSeconds.minTime,
        "minute"
      ) &&
      momentValue.isSameOrBefore(
        timeConstraintsWithoutSeconds.maxTime,
        "minute"
      );
    return isInMinMaxRange;
  };

  const validateTimeAndOnChange = () => {
    if (!timeInputValue) {
      return onChangeValueIfChanged?.(undefined);
    }
    if (!isValidTime(timeInputValue)) {
      return setTimeInputValue(getUppercaseValue(defaultValue));
    }
    onChangeValueIfChanged?.(getTodayWithTime(timeInputValue, momentFormat));
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
        placeholder={dayjs().format(momentFormat).toUpperCase()}
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
