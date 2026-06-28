import { useState } from "react";
import { useRegister } from "../hooks/use-auth";

const Register = () => {
    const [name, setName] = useState("Anya");
    const [email, setEmail] = useState("anya@example.com");
    const [password, setPassword] = useState("anyapassword");

    const { mutate: registerUser } = useRegister() // Assuming you have a mutation hook for registering users

    const onChangeValue = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
        setter(value);
    }

    const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChangeValue(e.target.value, setName);
    }

    const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChangeValue(e.target.value, setEmail);
    }

    const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChangeValue(e.target.value, setPassword);
    }

    const handleSubmit = (e: React.SubmitEvent) => {
        // Prevent the default form submission behavior as page reload is not desired in a single-page application (SPA) like Next.js. This allows for handling the form submission logic without refreshing the page.
        e.preventDefault();
        // Handle form submission logic here
        registerUser({ name, email, password });
    }

    return (
        <>
            <h1 className="jumbotron bg-primary text-center square">Register</h1>

            <div className="container col-md-4 offset-md-4 pb-5">
                <form onSubmit={handleSubmit}>
                    <input type="text" className="form-control mb-4 p-4" placeholder="Enter name" value={name} onChange={onChangeName} required />
                    <input type="email" className="form-control mb-4 p-4" placeholder="Enter email" value={email} onChange={onChangeEmail} required />
                    <input type="password" className="form-control mb-4 p-4" placeholder="Enter password" value={password} onChange={onChangePassword} required />
                    <button type="submit" className="btn btn-primary btn-block">Submit</button>
                </form>
            </div>
        </>
    )
}

export default Register