const socket = io()

//Elements
const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = document.querySelector('#messageFormInput')
const $messageFormButton = document.querySelector('#messageFormButton')
const $sendLocationButton = document.querySelector('#sendLocationButton')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessagesHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    const scroll = containerHeight - newMessagesHeight <= scrollOffset
    if (scroll) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', ({ username, text, createdAt }) => {
    const html = Mustache.render(messageTemplate, {
        username,
        text,
        createdAt: moment(createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', ({ username, url, createdAt }) => {
    const html = Mustache.render(locationMessageTemplate, {
        username,
        url,
        createdAt: moment(createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = $messageFormInput.value
    const isMessageValid = (message.length > 0)
    if (isMessageValid) {
        socket.emit('sendMessage', message, (error) => {
            $messageFormButton.removeAttribute('disabled')
            $messageFormInput.value = ''
            if (error){
                return console.log(error)
            }
        })
    } else {
        $messageFormButton.removeAttribute('disabled')
    }
    $messageFormInput.focus()
})

$sendLocationButton.addEventListener('click', (event) => {
    event.preventDefault()
    if (!navigator.geolocation){
        return alert('Geo is not supported by you browser.')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        const location = {
           latitude,
           longitude
        }
        socket.emit('sendLocation', location, (error) => {
            $sendLocationButton.removeAttribute('disabled')
            if (error) {
                return console.log(error)
            }
        })
    })
    $messageFormInput.focus()
})

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})