import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
  width: 100%;
  max-width: 400px;
  margin: auto;
  min-height: 100vh;
  &,
  * {
    color: white;
    box-sizing: border-box;
  }
`;

export const InputContainer = styled.div`
  position: relative;
  display: block;
  width: 100%;
`;

export const StyledInput = styled.input`
  width: 100%;
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
  &.--invalid {
    box-shadow: 0 0 0 1px rgba(255, 0, 0, 0.4);
    background-color: rgba(255, 0, 0, 0.05);
  }
`;

export const DropDownOptionsContainer = styled.div`
  position: absolute;
  width: 100%;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: #1f1f1f;
  border-radius: 12px;
  border: 1px solid black;
  padding: 4px;
  z-index: 11;
  visibility: hidden;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.2);
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }
  &.--visible {
    transform: translateY(0px);
    visibility: visible;
    opacity: 1;
  }
`;

export const DropDownListItem = styled.li`
  list-style: none;
  padding: 8px 8px;
  cursor: pointer;
  border-radius: 8px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.4);
  }
`;

export const TimeInputAdornment = styled.div`
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

export const ResultContainer = styled.div`
  display: flex;
  flex-direction: row;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  b {
    color: rgba(255, 255, 255, 0.5);
    margin-right: 4px;
  }
`;
