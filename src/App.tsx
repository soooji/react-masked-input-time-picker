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

  return (
    <Container className="App">
      <Toaster />

      <FlexContainer width="400px">
        <PageTitle>Time Picker</PageTitle>

        <InlineSelect
          style={{ flex: "none" }}
          value={timingFormat}
          options={TIMING_FORMAT_OPTIONS}
          onChange={setTimingFormat}
        />
      </FlexContainer>

      <FlexContainer width="400px">
        <div>
          <InputLabel>Min Time</InputLabel>
          <TimePicker
            value={minTime}
            onChange={(newMinTime) => {
              if ((!newMinTime && !minTime) || newMinTime?.isSame(minTime))
                return;
              setSelectedTime(undefined);
              setMinTime(newMinTime);
              setMaxTime(undefined);
            }}
            timingFormat={timingFormat.value}
          />
        </div>

        <div>
          <InputLabel>Max Time</InputLabel>
          <TimePicker
            value={maxTime}
            minTime={minTime ? minTime.clone().add(1, "minute") : undefined}
            onChange={(newMaxTime) => {
              if ((!newMaxTime && !maxTime) || newMaxTime?.isSame(maxTime))
                return;
              setSelectedTime(undefined);
              setMaxTime(newMaxTime);
            }}
            timingFormat={timingFormat.value}
          />
        </div>
      </FlexContainer>

      <FlexContainer width="400px">
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

      <ResultContainer>
        <b>Moment.js Value:</b>{" "}
        {selectedTime ? selectedTime.format("YYYY-MM-DD HH:mm:ss") : "-"}
      </ResultContainer>
    </Container>
  );
}
