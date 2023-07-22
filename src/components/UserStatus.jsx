import { Avatar, ListItemAvatar } from "@mui/material";
import {
  getDatabase,
  ref,
  onValue,
  off,
  onDisconnect,
  get,
} from "firebase/database";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import React, { useEffect, useState } from "react";

function UserStatus({ user }) {
  const [online, setOnline] = useState(false);
  const [lastOnline, setLastOnline] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const myConnectionsRef = ref(db, `users/${user.id}/connections`);

    onValue(myConnectionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOnline(data);
      }
    });

    return () => {
      onDisconnect(myConnectionsRef).cancel();
    };
  }, [user.id]);

  useEffect(() => {
    const lastOnlineRef = ref(getDatabase(), `users/${user.id}/lastOnline`);
    onValue(lastOnlineRef, (snapshot) => {
      const timestamp = snapshot.val();
      setLastOnline(timestamp);
    });

    return () => {
      off(lastOnlineRef, "value");
    };
  }, [user.id]);

  const formatLastOnline = () => {
    if (!lastOnline) return "최근 접속 기록 없음";

    const secondsSinceLastOnline = Math.floor((Date.now() - lastOnline) / 1000);
    const minutesSinceLastOnline = Math.floor(secondsSinceLastOnline / 60);
    const hoursSinceLastOnline = Math.floor(minutesSinceLastOnline / 60);
    const daysSinceLastOnline = Math.floor(hoursSinceLastOnline / 24);

    if (daysSinceLastOnline >= 1) {
      return `${daysSinceLastOnline}일 전에 접속함`;
    } else if (hoursSinceLastOnline >= 1) {
      return `${hoursSinceLastOnline}시간 전에 접속함`;
    } else if (minutesSinceLastOnline >= 1) {
      return `${minutesSinceLastOnline}분 전에 접속함`;
    } else {
      return `${secondsSinceLastOnline}초 전에 접속함`;
    }
  };

  const handleMiniChat = () => {};

  return (
    <div style={{ display: "flex" }}>
      <ListItemAvatar sx={{ alignSelf: "stretch" }}>
        <Avatar
          variant="rounded"
          sx={{ width: 50, height: 50 }}
          alt="profile image"
          src={user.avatar}
        />
      </ListItemAvatar>
      <div>
        <span>{user.name}</span>
        {!online && (
          <div style={{ fontSize: "15px", color: "gray" }}>
            {formatLastOnline()}
          </div>
        )}
      </div>
      <RadioButtonCheckedIcon
        sx={{
          color: online ? "green" : "gray",
          position: "absolute",
          right: "10px",
        }}
        onClick={handleMiniChat}
      />
    </div>
  );
}

export default UserStatus;
