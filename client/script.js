let baseUrl = "http://localhost:3000"

// Intialize document
$(document).ready(event => {
    checkAuth()
})

// To Login/register page
$('#to-login-btn').click( event => {
    event.preventDefault()
    $('#login-form').show()
    $('#register-form').hide();
    $('#email-register').val('');
    $('#password-register').val('')
    $('#password-register').val('')
})

$('#to-register-btn').click( event => {
    event.preventDefault()
    $('#login-form').hide()
    $('#register-form').show();
    $('#email-login').val('');
    $('#password-login').val('')
})

// Register Button
$('#register-btn').click(event => {
    event.preventDefault();

    $.ajax({
        method: 'POST',
        url: `${baseUrl}/register`,
        data: {
            email: $('#email-register').val(),
            password: $('#password-register').val(),
            repeatPassword: $('#repeat-password').val(),

        }
    })
        .done(response => {
            $('#success-modal').modal('show')
            $('#login-form').show();
            $('#register-form').hide();
        })
        .fail(xhr => {
            $('#register-modal').modal('show')
        })
        .always(() => {
            $('#email-register').val('');
            $('#password-register').val('');
            $('#repeat-password').val('')
        })
})

// Login Button
$('#login-btn').click( event => {
    event.preventDefault();
    
    $.ajax({
        method: 'POST',
        url: `${baseUrl}/login`,
        data: {
            email: $('#email-login').val(),
            password: $('#password-login').val()
        }
    })
    .done(response => {
        localStorage.access_token = response.access_token;
        checkAuth();
    })  
    .fail((xhr, status, err) => {
        $('#login-modal').modal('show')
    })
    .always(() => {
        $('#email-login').val('')
        $('#password-login').val('')
    })
})

// Modal Button Auth Page
$('#login-modal').click(event => {
    event.preventDefault();
    $('#login-modal').modal('hide')
})

$('#register-modal').click(event => {
    event.preventDefault();
    $('#register-modal').modal('hide')
})

$('#success-modal').click(event => {
    event.preventDefault();
    $('#success-modal').modal('hide')
})

// Logout Button
$('#logout-btn').click(() => {
    localStorage.clear();
    checkAuth();
    signOut()
})

// Form Button
$('#add-form-btn').click(event => {
    event.preventDefault();
    $('#add-todo-form').modal('show')
})

// Cancel Add Todo Button
$('#cancel-todo-form-btn').click(event => {
    event.preventDefault();
    $('#add-todo-form').modal('hide')
})

// Cancel Edit Todo Button
$('#cancel-edit-form-btn').click(event => {
    event.preventDefault();
    $('#edit-todo-form').modal('hide')
})

// Cancel Delete Todo Button
$('#cancel-delete-btn').click(event => {
    event.preventDefault();
    $('#delete-todo').modal('hide')
})

// Add Todo Button
$('#add-todo-btn').click(event => {
    event.preventDefault();

    $.ajax({
        method: 'POST',
        url: `${baseUrl}/todos`,
        headers: {
            access_token: localStorage.access_token
        },
        data: {
            title: $('#title').val(),
            due_date: $('#due_date').val(),
            description: $('#description').val(),
        }
    })
        .done(todo => {
            let newTodoCheck = '';
            let ongoingCheck = '';
            let doneCheck = '';

            if (todo.status === "new todo") {
                newTodoCheck = 'checked';
            } else if (todo.status === 'ongoing') {
                ongoingCheck = 'checked';
            } else {
                doneCheck = 'checked'
            }
            
            if (navStatus) {
            $('#lists').append(`
            <tr id="todo-${todo.id}">
                <td>
                    <input type="radio" id="new-todo-${todo.id}" name="status-${todo.id}" value="new-todo" ${newTodoCheck} onclick=newTodo(${todo.id})>
                    <label for="new-todo-${todo.id}">New Todo</label><br>

                    <input type="radio" id="ongoing-${todo.id}" name="status-${todo.id}" value="ongoing" ${ongoingCheck} onclick=ongoing(${todo.id})> 
                    <label for="ongoing-${todo.id}">Ongoing</label><br>
                    
                    <input type="radio" id="done-${todo.id}" name="status-${todo.id}" value="done" ${doneCheck} onclick=done(${todo.id})>
                    <label for="done-${todo.id}">Done</label>
                </td>
                <td class="align-middle">${todo.title}</td>
                <td class="align-middle">${todo.description}</td>
                <td style="text-align: center;" class="align-middle">${todo.due_date}</td>
                <td style="text-align: center;" class="align-middle">
                    <button class="btn btn-success" onclick="openEditFormTodo(${todo.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteTodo(${todo.id})">Delete</button>
                </td>
            </tr>
            `)
            } else {
                finish()
            }
            $('#add-todo-form').modal('hide')
        })
        .fail((xhr, status, err) => {

        })
        .always(() => {
            $('#title').val("");
            $('#due_date').val("");
            $('#description').val("");
        })
})

