import React from 'react';

function Login() {
    return (
        <>
<title>Swipify</title>
<div className="top-bar">
  <div className="small-title">
    <h2>Swipify &#9835;</h2>
  </div>
</div>

<div className="container">
  <div className="center">
    <h1 className="big-title">Swipe in to Swipify</h1>
    <a className="login-button" href='http://localhost:8000/login'>Login with Spotify</a>
  </div>
</div>
    </>
    );
}

export default Login;

