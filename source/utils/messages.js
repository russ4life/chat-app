const generateMessage = (username, text) => {
    const createdAt = new Date().getTime()
    return {
        username,
        text,
        createdAt
    }
}

const generateLocationMessage = (username, location) => {
    const url = `https://google.co.uk/maps?${location.latitude},${location.longitude}`
    const createdAt = new Date().getTime()
    return {
        username,
        url,
        createdAt
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}