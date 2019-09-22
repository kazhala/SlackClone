import React from 'react';
import { Segment, Header, Icon, Input } from 'semantic-ui-react';

const MessagesHeader = props => {
    return (
        <Segment clearing>
            <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
                <span>
                    {props.channelName}
                    {!props.isPrivateChannel && <Icon name={"star outline"} color="black" />}
                </span>
                <Header.Subheader>
                    {props.userCount}
                </Header.Subheader>
            </Header>
            <Header floated="right">
                <Input
                    loading={props.searchLoading}
                    size="mini"
                    icon="search"
                    name="searchTerm"
                    placeholder="Search Messages"
                    onChange={props.handleSearch}
                />
            </Header>
        </Segment>
    );
}

export default MessagesHeader;