import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    withRouter
} from 'react-router-dom';
//import semantic ui css
import 'semantic-ui-css/semantic.min.css';
import App from './components/App';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import firebase from './firebase';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import * as actionCreators from './actions/index';
import rootReducer from './reducers/index';
import Spinner from './Spinner';
import { useAuthState } from 'react-firebase-hooks/auth';
import * as serviceWorker from './serviceWorker';

const store = createStore(rootReducer, composeWithDevTools());
const userRef = firebase.database().ref('users');
//setting up router at start of the project
const Root = props => {
    const { history, setUser, clearUser } = props;

    //eslint-disable-next-line
    const [user, loading, error] = useAuthState(firebase.auth());

    //listen to the state of firebase authentication
    useEffect(() => {
        const saveUser = response => {
            userRef.child(response.uid).once('value', snap => {
                if (!snap.exists()) {
                    userRef
                        .child(response.uid)
                        .update({
                            name: response.displayName,
                            avatar: response.photoURL
                        })
                        .then(() => history.push('/'));
                } else {
                    history.push('/');
                }
            });
        };
        if (!loading) {
            if (user) {
                if ((user.displayName || user.photoURL) === null) {
                    window.location.reload();
                }
                setUser(user);
                saveUser(user);
            } else {
                history.push('/login');
                clearUser();
            }
        }
    }, [history, setUser, clearUser, user, loading]);

    return props.loading ? (
        <Spinner />
    ) : (
        <Switch>
            <Route path="/" exact component={App} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
        </Switch>
    );
};

const mapStateToProps = state => {
    return {
        loading: state.user.isLoading
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setUser: user => dispatch(actionCreators.setUser(user)),
        clearUser: () => dispatch(actionCreators.clearUser())
    };
};

const RootWithAuth = withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Root)
);

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <RootWithAuth />
        </Router>
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
