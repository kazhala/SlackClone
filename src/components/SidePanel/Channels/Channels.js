import React, { useState, useReducer } from 'react';
import { Menu, Icon, Modal, Form, Input, Button, Popup } from 'semantic-ui-react';
import firebase from '../../../firebase';

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
    const [channels, setChannels] = useState([]);
    const [modal, setModal] = useState(false);
    const [channelInput, dispatchInput] = useReducer(channelInputReducer, {
        channelname: '',
        channelDetails: ''
    });

    const channelRef = firebase.database().ref('channels');

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

    const closeModal = () => {
        setModal(false);
    }

    const openModal = () => {
        setModal(true);
    }

    const addChannel = () => {
        const key = channelRef.push().key;
        const newChannel = {
            id: key,
            name: channelInput.channelname,
            details: channelInput.channelDetails,
            createdBy: {
                name: props.user.displayName,
                avatar: props.user.photoURL
            }
        };
        channelRef
            .child(key)
            .update(newChannel)
            .then(() => {
                dispatchInput({
                    type: 'CLEARDETAILS'
                });
                closeModal();
                console.log('channel log');
            })
            .catch(error => {
                console.log(error);
            })
    }

    const handleSubmit = e => {
        e.preventDefault();
        if (isFormValid()) {
            addChannel();
        }
    }

    const isFormValid = () => {
        return channelInput.channelDetails && channelInput.channelname;
    }

    return (
        <React.Fragment>

            <Menu.Menu style={{ paddingBottom: '2em' }}>
                <Menu.Item >
                    <span>
                        <Icon name="exchange" /> CHANNELS
                    </span>{' '}
                    ({channels.length})
                    <Popup content="Add a new channel"
                        trigger={
                            <Icon name="add" onClick={openModal} />
                        } />
                </Menu.Item>
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

export default Channels;