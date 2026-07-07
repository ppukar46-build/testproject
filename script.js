// =========================================
// DSA ROADMAP TRACKER
// PART 1
// =========================================

// ---------- ELEMENTS ----------

const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const monthCards = document.querySelectorAll(".month-card");

const completedCount = document.getElementById("completedCount");
const remainingCount = document.getElementById("remainingCount");
const readiness = document.getElementById("readiness");

const footerCompleted = document.getElementById("footerCompleted");
const footerRemaining = document.getElementById("footerRemaining");

// =========================================
// LOAD SAVED DATA
// =========================================

window.addEventListener("load", () => {

    checkboxes.forEach((box, index) => {

        const saved = localStorage.getItem("checkbox_" + index);

        if (saved === "true") {

            box.checked = true;

        }

    });

    updateProgress();

    updateDaysLeft();

});

// =========================================
// SAVE DATA
// =========================================

checkboxes.forEach((box, index) => {

    box.addEventListener("change", () => {

        localStorage.setItem(

            "checkbox_" + index,

            box.checked

        );

        updateProgress();

    });

});

// =========================================
// UPDATE PROGRESS
// =========================================

function updateProgress() {

    let checked = 0;

    checkboxes.forEach(box => {

        if (box.checked) checked++;

    });

    const total = checkboxes.length;

    const percent = Math.round((checked / total) * 100);

    progressBar.style.width = percent + "%";

    progressText.innerHTML =
        percent + "% Completed (" +
        checked +
        "/" +
        total +
        ")";

    completedCount.innerHTML = checked;

    remainingCount.innerHTML = total - checked;

    footerCompleted.innerHTML =
        "✔ Completed : " + checked;

    footerRemaining.innerHTML =
        "📚 Remaining : " + (total - checked);

    updateReadiness(percent);

    updateMonthCards();

    updateMonthProgress();

}

// =========================================
// PLACEMENT READINESS
// =========================================

function updateReadiness(percent){

    if(percent<=25){

        readiness.innerHTML="Beginner 🌱";

    }

    else if(percent<=50){

        readiness.innerHTML="Learning 📚";

    }

    else if(percent<=75){

        readiness.innerHTML="Interview Ready 💼";

    }

    else{

        readiness.innerHTML="Placement Ready 🚀";

    }

}

// =========================================
// PART 2
// Month Progress + Accordion + Parent Child
// =========================================

// ---------- MONTH PROGRESS ----------

function updateMonthProgress(){

    monthCards.forEach(card=>{

        const boxes = card.querySelectorAll('input[type="checkbox"]');

        const checked = card.querySelectorAll('input[type="checkbox"]:checked');

        const percent = Math.round((checked.length / boxes.length) * 100);

        const miniBar = card.querySelector(".mini-bar");
        const monthPercent = card.querySelector(".month-progress");

        miniBar.style.width = percent + "%";
        monthPercent.innerHTML = percent + "%";

    });

}

// ---------- MONTH COMPLETION ----------

function updateMonthCards(){

    monthCards.forEach(card=>{

        const boxes = card.querySelectorAll('input[type="checkbox"]');

        const checked = card.querySelectorAll('input[type="checkbox"]:checked');

        if(boxes.length === checked.length){

            card.classList.add("completed");

        }

        else{

            card.classList.remove("completed");

        }

    });

}

// =========================================
// ACCORDION (CLICK)
// =========================================

const topics = document.querySelectorAll(".topic");

topics.forEach(topic=>{

    const title = topic.querySelector(".topic-title");

    title.addEventListener("click",(e)=>{

        // Don't open/close when clicking checkbox
        if(e.target.type === "checkbox") return;

        // Close other topics
        topics.forEach(t=>{

            if(t!==topic){

                t.classList.remove("active");

            }

        });

        topic.classList.toggle("active");

    });

});

// =========================================
// PARENT → CHILD
// =========================================

topics.forEach(topic=>{

    const parent = topic.querySelector(".topic-title input");

    const children = topic.querySelectorAll(".subtopic input");

    parent.addEventListener("change",()=>{

        children.forEach(box=>{

            box.checked = parent.checked;

        });

        // Save immediately
        checkboxes.forEach((box,index)=>{

            localStorage.setItem(
                "checkbox_"+index,
                box.checked
            );

        });

        updateProgress();

    });

});

// =========================================
// CHILD → PARENT
// =========================================

topics.forEach(topic=>{

    const parent = topic.querySelector(".topic-title input");

    const children = topic.querySelectorAll(".subtopic input");

    children.forEach(child=>{

        child.addEventListener("change",()=>{

            let allChecked = true;

            children.forEach(box=>{

                if(!box.checked){

                    allChecked = false;

                }

            });

            parent.checked = allChecked;

            // Save parent state
            checkboxes.forEach((box,index)=>{

                localStorage.setItem(
                    "checkbox_"+index,
                    box.checked
                );

            });

            updateProgress();

        });

    });

});

