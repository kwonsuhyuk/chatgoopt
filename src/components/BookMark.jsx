import { Button, IconButton, Menu, MenuItem } from "@mui/material";
import React, { useCallback, useState } from "react";
import BookMarkModal from "./modal/BookMarkModal";
import "./BookMark.css";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getDatabase, ref, remove } from "firebase/database";
import { useSelector } from "react-redux";

function BookMark({ value }) {
  const { user } = useSelector((state) => state);
  const [open, setOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);

  const handleClick = (event) => {
    event?.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = useCallback((event) => {
    event?.stopPropagation();
    setOpen(false);
  }, []);
  const handleMenuClose = useCallback((event) => {
    event?.stopPropagation();
    setAnchorEl(false);
  }, []);
  const handleDelete = useCallback(
    async (event) => {
      event?.stopPropagation();
      await remove(
        ref(
          getDatabase(),
          "users/" + user.currentUser.uid + "/bookmark/" + value?.id
        )
      );
      handleMenuClose();
    },
    [user.currentUser.uid, value?.id, handleMenuClose]
  );

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleUpdate = useCallback(
    (event) => {
      event?.stopPropagation();
      handleMenuClose();
    },
    [handleMenuClose]
  );

  const handleBookClick = useCallback(
    (e) => {
      e.preventDefault();
      const url = value.url;
      window.open(url, "_blank");
    },
    [value]
  );

  return (
    <>
      {value ? (
        !imageError ? (
          <div
            className="bookBtn"
            style={{ position: "relative" }}
            onClick={handleBookClick}>
            <img
              src={value.favicon}
              onError={handleImageError}
              alt="fav"
              style={{
                width: "30px",
                height: "30px",
                position: "relative",
                textAlign: "center",
              }}
            />
            <IconButton
              aria-label="more"
              id="long-button"
              aria-controls={openMenu ? "long-menu" : undefined}
              aria-expanded={openMenu ? "true" : undefined}
              aria-haspopup="true"
              sx={{ position: "absolute", top: 0, right: 0 }}
              onClick={handleClick}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="long-menu"
              MenuListProps={{
                "aria-labelledby": "long-button",
              }}
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              PaperProps={{
                style: {
                  width: "20ch",
                },
              }}>
              <MenuItem key="edit bookmark" onClick={handleUpdate}>
                Edit
              </MenuItem>
              <MenuItem key="delete bookmark" onClick={handleDelete}>
                Delete
              </MenuItem>
            </Menu>
            <h5
              style={{
                fontFamily: "Raleway Dots",
                fontWeight: "700",
                marginTop: "10px",
                position: "relative",
                textAlign: "center",
                color: "gray",
              }}>
              {value.name}
            </h5>
          </div>
        ) : (
          <div className="bookBtn">
            <img
              alt="fav"
              src="/bookmark.ico"
              style={{
                width: "30px",
                height: "30px",
                position: "relative",
                textAlign: "center",
                color: "gray",
              }}
            />
            <IconButton
              aria-label="more"
              id="long-button"
              aria-controls={openMenu ? "long-menu" : undefined}
              aria-expanded={openMenu ? "true" : undefined}
              aria-haspopup="true"
              sx={{ position: "absolute", top: 0, right: 0 }}
              onClick={handleClick}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="long-menu"
              MenuListProps={{
                "aria-labelledby": "long-button",
              }}
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              PaperProps={{
                style: {
                  width: "20ch",
                },
              }}>
              <MenuItem key="edit" onClick={handleUpdate}>
                Edit
              </MenuItem>
              <MenuItem key="delete" onClick={handleDelete}>
                Delete
              </MenuItem>
            </Menu>
            <h5
              style={{
                fontFamily: "Raleway Dots",
                fontWeight: "700",
                marginTop: "10px",
                position: "relative",
                textAlign: "center",
                color: "gray",
              }}>
              {value.name}
            </h5>
          </div>
        )
      ) : (
        <div
          style={{
            width: "100px",
            height: "100px",
            boxShadow:
              "inset -5px -5px 10px white, inset 5px 5px 10px rgba(0, 0, 0, 0.1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "20px",
          }}>
          <Button
            onClick={() => setOpen(true)}
            sx={{
              borderRadius: "20px",
              color: "gray",
              width: "100%",
              height: "100%",
              fontSize: "70px",
            }}>
            +
          </Button>
          <BookMarkModal open={open} handleClose={handleClose} />
        </div>
      )}
    </>
  );
}

export default BookMark;
