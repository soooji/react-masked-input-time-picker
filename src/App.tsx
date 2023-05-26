import moment, { Moment } from "moment";
import { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import {
  amPmTimeRegex,
  getFormattedAMPMTimeFromStringValue,
  getTimeSelectionSuggestions,
} from "./utils";
import styled from "styled-components";
import { useClickOutside } from "./useClickOutside";

const Container = styled.div`
  &,
  * {
    color: white;
  }
`;

const ResultContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 24px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  b {
    color: rgba(255, 255, 255, 0.5);
    margin-right: 4px;
  }
`;

const StyledChevronTriangle = styled.div`
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid white;
  position: absolute;
  right: 10px;
  z-index: 1;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  transition: transform 0.2s ease-in-out;
  &.--up {
    transform: translateY(-50%) rotate(180deg);
  }
`;

const DropDownOptionsContainer = styled.div`
  position: absolute;
  top: calc(100% + 16px);
  left: 0;
  right: 0;
  background-color: #1f1f1f;
  border-radius: 5px;
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

const InputContainer = styled.div`
  position: relative;
  display: inline;
`;

const StyledInput = styled.input`
  border: 1px solid black;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 5px;
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

const DropDownListItem = styled.li`
  list-style: none;
  padding: 8px 8px;
  cursor: pointer;
  border-radius: 5px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.4);
  }
`;

export default function App() {
  const [timeInputValue, setTimeInputValue] = useState("");
  const [selectedTimeValue, setSelectedTimeValue] = useState("");
  const isValid = amPmTimeRegex.test(timeInputValue);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickOutside(inputRef, () => {
    setIsDropDownOpen(false);
    if (!isValid) {
      setTimeInputValue(selectedTimeValue);
    }
  });

  useEffect(() => {
    if (amPmTimeRegex.test(timeInputValue)) {
      setSelectedTimeValue(timeInputValue);
    }
  }, [timeInputValue]);

  const getUppercasedValue = (value: string) => value.toUpperCase();

  const memoizedTimeSelectionSuggestions = useMemo(() => {
    const defaultTimeForSuggestions = moment();
    return getTimeSelectionSuggestions(
      timeInputValue?.length
        ? moment(timeInputValue, "hh:mm a")
        : defaultTimeForSuggestions
    );
  }, [timeInputValue]);

  const isDropDownOpenVisible =
    memoizedTimeSelectionSuggestions?.length && isDropDownOpen;

  return (
    <Container className="App">
      <InputContainer>
        <StyledInput
          ref={inputRef}
          value={timeInputValue}
          placeholder={moment().format("hh:mm a").toUpperCase()}
          className={isValid ? "--valid" : ""}
          onChange={(e) => {
            setIsDropDownOpen(true);
            setTimeInputValue(
              getFormattedAMPMTimeFromStringValue(e.target.value) ??
                timeInputValue
            );
          }}
          onFocus={() => setIsDropDownOpen(true)}
        />
        <StyledChevronTriangle
          className={isDropDownOpenVisible ? "--up" : ""}
        />
        <DropDownOptionsContainer
          className={isDropDownOpenVisible ? "--visible" : ""}
        >
          {memoizedTimeSelectionSuggestions.map((timeOption) => (
            <DropDownListItem
              key={timeOption.toString()}
              onClick={() => {
                setTimeInputValue(
                  getUppercasedValue(timeOption.format("hh:mm a"))
                );
                setIsDropDownOpen(false);
              }}
            >
              {getUppercasedValue(timeOption.format("hh:mm a"))}
            </DropDownListItem>
          ))}
        </DropDownOptionsContainer>
      </InputContainer>

      <br />
      <ResultContainer>
        <b>Moment.js Value:</b>{" "}
        {moment(timeInputValue, "hh:mm a").format("YYYY-MM-DD HH:mm:ss")}
      </ResultContainer>
    </Container>
  );
}
