import React from "react";
import "./PinDigit.css";
import classNames from "classnames";

function PinDigit({ value, focused, error }) {
  return (
    <div
      className={classNames("app-pin-digit", {
        focused: focused,
        error,
      })}>
      <span className="app-pin-digit-value">{value || ""}</span>
    </div>
  );
}

export default PinDigit;
