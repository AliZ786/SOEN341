import { useIsAuthenticated } from "@azure/msal-react";
import Modal from 'react-modal'
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    createStyles,
    makeStyles,
    Theme,
    Typography,
} from "@material-ui/core";
import { useEffect, useState, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import { backendURL } from "../../Constants/backendConfig";
import { AuthenticationContext, AuthenticationContextType } from "../AuthenticationProvider/authenticationProvider";
import "./userProfile.css"
import { useHistory } from "react-router-dom";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            minWidth: "100%",
            minHeight: 750,
            margin: 15,
            alignSelf: "flex-start",
        },
        media: {
            height: 0,
            paddingTop: "56.25%", // 16:9
        },
        expand: {
            transform: "rotate(0deg)",
            marginLeft: "auto",
            transition: theme.transitions.create("transform", {
                duration: theme.transitions.duration.shortest,
            }),
        },
        expandOpen: {
            transform: "rotate(180deg)",
        },
        avatar: {},
    })
);

// Model of JSON response from /user
interface User {
    id: string;
    userId: string;
    name: string;
    email: string;
    followerCount: number;
    UsersFollowed : string[];
    UsersFollowers: string[];
}

const defaultUserList: User[] = [];



export default function UserProfile() {
    const isAuthenticated = useIsAuthenticated();
    let { userId } = useParams<Record<string, string | undefined>>();
    const [user, setUser] = useState<User>(); // User profile data set as the state
    const classes = useStyles();
    const [follow, setFollow] = useState(false); // Whether the logged in user is following or not
    const { getAccessToken } = useContext(AuthenticationContext) as AuthenticationContextType

    const [userFollowerList, setUserFollowerList]: [
        User[],
        (userFollowerList: User[]) => void
      ] = useState(defaultUserList);
    
     const [userFollowedList, setUserFollowedList]: [

        User[],
        (userFollowedList: User[]) => void
     ] = useState(defaultUserList);

     const history = useHistory();
     const goToCreator = useCallback(
       () => history.push("/user/" + user),
       // eslint-disable-next-line
       [history]
     );
     
        


    // Sends to /follow that the logged in user wants to follow
    async function followUser() {
        const token = await getAccessToken();
        fetch(backendURL + "/follow?userId=" + userId, {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                'Authorization': 'Bearer ' + token,
            },
        })
        .then((response) => {
            console.log(response);
            });
    }

    // Gets the follow state of the logged in user
    async function getFollowState() {
        const token = await getAccessToken();

        fetch(backendURL + "/follow/isfollowed?userId=" + userId, {
            method: "GET",
            mode: "cors",
            headers: {
                "Access-Control-Allow-Origin": "*",
                'Authorization': 'Bearer ' + token,

            },
        })
            .then((response) => response.json())
            .then((response) => {
                setFollow(response);
            });
    }

    // Sends to /follow that the logged in user wants to follow
    async function followerList() {
        const token = await getAccessToken();
        fetch(backendURL + "/follow/followerList?userId=" + userId, {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                'Authorization': 'Bearer ' + token,
            },
        })
        .then((response) => response.json())
                .then((response) => {
                    setUserFollowerList(response);
            });
    }


    async function followedList() {
        const token = await getAccessToken();
        fetch(backendURL + "/follow/followedList?userId=" + userId, {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                'Authorization': 'Bearer ' + token,
            },
        })
        .then((response) => response.json())
                .then((response) => {
                    setUserFollowedList(response);
            });
    }


    // modal
    const [modalIsOpen, setModalIsOpen] = useState(false);

    // Gets the user profile data from the backend
    useEffect(
        () => {
            fetch(backendURL + "/user?userId=" + userId, {
                method: "GET",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            })
                .then((response) => response.json())
                .then((response) => {
                    setUser(response);
                });
            getFollowState();
        },
        // eslint-disable-next-line
        []
    );
//Adding comments
    return (
        <Box width="50%">
            <Card className={classes.root} elevation={3}>
                <CardHeader title={user?.name + "'s Profile"} />
                <div><Button type="button" onClick={() => {setModalIsOpen(true); followerList();}}>{user?.followerCount + " followers"}</Button>
                </div>
                <div>
                    <Modal className= "modal" isOpen={modalIsOpen} shouldCloseOnOverlayClick onRequestClose={() => setModalIsOpen(false)}>
                        <h2 className = "followers">{user?.name} list of followers</h2>
                         {userFollowerList.map((userFollower, index) => (
                        <p key ={index}>{userFollower.name} <Button variant ="outlined" id = "profileButton" > Go to Profile page!</Button> </p>
                        ))} 

                        
                        <div>
                            <button onClick = {() => setModalIsOpen(false)}>Close</button>

                        </div>
                    </Modal>
                </div>
                
                {isAuthenticated ? <div>
                    {follow ?
                        (<Button
                            id="followbtn"
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                                setFollow(!follow);
                                followUser();
                            }}>
                            Unfollow {user?.name}
                        </Button>)
                        :
                        (<Button
                            id="followbtn"
                            variant="outlined"
                            onClick={() => {
                                setFollow(!follow);
                                followUser();
                            }}>
                            Follow {user?.name}
                        </Button>)}
                </div> : <div></div>}

                <CardContent>
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        component="p"
                    ></Typography>
                </CardContent>
            </Card>
        </Box>
    );
}
