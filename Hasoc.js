//proxy = `http://127.0.0.1:5000/`
proxy = `https://ilsumsub.el.r.appspot.com`

var task_titles = {
    "English": "English",
    "Hindi": "Hindi",
    "Gujarati": "Gujarati",
}


function getCookie(name) {
    var cookieArr = document.cookie.split(";");
    for (var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        if (name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

function check_token() {
    if (getCookie('token') == null || getCookie('user') == null) {
        window.location = 'login.html';
    } else {
        team_data_new()
    }
}


async function submission() {
    const url = proxy + "/dashboard/submission";
    let submission_name = `<input type=text id="Subname" class="swal2-input mb-2" placeholder="Please enter your submission name" style="width:70%;" maxlength="40"></input>`
    let desc = `<textarea id="Desc" placeholder="Please enter your description" class="swal2-input mb-2" style="width:70%;height:30%" maxlength="150"></textarea>`
    let select_box_html = `<select id="subtask_name" class="swal2-input" style="width:70%;">
    <option value="English">English</option>
    <option value="Hindi">Hindi</option>
    <option value="Gujarati">Gujarati</option>`
    Swal.fire({
            html: `${select_box_html}${submission_name}${desc}<input type="file" id="file" placeholder="Submission File">`,
            confirmButtonText: 'SUBMIT',
            focusConfirm: false,
            customClass: 'swal-height-submission',
            preConfirm: () => {
                Swal.showLoading()
                var team_name = getCookie('user')
                if (team_name == null) {
                    window.location = "login.html"
                }
                var des = document.getElementById("Desc").value
                var input = document.getElementById("file");
                var ex = document.getElementById("file").value;
                var sel = document.getElementById("subtask_name")
                var subname = document.getElementById("Subname").value
                var opt = sel.options[sel.selectedIndex];
                var tasks_name = opt.value;
                ex = ex.split('.').pop()

                if (subname.length == 0) {
                    Swal.showValidationMessage(
                        `Please Enter Submission Name`
                    )
                } else if (input.files.length == 0) {
                    Swal.showValidationMessage(`Please Select File`)
                } else if (ex != "csv") {
                    Swal.showValidationMessage(
                        `Please Submit CSV File only`
                    )
                } else {
                    if (input.files && input.files[0]) {
                        const formData = new FormData();
                        formData.append('file', input.files[0])
                        formData.append('task_name', tasks_name);
                        formData.append('team_name', team_name);
                        formData.append('description', des);
                        formData.append('submission_name', subname)
                        return fetch(url, {
                                method: 'post',
                                body: formData,
                                headers: {
                                    "x-access-token": getCookie('token')
                                }
                            })
                            .then(response => {
                                if (response.status == 401) {
                                    window.location = "login.html"
                                }
                                if (response.status != 200) {
                                    throw new Error(response.status)
                                }
                                if (response.status == 200) {
                                    console.log('im in 200')
                                    Swal.fire({
                                        title: 'Run Submitted Successfully! 🥳🎉🥳',
                                        icon: 'success',
                                        timer: 2000,
                                        showConfirmButton: true
                                    })
                                    console.log('200 swal done')
                                    team_data_new();
                                }
                                return response.json()
                            })
                            .catch(error => {
                                if (error == 'Error: 408') {
                                    console.log('im here')
                                    Swal.fire({
                                        icon: 'warning',
                                        title: 'Daily Maximum Submission Limit Exceed!'
                                    })
                                }
                                if (error == 'Error: 406') {
                                    Swal.showValidationMessage(
                                        `Missing or Unknown ID found Please Upload Proper Submission Files`
                                    )
                                }
                                if (error == 'Error: 405') {
                                    Swal.showValidationMessage(
                                        `Unknown or Empty Labels Found Please Upload Proper Submission Files`
                                    )
                                }
                                if (error == 'Error: 403') {
                                    Swal.showValidationMessage(
                                        `Wrong Column Names Please Upload Proper Submission Files`
                                    )
                                }
                                if (error == 'Error: 409') {
                                    Swal.showValidationMessage(
                                        `Can't Use Same Submission Name For Multiple Submissions`
                                    )
                                } else {
                                    Swal.showValidationMessage(
                                        `Server Busy, please try again later`
                                    )
                                }
                            })
                    }
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
        /*.then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Run Submitted Successfully! 🥳🎉🥳',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: true
                    })
                    
                }
            })*/

}


function logout() {
    document.cookie = "token= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
    localStorage.clear()
    window.location = 'login.html'
}


async function changepassword() {
    var password = document.getElementById("Password").value
    var new_password = document.getElementById("NewPassword").value
    var confirm_passowrd = document.getElementById("ConfirmPassword").value
    if (new_password == confirm_passowrd) {
        $.ajax({
            type: 'POST',
            url: proxy + "/user/change_password",
            headers: {
                "x-access-token": getCookie('token'),
                'content-type': 'application/json'
            },
            data: JSON.stringify({
                "team_name": getCookie('user'),
                "password": password,
                "new_password": new_password
            }),
            success: function(result) {
                $('#close_modal').click() //document.getElementById('myModal4').style.display = "none";
                Swal.fire({
                    icon: 'success',
                    title: 'Password Updated Successfully'
                })
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 402) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Invalid password',
                    })
                }
                if (jqXHR.status == 401) {
                    window.location = "login.html"
                }
            }

        });
    } else {
        var passerr = document.getElementById('passworderr');
        passerr.innerHTML = "Password and Confirm Password Must be Same"
        passerr.removeAttribute("hidden")
    }
}


async function details(_id) {
    document.getElementById("details_modal_body").innerHTML = `<div id="loading_details" class="container-fluid text-center">
    <img src="images/loading_coffee.gif" width="450" height="450" />
</div>`
    $.ajax({
        type: 'POST',
        url: proxy + `/dashboard/submission_details`,
        headers: {
            "x-access-token": getCookie('token'),
            'content-type': 'application/json'
        },
        data: JSON.stringify({
            "_id": _id
        }),
        success: function(result) {
            result = result[0]
            document.getElementById("modal_submission_time").innerHTML = result.timestamp
            tab = `<table class="table table-hover">
            <thead style="color:cadetblue">
                <tr>
                    <th class="text-center" colspan="4">${task_titles[result.task_name]}</th>
                </tr>
                <tr>
                    <th class="text-center" colspan="4">${result.submission_name}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td></td>
                    <td>F1 Score</td>
                    <td>Precision</td>
                    <td>Recall</td>
                </tr>
                <tr>
                    <td>Rouge-1</td>
                    <td>${result.scores["rouge-1"].f.toFixed(4)}</td>
                    <td>${result.scores["rouge-1"].p.toFixed(4)}</td>
                    <td>${result.scores["rouge-1"].r.toFixed(4)}</td>
                    </tr>
                    <tr>
                    <td>Rouge-2</td>
                    <td>${result.scores["rouge-2"].f.toFixed(4)}</td>
                    <td>${result.scores["rouge-2"].p.toFixed(4)}</td>
                    <td>${result.scores["rouge-2"].r.toFixed(4)}</td>
                    </tr>
                    <tr>
                    <td>Rouge-4</td>
                    <td>${result.scores["rouge-4"].f.toFixed(4)}</td>
                    <td>${result.scores["rouge-4"].p.toFixed(4)}</td>
                    <td>${result.scores["rouge-4"].r.toFixed(4)}</td>
                    </tr>
            </tbody>
        </table>`
            if (result.description != "") {
                tab += `<div><p class="text-justify border p-2">${result.description}</p></div>`
            }
            document.getElementById("details_modal_body").innerHTML = tab
        },
        error: function(jqXHR, textStatus, errorThrown) {

        }
    });
}

async function team_data_new() {
    var x = document.getElementById("loading");
    if (window.getComputedStyle(x).display === "none") {
        document.getElementById("body_content").setAttribute("hidden", true);
        document.getElementById("loading").removeAttribute("hidden", false);
    }
    //var sort_param = "task_name";
    //sort_param = document.getElementById("sort_param").value;
    document.getElementById("navbarDropdownMenuLink").innerHTML = `Welcome ${getCookie('team_display')} 🤗`
    $.ajax({
        type: 'POST',
        url: proxy + `/dashboard/team_data/timestamp_desc`,
        headers: {
            "x-access-token": getCookie('token'),
            'content-type': 'application/json'
        },
        data: JSON.stringify({
            "team_name": getCookie('user')
        }),
        success: function(result) {
            if (result.length <= 2) {
                document.getElementById("footer_div").classList.add("position-fixed")
            }
            if (result.length >= 2) {
                if (document.getElementsByClassName('footer position-fixed bg-dark').length > 0) {
                    document.getElementById("footer_div").classList.remove("position-fixed")

                }
            }
            var table_body = document.getElementById("team_data_table_body")
            var tab = ``;

            for (var i = 0; i < result.length; i++) {
                tab += `<tr class="text-center">
                    <td class="text-left align-middle">${result[i].timestamp}</td>
                    <td class="text-center align-middle">${result[i].submission_name}</td>
                    <td class="text-center align-middle">${task_titles[result[i].task_name]}</td>
                    <td class="text-center align-middle">${result[i].scores["rouge-1"].f.toFixed(4)}</td>
                    <td class="text-center align-middle">${result[i].scores["rouge-2"].f.toFixed(4)}</td>
                    <td class="text-center align-middle">${result[i].scores["rouge-4"].f.toFixed(4)}</td>
                    <td class="text-center align-middle"><button class="btn btn-outline-info" id="${result[i]._id}" onclick="details(this.id)" name="details" data-toggle="modal" data-target="#myModal3">Details</button></td>
                    <td class="text-center align-middle"> <button class="btn btn-outline-info" onclick="details(this.id); location.href='leaderboard.html?subtask_name=${result[i].task_name}'"><i class="fas fa-walking"></i></a> </button></td>
                </tr>`
                table_body.innerHTML = tab + `<div class="mb-3"></div>`;
                document.getElementById("loading").setAttribute("hidden", true);
                document.getElementById("zero_submission_div").setAttribute("hidden", true);
                document.getElementById("body_content").removeAttribute("hidden");
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status == 404) {
                //document.getElementById("footer_div").classList.add("position-fixed")
                document.getElementById("loading").setAttribute("hidden", true);
                document.getElementById("zero_submission_div").removeAttribute("hidden");
            }
            if (jqXHR.status == 401) {
                window.location = "login.html"
            }
        }
    });
}