const jwt = require('jsonwebtoken');
const fs = require('fs');

const header = {
    alg: "HS256",
    typ: "JWT"
};

// Sample payload
const payload = {
    id: "8b12e405-79f7-4cdf-8279-f4fba5e3c927",
    name: "Dave Kitzmiller",
    family_name: "Kitzmiller",
    given_name: "Dave",
    email: "v-dakit@microsoft.com",
    exp: Date.now() + 12000,
    organization_id: 1,
    iat: 1520635371
};

const secretKey = process.env.SESSION_SECRET;

const token = jwt.sign(payload, secretKey, {header});

const wf_Promise = new Promise((resolve, reject) => {
    fs.writeFile("token", token, (err) => {
        if (err) {
            reject(err);
        } else {
            resolve(token);
        }
    });
});

// Copy and paste from the file instead of from console output
// Console will add \r\n in the middle of the output and that needs to be removed
wf_Promise.then((data) => {
    console.log(data);
}).catch((e) => {
    console.error(`Error: ${e}`);
});
