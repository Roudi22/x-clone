
import { useState } from "react";
import { Link } from "react-router-dom";

import XSvg from "../../../components/svgs/X";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
const LogInPage = () => {
    const [formData, setFormData] = useState({
		username: "",
		password: "",
	});

	const {mutate:loginMutation, isError, isPending, error} =useMutation({
		mutationFn: async ({username, password})=> { // Destructure the username and password from the formData object
			try {
				const res = await fetch('/api/auth/login', {
					method: 'POST',
					headers: { "Content-Type": 'application/json' },
					body: JSON.stringify({ username, password }), // Send the username and password as JSON
				});
				// if (!res.ok) {
				// 	throw new Error('Something went wrong');
				// }
				const data = await res.json();
				if (data.error) {
					throw new Error(data.error);
				}
				console.log(data);
				return data;
			} catch (error) {
				toast.error(error.message);
				throw error;
			}
		},
		onSuccess: () => {
			toast.success('Login successful');
			// history.push('/login');
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		loginMutation(formData); // Pass the formData object to the mutation function
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	
  return (
    <div className='max-w-screen-xl mx-auto flex h-screen'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' />
					<h1 className='text-4xl font-extrabold text-white'>{"Let's"} go.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type='text'
							className='grow'
							placeholder='username'
							name='username'
							onChange={handleInputChange}
							value={formData.username}
						/>
					</label>

					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type='password'
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button className='btn rounded-full btn-primary text-white'>
						{isPending ? 'Loading...' : 'Log in'}
					</button>
					{isError && <p className='text-red-500'>{error.message}</p>}
				</form>
				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-white text-lg'>{"Don't"} have an account?</p>
					<Link to='/signup'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign up</button>
					</Link>
				</div>
			</div>
		</div>
  )
}

export default LogInPage