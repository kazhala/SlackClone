import React, { useState, useReducer, useEffect, useCallback } from 'react';
import { useListVals, useListKeys } from 'react-firebase-hooks/database';
import { Menu, Icon, Modal, Form, Input, Button, Popup, Loader, Label } from 'semantic-ui-react';
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


//firebase databse listner reference
const channelRef = firebase.database().ref('channels');
const messagesRef = firebase.database().ref('messages');

const Channels = props => {
    const { setChannel, setPrivateChannel } = props;

    //handle modal display
    const [modal, setModal] = useState(false);
    //current channel
    const [activeChannel, setActiveChannel] = useState('');
    //identify component first load, set first channel as active
    const [firstLoad, setFirstLoad] = useState(true);
    //for message notification reference, once message channel is set, start accepting message notifications
    const [messageChannel, setMessageChannel] = useState(null);
    //store each channel notification status, if new message, array would update
    const [notifications, setNotifications] = useState([]);

    //local reducer to handle multiple state manipulation
    const [channelInput, dispatchInput] = useReducer(channelInputReducer, {
        channelname: '',
        channelDetails: ''
    });

    //firebase databse listner + data
    // eslint-disable-next-line
    const [snapshots, loading, error] = useListVals(channelRef);
    // eslint-disable-next-line
    const [snapKeys, keyLoading, keyError] = useListKeys(channelRef);

    //notification listners, if new message is upload to the DB
    //check if it is the same channel, then display count
    useEffect(() => {
        const handleNotifications = (channelId, currentChannelId, notifications, snap) => {
            let lastTotal = 0;
            //find the index of the channel in notification array
            let index = notifications.findIndex(notification => notification.id === channelId);
            //if found
            if (index !== -1) {
                // and is not the current channel
                if (channelId !== currentChannelId) {
                    //update total
                    lastTotal = notifications[index].total;
                    //if message on DB is greater than lastTotal, there is new messsage
                    if (snap.numChildren() - lastTotal > 0) {
                        notifications[index].count = snap.numChildren() - lastTotal;
                    }
                }
                notifications[index].lastKnownTotal = snap.numChildren();
            } else {
                //if not found, means array is not fully loaded yet, push the current channel into the array
                notifications.push({
                    id: channelId,
                    total: snap.numChildren(),
                    lastKnownTotal: snap.numChildren(),
                    count: 0
                })
            }
            setNotifications(notifications);
        };

        //open a listner for each channel
        snapKeys.forEach(snap => {
            messagesRef.child(snap).on('value', messageSnap => {
                //once the messageChannel is set, start accepting channel notifications
                if (messageChannel) {
                    handleNotifications(snap, messageChannel.id, notifications, messageSnap);
                }
            })
        })

    }, [messageChannel, notifications, snapKeys]);

    //console.log(notifications);

    const clearNotifications = useCallback(() => {
        //get the index of the current channel
        let index = notifications.findIndex(notification => notification.id === messageChannel.id);
        if (index !== -1) {
            //clear the notification
            setNotifications(prevNotification => {
                let updatedNotification = [...prevNotification];
                updatedNotification[index].total = prevNotification[index].lastKnownTotal;
                updatedNotification[index].count = 0;
                return updatedNotification;
            })
        }
    }, [messageChannel, notifications])

    //call redux to set new seleted channel
    const changeChannel = useCallback((channel) => {
        setActiveChannel(channel.id);
        //clear notification on entering a new channel
        clearNotifications();
        setChannel(channel);
        setPrivateChannel(false);
        if (!firstLoad) {
            setMessageChannel(channel);
        }
    }, [setChannel, setPrivateChannel, firstLoad, clearNotifications]);

    const setFirstChannel = useCallback(() => {
        if (firstLoad && snapshots.length > 0) {
            changeChannel(snapshots[0]);
            setFirstLoad(false);
        }
    }, [snapshots, firstLoad, changeChannel]);


    useEffect(() => {
        setFirstChannel();
    }, [setFirstChannel]);

    //close the listners
    useEffect(() => {
        return () => {
            console.log('closed');
            channelRef.off();
            messagesRef.off();
        }
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
                    {getNotificationCount(channel) && (
                        <Label color="red">{getNotificationCount(channel)}</Label>
                    )}
                    # {channel.name}
                </Menu.Item>
            )) : <Loader active inverted>Loading channels</Loader>
        );
    }

    const getNotificationCount = (channel) => {
        let count = 0;
        //find the according channel details in notification
        notifications.forEach(notification => {
            if (notification.id === channel.id) {
                count = notification.count;
            }
        })

        //if there is new messages, return
        if (count > 0) return count;
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
        setChannel: (channel) => dispatch(actionCreators.setCurrentChannel(channel)),
        setPrivateChannel: (isPrivateChannel) => dispatch(actionCreators.setPrivateChannel(isPrivateChannel)),
    }
}

export default connect(null, mapDispatchToProps)(Channels);