import React, { useState, useReducer } from 'react';
import firebase from '../../firebase';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

//firebase handle authentication

//reducer to handle same type of input
const registerInfoReducer = (currentState, action) => {
    switch (action.type) {
        case 'EMAIL':
            return {
                ...currentState,
                email: action.email,
            };
        case 'PASSWORD':
            return {
                ...currentState,
                password: action.password
            };
        default:
            return currentState;
    }
}


const Login = props => {
    //useReducer to set up initial state
    const [userInput, dispatchInput] = useReducer(registerInfoReducer, {
        email: '',
        password: '',
    });

    //set up error state and loading state
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);


    //handle user input , 2 way binding
    const handleChange = (event) => {
        switch (event.target.name) {
            case 'email':
                dispatchInput({
                    type: 'EMAIL',
                    email: event.target.value
                })
                break;
            case 'password':
                dispatchInput({
                    type: 'PASSWORD',
                    password: event.target.value
                })
                break;
            default:
                break;
        }
    }


    //display all erroes
    const displayError = () => errors.map((error, index) => {
        return <p key={index}>{error.message}</p>
    });

    //handle submit aciton
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isFormValid) {
            setErrors([]);
            setLoading(true);
            firebase
                .auth()
                .signInWithEmailAndPassword(userInput.email, userInput.password)
                .then(response => {
                    console.log(response);
                })
                .catch(error => {
                    setErrors(errors.concat(error));
                    setLoading(false);
                });
        }

    }

    const isFormValid = () => {
        return userInput.email && userInput.password;
    }

    //check if the inputfield contains error
    //if error, display inputfield with error css
    const handleInputError = (inputName) => {
        if (errors.some(error => error.message.includes('all'))) {
            return 'error';
        }
        return (errors.some(error => error.message.toLowerCase().includes(inputName)) ? 'error' : '');
    }


    return (
        <Grid textAlign="center" verticalAlign="middle" className="app">
            <Grid.Column style={{ maxWidth: 450 }} >
                <Header as="h1" icon color="violet" text="center">
                    <Icon name="code branch" color="violet" />
                    Login to DevChat
                </Header>

                <Form size="large" onSubmit={handleSubmit}>
                    <Segment stacked>
                        <Form.Input fluid
                            className={handleInputError('email')}
                            name="email" icon="mail" iconPosition="left"
                            placeholder="Email" value={userInput.email} onChange={handleChange} type="email" />
                        <Form.Input fluid
                            className={handleInputError('password')}
                            name="password" icon="lock" iconPosition="left"
                            placeholder="Password" value={userInput.password} onChange={handleChange} type="password" />
                        <Button disabled={loading} className={loading ? 'loading' : ''} color="violet" fluid size="large">Submit</Button>
                    </Segment>
                </Form>

                {errors.length > 0 && (
                    <Message error>
                        <h3>Error</h3>
                        {displayError()}
                    </Message>
                )}
                <Message>Don't have an account? <Link to="/register">Register</Link></Message>
            </Grid.Column>
        </Grid>
    );
}

export default Login;
