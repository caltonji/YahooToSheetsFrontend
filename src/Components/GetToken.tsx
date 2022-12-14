import {
    Button, 
    Box
    }
    from '@material-ui/core';
import * as React from 'react';
import * as qs from 'qs';
import axios from 'axios';
import MainProgress from './MainProgress';
import Typography from '@mui/material/Typography';
import './Main.css';

interface IGetTokenState {
    accessToken: string,
    expirationTime: number,
    refreshToken: string,
    loading: boolean
}

interface IGetTokenProps {
    updateAccessToken: (accessToken: string) => void,
}

const loginTitle = "Login with Yahoo! for Read Access";

const config = require('../config.json')[process.env.NODE_ENV || 'development'];
const loginUrl = "https://api.login.yahoo.com/oauth2/request_auth?response_type=code&state=&client_id=" + config.clientId + "&scope=&redirect_uri=" + config.redirectUrl;

const titleMessage = "Export your Fantasy Football data to Google Sheets";
const secondMessage = "By logging into Yahoo, we get temporary Read access to your Fantasy Football leauges.";

export default class GetLink extends React.Component<IGetTokenProps, IGetTokenState> {

    constructor(props: any) {
        super(props);

        this.state = {
            accessToken: "",
            expirationTime: new Date().getTime(),
            refreshToken: "",
            loading: false
        }
    }

    componentDidMount() {
        let queryParams = qs.parse(window.location.search, { ignoreQueryPrefix: true });
        // if a code is provided in url, use that. Else try filling state with localStorage
        if (queryParams.code) {
            window.history.pushState({}, document.title, "/");
            this.get_token(queryParams.code.toString());
        } else {
            let accessToken = localStorage.getItem("accessToken");
            let refreshToken = localStorage.getItem("refreshToken");
            const expirationTimeString = localStorage.getItem("expirationTime")
            if (expirationTimeString && accessToken && refreshToken) {
                let expirationTimeEpoch: number = Date.parse(expirationTimeString);
                this.setState({
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    expirationTime: expirationTimeEpoch
                });
                const ttl = expirationTimeEpoch - new Date().getTime();
                if (ttl > 0) {
                    this.props.updateAccessToken(accessToken);
                }
                // if (ttl > 0) {
                //     setTimeout(() => {
                //         this.forceUpdate();
                //     }, ttl);
                // }
            }
        }
    }

    private get_token = (code: string) => {
        console.log("getting token");
        console.log(code);
        this.setState({
            loading: true
        });
        axios.post(config.apiUrl + '/auth', {
            yahoo_code: code
        })
        .then( (response) => {
            console.log(response);
            this.updateTokenData(response.data);
        })
        .catch( (error) => {
            console.log(error);
            this.clearState();
        });
    }

    private clearState = () => {
        this.setState({
            accessToken: "",
            expirationTime: new Date().getTime(),
            refreshToken: "",
            loading: false
        });
    }

    private refresh_token = (refreshToken: string) => {
        // clear current state
        this.setState({
            accessToken: "",
            expirationTime: new Date().getTime(),
            refreshToken: "",
            loading: true
        });
        axios.post(config.apiUrl + "/auth", {
            refresh_token: refreshToken
        })
        .then( (response) => {
            console.log(response);
            this.updateTokenData(response.data);
        })
        .catch( (error) => {
            console.log(error);
            this.clearState();
        });
    }

    private updateTokenData = (tokenData: any) => {
        let expirationTime = new Date();
        expirationTime.setSeconds(expirationTime.getSeconds() + tokenData.expires_in);

        this.setState({
            accessToken: tokenData["access_token"],
            refreshToken: tokenData["refresh_token"],
            expirationTime: expirationTime.getTime(),
            loading: false
        });
        localStorage.setItem("accessToken", tokenData["access_token"]);
        localStorage.setItem("refreshToken", tokenData["refresh_token"]);
        localStorage.setItem("expirationTime", expirationTime.toString());
        this.props.updateAccessToken(tokenData["access_token"]);
        // setTimeout(() => {
        //     this.forceUpdate();
        // }, tokenData.expires_in * 1000);
    }

    public render() {
        if (this.state && this.state.expirationTime && this.state.refreshToken
            && this.state.expirationTime < new Date().getTime()) {
                this.refresh_token(this.state.refreshToken);
        }
        return (
            <Box sx={{ width: '100%' }}>
                { this.state.loading ?
                // Create a centered div with a loading spinner
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    { MainProgress("Logging In") }
                </Box>
                :
                // Create a box showing titleMessage, secondMessage and Login button vertically aligned, nicely spaces
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    {/* show title message with typography */}
                    <Typography variant="h4" component="div" gutterBottom>
                        { titleMessage }
                    </Typography>
                    {/* show second message with typography */}
                    <Typography variant="h6" component="div" gutterBottom>
                        { secondMessage }
                    </Typography>
                    <Button className="GetToken-login-button" variant="contained" color="primary" disabled={ this.state.loading} href={loginUrl}>
                        {loginTitle}
                    </Button>
                </Box>

                }
            </Box>
        );
    }
}