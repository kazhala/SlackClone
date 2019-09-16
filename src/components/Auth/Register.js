import React, { useState } from 'react';
import firebase from '../../firebase';
import md5 from 'md5';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const Register = props => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userRef, setUserRef] = useState(firebase.database().ref('users'));

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
            setErrors([]);
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
        let errorArray = [];
        e.preventDefault();
        if (formIsValid()) {
            setErrors([]);
            setLoading(true);
            firebase
                .auth()
                .createUserWithEmailAndPassword(email, password)
                .then(response => {
                    console.log(response);
                    response.user.updateProfile({
                        displayName: username,
                        photoURL: `http://gravatar.com/avatar/${md5(response.user.email)}?d=identicon`
                    })
                        .then(() => {
                            saveUser(response).then(() => {
                                setLoading(false);
                            })
                        })
                        .catch(error => {
                            console.log(error);
                            setLoading(false);
                            setErrors(errorArray.concat(error));
                        })
                })
                .catch(error => {
                    setErrors(errorArray.concat(error));
                    setLoading(false);
                })

        }
    }

    const saveUser = response => {
        return userRef.child(response.user.uid).set({
            name: response.user.displayName,
            avatar: response.user.photoURL
        })
    }

    const handleInputError = (inputName) => {
        if (errors.some(error => error.message.includes('all'))) {
            return 'error';
        }
        return (errors.some(error => error.message.toLowerCase().includes(inputName)) ? 'error' : '');
    }


    return (
        <Grid textAlign="center" verticalAlign="middle" className="app">
            <Grid.Column style={{ maxWidth: 450 }} >
                <Header as="h1" icon color="orange" text="center">
                    <Icon name="puzzle piece" color="orange" />
                    Register for DevChat
                </Header>

                <Form size="large" onSubmit={handleSubmit}>
                    <Segment stacked>
                        <Form.Input fluid
                            className={handleInputError('username')}
                            name="username" icon="user" iconPosition="left"
                            placeholder="Username" value={username} onChange={handleChange} type="text" />
                        <Form.Input fluid
                            className={handleInputError('email')}
                            name="email" icon="mail" iconPosition="left"
                            placeholder="Email" value={email} onChange={handleChange} type="email" />
                        <Form.Input fluid
                            className={handleInputError('password')}
                            name="password" icon="lock" iconPosition="left"
                            placeholder="Password" value={password} onChange={handleChange} type="password" />
                        <Form.Input fluid
                            className={handleInputError('password')}
                            name="passwordConfirmation" icon="repeat" iconPosition="left"
                            placeholder="Password Confirmation" value={passwordConfirmation} onChange={handleChange} type="password" />
                        <Button disabled={loading} className={loading ? 'loading' : ''} color="orange" fluid size="large">Submit</Button>
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