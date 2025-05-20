// Data file

// BASE_DIR = "../data";
BASE_DIR = "https://raw.githubusercontent.com/HarryYancy/SolidGeo/main/data"

DATA_FILE = "data_public.js"; // default, answers for testmini, no answer for test

// Variables for the filters
let number_options = [20, 50, 100, 200, 500];
let answer_types = ["All", "single-step", "multi-step", "choice"];
let sources = ["All", "solidgeo", "OlympiadBench", "MathVerse", "cmm_math", "MathVision", "DynaMath", "GeoEval", "MathVista"];
let complexity = ["All", "Level 1", "Level 2", "Level 3"]
let problem_types = ["All", "Measurement of Basic Solid Geometric Forms", "Solid Shape Identification", "Spatial Metric Relations", "Multi-view Projection Analysis", "Planar Unfolding and 3D Configuration Analysis", "Composite Solid Structural Analysis", "3D Coordinate and Vector Applications", "Engineering Solid Geometric Modeling"]
// Elements in the Option Panel
let optbtn = document.getElementsByClassName("optionsbtn")[0];
let closebtn = document.getElementsByClassName("closebtn")[0];
let optionpanel = document.getElementById("option-panel");
let optboxes = document.getElementsByClassName("optbox");
let opt_dds = document.getElementsByClassName("opt-dd");
let filter_submit = document.getElementById("filter-submit");

// Element Text the Option Panel
let number_dd = make_dropdown("How many samples?", number_options, "number_dd");
let answer_type_dd = make_dropdown("Choose a answer type:", answer_types, "answer_type_dd");
let source_dd = make_dropdown("Choose a source dataset:", sources, "source-dd");
let complexity_dd = make_dropdown("Choose complexity level:", complexity, "complexity-dd");
let problem_type_dd = make_dropdown("Choose problem type:", problem_types, "problem_type-dd");

// Content in the Option Box
optboxes[0].innerHTML += number_dd;
optboxes[0].innerHTML += answer_type_dd;
optboxes[0].innerHTML += source_dd;
optboxes[0].innerHTML += complexity_dd;
optboxes[0].innerHTML += problem_type_dd;

// Elements in the Content Body
let body = document.getElementById("content-body");
let display = document.getElementById("display");

// Click actions for the option buttons
optbtn.addEventListener("click", openNav);
closebtn.addEventListener("click", closeNav);

// Responsive: if screen is narrow, body only displays one column
if (window.innerWidth < 600) {
    body.style.flexDirection = "column";
}

// Set up the data filters and display the page
let filters = {};

for (each of opt_dds) {
    each.addEventListener("change", change_filters);
}

// Display the page when clicking the fresh button
filter_submit.addEventListener("click", filter_data);
if (window.innerWidth < 600) {
    filter_submit.addEventListener("click", closeNav);
}

// Display the page when it is running at the first time
filter_data();

// Functions
var display_padding = display.style.padding;
function openNav() {
    if (window.innerWidth < 600) {
        optionpanel.style.width = "100vw";
        display.style.width = "0vw";
        display.style.padding = "0";
    } else {
        optionpanel.style.width = "30vw";
        display.style.width = "50vw";
    }
    for (each of optionpanel.children)
        each.style.display = "block";
}

function closeNav() {
    optionpanel.style.width = "0vw";
    display.style.width = "100vw";
    for (each of optionpanel.children) {
        each.style.display = "none";
    }
}

// Function: update the filter values
function change_filters(e) {
    filters.source = document.getElementById("source-dd").value;
    filters.answer_type = document.getElementById("answer_type_dd").value;
    filters.number = document.getElementById("number_dd").value;
    filters.complexity = document.getElementById("complexity-dd").value;
    filters.problem_type = document.getElementById("problem_type-dd").value;
}

// Function: draw the page
function create_page(d) {
    if (d.length === 0) {
        body.innerHTML = "<p>No number satisfies All the filters.</p>";
    } else {
        col1 = create_col(d.slice(0, d.length / 2));
        col2 = create_col(d.slice(d.length / 2));
        body.innerHTML = col1 + col2;
    }
    reflow(body);
    console.log("reflowed");
}

function create_col(data) {
    res = [];

    for (each of data) {
        res.push(create_number(each));
    }

    return `<div class="display-col"> ${res.join("")} </div>`;
}

// data is an object with the following attr.
function create_number(data) {
    let question = make_qt(data.qa_id, data.question, null);

    let images = "";
    if (data.image !== -1) {
        if (Array.isArray(data.image)) {
            // 处理多个图片
            images = data.image.map(img => make_img(`${BASE_DIR}/${img}`)).join("");
        } else {
            // 处理单个图片
            images = make_img(`${BASE_DIR}/${data.image}`);
        }
    }

    // 替换问题文本中的<ImageHere>标签
    if (data.question.includes("<ImageHere>")) {
        // 将图片HTML分割成数组，每个元素对应一个图片
        let imageArray = Array.isArray(data.image) ?
            data.image.map(img => make_img(`${BASE_DIR}/${img}`)) :
            [make_img(`${BASE_DIR}/${data.image}`)];

        // 逐个替换<ImageHere>标签
        let currentImageIndex = 0;
        while (question.includes("<ImageHere>") && currentImageIndex < imageArray.length) {
            question = question.replace("<ImageHere>", imageArray[currentImageIndex]);
            currentImageIndex++;
        }

        // 如果还有剩余的<ImageHere>标签，用最后一个图片替换
        while (question.includes("<ImageHere>")) {
            question = question.replace("<ImageHere>", imageArray[imageArray.length - 1]);
        }

        images = ""; // 清空images，因为图片已经被嵌入到问题中
    }

    let choices = "";
    if (data.answer_type === "choice" && data.choices.length !== 0)
        choices = make_choices(data.choices);

    // if data has the answer attr.
    let answer = "";
    if ("answer" in data)
        answer = make_answer(data.answer);

    html = make_box([question, images, choices, answer]) + "<hr/>";

    return html;
}

