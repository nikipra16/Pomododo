
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "/src/firebase.js";
import {Link, useNavigate} from "react-router-dom";
import Header from '/src/components/header/Header.jsx';
import './login.css';
import Button from '@mui/material/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import '/src/components/signUp/signUp.css'

export default function LogIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("LogIn successful!");
            navigate("/");

        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <div className="formWrapper">
                <div className={'formContainer'}>
                    <form onSubmit={handleLogin}>
                        <h2 style={{fontFamily: 'monospace', color: 'whitesmoke'}}>Log In </h2>
                        <div className="mb-3">
                            <label htmlFor="exampleInputEmail1" className="form-label"
                                   style={{fontSize: '20px', fontFamily: 'monospace'}}></label>
                            <input type="email" className="form-control" id="exampleInputEmail1"
                                   aria-describedby="emailHelp"
                                   value={email}
                                   onChange={(e) => setEmail(e.target.value)}
                                   required
                                   placeholder="Email"/>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label"
                                   style={{fontSize: '20px', fontFamily: 'monospace'}}></label>
                            <input type="password" className="form-control" id="exampleInputPassword1"
                                   placeholder="Password"
                                   value={password}
                                   onChange={(e) => setPassword(e.target.value)}
                                   required
                                   minLength={6}/>
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            variant="contained"
                            color="success"
                            style={{fontFamily: 'monospace'}}
                        >
                            {loading ? "Logging In..." : "Log In"}
                        </Button>
                    </form>
                    <br/>
                    <p style={{fontFamily: 'monospace', color: 'whitesmoke'}}>
                        Not a user?{" "}
                        <Link to="/signup" style={{fontFamily: 'monospace'}}>Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>

    );
}