import { Moment } from "moment";
import { useState } from "react";
import "./styles.css";
import { TimingFormatType } from "./utils";
import styled from "styled-components";
import { InlineSelect, SelectOption } from "./InlineSelect";
import { Container } from "./components";
import { TimePicker } from "./TimePicker";
import { Toaster, toast } from "react-hot-toast";

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
const InputLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
`;

const FlexContainer = styled.div<{ width?: string }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: ${(props) => props?.width ?? "100%"};
  max-width: 100%;
  > div {
    flex: 1;
  }
`;

const CalendarLikeTimeCard = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  > hr {
    width: 100%;
    margin: 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  > div {
    padding: 12px 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    > span {
      color: rgba(255, 255, 255, 0.5);
    }
  }
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16px;
`;

export default function App() {
  const [timingFormat, setTimingFormat] = useState<
    SelectOption<TimingFormatType>
  >(TIMING_FORMAT_OPTIONS[1]);
  const [selectedTime, setSelectedTime] = useState<Moment>();
  const [minTime, setMinTime] = useState<Moment>();
  const [maxTime, setMaxTime] = useState<Moment>();

  const onChangeMinTime = (newMinTime: Moment | undefined) => {
    if ((!newMinTime && !minTime) || newMinTime?.isSame(minTime)) {
      return;
    }
    if (newMinTime && selectedTime?.isBefore(newMinTime)) {
      setSelectedTime(undefined);
    }
    setMinTime(newMinTime);
    if (newMinTime && maxTime && newMinTime.isSameOrAfter(maxTime)) {
      setMaxTime(undefined);
    }
  };

  const onChangeMaxTime = (newMaxTime: Moment | undefined) => {
    if ((!newMaxTime && !maxTime) || newMaxTime?.isSame(maxTime)) {
      return;
    }
    if (newMaxTime && selectedTime?.isAfter(newMaxTime)) {
      setSelectedTime(undefined);
    }
    setMaxTime(newMaxTime);
  };

  return (
    <Container className="App">
      <Toaster position="bottom-center" />

      <FlexContainer style={{ marginBottom: "16px" }}>
        <PageTitle>Time Picker</PageTitle>

        <InlineSelect
          style={{ flex: "none" }}
          value={timingFormat}
          options={TIMING_FORMAT_OPTIONS}
          onChange={setTimingFormat}
        />
      </FlexContainer>

      <FlexContainer>
        <div>
          <InputLabel>Min Time</InputLabel>
          <TimePicker
            value={minTime}
            onChange={onChangeMinTime}
            timingFormat={timingFormat.value}
          />
        </div>

        <div>
          <InputLabel>Max Time</InputLabel>
          <TimePicker
            value={maxTime}
            minTime={minTime ? minTime.clone().add(1, "minute") : undefined}
            onChange={onChangeMaxTime}
            timingFormat={timingFormat.value}
          />
        </div>
      </FlexContainer>

      <FlexContainer>
        <div>
          <InputLabel>Time Picker (with constraints):</InputLabel>
          <TimePicker
            value={selectedTime}
            onChange={(newTime) => {
              setSelectedTime(newTime);
              toast.success(
                `Selected time: ${
                  newTime?.format("YYYY-MM-DD HH:mm:ss") ?? "N/A"
                }`,
                {
                  style: {
                    borderRadius: "10px",
                    background: "#333",
                    color: "#fff",
                  },
                }
              );
            }}
            timingFormat={timingFormat.value}
            minTime={minTime}
            maxTime={maxTime}
          />
        </div>
      </FlexContainer>

      <CalendarLikeTimeCard>
        <div>
          <span>Min Time:</span>
          {minTime ? minTime.format("YYYY-MM-DD HH:mm:ss") : "N/A"}
        </div>
        <hr />
        <div>
          <span>Max Time:</span>
          {maxTime ? maxTime.format("YYYY-MM-DD HH:mm:ss") : "N/A"}
        </div>
        <hr />
        <div>
          <span>Selected Value:</span>
          {selectedTime ? selectedTime.format("YYYY-MM-DD HH:mm:ss") : "N/A"}
        </div>
      </CalendarLikeTimeCard>
    </Container>
  );
}