// creates a div with question text in it
function make_qt(pid, question, unit) {
    let html = "";
    if (unit === null)
        html = `
                <p><b>Question </b></p>
                <p class="question-txt">[No.${pid}] ${question}</p>
        `;
    else
        html = `
                <p><b>Question </b></p>
                <p class="question-txt">[No.${pid}] ${question} (unit: ${unit})</p>
        `;
    return html;
}

function make_img(path) {
    if (path === null) return "";
    let html = `<img src="${path}" alt="number image" class="question-img" />`;
    return html;
}

function make_box(contents, cls = "") {
    if (contents.join("").length === 0) return "";
    let html = `
        <div class="box ${cls}"> 
            ${contents.join(" ")}
        </div>
    `;
    return html;
}

function make_choices(choices) {
    // console.log(choices);
    let temp = "";
    let len = 0;
    for (each of choices) {
        let html = make_choice(each);
        temp += html;
        len += each.length;
    }
    let html = "";
    if (len < 60)
        html = `<p><b>Choices </b></p><div class="choices">${temp}</div>`;
    else
        html = `<p><b>Choices </b></p><div class="choices-vertical">${temp}</div>`;
    return html;
}

function make_choice(choice) {
    let html = `<p class="choice-txt">${choice}</p>`;
    return html;
}

function make_answer(answer) {
    let html = `<p><b>Answer </b></p><p class="answer-txt">${answer}</p>`;
    return html;
}

function make_dropdown(label, options, id, default_ind = 0) {
    let html = "";
    for (let i = 0; i < options.length; i++) {
        if (i === default_ind)
            html += `<option value="${options[i]}" selected> ${options[i]} </option>`;
        else
            html += `<option value="${options[i]}"> ${options[i]} </option>`;
    }
    html = `<label class="dd-label">${label} <select id="${id}" class="opt-dd"> ${html} </select> </label><br/>`;
    return html;
}

// Main Functions
async function filter_data() {
    // set up or update the filter
    change_filters();

    console.log(filters);
    console.log('Loading data from:', `${BASE_DIR}/${DATA_FILE}`);

    try {
        // const response = await fetch(`${BASE_DIR}/${DATA_FILE}`);
        // console.log('Response status:', response.status);
        // success event 
        let scriptEle = document.createElement("script");
        // scriptEle.setAttribute("src", `data/${filters.dataset}_test.js`);
        scriptEle.setAttribute("src", `data/${DATA_FILE}`);
        scriptEle.setAttribute("type", "text/javascript");
        scriptEle.setAttribute("async", false);
        document.body.appendChild(scriptEle);

        // if (!response.ok) {
        //     throw new Error(`HTTP error! status: ${response.status}`);
        // }

        // const text = await response.text();
        // console.log('Response text length:', text.length);


        scriptEle.addEventListener("load", () => {
            console.log("File loaded");
            res = test_data;
            // console.log(res);
            // go over res and add pid to each element
            for (let i of Object.keys(res)) {
                res[i].pid = i;
            }

            // filter: source dataset
            if (filters.source !== "All") {
                for (let i of Object.keys(res)) {
                    if (res[i].source.toString() !== filters.source) {
                        delete res[i];
                    }
                }
            }

            // filter: answer type
            if (filters.answer_type !== "All") {
                for (let i of Object.keys(res)) {
                    if (res[i].answer_type.toString() !== filters.answer_type) {
                        delete res[i];
                    }
                }
            }

            // filter: complexity
            if (filters.complexity !== "All") {
                for (let i of Object.keys(res)) {
                    if (res[i].complexity_level.toString() !== filters.complexity) {
                        delete res[i];
                    }
                }
            }

            // filter: problem type
            if (filters.problem_type !== "All") {
                for (let i of Object.keys(res)) {
                    if (!res[i].problem_type.includes(filters.problem_type)) {
                        delete res[i];
                    }
                }
            }

            // filter: number
            cnt = filters.number;
            if (cnt != "All") {
                cnt = Number.parseInt(cnt);
                d = _.sample(res, Math.min(cnt, Object.keys(res).length));
            } else {
                d = [];
                for (let i of Object.keys(res)) {
                    d.push(res[i]);
                }
            }

            create_page(d);
        });
    } catch (error) {
        console.error('Error loading data:', error);
        body.innerHTML = `<p>Error loading data: ${error.message}</p>`;
    }
}

// force the browser to reflow
function reflow(elt) {
    elt.offsetHeight;
}
