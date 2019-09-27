import React, { useState, useReducer } from 'react';
import firebase from '../../firebase';
import md5 from 'md5';
import {
    Grid,
    Form,
    Segment,
    Button,
    Header,
    Message,
    Icon
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';

//md5 create hash code for getting random avatar
//firebase handle authentication

//reducer to handle same type of input
const registerInfoReducer = (currentState, action) => {
    switch (action.type) {
        case 'USERNAME':
            return {
                ...currentState,
                username: action.username
            };
        case 'EMAIL':
            return {
                ...currentState,
                email: action.email
            };
        case 'PASSWORD':
            return {
                ...currentState,
                password: action.password
            };
        case 'PASSWORDCONFIRMATION':
            return {
                ...currentState,
                passwordConfirmation: action.passwordConfirmation
            };
        default:
            return currentState;
    }
};

const Register = props => {
    //useReducer to set up initial state
    const [userInput, dispatchInput] = useReducer(registerInfoReducer, {
        username: '',
        email: '',
        password: '',
        passwordConfirmation: ''
    });

    //set up error state and loading state
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    //handle user input , 2 way binding
    const handleChange = event => {
        switch (event.target.name) {
            case 'username':
                dispatchInput({
                    type: 'USERNAME',
                    username: event.target.value
                });
                break;
            case 'email':
                dispatchInput({
                    type: 'EMAIL',
                    email: event.target.value
                });
                break;
            case 'password':
                dispatchInput({
                    type: 'PASSWORD',
                    password: event.target.value
                });
                break;
            case 'passwordConfirmation':
                dispatchInput({
                    type: 'PASSWORDCONFIRMATION',
                    passwordConfirmation: event.target.value
                });
                break;
            default:
                break;
        }
    };

    //check if the input field is empty
    const isFormEmpty = () => {
        return (
            !userInput.username.length ||
            !userInput.password.length ||
            !userInput.email.length ||
            !userInput.passwordConfirmation.length
        );
    };

    //check if form contains any error
    const formIsValid = () => {
        let errorArray = [];
        let error;
        if (isFormEmpty()) {
            error = { message: 'Fill in all fields' };
            setErrors(errorArray.concat(error));
            return false;
        } else if (!passWordValid()) {
            error = { message: 'Password is Invalid' };
            setErrors(errorArray.concat(error));
            return false;
        } else {
            setErrors([]);
            return true;
        }
    };

    //display all erroes
    const displayError = () =>
        errors.map((error, index) => {
            return <p key={index}>{error.message}</p>;
        });

    //check if both password match and valid
    const passWordValid = () => {
        if (
            userInput.password.length < 6 ||
            userInput.passwordConfirmation.length < 6
        ) {
            return false;
        } else if (userInput.password !== userInput.passwordConfirmation) {
            return false;
        }
        return true;
    };

    //handle submit aciton
    const handleSubmit = e => {
        let errorArray = [];
        e.preventDefault();

        //start the action when form is all valid
        if (formIsValid()) {
            //clear the errors
            setErrors([]);
            //start loading
            setLoading(true);

            //call firebase sdk to set up the account, refer to firebase sdk documentation
            firebase
                .auth()
                .createUserWithEmailAndPassword(
                    userInput.email,
                    userInput.password
                )
                .then(response => {
                    console.log(response);
                    //modify the response and set displaynae and photoURL
                    response.user
                        .updateProfile({
                            displayName: userInput.username,
                            photoURL: `http://gravatar.com/avatar/${md5(
                                response.user.email
                            )}?d=identicon`
                        })
                        .catch(error => {
                            console.log(error);
                            setLoading(false);
                            setErrors(errorArray.concat(error));
                        });
                })
                .catch(error => {
                    setErrors(errorArray.concat(error));
                    setLoading(false);
                });
        }
    };

    //check if the inputfield contains error
    //if error, display inputfield with error css
    const handleInputError = inputName => {
        if (errors.some(error => error.message.includes('all'))) {
            return 'error';
        }
        return errors.some(error =>
            error.message.toLowerCase().includes(inputName)
        )
            ? 'error'
            : '';
    };

    return (
        <Grid textAlign="center" verticalAlign="middle" className="app">
            <Grid.Column style={{ maxWidth: 450 }}>
                <Header as="h1" icon color="orange" text="center">
                    <Icon name="puzzle piece" color="orange" />
                    Register for DevChat
                </Header>

                <Form size="large" onSubmit={handleSubmit}>
                    <Segment stacked>
                        <Form.Input
                            fluid
                            className={handleInputError('username')}
                            name="username"
                            icon="user"
                            iconPosition="left"
                            placeholder="Username"
                            value={userInput.username}
                            onChange={handleChange}
                            type="text"
                        />
                        <Form.Input
                            fluid
                            className={handleInputError('email')}
                            name="email"
                            icon="mail"
                            iconPosition="left"
                            placeholder="Email"
                            value={userInput.email}
                            onChange={handleChange}
                            type="email"
                        />
                        <Form.Input
                            fluid
                            className={handleInputError('password')}
                            name="password"
                            icon="lock"
                            iconPosition="left"
                            placeholder="Password"
                            value={userInput.password}
                            onChange={handleChange}
                            type="password"
                        />
                        <Form.Input
                            fluid
                            className={handleInputError('password')}
                            name="passwordConfirmation"
                            icon="repeat"
                            iconPosition="left"
                            placeholder="Password Confirmation"
                            value={userInput.passwordConfirmation}
                            onChange={handleChange}
                            type="password"
                        />
                        <Button
                            disabled={loading}
                            className={loading ? 'loading' : ''}
                            color="orange"
                            fluid
                            size="large"
                        >
                            Submit
                        </Button>
                    </Segment>
                </Form>

                {errors.length > 0 && (
                    <Message error>
                        <h3>Error</h3>
                        {displayError()}
                    </Message>
                )}
                <Message>
                    Already a user? <Link to="/login">Login</Link>
                </Message>
            </Grid.Column>
        </Grid>
    );
};

export default Register;
