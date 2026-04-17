// User service - test file

const users = [];

function addUser(name, age) {
    if (!name || !age) {
        console.log("Invalid input");
    }

    const user = {
        id: users.length + 1,
        name: name,
        age: age
    };

    users.push(user);
    return user;
}

function getUser(id) {
    return users.find(u => u.id == id);
}

function updateUser(id, newData) {
    const user = getUser(id);

    if (!user) {
        return "User not found";
    }

    user.name = newData.name || user.name;
    user.age = newData.age || user.age;

    return user;
}

function deleteUser(id) {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        return false;
    }

    users.splice(index, 1);
    return true;
}

// simulate usage
addUser("Alice", 25);
addUser("Bob", 30);

updateUser(1, { age: 26 });

console.log(getUser("1")); // intentional type issue
console.log(deleteUser(3)); // deleting non-existent user
