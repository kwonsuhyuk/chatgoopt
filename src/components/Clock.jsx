import React, { useEffect, useRef, useState } from "react";
import "./Clock.css";

function Clock() {
  const [isDigital, setIsDigital] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [state, setState] = useState();
  const date = new Date();
  const hour = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();

  const ang = 360 / 60;
  const angHour = 360 / 12;

  const nowMin = min * ang;
  const nowSec = sec * ang;
  const nowHou = hour * angHour + nowMin / 12;

  const hrHe = 80; //110
  const mnHe = 100; //150
  const seHe = 120; //180

  const getDate = () => {
    setState(`${hour}:${min}:${sec}`);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      getDate();
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  });

  const handleClick = () => {
    setIsDigital(!isDigital);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const formatDigits = (digit) => {
    return digit < 10 ? "0" + digit : digit;
  };

  const hours = formatDigits(currentTime.getHours());
  const minutes = formatDigits(currentTime.getMinutes());
  const seconds = formatDigits(currentTime.getSeconds());

  //setInterval 변수 선언후  clearInterval로 리턴하기
  return (
    <div
      className={`Clock  ${isDigital ? "flipped" : ""}`}
      onClick={handleClick}>
      {/* 앞면 요소 */}
      <div className="clockcontainer">
        <div
          className="front"
          style={{ backgroundImage: 'url("../img/clock.png")' }}>
          <div className="clock-hand point"></div>
          <div
            className="clock-hand hourHand"
            style={{
              transform: `rotate(${nowHou}deg)`,
              height: `${hrHe}px`,
              transformOrigin: `3.5px ${hrHe}px`,
              bottom: `${hrHe}px`,
            }}></div>
          <div
            className="clock-hand minHand"
            style={{
              transform: `rotate(${nowMin}deg)`,
              height: `${mnHe}px`,
              transformOrigin: `2.5px ${mnHe}px`,
              bottom: `${mnHe}px`,
            }}></div>
          <div
            className="clock-hand secHand"
            style={{
              transform: `rotate(${nowSec}deg)`,
              height: `${seHe}px`,
              transformOrigin: `1.5px ${seHe}px`,
              bottom: `${seHe}px`,
            }}></div>
        </div>
        {/* 뒷면 요소 */}
        <div className="back">
          <div className="digitalClock">
            {hours}:{minutes}:{seconds}
          </div>
        </div>
      </div>
    </div>
  );
}

//
//
//

export default Clock;
