import React from 'react';
import firebase from '../../../firebase';
import { Grid, Header, Icon, Dropdown, Image } from 'semantic-ui-react';

const UserPanel = props => {
    const { user, primaryColor } = props;

    //selectable in the dropdown menu
    const dropdownOptions = () => [
        {
            key: 'user',
            text: (
                <span>
                    Signed in as <strong>{user.displayName}</strong>
                </span>
            ),
            disabled: true
        },
        {
            key: 'avatar',
            text: <span>Change Avatar</span>
        },
        {
            key: 'signout',
            text: <div onClick={handleSignout}>Sign out</div>
        }
    ];

    //handle action when user signout
    const handleSignout = () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                console.log('signed out');
            });
    };

    return (
        <Grid>
            <Grid.Column style={{ background: primaryColor }}>
                <Grid.Row style={{ padding: '1.2em', margin: 0 }}>
                    <Header inverted floated="left" as="h2">
                        <Icon name="code" />
                        <Header.Content>DevChat</Header.Content>
                    </Header>
                    <Header style={{ padding: '0.25em' }} as="h4" inverted>
                        <Dropdown
                            trigger={
                                <span>
                                    <Image
                                        src={user.photoURL}
                                        spaced="right"
                                        avatar
                                    />
                                    {user.displayName}
                                </span>
                            }
                            options={dropdownOptions()}
                        />
                    </Header>
                </Grid.Row>
            </Grid.Column>
        </Grid>
    );
};

export default UserPanel;
