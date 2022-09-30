import React from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Tooltip from '@mui/material/Tooltip';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import UploadIcon from '@mui/icons-material/Upload'; 
import Typography from '@mui/material/Typography';
import MainProgress from './MainProgress';
import './Main.css';

const config = require('../config.json')[process.env.NODE_ENV || 'development'];

interface ILeaguesViewState {
    leagues: any
    loading: boolean
    exporting: boolean
}

interface ILeaguesViewProps {
    accessToken: string
}

export default class LeaguesView extends React.Component<ILeaguesViewProps, ILeaguesViewState> {
        classes: any;

        constructor(props: any) {
            super(props);
    
            this.state = {
                leagues: {},
                loading: false,
                exporting: false
            }
        }
    
        componentDidMount() {
            this.get_leagues();
        }

        // build_leagues_map takes as input an array of leagues and maps the league key to the league object
        build_leagues_map(leagues: any[]) {
            let leaguesMap: any = {};
            for (let i = 0; i < leagues.length; i++) {
                leaguesMap[leagues[i].league_key] = leagues[i];
            }
            return leaguesMap;
        }
    
        private get_leagues = () => {
            this.setState({ loading: true, leagues: [] });

            axios.post(config.apiUrl + '/leagues', { 
                access_token: this.props.accessToken 
            })
            .then( (response) => {
                console.log(response);
                let leagues = this.build_leagues_map(response.data)
                console.log(leagues)

                this.setState({
                    leagues: leagues,
                    loading: false
                })
            })
            .catch( (error) => {
                console.log(error);
                this.setState({ loading: false });
            })
        }

        // export_league function takes as input a league, and calls the export api and with the league_key as a query param
        private export_league = (key: string) => {
            // set the state of leagues at league_key exporting to true
            let leagues = this.state.leagues;
            leagues[key].exporting = true;
            this.setState({ leagues: leagues, exporting: true });
            axios.post(config.apiUrl + '/export', {
                access_token: this.props.accessToken,
                league_key: key
            })
            .then( (response) => {
                console.log(response);
                // set the stage of the leagues at league_key exporting to false
                let leagues = this.state.leagues;
                leagues[key].exporting = false;

                this.setState({ leagues: leagues, exporting: false });
            })
            .catch( (error) => {
                console.log(error);
                // set the stage of the leagues at league_key exporting to false
                let leagues = this.state.leagues;
                leagues[key].exporting = false;
                this.setState({ leagues: leagues, exporting: false });
            })
            .finally( () => {
                this.get_leagues();
            })
        }

    
        render() {
            return (
                <Box sx={{ width: '100%' }}>
                    { this.state.loading ? 
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                            { MainProgress("Fetching Leagues") }
                        </Box>
                        :
                        <h1>Leagues</h1>
                    }
                    {/* Create a Box with maxwidth 720 horizontall centered  */}
                    <Box sx={{ width: '100%', maxWidth: 720, bgcolor: 'background.paper', mx: 'auto' }}>
                        <List dense={true}>
                            {/* iterate over key of leagues in state */}
                            {Object.keys(this.state.leagues).map((key) => (
                                <ListItem key={key}>
                                    <ListItemText
                                        primary={this.state.leagues[key].name}
                                        secondary={this.state.leagues[key].season}/>
                                    {/* If exporting, add blue text to the far right of the list item saying "This usually takes 1 minute" */}
                                    { this.state.leagues[key].exporting &&
                                        <Typography variant="body2" color="text.secondary">
                                            This usually takes 1 minute
                                        </Typography>
                                    }
                                    {/* On click of Icon Button, call the export function with league as input */}
                                    <IconButton disabled={this.state.exporting} edge="end" aria-label="export league" onClick={() => this.export_league(key)}>
                                        { this.state.leagues[key].exporting ? <CircularProgress size={24} /> : <Tooltip title="Export League to Google Sheets"><UploadIcon sx={{p:0.5}}/></Tooltip> }
                                    </IconButton>
                                    { this.state.leagues[key].export_url && !this.state.leagues[key].exporting &&
                                        <IconButton href={this.state.leagues[key].export_url} edge="end" target="_blank">
                                            {/* Create a BorderAllIcon with a green background */}
                                            <Tooltip title={this.state.leagues[key].export_url}><ExitToAppIcon sx={{ bgcolor: 'success.main', color: 'white', p:0.5}}/></Tooltip>
                                        </IconButton>
                                    }
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    {/* Add an email link to caltonji@gmail.com with the prompt "For feature requests, email: caltonji@gmail.com" add padding below */}
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary" align="center">
                            For feature requests, email: <a href="mailto:caltonji@gmail.com">caltonji@gmail.com</a>
                        </Typography>
                    </Box>

                </Box>
            )
        }
    }