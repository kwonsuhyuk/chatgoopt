import * as React from "react";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../store/themeSlice";
import "../firebase";
import { getDatabase, ref, set } from "firebase/database";

const actions = [
  {
    icon: (
      <div
        style={{
          backgroundColor: "white",
          width: 24,
          height: 24,
          borderRadius: "50%",
        }}
      />
    ),
    name: "white",
    mainColor: "whitesmoke",
    subColor: "white",
  },
  {
    icon: (
      <div
        style={{
          backgroundColor: "#fffacd",
          width: 24,
          height: 24,
          borderRadius: "50%",
        }}
      />
    ),
    name: "Yellow",
    mainColor: "#fffacd",
    subColor: "#fffacd9b",
  },
  {
    icon: (
      <div
        style={{
          backgroundColor: "#353839",
          width: 24,
          height: 24,
          borderRadius: "50%",
        }}
      />
    ),
    name: "black",
    mainColor: "#353839",
    subColor: "#3538399b",
  },
  {
    icon: (
      <div
        style={{
          backgroundColor: "#9f81cd",
          width: 24,
          height: 24,
          borderRadius: "50%",
        }}
      />
    ),
    name: "purple",
    mainColor: "#9f81cd",
    subColor: "#9f81cd9b",
  },
  {
    icon: (
      <div
        style={{
          backgroundColor: "#c3d3d6",
          width: 24,
          height: 24,
          borderRadius: "50%",
        }}
      />
    ),
    name: "blue",
    mainColor: "#c3d3d6",
    subColor: "#c3d3d69b",
  },
];

export default function ThemePicker() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state);

  const handleActionClick = async (action) => {
    dispatch(setTheme(action));
    const themeData = {
      mainColor: action.mainColor,
      subColor: action.subColor,
    };

    const db = getDatabase();
    try {
      await set(ref(db, "users/" + user.currentUser.uid + "/theme"), themeData);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <Box
      sx={{
        height: "100px",
        transform: "translateZ(0px)",
        flexGrow: 1,
      }}>
      <SpeedDial
        ariaLabel="theme picker"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        direction="right" // Set the direction to "right"
        icon={<ColorLensIcon />}>
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => handleActionClick(action)}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}
