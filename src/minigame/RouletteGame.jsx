import React, { useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import RouletteWheel from "./RouletteWheel";

const RouletteContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
`;

const RouletteButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
`;

const Roulette = ({ options }) => {
  const [angle, setAngle] = useState(0);
  const wheelSize = 300;
  const wheelRadius = wheelSize / 2;

  const spinRoulette = () => {
    const randomAngle = Math.floor(Math.random() * 360);
    setAngle(randomAngle);
  };

  return (
    <div>
      <RouletteContainer>
        <RouletteWheel size={wheelSize} angle={angle} options={options} />
      </RouletteContainer>
      <RouletteButton onClick={spinRoulette}>Spin</RouletteButton>
    </div>
  );
};

Roulette.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Roulette;
