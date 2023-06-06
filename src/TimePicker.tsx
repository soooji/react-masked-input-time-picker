import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import {
  getFormattedAmPmTimeFromStringValue,
  getTimeSelectionSuggestions,
  getUppercaseValue,
  isValidTimeString,
  TimeSelectionSuggestionProps,
  ClockSystemType,
  getDateWithSameTimeForToday,
  getTimeStringFormat,
  isValidAndInRangeTimeString,
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
  clockSystem?: ClockSystemType;
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
  clockSystem = "12h",
  minTime = dayjs().hour(0).minute(0).second(0),
  maxTime = dayjs().hour(23).minute(59).second(0),
  timeSuggestionProps = {},
  onChange,
}) => {
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const adornmentRef = useRef<HTMLDivElement>(null);

  // Constraints with fixed date and seconds
  const timeConstraintsWithoutSeconds = useMemo(() => {
    return {
      minTime: getDateWithSameTimeForToday(minTime),
      maxTime: getDateWithSameTimeForToday(maxTime),
    };
  }, [minTime, maxTime]);

  // Value and onChange
  const [timeInputValue, setTimeInputValue] = useState("");

  const onChangeInputValue = (typedValue: string) => {
    setTimeInputValue(
      getFormattedAmPmTimeFromStringValue(typedValue, clockSystem) ??
        timeInputValue
    );
  };

  const onChangeValueIfChanged = (date: Dayjs | undefined) => {
    const isValueChanged =
      (!value && !date) || (value && date && value.isSame(date, "minute"));
    if (isValueChanged) {
      return;
    }
    onChange?.(date?.clone()?.set("seconds", 0));
  };

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
  const isValidTimeStringValue = useCallback(
    (timeValue: string) =>
      isValidAndInRangeTimeString(timeValue, {
        ...timeConstraintsWithoutSeconds,
        clockSystem,
      }),
    [timeConstraintsWithoutSeconds, clockSystem]
  );

  const validateTimeAndOnChange = useCallback(() => {
    if (!timeInputValue) {
      return onChangeValueIfChanged?.(undefined);
    }
    if (!isValidTimeStringValue(timeInputValue)) {
      const defaultValue = value
        ? value.format(getTimeStringFormat(clockSystem))
        : "";
      return setTimeInputValue(getUppercaseValue(defaultValue));
    }
    onChangeValueIfChanged?.(
      getDateWithSameTimeForToday(
        dayjs(timeInputValue, getTimeStringFormat(clockSystem))
      )
    );
  }, [
    timeInputValue,
    clockSystem,
    isValidTimeStringValue,
    onChangeValueIfChanged,
    value,
  ]);

  const openDropDownAndFocusOnInput = () => {
    setIsDropDownOpen(true);
    inputRef?.current?.focus();
  };

  useClickOutside(containerRef, () => {
    setIsDropDownOpen(false);
  });

  // Effects
  useEffect(() => {
    setTimeInputValue(
      getUppercaseValue(
        value ? value.format(getTimeStringFormat(clockSystem)) : ""
      )
    );
  }, [value, clockSystem]);

  // Constants
  const isDropDownOpenVisible = suggestedTimeOptions?.length && isDropDownOpen;

  return (
    <InputContainer ref={containerRef}>
      <StyledInput
        ref={inputRef}
        value={timeInputValue}
        placeholder={dayjs()
          .format(getTimeStringFormat(clockSystem))
          .toUpperCase()}
        onBlur={validateTimeAndOnChange}
        className={
          isValidTimeStringValue(timeInputValue)
            ? "--valid"
            : isValidTimeString(timeInputValue, { clockSystem })
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
            {getUppercaseValue(
              timeOption.format(getTimeStringFormat(clockSystem))
            )}
          </DropDownListItem>
        ))}
      </DropDownOptionsContainer>
    </InputContainer>
  );
};
