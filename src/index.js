import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route, withRouter } from 'react-router-dom';
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
import * as serviceWorker from './serviceWorker';

const store = createStore(rootReducer, composeWithDevTools());


//setting up router at start of the project
const Root = (props) => {
    const { history, setUser, clearUser } = props;

    //listen to the state of firebase authentication
    useEffect(() => {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                console.log(user);
                setUser(user);
                history.push('/');
            } else {
                history.push('/login');
                clearUser();
            }
        })
    }, [history, setUser, clearUser]);


    return props.loading ? <Spinner /> : (
        <Switch>
            <Route path="/" exact component={App} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
        </Switch>

    )

};

const mapStateToProps = state => {
    return {
        loading: state.user.isLoading
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setUser: (user) => dispatch(actionCreators.setUser(user)),
        clearUser: () => dispatch(actionCreators.clearUser())
    }
}

const RootWithAuth = withRouter(connect(mapStateToProps, mapDispatchToProps)(Root));

ReactDOM.render(<Provider store={store}>
    <Router>
        <RootWithAuth />
    </Router>
</Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
