import { Box, Container } from '@mui/material'
import React, { useRef } from 'react'
import { Link } from 'react-router-dom'

function Notfound() {
  return (
    <Container component="main" maxWidth="xl" style={{padding:0,minHeight:`100vh`}}>
      <Box sx={{width:"100vw", height:"100vh", backgroundColor:"black", color:`white`,fontSize:`150px`,textAlign:`center`,verticalAlign:`center`,wordBreak: `keep-all`}}>
      404 ERROR!! <span>Page</span> Not Found.
      <Box>
      <Link to="/" style={{fontSize:`40px`,textDecoration:`none`, color:`white`}}> Go to home ←</Link>
      </Box>
      </Box>
    </Container>
  )
}

export default Notfound


// <Container fixed style={{background:`black`}}>
//         <h1 style={{fontSize:`200px`}}>404 ERROR!!</h1>
//         <button style={{background:`white`, width:`200px`, height:`100px`}}>
//           <a style={{color:`black`, textDecoration:`none`}} href="/">Go to Main</a>
//         </button>
//       </Container>