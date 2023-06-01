import React, { useEffect, useRef, useState } from "react";
import "./Clock.css";

function Clock() {
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
    <div>
      <div style={{ color: "white" }}></div>
      <div className="Clock">
        <div className="point"></div>
        <div
          className="hourHand"
          style={{ transform: `rotate(${nowHou}deg)`, height: `150px`, transformOrigin:`3.5px 150px` , bottom: `150px` }}></div>
        <div
          className="minHand"
          style={{ transform: `rotate(${nowMin}deg)`,height: `170px`, transformOrigin:`2.5px 170px` , bottom: `170px`}}></div>
        <div
          className="secHand"
          style={{ transform: `rotate(${nowSec}deg)`, height: `200px`, transformOrigin:`1.5px 200px` , bottom: `200px` }}></div>
      </div>
    </div>
  );
}

//
//
//

export default Clock;
