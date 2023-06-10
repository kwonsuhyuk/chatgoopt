import React, { useEffect, useRef, useState } from "react";
import "./Clock.css";

function Clock() {
  const [state, setState] = useState();
  const week = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const date = new Date();
  const hour = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const daying = week[date.getDay()];

  const ang = 360 / 60;
  const angHour = 360 / 12;

  const nowMin = min * ang;
  const nowSec = sec * ang;
  const nowHou = hour * angHour + nowMin / 12;

  const hrHe = 110;
  const mnHe = 150;
  const seHe = 180;

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
  //setInterval 변수 선언후  clearInterval로 리턴하기
  return (
    <>
      <div style={{ marginTop: "150px" }}>
        <div style={{ color: "white" }}></div>
        <div className="Clock">
          <div className="point"></div>
          <div
            className="hourHand"
            style={{
              transform: `rotate(${nowHou}deg)`,
              height: `${hrHe}px`,
              transformOrigin: `3.5px ${hrHe}px`,
              bottom: `${hrHe}px`,
            }}></div>
          <div
            className="minHand"
            style={{
              transform: `rotate(${nowMin}deg)`,
              height: `${mnHe}px`,
              transformOrigin: `2.5px ${mnHe}px`,
              bottom: `${mnHe}px`,
            }}></div>
          <div
            className="secHand"
            style={{
              transform: `rotate(${nowSec}deg)`,
              height: `${seHe}px`,
              transformOrigin: `1.5px ${seHe}px`,
              bottom: `${seHe}px`,
            }}></div>
        </div>
      </div>

      <div className="date">{`${
        month + 1
      }/${day}/${year}  ${daying.toUpperCase()}`}</div>
    </>
  );
}

//
//
//

export default Clock;
