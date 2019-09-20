import React, { useState, useReducer, useEffect, useCallback } from 'react';
import { useListVals } from 'react-firebase-hooks/database';
import { Menu, Icon, Modal, Form, Input, Button, Popup, Loader } from 'semantic-ui-react';
import firebase from '../../../firebase';
import { connect } from 'react-redux';
import * as actionCreators from '../../../actions/index';

//handle channel details
const channelInputReducer = (currentState, action) => {
    switch (action.type) {
        case 'CHANNELNAME':
            return {
                ...currentState,
                channelname: action.channelname
            }
        case 'CHANNELDETAILS':
            return {
                ...currentState,
                channelDetails: action.channelDetails
            }
        case 'CLEARDETAILS':
            return {
                channelname: '',
                channelDetails: ''
            }
        default:
            return currentState;
    }
}




const Channels = props => {
    const { setChannel } = props;

    //handle modal display
    const [modal, setModal] = useState(false);

    const [activeChannel, setActiveChannel] = useState('');

    const [firstLoad, setFirstLoad] = useState(true);

    //local reducer to handle multiple state manipulation
    const [channelInput, dispatchInput] = useReducer(channelInputReducer, {
        channelname: '',
        channelDetails: ''
    });

    //firebase databse listner reference
    const channelRef = firebase.database().ref('channels');

    //firebase databse listner + data
    // eslint-disable-next-line
    const [snapshots, loading, error] = useListVals(channelRef);

    //call redux to set new seleted channel
    const changeChannel = useCallback((channel) => {
        setActiveChannel(channel.id);
        setChannel(channel);
    }, [setChannel]);

    const setFirstChannel = useCallback(() => {
        if (firstLoad && snapshots.length > 0) {
            changeChannel(snapshots[0]);
            setFirstLoad(false);
        }
    }, [snapshots, firstLoad, changeChannel]);


    useEffect(() => {
        //console.log('loaded');
        setFirstChannel();
    }, [setFirstChannel, channelRef]);

    useEffect(() => {
        return () => {
            console.log('closed');
            channelRef.off();
        }
        // eslint-disable-next-line
    }, []);



    //handle input filed change when adding new channel
    const handleChange = e => {
        switch (e.target.name) {
            case 'channelname':
                dispatchInput({
                    type: 'CHANNELNAME',
                    channelname: e.target.value
                });
                break;
            case 'channeldetails':
                dispatchInput({
                    type: 'CHANNELDETAILS',
                    channelDetails: e.target.value
                });
                break;
            default:
                break;
        }
    }

    //close modal action
    const closeModal = () => {
        setModal(false);
    }

    //open modal aciton
    const openModal = () => {
        setModal(true);
    }

    //handles the aciton of adding a new channel
    const addChannel = () => {
        //creating a new field in fireabase databse
        const key = channelRef.push().key;
        //create a new object to be stored
        const newChannel = {
            id: key,
            name: channelInput.channelname,
            details: channelInput.channelDetails,
            createdBy: {
                name: props.user.displayName,
                avatar: props.user.photoURL
            }
        };

        //store the new object in the created new field
        channelRef
            .child(key)
            .update(newChannel)
            .then(() => {
                dispatchInput({
                    type: 'CLEARDETAILS'
                });
                closeModal();
                //console.log('channel log');
            })
            .catch(error => {
                console.log(error);
            })
    }

    //handle adding new channel
    const handleSubmit = e => {
        e.preventDefault();
        if (isFormValid()) {
            addChannel();
        }
    }

    //loop to display all channels retrieved from databse
    const displayChannels = () => {
        return (
            snapshots.length > 0 ? snapshots.map(channel => (
                <Menu.Item
                    key={channel.id}
                    onClick={() => changeChannel(channel)}
                    name={channel.name}
                    style={{ opacity: 0.7 }}
                    active={channel.id === activeChannel}
                >
                    # {channel.name}
                </Menu.Item>
            )) : <Loader active inverted>Loading channels</Loader>
        );
    }

    //check if field is empty
    const isFormValid = () => {
        return channelInput.channelDetails && channelInput.channelname;
    }

    return (
        <React.Fragment>

            <Menu.Menu className="menu">
                <Menu.Item >
                    <span>
                        <Icon name="exchange" /> CHANNELS
                    </span>{' '}
                    ({snapshots.length})
                    <Popup content="Add a new channel"
                        trigger={
                            <Icon name="add" onClick={openModal} />
                        } />
                </Menu.Item>
                {displayChannels()}
            </Menu.Menu>

            <Modal basic open={modal} onClose={closeModal}>
                <Modal.Header>Add a Channel</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <Input
                                fluid
                                label="Name of Channel"
                                name="channelname"
                                value={channelInput.channelname}
                                onChange={handleChange}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Input
                                fluid
                                label="About the channel"
                                name="channeldetails"
                                value={channelInput.channelDetails}
                                onChange={handleChange}
                            />
                        </Form.Field>
                    </Form>
                </Modal.Content>

                <Modal.Actions>
                    <Button color="green" inverted onClick={handleSubmit}>
                        <Icon name="checkmark" /> Add
                    </Button>
                    <Button color="red" inverted onClick={closeModal}>
                        <Icon name="remove" /> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>

        </React.Fragment>
    );
}

const mapDispatchToProps = dispatch => {
    return {
        setChannel: (channel) => dispatch(actionCreators.setCurrentChannel(channel))
    }
}

export default connect(null, mapDispatchToProps)(Channels);