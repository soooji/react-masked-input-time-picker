import moment, { Moment } from "moment";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import {
  getFormattedAmPmTimeFromStringValue,
  getTimeSelectionSuggestions,
  getUppercaseValue,
  isValidTimeFormat,
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
  minDate?: Moment;
  maxDate?: Moment;
  onChange?: (value: Moment | undefined) => void;
}

//TODO: Ignore date part of all given and forwarded props
export const TimePicker: FC<TimePickerProps> = ({
  value,
  timingFormat = "12h",
  minDate = moment().startOf("day"),
  maxDate = moment().endOf("day"),
  onChange,
}) => {
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

  // Value and onChange
  const [timeInputValue, setTimeInputValue] = useState("");
  const onChangeInputValue = (typedValue: string) => {
    setTimeInputValue(
      getFormattedAmPmTimeFromStringValue(typedValue, timingFormat) ??
        timeInputValue
    );
  };

  // Effects
  useEffect(() => {
    setTimeInputValue(
      getUppercaseValue(value ? value.format(momentFormat) : "")
    );
  }, [value, momentFormat]);

  // DropDown
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  // TODO: Include minDate and maxDate in suggestions
  const suggestedTimeOptions = useMemo(() => {
    const defaultTimeForSuggestions = moment();
    return getTimeSelectionSuggestions(
      timeInputValue
        ? moment(timeInputValue, momentFormat)
        : defaultTimeForSuggestions
    );
  }, [timeInputValue, momentFormat]);
  const onSelectSuggestedTime = (timeOption: Moment) => {
    setIsDropDownOpen(false);
    onChange?.(timeOption);
  };

  // Validations
  const isValidTime = (timeValue: string) => {
    if (!isValidTimeFormat(timeValue, { timeFormat: timingFormat })) {
      return false;
    }
    const momentValue = moment(timeValue, momentFormat);
    const isInMinMaxRange =
      (!minDate || momentValue.isSameOrAfter(minDate, "minute")) &&
      (!maxDate || momentValue.isSameOrBefore(maxDate, "minute"));
    return isInMinMaxRange;
  };

  const validateTimeAndOnChange = () => {
    if (!timeInputValue) {
      return onChange?.(undefined);
    }
    if (!isValidTime(timeInputValue)) {
      return setTimeInputValue(getUppercaseValue(defaultValue));
    }
    onChange?.(moment(timeInputValue, momentFormat));
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
    <InputContainer ref={containerRef} onBlur={() => validateTimeAndOnChange()}>
      <StyledInput
        ref={inputRef}
        value={timeInputValue}
        placeholder={moment().format(momentFormat).toUpperCase()}
        className={isValidTime(timeInputValue) ? "--valid" : ""}
        onChange={(event) => onChangeInputValue(event.target.value)}
      />

      <TimeInputAdornment
        onClick={openDropDownAndFocusOnInput}
        id="time-input-adornment"
      >
        <img src="/clock.svg" alt="clock icon" />
      </TimeInputAdornment>

      <DropDownOptionsContainer
        className={isDropDownOpenVisible ? "--visible" : ""}
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
