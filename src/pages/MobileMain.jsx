import React, { useState } from "react";
import "./MobileMain.css";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import { NavLink } from "react-router-dom";

function MobileMain() {
  const [menuOn, setMenuOn] = useState(false);
  const handleMenu = () => {
    setMenuOn(!menuOn);
  };
  return (
    <>
      <div
        id="logo"
        onClick={handleMenu}
        style={{
          transform: menuOn && "translateY(-170px)",
          transition: "all .5s ease-in",
        }}>
        <div className="symbol">
          <div className="symbol_letter">챗</div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div>G</div>
        </div>
        <div className="symbol">
          <div className="symbol_letter">구</div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div>O</div>
        </div>
        <div className="symbol">
          <div className="symbol_letter">피</div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div>O</div>
        </div>
        <div className="symbol">
          <div className="symbol_letter">티</div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div>P</div>
        </div>
        <div className="symbol">
          <div className="symbol_letter">
            <ChatBubbleIcon />
          </div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div>T</div>
        </div>
        {!menuOn && <div className="clickMe">Click!</div>}
      </div>
      {menuOn && (
        <div className="menuList">
          <NavLink
            to="/dashboard"
            className="menu__list__item"
            style={{
              textDecoration: "none",
              color: "grey",
              textAlign: "center",
              fontSize: "1.5em",
              fontFamily: "'Open Sans', sans-serif",
            }}>
            DashBoard
          </NavLink>
          <NavLink
            to="/chat"
            className="menu__list__item"
            style={{
              textDecoration: "none",
              color: "grey",
              textAlign: "center",
              fontSize: "1.5em",
              fontFamily: "'Open Sans', sans-serif",
            }}>
            Chat
          </NavLink>
          <NavLink
            to="/board"
            className="menu__list__item"
            style={{
              textDecoration: "none",
              color: "grey",
              textAlign: "center",
              fontSize: "1.5em",
              fontFamily: "'Open Sans', sans-serif",
            }}>
            Board
          </NavLink>
          <NavLink
            to="/minigame"
            className="menu__list__item"
            style={{
              textDecoration: "none",
              color: "grey",
              textAlign: "center",
              fontSize: "1.5em",
              fontFamily: "'Open Sans', sans-serif",
            }}>
            MiniGame
          </NavLink>
        </div>
      )}
    </>
  );
}

export default MobileMain;
