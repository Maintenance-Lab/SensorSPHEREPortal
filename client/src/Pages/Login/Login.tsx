import React from "react";
import { Navigate } from "react-router-dom";
import { Button, TextField } from "@material-ui/core";

const Login: React.FC = () => {
  const handleLogin = () => {
    const usernameInput = document.getElementById("username") as HTMLInputElement | null;
    const passwordInput = document.getElementById("password") as HTMLInputElement | null;
    if (!usernameInput || !passwordInput) {
      return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;
    if (!username || !password) {
      return;
    }

    fetch("/api/login", {
      method: "POST",
      redirect: "manual",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        const { success, error, location } = data;
        if (success) window.location.href = location;
        else console.error(error);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div>
      <TextField id="username" label="Username" />
      <TextField id="password" label="Password" type="password" />
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Login
      </Button>
    </div>
  );
};

export default Login;

export {};
