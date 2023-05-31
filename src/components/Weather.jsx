import { Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { ScaleLoader } from "react-spinners";

const API_KEY = "fcb5e993ed95afdfb3782c2e6cae8075";

function Weather() {
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState("");
  const [tmp, setTmp] = useState();
  const [icon, setIcon] = useState();

  const getweather = useCallback(async (lat, lng) => {
    try {
      let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      setWeather(data.weather[0].main);
      // console.log(data.weather[0]);
      setTmp(data.main.temp);
      setLoading(false);
      setIcon(data.weather[0].icon);
    } catch (error) {
      setLoading(false);
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
    <>
      {loading ? (
        <ScaleLoader color="#36d7b7" />
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
          }}>
          <img
            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
            alt="weather"
            style={{ height: "150px", width: "150px" }}
          />
          <Typography variant="p" sx={{ color: "white" }}>
            {(tmp - 273.15).toFixed(2) + "°C"}
          </Typography>
        </div>
      )}
    </>
  );
}

export default Weather;
