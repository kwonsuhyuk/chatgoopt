// import React, { useEffect, useState } from "react";
// import "../firebase";
// import BoardItem from "./BoardItem";
// import { Box, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
// import CircularProgress from "@mui/material/CircularProgress";
// import { useSelector } from "react-redux";
// import { Link } from "react-router-dom";

// function LiveBoard({ isLoading, boardList }) {
//   const { theme, user } = useSelector((state) => state);
//   const [showMyPosts, setShowMyPosts] = useState(false); // 내 게시물 보기 여부 상태 추가

//   const toggleMyPosts = () => {
//     setShowMyPosts(!showMyPosts);
//   };

//   return (
//     <Box
//       sx={{
//         backgroundColor: `${theme.mainColor}`,
//         display: "flex",
//         flexDirection: "column",
//         gap: "3vh",
//       }}>
//       <FormGroup>
//         <FormControlLabel
//           control={
//             <Checkbox
//               value={showMyPosts}
//               onClick={toggleMyPosts}
//               color="success"
//             />
//           }
//           label="내 게시물 보기"
//         />
//       </FormGroup>
//       {isLoading ? (
//         <CircularProgress />
//       ) : boardList?.length > 0 && !showMyPosts ? (
//         boardList?.map(
//           (item) =>
//             item.id && (
//               <BoardItem
//                 key={item.id}
//                 title={item.title}
//                 content={item.content}
//                 id={item.id}
//                 timestamp={item.timestamp}
//                 userinfo={item.user}
//                 images={item.images}
//                 notice={item.notice}
//                 youtubeLink={item.youtubeLink}
//               />
//             )
//         )
//       ) : (
//         boardList?.map(
//           (item) =>
//             item.user.id === user.currentUser.uid && (
//               <BoardItem
//                 key={item.id}
//                 title={item.title}
//                 content={item.content}
//                 id={item.id}
//                 timestamp={item.timestamp}
//                 userinfo={item.user}
//                 images={item.images}
//                 notice={item.notice}
//                 youtubeLink={item.youtubeLink}
//               />
//             )
//         )
//       )}
//     </Box>
//   );
// }

// export default LiveBoard;
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Box, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import BoardItem from "./BoardItem";
import useLazyImageLoading from "../useLazyImageLoading";

function LiveBoard({ isLoading, boardList }) {
  const { theme, user } = useSelector((state) => state);
  const [showMyPosts, setShowMyPosts] = useState(false);

  const getItemRef = useLazyImageLoading(boardList);

  const toggleMyPosts = () => {
    setShowMyPosts(!showMyPosts);
  };

  return (
    <Box
      sx={{
        backgroundColor: `${theme.mainColor}`,
        display: "flex",
        flexDirection: "column",
        gap: "3vh",
      }}>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              value={showMyPosts}
              onClick={toggleMyPosts}
              color="success"
            />
          }
          label="내 게시물 보기"
        />
      </FormGroup>
      {isLoading ? (
        <CircularProgress />
      ) : (
        boardList?.map((item) => {
          if (!item.id) return null;

          const isCurrentUserPost = item.user.id === user.currentUser.uid;
          if (showMyPosts && !isCurrentUserPost) return null;

          return (
            <BoardItem
              key={item.id}
              title={item.title}
              content={item.content}
              id={item.id}
              timestamp={item.timestamp}
              userinfo={item.user}
              images={item.images}
              notice={item.notice}
              youtubeLink={item.youtubeLink}
              imageRef={getItemRef(item.id)} // 커스텀 훅을 사용하여 ref 얻기
            />
          );
        })
      )}
    </Box>
  );
}

export default LiveBoard;
