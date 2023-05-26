import moment, { Moment } from "moment";
import { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import {
  amPmTimeRegex,
  getFormattedAMPMTimeFromStringValue,
  getTimeSelectionSuggestions,
  TimingFormatType,
  twentyFourHourTimeRegex,
} from "./utils";
import styled from "styled-components";
import { useClickOutside } from "./useClickOutside";
import ClockIcon from "./clock.svg";
import { InlineSelect, SelectOption } from "./InlineSelect";
const TIMING_FORMAT_OPTIONS: SelectOption<TimingFormatType>[] = [
  {
    value: "12h",
    label: "12h",
  },
  {
    value: "24h",
    label: "24h",
  },
];

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  &,
  * {
    color: white;
  }
`;

const InputContainer = styled.div`
  position: relative;
  display: block;
`;

const StyledInput = styled.input`
  border: 1px solid black;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: none;
  padding: 12px;
  font-size: 1rem;
  &:focus {
    background-color: rgba(0, 0, 0, 0.4);
  }
  &.--valid {
    box-shadow: 0 0 0 1px rgba(0, 255, 0, 0.4);
    background-color: rgba(0, 255, 0, 0.05);
  }
`;

const DropDownOptionsContainer = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: #1f1f1f;
  border-radius: 12px;
  border: 1px solid black;
  padding: 4px;
  z-index: 1;
  visibility: hidden;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
  &.--visible {
    transform: translateY(0px);
    visibility: visible;
    opacity: 1;
  }
`;

const DropDownListItem = styled.li`
  list-style: none;
  padding: 8px 8px;
  cursor: pointer;
  border-radius: 8px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.4);
  }
`;

const TimeInputEndornment = styled.div`
  position: absolute;
  right: 4px;
  height: 36px;
  width: 36px;
  z-index: 1;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  &:active {
    background: rgba(0, 0, 0, 0.4);
  }
`;

const ResultContainer = styled.div`
  display: flex;
  flex-direction: row;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  b {
    color: rgba(255, 255, 255, 0.5);
    margin-right: 4px;
  }
`;

export default function App() {
  const [timeInputValue, setTimeInputValue] = useState("");
  const [selectedTimeValue, setSelectedTimeValue] = useState("");
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [timingFormat, setTimingFormat] = useState<
    SelectOption<TimingFormatType>
  >(TIMING_FORMAT_OPTIONS[0]);
  const inputContentRef = useRef<HTMLDivElement>(null);

  const isValidAmPmTime = (timeValue: string) =>
    timingFormat.value === "12h"
      ? amPmTimeRegex.test(timeValue)
      : twentyFourHourTimeRegex.test(timeValue);

  const momentFormat = timingFormat.value === "12h" ? "hh:mm a" : "HH:mm";

  useClickOutside(inputContentRef, () => {
    setIsDropDownOpen(false);
    if (!timeInputValue) {
      return setSelectedTimeValue("");
    }
    if (!isValidAmPmTime(timeInputValue)) {
      setTimeInputValue(selectedTimeValue);
    }
  });

  const onSelectOption = (timeOption: Moment) => {
    setTimeInputValue(getUppercasedValue(timeOption.format(momentFormat)));
    setIsDropDownOpen(false);
  };

  const onChangeInputValue = (typedValue: string) => {
    setTimeInputValue(
      getFormattedAMPMTimeFromStringValue(typedValue, timingFormat.value) ??
        timeInputValue
    );
  };

  useEffect(() => {
    if (amPmTimeRegex.test(timeInputValue)) {
      setSelectedTimeValue(timeInputValue);
    }
  }, [timeInputValue]);

  const getUppercasedValue = (value: string) => value.toUpperCase();

  const memoizedTimeSelectionSuggestions = useMemo(() => {
    const defaultTimeForSuggestions = moment();
    return getTimeSelectionSuggestions(
      timeInputValue
        ? moment(timeInputValue, momentFormat)
        : defaultTimeForSuggestions
    );
  }, [timeInputValue]);

  const isDropDownOpenVisible =
    memoizedTimeSelectionSuggestions?.length && isDropDownOpen;

  return (
    <Container className="App">
      <InputContainer ref={inputContentRef}>
        <StyledInput
          value={timeInputValue}
          placeholder={moment().format(momentFormat).toUpperCase()}
          className={isValidAmPmTime(timeInputValue) ? "--valid" : ""}
          onChange={(event) => onChangeInputValue(event.target.value)}
        />
        <TimeInputEndornment onClick={() => setIsDropDownOpen(!isDropDownOpen)}>
          <img src={ClockIcon} alt="clock icon" />
        </TimeInputEndornment>
        <DropDownOptionsContainer
          className={isDropDownOpenVisible ? "--visible" : ""}
        >
          {memoizedTimeSelectionSuggestions.map((timeOption) => (
            <DropDownListItem
              key={timeOption.toString()}
              onClick={() => onSelectOption(timeOption)}
            >
              {getUppercasedValue(timeOption.format(momentFormat))}
            </DropDownListItem>
          ))}
        </DropDownOptionsContainer>
      </InputContainer>
      <InlineSelect
        value={timingFormat}
        options={TIMING_FORMAT_OPTIONS}
        onChange={(value) => setTimingFormat(value)}
      />
      <ResultContainer>
        <b>Moment.js Value:</b>{" "}
        {selectedTimeValue
          ? moment(selectedTimeValue, momentFormat).format(
              "YYYY-MM-DD HH:mm:ss"
            )
          : "-"}
      </ResultContainer>
    </Container>
  );
}
