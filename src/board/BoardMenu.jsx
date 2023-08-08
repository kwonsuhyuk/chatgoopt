import { List, ListItem, ListItemText } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import "../firebase";
import { child, get, getDatabase, ref } from "firebase/database";
import "../firebase";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentBoardChannel } from "../store/boardChannelSlice";

function BoardMenu() {
  const [channels, setChannels] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState("");
  const [firstLoad, setFirstLoad] = useState(true);
  const { theme, currentBoardChannel } = useSelector((state) => state);
  const dispatch = useDispatch();

  const changeChannel = useCallback(
    (channel) => {
      if (channel === activeChannelId) return;
      setActiveChannelId(channel);
      dispatch(setCurrentBoardChannel(channel));
    },

    [dispatch, activeChannelId]
  );

  useEffect(() => {
    async function getBoardChannel() {
      const snapshot = await get(child(ref(getDatabase()), "boardchannels/"));
      setChannels(snapshot.val() ? Object.keys(snapshot.val()) : []);
    }
    getBoardChannel();

    return () => {
      setChannels([]);
    };
  }, []);

  useEffect(() => {
    if (firstLoad) {
      dispatch(setCurrentBoardChannel(null));
      setFirstLoad(false);
    }
  }, [firstLoad, dispatch]);

  return (
    <>
      <List className="chatMenuTitle">
        <List className="chatMenuItem">
          {channels?.map((channel) => (
            <ListItem
              key={channel}
              onClick={() => changeChannel(channel)}
              selected={channel === activeChannelId}
              button>
              <ListItemText
                primary={`> ${channel}`}
                // secondary={` ${
                //   chatAlarmNum[channel?.id]
                // } 개 새 메시지가 있습니다!`}
                // secondaryTypographyProps={{
                //   style: {
                //     color: "#5e67c3",
                //   },
                // }}
                sx={{
                  wordBreak: "break-all",
                  color:
                    theme.mainColor === "whitesmoke" ||
                    theme.mainColor === "#fffacd"
                      ? "gray"
                      : "white",
                }}
              />
            </ListItem>
          ))}
        </List>
      </List>
    </>
  );
}

export default BoardMenu;
