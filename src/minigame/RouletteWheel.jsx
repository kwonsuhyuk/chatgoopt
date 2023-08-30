import React, { useState } from "react";
import "./RouletteWheel.css"; // 스타일링을 위한 CSS 파일

const RouletteWheel = ({ options }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const spinWheel = () => {
    if (isSpinning) return;

    const randomDegrees = Math.floor(Math.random() * 360); // 0도부터 359도 사이의 난수 생성
    const sectionAngle = 360 / options.length; // 각 섹션의 각도

    // 선택된 옵션 계산
    const selectedSection =
      Math.floor((randomDegrees + 90) / sectionAngle) % options.length;
    setSelectedOption(options[selectedSection]);

    setIsSpinning(true);

    setTimeout(() => {
      setIsSpinning(false);
    }, 3000); // 3초 후에 다시 돌릴 수 있게 설정
  };

  return (
    <div className="roulette-container">
      <div
        className={`wheel ${isSpinning ? "spinning" : ""}`}
        onClick={spinWheel}>
        <div className="pin"></div>
        {options.map((option, index) => (
          <div className={`section section-${index}`} key={index}>
            {option}
          </div>
        ))}
      </div>
      {selectedOption && (
        <div className="result">선택된 옵션: {selectedOption}</div>
      )}
    </div>
  );
};

export default RouletteWheel;
