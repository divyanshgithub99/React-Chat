import { useState } from "react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useNavigate } from 'react-router-dom';

const Form = ({
    isSignInPage = true,
}) => {
    const [data, setData] = useState({
        ...(!isSignInPage && {
            fullName: ''
        }),
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        console.log('data :>> ', data);
        e.preventDefault();
        const res = await fetch(`http://localhost:8080/api/${isSignInPage ? 'login' : 'register'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if(res.status === 400) {
            alert('Invalid credentials');
        } else {
            const resData = await res.json();
            if(resData.token) {
                localStorage.setItem('user:token', resData.token);
                localStorage.setItem('user:detail', JSON.stringify(resData.user));
                navigate('/');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            <div className="bg-white shadow-lg rounded-lg p-10 w-96">
                <div className="text-3xl font-bold mb-6 text-center">Welcome {isSignInPage && 'Back'}</div>
                <div className="text-lg font-light mb-10 text-center">{isSignInPage ? 'Sign in to get explored' : 'Sign up to get started'}</div>
                <form className="flex flex-col" onSubmit={(e) => handleSubmit(e)}>
                    { !isSignInPage && 
                        <Input 
                            label="Full name" 
                            name="name" 
                            placeholder="Enter your full name" 
                            className="mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600" 
                            value={data.fullName} 
                            onChange={(e) => setData({ ...data, fullName: e.target.value }) } 
                        /> 
                    }
                    <Input 
                        label="Email address" 
                        type="email" 
                        name="email" 
                        placeholder="Enter your email" 
                        className="mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600" 
                        value={data.email} 
                        onChange={(e) => setData({ ...data, email: e.target.value }) }
                    />
                    <Input 
                        label="Password" 
                        type="password" 
                        name="password" 
                        placeholder="Enter your Password" 
                        className="mb-6 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600" 
                        value={data.password} 
                        onChange={(e) => setData({ ...data, password: e.target.value }) }
                    />
                    <Button 
                        label={isSignInPage ? 'Sign in' : 'Sign up'} 
                        type='submit' 
                        className="w-full py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition duration-200" 
                    />
                </form>
                <div className="mt-6 text-center">
                    { isSignInPage ? "Didn't have an account?" : "Already have an account?" } 
                    <span 
                        className="text-primary cursor-pointer underline ml-1" 
                        onClick={() => navigate(`/users/${isSignInPage ? 'sign_up' : 'sign_in'}`)}>
                        { isSignInPage ? 'Sign up' : 'Sign in' }
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Form;
