import styled from "styled-components";

export type SelectOption<TValue extends string = string> = {
  label: string;
  value: TValue;
};

export type InlineSelectProps<TOptionValue extends string = string> = {
  value?: SelectOption<TOptionValue>;
  options: SelectOption<TOptionValue>[];
  onChange: (value: SelectOption<TOptionValue>) => void;
};

const Container = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 4px;
  font-size: 1rem;
  display: flex;
  gap: 2px;
`;

const Option = styled.div`
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  &.--active {
    background-color: rgba(0, 0, 0, 0.4);
    border-color: rgba(0, 0, 0, 0.8);
  }
`;

export const InlineSelect = (({ value, options, onChange }) => {
  return (
    <Container>
      {options?.map((option) => (
        <Option
          key={option.value}
          className={option.value === value?.value ? "--active" : ""}
          onClick={() => option.value !== value?.value && onChange(option)}
        >
          {option.label}
        </Option>
      ))}
    </Container>
  );
}) as <TOptionType extends string = string>(
  props: InlineSelectProps<TOptionType>
) => JSX.Element;
