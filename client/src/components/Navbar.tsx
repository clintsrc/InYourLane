import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import auth from "../utils/auth";

const Navbar = () => {
  const [loginCheck, setLoginCheck] = useState(false);
  const navigate = useNavigate(); // for the redirect to login

  const checkLogin = () => {
    if (auth.loggedIn()) {
      setLoginCheck(true);
    } else {
      setLoginCheck(false);
    }
  };

  useEffect(() => {
    console.log(loginCheck);
    checkLogin();
  }, [loginCheck]);

  const handleTitleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link navigation
    if (auth.loggedIn()) {
      navigate("/");
    } else {
      navigate("/login"); // redirect to the login page
    }
  };

  return (
    <div className="nav">
      <div className="nav-title">
        <Link to="/" onClick={handleTitleClick}>
          Krazy Kanban Board
        </Link>
      </div>
      <ul>
        {!loginCheck ? (
          <li className="nav-item">
            <Link to="/login">
              <button type="button">Login</button>
            </Link>
          </li>
        ) : (
          <li className="nav-item">
            <button type="button" onClick={() => auth.logout()}>
              Logout
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Navbar;
