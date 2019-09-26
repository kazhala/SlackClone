import React, { useState } from 'react';
import {
    Segment,
    Accordion,
    Header,
    Icon,
    Image,
    List
} from 'semantic-ui-react';

const MetaPanel = props => {
    const { isPrivateChannel, currentChannel, userPosts } = props;

    const [activeIndex, setActiveIndex] = useState(0);

    const setNewActiveIndex = (e, titleProps) => {
        const { index } = titleProps;
        const newIndex = activeIndex === index ? -1 : index;
        setActiveIndex(newIndex);
    };

    const displayTopPosters = () => {
        return Object.entries(userPosts)
            .sort((a, b) => b[1] - a[1])
            .map((user, index) => {
                return (
                    <List.Item key={index}>
                        <Image avatar src={user[1].avatar} />
                        <List.Content>
                            <List.Header as="a">{user[0]}</List.Header>
                            <List.Description>
                                {user[1].count}{' '}
                                {user[1].count === 1 ? ' post' : ' posts'}
                            </List.Description>
                        </List.Content>
                    </List.Item>
                );
            })
            .slice(0, 3);
    };

    if (isPrivateChannel) return null;

    return (
        <Segment loading={!currentChannel}>
            <Header as="h3" attached="top">
                About # {currentChannel && currentChannel.name}
            </Header>
            <Accordion styled attached="true">
                <Accordion.Title
                    active={activeIndex === 0}
                    index={0}
                    onClick={setNewActiveIndex}
                >
                    <Icon name="dropdown" />
                    <Icon name="info" />
                    Channel Details
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 0}>
                    {currentChannel && currentChannel.details}
                </Accordion.Content>

                <Accordion.Title
                    active={activeIndex === 1}
                    index={1}
                    onClick={setNewActiveIndex}
                >
                    <Icon name="dropdown" />
                    <Icon name="user circle" />
                    Top Posters
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 1}>
                    <List>{userPosts && displayTopPosters()}</List>
                </Accordion.Content>
                <Accordion.Title
                    active={activeIndex === 2}
                    index={2}
                    onClick={setNewActiveIndex}
                >
                    <Icon name="dropdown" />
                    <Icon name="pencil alternate" />
                    Created By
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 2}>
                    <Header as="h3">
                        <Image
                            circular
                            src={
                                currentChannel &&
                                currentChannel.createdBy.avatar
                            }
                        />
                        {currentChannel && currentChannel.createdBy.name}
                    </Header>
                </Accordion.Content>
            </Accordion>
        </Segment>
    );
};

export default MetaPanel;