// =========================================
// PART 3
// Search + Theme + Back To Top + Days Left
// =========================================

// ---------- SEARCH ----------

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keyup", function () {

    const value = this.value.toLowerCase();

    topics.forEach(topic => {

        const text = topic.innerText.toLowerCase();

        if(text.includes(value)){

            topic.style.display = "block";

            topic.classList.add("highlight");

        }

        else{

            topic.style.display = "none";

            topic.classList.remove("highlight");

        }

    });

    if(value===""){

        topics.forEach(topic=>{

            topic.style.display="block";

            topic.classList.remove("highlight");

        });

    }

});

// =========================================
// DARK / LIGHT MODE
// =========================================

const themeBtn = document.getElementById("themeBtn");

const savedTheme = localStorage.getItem("theme");

if(savedTheme==="light"){

    document.body.classList.add("light");

    themeBtn.innerHTML="🌙 Dark Mode";

}

themeBtn.addEventListener("click",()=>{

    document.body.classList.toggle("light");

    if(document.body.classList.contains("light")){

        themeBtn.innerHTML="🌙 Dark Mode";

        localStorage.setItem("theme","light");

    }

    else{

        themeBtn.innerHTML="☀ Light Mode";

        localStorage.setItem("theme","dark");

    }

});

// =========================================
// BACK TO TOP BUTTON
// =========================================

const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll",()=>{

    if(window.scrollY>400){

        topBtn.style.display="block";

    }

    else{

        topBtn.style.display="none";

    }

});

topBtn.addEventListener("click",()=>{

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});

// =========================================
// DAYS LEFT
// =========================================

function updateDaysLeft(){

    const today = new Date();

    const year = today.getFullYear();

    monthCards.forEach(card=>{

        const month = Number(card.dataset.month);

        let targetYear = year;

        if(month < today.getMonth()){

            targetYear++;

        }

        const lastDay = new Date(targetYear,month+1,0);

        const diff = lastDay - today;

        const days = Math.ceil(diff/(1000*60*60*24));

        const text = card.querySelector(".days-left");

        if(days>=0){

            text.innerHTML =
            "🎯 Finish before "
            + lastDay.getDate()
            + " "
            + lastDay.toLocaleString("default",{month:"long"})
            + "<br>⏳ "
            + days
            + " days left";

        }

        else{

            text.innerHTML="✅ Month Finished";

        }

    });

}

// =========================================
// COMPLETION POPUP
// =========================================

const popup=document.getElementById("completePopup");

function showPopup(message){

    popup.innerHTML=message;

    popup.style.display="block";

    setTimeout(()=>{

        popup.style.display="none";

    },3000);

}

// =========================================
// PART 4
// Reset Modal + Completion Popup + Final
// =========================================

// ---------- RESET MODAL ----------

const resetBtn = document.getElementById("resetBtn");
const resetModal = document.getElementById("resetModal");
const confirmReset = document.getElementById("confirmReset");
const cancelReset = document.getElementById("cancelReset");

resetBtn.addEventListener("click",()=>{

    resetModal.style.display="flex";

});

cancelReset.addEventListener("click",()=>{

    resetModal.style.display="none";

});

window.addEventListener("click",(e)=>{

    if(e.target===resetModal){

        resetModal.style.display="none";

    }

});

confirmReset.addEventListener("click",()=>{

    checkboxes.forEach((box,index)=>{

        box.checked=false;

        localStorage.removeItem("checkbox_"+index);

    });

    updateProgress();

    resetModal.style.display="none";

    showPopup("🗑 Progress Reset Successfully");

});

// =========================================
// MONTH COMPLETION POPUP
// =========================================

const completedMonths = new Set();

function checkCompletedMonths(){

    monthCards.forEach(card=>{

        const monthName = card.querySelector("h2").innerText.split("0%")[0].trim();

        const boxes = card.querySelectorAll('input[type="checkbox"]');

        const checked = card.querySelectorAll('input[type="checkbox"]:checked');

        if(boxes.length>0 && boxes.length===checked.length){

            if(!completedMonths.has(monthName)){

                completedMonths.add(monthName);

                showPopup("🎉 " + monthName + " Completed!");

            }

        }

    });

}

// =========================================
// UPDATE PROGRESS OVERRIDE
// =========================================

const oldUpdateProgress = updateProgress;

updateProgress = function(){

    oldUpdateProgress();

    checkCompletedMonths();

};

// =========================================
// SAVE THEME
// =========================================

if(!localStorage.getItem("theme")){

    localStorage.setItem("theme","dark");

}

// =========================================
// INITIAL UPDATE
// =========================================

updateProgress();

updateDaysLeft();

// =========================================
// END
// =========================================

console.log("🚀 DSA Roadmap Tracker Loaded Successfully");
