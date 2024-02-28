import { Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { PropagateLoader, ScaleLoader } from "react-spinners";
import "./Weather.css";
import { useSelector } from "react-redux";

const API_KEY = "fcb5e993ed95afdfb3782c2e6cae8075";

function Weather() {
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState("");
  const [icon, setIcon] = useState();
  const { theme } = useSelector((state) => state);

  const getweather = useCallback(async (lat, lng) => {
    try {
      let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      setWeather(data?.weather[0].main);
      // console.log(data.weather[0]);
      setLoading(false);
      setIcon(data?.weather[0]?.icon);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }, []);

  const getPosition = useCallback(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      getweather(lat, lng);
    },
    [getweather]
  );

  const handleGeoError = () => {
    console.log("error occured");
  };

  useEffect(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(getPosition, handleGeoError);
  }, [getPosition]);

  return (
    <div>
      {loading ? (
        <div
          style={{
            height: "150px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <PropagateLoader color="white" />
        </div>
      ) : (
        <div className="weather_box front">
          <img
            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
            alt="weather"
            style={{ height: "150px", width: "150px" }}
          />
          <h1
            className="weather_name"
            style={{
              color: "white",
            }}>
            Now is {weather}_
          </h1>
        </div>
      )}
    </div>
  );
}

export default Weather;
