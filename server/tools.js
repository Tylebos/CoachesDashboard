import bcrypt from "bcryptjs";

const password = 'test';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Hashed Password: ", hash);
});
