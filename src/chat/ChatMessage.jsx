import {
  Avatar,
  Grid,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import React, { useCallback } from "react";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

const isImage = (message) => message.hasOwnProperty("image");

function ChatMessage({ message, user }) {
  const { theme } = useSelector((state) => state);
  return (
    <>
      {message.user.id === user.currentUser.uid ? (
        <ListItem
          sx={{
            width: "40%",
            m: 3,
            backgroundColor: `${theme.mainColor}`,
            boxShadow: `-5px -5px 10px ${theme.subColor},  5px 5px 10px rgba(0, 0, 0, 0.3)`,
            color:
              theme.mainColor === "whitesmoke" || theme.mainColor === "#fffacd"
                ? "gray"
                : "white",
            alignSelf: "flex-end",
            borderRadius: "20px",
            "@media (max-width: 500px)": {
              // 휴대폰에서의 스타일 조정
              // 예: 폰트 사이즈 변경, 패딩 조정 등
              width: "80%",
            },
          }}>
          <Grid container sx={{ mr: 2 }}>
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "right" }}>
              <ListItemText
                sx={{ display: "flex", flexDirection: "row-reverse" }}
                primary={message.user.name}
                primaryTypographyProps={{
                  color: "orange",
                  fontWeight: "bold",
                  ml: 3,
                }}
                secondary={dayjs(message.timestamp).fromNow()}
                secondaryTypographyProps={{
                  color:
                    theme.mainColor === "whitesmoke" ||
                    theme.mainColor === "#fffacd"
                      ? "gray"
                      : "wheat",
                }}
              />
            </Grid>
            <Grid item xs={12}>
              {isImage(message) ? (
                <img
                  alt="message"
                  src={message.image}
                  style={{ maxWidth: "100%" }}
                />
              ) : (
                <ListItemText
                  primary={message.content}
                  align="right"
                  xs={{ wordBreak: "break-all" }}
                />
              )}
            </Grid>
          </Grid>
          <ListItemAvatar sx={{ alignSelf: "stretch" }}>
            <Avatar
              variant="rounded"
              sx={{ width: 50, height: 50 }}
              alt="profile image"
              src={message.user.avatar}
            />
          </ListItemAvatar>
        </ListItem>
      ) : (
        <ListItem
          sx={{
            color:
              theme.mainColor === "whitesmoke" || theme.mainColor === "#fffacd"
                ? "gray"
                : "white",
            width: "40%",
            m: 3,
            backgroundColor: `${theme.mainColor}`,
            boxShadow: `-5px -5px 10px ${theme.subColor},  5px 5px 10px rgba(0, 0, 0, 0.3)`,
            borderRadius: "20px",
            "@media (max-width: 500px)": {
              // 휴대폰에서의 스타일 조정
              // 예: 폰트 사이즈 변경, 패딩 조정 등
              width: "80%",
            },
          }}>
          <ListItemAvatar sx={{ alignSelf: "stretch" }}>
            <Avatar
              variant="rounded"
              sx={{ width: 50, height: 50 }}
              alt="profile image"
              src={message.user.avatar}
            />
          </ListItemAvatar>
          <Grid container sx={{ ml: 2 }}>
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "left" }}>
              <ListItemText
                sx={{
                  display: "flex",
                }}
                primary={message.user.name}
                primaryTypographyProps={{
                  fontWeight: "bold",
                  color:
                    message.user.id === user.currentUser.uid
                      ? "orange"
                      : theme.mainColor === "whitesmoke" ||
                        theme.mainColor === "#fffacd"
                      ? "gray"
                      : "white",
                }}
                secondary={dayjs(message.timestamp).fromNow()}
                secondaryTypographyProps={{
                  color:
                    theme.mainColor === "whitesmoke" ||
                    theme.mainColor === "#fffacd"
                      ? "gray"
                      : "wheat",
                  ml: 1,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              {isImage(message) ? (
                <img
                  alt="message"
                  src={message.image}
                  style={{ maxWidth: "100%" }}
                />
              ) : (
                <ListItemText
                  primary={message.content}
                  align="left"
                  xs={{ wordBreak: "break-all" }}
                />
              )}
            </Grid>
          </Grid>
        </ListItem>
      )}
    </>
  );
}

export default ChatMessage;
