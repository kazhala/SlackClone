import React, { useState } from 'react';
import firebase from '../../firebase';

import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const Register = props => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState([]);

    const handleChange = (event) => {
        switch (event.target.name) {
            case 'username':
                setUsername(event.target.value);
                break;
            case 'email':
                setEmail(event.target.value);
                break;
            case 'password':
                setPassword(event.target.value);
                break;
            case 'passwordConfirmation':
                setPasswordConfirmation(event.target.value);
                break;
            default:
                break;
        }
    }

    const isFormEmpty = () => {
        return !username.length || !password.length || !email.length || !passwordConfirmation.length;
    }

    const formIsValid = () => {
        let errorArray = [];
        let error;
        if (isFormEmpty()) {
            error = { message: "Fill in all fields" };
            setErrors(errorArray.concat(error));
            return false;
        } else if (!passWordValid()) {
            error = { message: "Password is Invalid" };
            setErrors(errorArray.concat(error));
            return false;
        } else {
            return true;
        }
    }

    const displayError = () => errors.map((error, index) => {
        return <p key={index}>{error.message}</p>
    });


    const passWordValid = () => {
        if (password.length < 6 || passwordConfirmation.length < 6) {
            return false;
        } else if (password !== passwordConfirmation) {
            return false;
        }
        return true;
    }

    const handleSubmit = (e) => {
        if (formIsValid()) {
            e.preventDefault();
            firebase
                .auth()
                .createUserWithEmailAndPassword(email, password)
                .then(response => {
                    console.log(response);
                })
                .catch(error => {
                    console.log(error);
                })

        }
    }


    return (
        <Grid textAlign="center" verticalAlign="middle" className="app">
            <Grid.Column style={{ maxWidth: 450 }} >
                <Header as="h2" icon color="orange" text="center">
                    <Icon name="puzzle piece" color="orange" />
                    Register for DevChat
                </Header>
                <Form size="large" onSubmit={handleSubmit}>
                    <Segment stacked>
                        <Form.Input fluid name="username" icon="user" iconPosition="left"
                            placeholder="Username" value={username} onChange={handleChange} type="text" />
                        <Form.Input fluid name="email" icon="mail" iconPosition="left"
                            placeholder="Email" value={email} onChange={handleChange} type="email" />
                        <Form.Input fluid name="password" icon="lock" iconPosition="left"
                            placeholder="Password" value={password} onChange={handleChange} type="password" />
                        <Form.Input fluid name="passwordConfirmation" icon="repeat" iconPosition="left"
                            placeholder="Password Confirmation" value={passwordConfirmation} onChange={handleChange} type="password" />
                        <Button color="orange" fluid size="large">Submit</Button>
                    </Segment>
                </Form>
                {errors.length > 0 && (
                    <Message error>
                        <h3>Error</h3>
                        {displayError()}
                    </Message>
                )}
                <Message>Already a user? <Link to="/login">Login</Link></Message>
            </Grid.Column>
        </Grid>
    );
}

export default Register;