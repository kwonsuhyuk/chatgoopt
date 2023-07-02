import {
  Avatar,
  Grid,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import React, { useCallback } from "react";
import dayjs from "dayjs";

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
            boxShadow: "-3px -3px 6px white, 5px 5px 10px rgba(0, 0, 0, 0.3)",
            alignSelf: "flex-end",
            borderRadius: "20px",
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
                secondaryTypographyProps={{ color: "gray" }}
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
            color: "black",
            width: "40%",
            m: 3,
            boxShadow: "-5px -5px 10px white, 5px 5px 10px rgba(0, 0, 0, 0.3)",
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
                sx={{ display: "flex" }}
                primary={message.user.name}
                primaryTypographyProps={{
                  fontWeight: "bold",
                  color:
                    message.user.id === user.currentUser.uid
                      ? "orange"
                      : "black",
                }}
                secondary={dayjs(message.timestamp).fromNow()}
                secondaryTypographyProps={{ color: "gray", ml: 1 }}
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
