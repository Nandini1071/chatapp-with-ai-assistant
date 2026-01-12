import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { useContext } from "react";
import { userContext } from "../context/UserContext";

const Register = () => {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const navigate = useNavigate();
  const { setuser } = useContext(userContext);

  const submitHandler = (e) => {
    e.preventDefault();
    axios
      .post("/users/register", {
        email,
        password,
      })
      .then((res) => {
        console.log(res.data);
        localStorage.setItem("token", res.data.token);
        setuser(res.data.user);
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900">
      <div className="bg-gray-800 w-full max-w-md rounded-lg p-8 shadow-lg">
        <h2 className="font-bold text-xl text-white">Register</h2>
        <form className="mt-3" onSubmit={submitHandler}>
          <div className="flex flex-col mb-3 gap-2">
            <label htmlFor="email" className="text-gray-400">
              Email
            </label>
            <input
              type="email"
              required
              id="email"
              value={email}
              onChange={(e) => {
                setemail(e.target.value);
              }}
              className="p-2 rounded bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
            />
          </div>
          <div className="flex flex-col mb-3 gap-2">
            <label htmlFor="password" className="text-gray-400">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setpassword(e.target.value);
              }}
              id="password"
              className="p-2 rounded bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
            />
          </div>
          <button className="w-full bg-blue-400 p-2 cursor-pointer text-white mt-2 mb-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
            Register
          </button>
        </form>
        <p className="text-gray-300 mt-2">
          Already have an account?{" "}
          <Link className="text-blue-500" to="/login">
            Login to account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
