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
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setSuccess("Login successful! Redirecting...");
            setTimeout(() => {
            navigate("/profile");
            }, 1000);

        } catch (error) {
            setError(error.message);
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
                        <h2 style={{fontFamily: 'Poppins, sans-serif', color: '#ffffff', fontWeight: 700, fontSize: '2rem'}}>Log In </h2>
                        {error && (
                            <div 
                                role="alert" 
                                aria-live="assertive"
                                style={{
                                    padding: '10px',
                                    marginBottom: '15px',
                                    backgroundColor: '#f8d7da',
                                    color: '#721c24',
                                    border: '1px solid #f5c6cb',
                                    borderRadius: '4px',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                            >
                                {error}
                            </div>
                        )}
                        {success && (
                            <div 
                                role="status" 
                                aria-live="polite"
                                style={{
                                    padding: '10px',
                                    marginBottom: '15px',
                                    backgroundColor: '#d4edda',
                                    color: '#155724',
                                    border: '1px solid #c3e6cb',
                                    borderRadius: '4px',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                            >
                                {success}
                            </div>
                        )}
                        <div className="mb-3">
                            <label htmlFor="exampleInputEmail1" className="form-label"
                                   style={{fontSize: '20px', fontFamily: 'Poppins, sans-serif'}}>Email</label>
                            <input type="email" className="form-control" id="exampleInputEmail1"
                                   aria-describedby="emailHelp"
                                   value={email}
                                   onChange={(e) => setEmail(e.target.value)}
                                   required
                                   placeholder="Email"/>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label"
                                   style={{fontSize: '20px', fontFamily: 'Poppins, sans-serif'}}>Password</label>
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
                    <p style={{fontFamily: 'monospace', color: '#ffffff', fontSize: '16px', fontWeight: 500}}>
                        Not a user?{" "}
                        <Link to="/signup" style={{fontFamily: 'monospace', color: '#ffffff', textDecoration: 'underline'}}>Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>

    );
}