import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import "../firebase";
import { getAuth, signOut } from "firebase/auth";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const pages = ["dashboard", "chat", "board"];
const settings = ["Edit Profile", "Logout"];

function Header() {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const { user } = useSelector((state) => state);

  const logout = async () => {
    await signOut(getAuth());
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "black",
      }}>
      <Container
        maxWidth="xl"
        sx={{
          height: "7vh",
        }}>
        <Toolbar disableGutters>
          <Typography
            variant="h3"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "Bagel Fat One",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}>
            ChatGOOPT
          </Typography>

          <div style={{ marginLeft: "10rem", height: "100%" }}>
            {pages.map((page) => (
              <NavLink
                key={page}
                to={page === "dashboard" ? "" : "/" + page}
                style={({ isActive }) => {
                  return {
                    backgroundColor: isActive ? "white" : "black",
                    color: isActive ? "black" : "white",
                    textDecoration: "none",
                    marginRight: "5rem",
                    textTransform: "upperCase",
                    height: "200px",
                    padding: "10px",
                    borderRadius: "10px",
                  };
                }}>
                {page}
              </NavLink>
            ))}
          </div>

          <Box sx={{ flexGrow: 0, position: "absolute", right: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ color: "white" }}>
                  {user?.currentUser.displayName}
                </Typography>
                <Avatar
                  sx={{ marginLeft: "10px" }}
                  alt="profileImage"
                  src={user?.currentUser.photoURL}
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}>
              <MenuItem key="edit profile" onClick={handleCloseUserMenu}>
                <Typography textAlign="center">Edit Profile</Typography>
              </MenuItem>
              <MenuItem key="log out" onClick={logout}>
                <Typography textAlign="center">Log out</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Header;
