import React, { useState, useReducer } from 'react';
import { Menu, Icon, Modal, Form, Input, Button, Popup } from 'semantic-ui-react';

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


    return (
        <React.Fragment>

            <Menu.Menu style={{ paddingBottom: '2em' }}>
                <Menu.Item>
                    <span>
                        <Icon name="exchange" /> CHANNELS
                </span>{' '}
                    ({channels.length}) <Popup content="Add a new channel" trigger={<Icon name="add" onClick={openModal} />} />
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
                                onChange={handleChange}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Input
                                fluid
                                label="About the channel"
                                name="channeldetails"
                                onChange={handleChange}
                            />
                        </Form.Field>
                    </Form>
                </Modal.Content>

                <Modal.Actions>
                    <Button color="green" inverted>
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