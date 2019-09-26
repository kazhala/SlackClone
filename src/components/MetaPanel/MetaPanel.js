import React, { useState } from 'react';
import { Segment, Accordion, Header, Icon } from 'semantic-ui-react';

const MetaPanel = props => {
    const { isPrivateChannel } = props;

    const [activeIndex, setActiveIndex] = useState(0);

    const setNewActiveIndex = (e, titleProps) => {
        const { index } = titleProps;
        const newIndex = activeIndex === index ? -1 : index;
        setActiveIndex(newIndex);
    };

    if (isPrivateChannel) return null;

    return (
        <Segment>
            <Header as="h3" attached="top">
                About # Channel
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
                    Details
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
                    posters
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
                    creator
                </Accordion.Content>
            </Accordion>
        </Segment>
    );
};

export default MetaPanel;
