const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
if (req.session.authorization) {
    let token = req.session.authorization['accessToken']; // Extract the token
    
    // 2. Verify if the token is real and hasn't expired
    jwt.verify(token, "access", (err, user) => {
        if (err) {
            // Token is fake or expired
            return res.status(403).json({ message: "User not authenticated" });
        } else {
            // Token is good! Attach the decoded user data to the request and let them pass
            req.user = user;
            next(); // Proceeds to the actual /friends route
        }
    });
} else {
    // No authorization object found in session (They never logged in)
    return res.status(401).json({ message: "User not logged in" });
}
});
 
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // --- AUTOMATIC LIVE TESTING FOR TASKS 10-13 ---
    const axiosTasks = require('./router/general.js');

    // Wait 2 seconds for the server to fully initialize, then run all tasks
    setTimeout(() => {
        console.log("\n=================== RUNNING AXIOS ASYNC TESTS ===================");
        
        axiosTasks.getAllBooks();                  // Task 10
        axiosTasks.getBookByISBN("1");             // Task 11
        axiosTasks.getBooksByAuthor("Jane Austen"); // Task 12
        axiosTasks.getBooksByTitle("Fairy tales");  // Task 13
        
    }, 2000);
});