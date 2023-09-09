import React from "react";
import "./MiniGameMain.css";

function MiniGameMain() {
  return (
    <div className="minigame_main">
      {/* <div
        className="minigame_menu main"
        onClick={() => (window.location.href = "/minigame/gamemain")}>
        GAME MAIN
      </div> */}
      <div
        className="minigame_menu dice"
        onClick={() => (window.location.href = "/minigame/dicegame")}>
        DICE GAME
      </div>
      <div
        className="minigame_menu type"
        onClick={() => (window.location.href = "/minigame/typegame")}>
        TYPING GAME
      </div>
      <div
        className="minigame_menu fifa"
        onClick={() => (window.location.href = "/minigame/fifagame")}>
        FIFA GAME
      </div>
      <div
        className="minigame_menu lol"
        onClick={() => (window.location.href = "/minigame/lolgame")}>
        LOL GAME
      </div>
    </div>
  );
}

export default MiniGameMain;