// Google SignIn Function
function onSignIn(googleUser) {
    const id_token = googleUser.getAuthResponse().id_token;
    
    $.ajax({
        method: 'POST',
        url: `${baseUrl}/google-login`,
        data: {
            id_token
        }
    })
    .done(response => {
        localStorage.access_token = response.access_token;
        checkAuth()
    })
    .fail((xhr, status) => {
        console.log((xhr.responseJSON.message));
    })
}

// $('#add-modal').modal('show')

// Edit form
function openEditFormTodo(id) {
    $('#edit-todo-form').modal('show')
    $('option').removeAttr('selected')
    $('#selected').attr('selected', 'selected')
    $('.edit-todo-btn').off("click");
    getTodoById(id)

    // Edit Todo Button
    $(`.edit-todo-btn`).click(event => {
        event.preventDefault();

        $.ajax({
            method: 'PUT',
            url: `${baseUrl}/todos/${id}`,
            headers: {
                access_token: localStorage.access_token,
            },
            data: {
                title: $('.title').val(),
                due_date: $('.due_date').val(),
                description: $('.description').val(),
                status: $('#status').val()
            }
        })
            .done(response => {
                if (navStatus) home()
                else finish()
                $('#edit-todo-form').modal('hide')
            })
            .fail((xhr) => {
                console.log(xhr.responseJSON.message);
            })
    })
}

// Delete todo function
function deleteTodo(id) {
    $('#delete-todo').modal('show')
    $('.delete-todo-btn').off('click');
    $('.delete-todo-btn').click(event => {
        event.preventDefault();
        $.ajax({
            method: 'DELETE',
            url: `${baseUrl}/todos/${id}`,
            headers: {
                access_token: localStorage.access_token,
            }
        })
            .done(response => {
                $(`#todo-${id}`).remove()
                $('#delete-todo').modal('hide')
            })
            .fail((xhr, status, err) => {
                console.log(xhr.responseJSON.message);
            })
    })
}

// Get todo by id functioin
function getTodoById(id) {
    $.ajax({
        method: 'GET',
        url: `${baseUrl}/todos/${id}`,
        headers: {
            access_token: localStorage.access_token,
        }
    })
        .done(todo => {
            $('.title').val(todo.title);
            $('.due_date').val(todo.due_date);
            $('.description').val(todo.description);
            $('#selected').removeAttr('selected')
            $(`#${todo.status.replace(' ', '-')}`).attr('selected', 'selected')
        })
        .fail(() => {
            console.log(xhr.responseJSON.message);
        })
}

// Authentication Function
function checkAuth() {
    if (localStorage.access_token) {
        $('#auth-page').hide();
        $('#todo-list-page').show();
        $('#logout-btn').show();
        $('#quote img').removeAttr('src');

        getTodoList();
        weatherToday()
        getQuote()

    } else {
        $('#auth-page').show();
        $('#login-form').show()
        $('#register-form').hide();
        $('#todo-list-page').hide();
        $('#logout-btn').hide();
    }
}

// getTodoList Function
function getTodoList() {
    $.ajax({
        method: 'GET',
        url: `${baseUrl}/todos`,
        headers: {
            access_token: localStorage.access_token
        }
    })
        .done(todos => {
            $('#lists').empty()

            todos.forEach(todo => {
                let newTodoCheck = '';
                let ongoingCheck = '';
                let doneCheck = '';

                if (todo.status === "new todo") {
                    newTodoCheck = 'checked';
                } else if (todo.status === 'ongoing') {
                    ongoingCheck = 'checked';
                } else {
                    doneCheck = 'checked'
                }

                if (todo.status !== 'done') {
                    $('#lists').append(`
                <tr id="todo-${todo.id}">
                    <td>
                        <input type="radio" id="new-todo-${todo.id}" name="status-${todo.id}" value="new-todo" ${newTodoCheck} onclick=newTodo(${todo.id})>
                        <label for="new-todo-${todo.id}">New Todo</label><br>

                        <input type="radio" id="ongoing-${todo.id}" name="status-${todo.id}" value="ongoing" ${ongoingCheck} onclick=ongoing(${todo.id})> 
                        <label for="ongoing-${todo.id}">Ongoing</label><br>
                        
                        <input type="radio" id="done-${todo.id}" name="status-${todo.id}" value="done" ${doneCheck} onclick=done(${todo.id})>
                        <label for="done-${todo.id}">Done</label>
                    </td>
                    <td class="align-middle">${todo.title}</td>
                    <td class="align-middle">${todo.description}</td>
                    <td style="text-align: center;" class="align-middle">${todo.due_date}</td>
                    <td style="text-align: center;" class="align-middle">
                        <button class="btn btn-success" onclick="openEditFormTodo(${todo.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteTodo(${todo.id})">Delete</button>
                    </td>
                </tr>
                `)
                }  
            })
        })
        .fail(xhr => {
            console.log(xhr.responseJSON.message);
        })
}

