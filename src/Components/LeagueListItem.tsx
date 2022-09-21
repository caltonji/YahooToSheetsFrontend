// import react
import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

interface ILeagueViewProps {
    league: any
}

export default class LeagueView extends React.Component<ILeagueViewProps, any> {
    render() {
        // Display the 'name' and 'season' of the league and an export button on the far right
        return (
            <ListItem>
                 <ListItemText primary={this.props.league.name} secondary={this.props.league.season} />
            </ListItem>
        )
    }
}