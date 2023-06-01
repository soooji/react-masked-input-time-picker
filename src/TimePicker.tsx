import moment, { Moment } from "moment";
import {
  FC,
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  minTime?: Moment;
  maxTime?: Moment;
  onChange?: (value: Moment | undefined) => void;
}

//TODO: Ignore date part of minTime and maxTime
export const TimePicker: FC<TimePickerProps> = ({
  value,
  timingFormat = "12h",
  minTime = moment().startOf("day"),
  maxTime = moment().endOf("day"),
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
    onChange?.(momentValue);
  };

  // Effects
  useEffect(() => {
    setTimeInputValue(
      getUppercaseValue(value ? value.format(momentFormat) : "")
    );
  }, [value, momentFormat]);

  // DropDown
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);

  const suggestedTimeOptions = useMemo(() => {
    const defaultTimeForSuggestions = moment();
    return getTimeSelectionSuggestions(
      timeInputValue
        ? moment(timeInputValue, momentFormat)
        : defaultTimeForSuggestions,
      { minTime, maxTime }
    );
  }, [timeInputValue, momentFormat, minTime, maxTime]);

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
      (!minTime || momentValue.isSameOrAfter(minTime, "minute")) &&
      (!maxTime || momentValue.isSameOrBefore(maxTime, "minute"));
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
