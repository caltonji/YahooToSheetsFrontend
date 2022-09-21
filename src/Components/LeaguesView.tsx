import React from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Tooltip from '@mui/material/Tooltip';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import UploadIcon from '@mui/icons-material/Upload'; 
import BorderAllIcon from '@mui/icons-material/BorderAll';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';


const apiUrl = "http://127.0.0.1:5000";

interface ILeaguesViewState {
    leagues: any
    loading: boolean
}

interface ILeaguesViewProps {
    accessToken: string
}

export default class LeaguesView extends React.Component<ILeaguesViewProps, ILeaguesViewState> {
        apiParams: { params: { access_token: string; }; };
        classes: any;
        

        constructor(props: any) {
            super(props);

            this.apiParams = { params: { access_token: this.props.accessToken } };
    
            this.state = {
                leagues: {},
                loading: false
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
            this.setState({ loading: true });
            
            axios.get(apiUrl + '/leagues', this.apiParams)
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
            this.setState({ leagues: leagues });
            axios.get(apiUrl + '/export', {
                params: {
                    access_token: this.props.accessToken,
                    league_key: key
                }
            })
            .then( (response) => {
                console.log(response);
                // set the stage of the leagues at league_key exporting to false
                let leagues = this.state.leagues;
                leagues[key].exporting = false;
                this.setState({ leagues: leagues });
            })
            .catch( (error) => {
                console.log(error);
                // set the stage of the leagues at league_key exporting to false
                let leagues = this.state.leagues;
                leagues[key].exporting = false;
                this.setState({ leagues: leagues });
            })
            .finally( () => {
                this.get_leagues();
            })
        }
    
        render() {
            return (
                <Box sx={{ width: '100%' }}>
                    <h1>Leagues</h1>
                    { this.state.loading && 
                        <div>Loading...</div>
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
                                    { this.state.leagues[key].export_url ?
                                        <IconButton href={this.state.leagues[key].export_url} edge="end" target="_blank">
                                            {/* Create a BorderAllIcon with a green background */}
                                            <Tooltip title={this.state.leagues[key].export_url}><ExitToAppIcon sx={{ bgcolor: 'success.main', color: 'white', p:0.5}}/></Tooltip>
                                        </IconButton>
                                        :
                                        <IconButton disabled={this.state.leagues[key].exporting} edge="end" aria-label="export league" onClick={() => this.export_league(key)}>
                                            { this.state.leagues[key].exporting ? <CircularProgress size={24} /> : <Tooltip title="Export League to Google Sheets"><UploadIcon sx={{p:0.5}}/></Tooltip> }
                                        </IconButton>
                    }
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Box>
            )
        }
    }