import React from 'react';
import GetToken from "./GetToken";
import LeaguesView from "./LeaguesView";

//  React component Main has access_token as state, child component GetToken has access_token as prop

interface IMainState {
    accessToken: string;
}

export default class Main extends React.Component<any, IMainState> {

    constructor(props: any) {
        super(props);
        this.state = {
            accessToken: ""
        }
    }

    updateAccessToken = (accessToken: string) => {
        this.setState({
            accessToken: accessToken
        });
    }

    render() {
        return (
            <div>
                {/* Render GetToken page if accessToken is empty */}
                {
                    this.state.accessToken === "" ? 
                    <GetToken updateAccessToken={this.updateAccessToken}/> : 
                    <LeaguesView accessToken={this.state.accessToken}/> 
                }
            </div>
        )
    }
}
