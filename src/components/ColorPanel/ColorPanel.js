import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/index';
import {
    Sidebar,
    Menu,
    Divider,
    Button,
    Modal,
    Icon,
    Label,
    Segment
} from 'semantic-ui-react';
import { SliderPicker } from 'react-color';
import firebase from '../../firebase';
import { useList } from 'react-firebase-hooks/database';

//firebase DB reference
const usersRef = firebase.database().ref('users');

const ColorPanel = props => {
    const { user } = props;

    const [modalOpen, setModalOpen] = useState(false);

    const [primary, setPrimary] = useState('');
    const [secondary, setSecondary] = useState('');

    const [appColors, setAppColors] = useState([]);

    //listen and store the DB entry to snapShots
    const [snapShots, loading, error] = useList(
        usersRef.child(`${user.uid}/colors`)
    );

    useEffect(() => {
        return () => {
            usersRef.child(`${user.uid}/colors`).off();
        };
    }, [user]);

    //after loading the DB entries, display the stored color
    useEffect(() => {
        if (snapShots && !loading && !error) {
            const userColors = [];
            snapShots.forEach(snap => {
                userColors.unshift(snap.val());
            });
            setAppColors(userColors);
        }
    }, [snapShots, loading, error]);

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleChangePrimary = color => {
        setPrimary(color.hex);
    };

    const handleChangeSecondary = color => {
        setSecondary(color.hex);
    };

    const handleSave = () => {
        if (primary && secondary) {
            saveColors(primary, secondary);
        }
    };

    //save the color to the database
    const saveColors = (primaryColor, secondaryColor) => {
        usersRef
            .child(`${user.uid}/colors`)
            .push()
            .update({
                primaryColor,
                secondaryColor
            })
            .then(() => {
                console.log('colors added');
                closeModal();
            })
            .catch(err => console.log(err));
    };

    //display the color stored in the appColor state as a visual block
    const displayUserColors = colors => {
        return (
            colors.length > 0 &&
            colors.map((color, index) => (
                <React.Fragment key={index}>
                    <Divider />
                    <div
                        className="color__container"
                        onClick={() =>
                            props.setGlobalColors(
                                color.primaryColor,
                                color.secondaryColor
                            )
                        }
                    >
                        <div
                            className="color__square"
                            style={{ backgroundColor: color.primaryColor }}
                        >
                            <div
                                className="color__overlay"
                                style={{
                                    backgroundColor: color.secondaryColor
                                }}
                            ></div>
                        </div>
                    </div>
                </React.Fragment>
            ))
        );
    };

    return (
        <Sidebar
            as={Menu}
            icon="labeled"
            inverted
            vertical
            visible
            width="very thin"
        >
            <Divider />
            <Button icon="add" size="small" color="blue" onClick={openModal} />
            {displayUserColors(appColors)}
            <Modal basic open={modalOpen} onClose={closeModal}>
                <Modal.Header>Choose App Colors</Modal.Header>
                <Modal.Content>
                    <Segment inverted>
                        <Label content="Primary Color" />
                        <SliderPicker
                            onChange={handleChangePrimary}
                            color={primary}
                        />
                    </Segment>

                    <Segment inverted>
                        <Label content="Secondary Color" />
                        <SliderPicker
                            onChange={handleChangeSecondary}
                            color={secondary}
                        />
                    </Segment>
                </Modal.Content>
                <Modal.Actions>
                    <Button color="green" inverted onClick={handleSave}>
                        <Icon name="checkmark" /> Save Colors
                    </Button>
                    <Button color="red" inverted onClick={closeModal}>
                        <Icon name="remove" /> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        </Sidebar>
    );
};

const mapDispatchToProps = dispatch => {
    return {
        setGlobalColors: (primary, secondary) =>
            dispatch(actionCreators.setColors(primary, secondary))
    };
};

export default connect(
    null,
    mapDispatchToProps
)(ColorPanel);
