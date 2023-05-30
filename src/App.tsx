import moment, { Moment } from "moment";
import { useState } from "react";
import "./styles.css";
import { TimingFormatType } from "./utils";
import styled from "styled-components";
import { InlineSelect, SelectOption } from "./InlineSelect";
import { Container } from "./components";
import { TimePicker } from "./TimePicker";

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

export default function App() {
  const [timingFormat, setTimingFormat] = useState<
    SelectOption<TimingFormatType>
  >(TIMING_FORMAT_OPTIONS[0]);
  const [selectedTime, setSelectedTime] = useState<Moment>();

  return (
    <Container className="App">
      <TimePicker
        value={selectedTime}
        onChange={setSelectedTime}
        timingFormat={timingFormat.value}
        minDate={moment().hour(10).minute(0).second(0)}
        maxDate={moment().hour(17).minute(0).second(0)}
      />

      <InlineSelect
        value={timingFormat}
        options={TIMING_FORMAT_OPTIONS}
        onChange={setTimingFormat}
      />

      <ResultContainer>
        <b>Moment.js Value:</b>{" "}
        {selectedTime ? selectedTime.format("YYYY-MM-DD HH:mm:ss") : "-"}
      </ResultContainer>
    </Container>
  );
}