function signOut() {
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut()
        .then(function () {
            console.log('User signed out.');
        });
}

function patchStatus(id, status) {
    $.ajax({
        method: 'PATCH',
        url: `${baseUrl}/todos/${id}`,
        headers: {
            access_token: localStorage.access_token
        },
        data: {
            id,
            status
        }
    })
        .done(response => {
            // console.log(response);
        })
        .fail(xhr => {

        })
}

let navStatus = true;

function newTodo(id) {
    let status = $(`#new-todo-${id}`).val().replace('-', ' ');
    patchStatus(id, status)

    if (!navStatus) {
        $(`#todo-${id}`).remove()
    }
}

function ongoing(id) {
    let status = $(`#ongoing-${id}`).val()
    patchStatus(id, status)
    if (!navStatus) {
        $(`#todo-${id}`).remove()
    } 
}

function done(id) {
    let status = $(`#done-${id}`).val()
    patchStatus(id, status)
   
    if (navStatus) {
        $(`#todo-${id}`).remove()
    } 
}

function weatherToday() {
    $.ajax({
        method: 'GET',
        url: `${baseUrl}/location`,
        headers: {
            access_token: localStorage.access_token,
        }
    })
    .then(location => {
        return $.ajax({
            method: 'POST',
            url: `${baseUrl}/weather`,
            headers: {
                access_token: localStorage.access_token
            },
            data: {
                location
            }  
        })
    })
    .done(locationData => {
        window.myWidgetParam ? window.myWidgetParam : window.myWidgetParam = []; 
        window.myWidgetParam.push({ 
            id: 15, 
            cityid: locationData.id, 
            appid: locationData.appid, 
            units: 'metric', 
            containerid: 'openweathermap-widget-15', }); 
            
            (function () { 
                var script = document.createElement('script'); 
                script.async = true; 
                script.charset = "utf-8"; 
                script.src = "//openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js"; 
                
                var s = document.getElementsByTagName('script')[0]; 
                s.parentNode.insertBefore(script, s); 
            })();   
    })
    .fail(xhr => {
        console.log(xhr);
    })
}


function getQuote() {
    $.ajax({
        method: 'GET',
        url: `${baseUrl}/quote`,
        headers: {
            access_token: localStorage.access_token
        }
    })
    .done(quote => {
        $('#quote img').removeAttr('src');
        $('#quote img').attr('src', quote.media)
    })
}

function doneTodo () {
    $.ajax({
        method: 'GET',
        url: `${baseUrl}/todos`,
        headers: {
            access_token: localStorage.access_token
        }
    })
        .done(todos => {
            $('#lists').empty()

            todos.forEach(todo => {
                let newTodoCheck = '';
                let ongoingCheck = '';
                let doneCheck = '';

                if (todo.status === "new todo") {
                    newTodoCheck = 'checked';
                } else if (todo.status === 'ongoing') {
                    ongoingCheck = 'checked';
                } else {
                    doneCheck = 'checked'
                }

                if (todo.status === 'done') {
                    $('#lists').append(`
                <tr id="todo-${todo.id}">
                    <td>
                        <input type="radio" id="new-todo-${todo.id}" name="status-${todo.id}" value="new-todo" ${newTodoCheck} onclick=newTodo(${todo.id})>
                        <label for="new-todo-${todo.id}">New Todo</label><br>

                        <input type="radio" id="ongoing-${todo.id}" name="status-${todo.id}" value="ongoing" ${ongoingCheck} onclick=ongoing(${todo.id})> 
                        <label for="ongoing-${todo.id}">Ongoing</label><br>
                        
                        <input type="radio" id="done-${todo.id}" name="status-${todo.id}" value="done" ${doneCheck} onclick=done(${todo.id})>
                        <label for="done-${todo.id}">Done</label>
                    </td>
                    <td class="align-middle">${todo.title}</td>
                    <td class="align-middle">${todo.description}</td>
                    <td style="text-align: center;" class="align-middle">${todo.due_date}</td>
                    <td style="text-align: center;" class="align-middle">
                        <button class="btn btn-success" onclick="openEditFormTodo(${todo.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteTodo(${todo.id})">Delete</button>
                    </td>
                </tr>
                `)
                }
            })
        })
        .fail(xhr => {
            console.log(xhr.responseJSON.message);
        })
}

function home() {
    getTodoList();
    navStatus = true;
    $('#home').addClass('active');
    $('#finish').removeClass('active');
}

function finish() {
    doneTodo();
    navStatus = false;
    $('#home').removeClass('active');
    $('#finish').addClass('active');
}


function inviteMember() {
    
}