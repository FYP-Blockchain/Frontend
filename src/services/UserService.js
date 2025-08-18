import axios from "axios";

const USER_API_BASE_URL1="https://user-event-web.azurewebsites.net/auth/addUser"
class UserService{
    saveUser(user){
        return axios.post(
            USER_API_BASE_URL1, user
        );
        
    }

}


export default new UserService();