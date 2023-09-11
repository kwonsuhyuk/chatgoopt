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
  return (
    <>
      {message.user.id === user.currentUser.uid ? (
        <ListItem
          sx={{
            width: "40%",
            m: 3,
            color: "white",
            alignSelf: "flex-end",
            borderBottom: "2px solid white",
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
                  color: "lime",
                  fontFamily: "Montserrat",
                  fontWeight: 700,
                  ml: 3,
                }}
                secondary={dayjs(message.timestamp).fromNow()}
                secondaryTypographyProps={{
                  color: "wheat",
                  fontFamily: "Montserrat",
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
                  sx={{ wordBreak: "break-all" }}
                  primaryTypographyProps={{
                    fontFamily: "Montserrat",
                  }}
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
            color: "white",
            width: "40%",
            m: 3,
            borderBottom: "1px solid white",
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
                  fontWeight: 700,
                  fontFamily: "Montserrat",
                  color: "white",
                }}
                secondary={dayjs(message.timestamp).fromNow()}
                secondaryTypographyProps={{
                  color: "wheat",
                  fontFamily: "Montserrat",
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
                  primaryTypographyProps={{
                    wordBreak: "break-all",
                    fontFamily: "Montserrat",
                  }}
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
