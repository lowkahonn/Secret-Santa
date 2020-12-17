let shuffle = (users) => {
    let i = users.length, j, temp
    while (i) {
        j = Math.floor(Math.random() * i--)
        temp = users[i]
        users[i] = users[j]
        users[j] = temp
    }
    return users
}

module.exports = shuffle