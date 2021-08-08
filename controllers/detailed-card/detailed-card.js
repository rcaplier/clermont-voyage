const {ipcRenderer} = require('electron');
const bootstrap = require('bootstrap');

// content variable
const content = document.querySelector("#content");
const editTravelOfferBtn = document.querySelector("#editTravelOfferBtn");
const deleteTravelOfferBtn = document.querySelector("#deleteTravelOfferBtn");
const deleteCardBtnYes = document.querySelector("#deleteCardBtnYes");

// content variable that will be initialized after HTML generation
let titleOffer;
let priceOffer;
let destinationOffer;
let shortDescriptionOffer;
let longDescriptionOffer;
let advantagesOffer;
let firstAdvantageOffer;
let secondAdvantageOffer;
let thirdAdvantageOffer;

// Bootstrap modals initialization
var modalDeleteDOM = document.querySelector("#modalDelete");
var modalDelete = new bootstrap.Modal(modalDeleteDOM);

// IPCRenderer initialization data function
ipcRenderer.on('init-data', (e, card) => {

    let upToDateCard;

    //If the page is reloaded we need to get up to date card infos
    ipcRenderer.invoke("reload-window", card.id)
        .then((response) => {
            upToDateCard = response;

            //calling the createCard function in order to create our detailed version of the offer
            createCard(upToDateCard);

            //now that the HTML has been generatted we can affect each variable
            titleOffer = document.querySelector("#titleOffer");
            priceOffer = document.querySelector("#priceOffer");
            destinationOffer = document.querySelector("#destinationOffer");
            shortDescriptionOffer = document.querySelector("#shortDescriptionOffer");
            longDescriptionOffer = document.querySelector("#longDescriptionOffer");
            advantagesOffer = document.querySelector("#advantagesOffer");

            //these 3 variables can be null if the offer has no advantages registred but we will check if null later on
            firstAdvantageOffer = document.querySelector("#advantage0");
            secondAdvantageOffer = document.querySelector("#advantage1");
            thirdAdvantageOffer = document.querySelector("#advantage2");

            // STEP 1 : To delete the offer, user click on the delete button, we popup confirmation modal
            deleteTravelOfferBtn.addEventListener('click', () => {
                modalDelete.toggle();
            });

            // STEP 2 : If the user clicked on the yes button in the modal, we send message to main.js
            deleteCardBtnYes.addEventListener('click', (e) => {
                ipcRenderer.send("delete-offer", card);
            });

            // User clicked on edit offer, we send message to main.js to open the edit-offer window with up to date card
            editTravelOfferBtn.removeEventListener('click', editBtnCallBack);
            editTravelOfferBtn.addEventListener('click',editBtnCallBack);

            function editBtnCallBack(){
                ipcRenderer.send("open-edit-offer-window", upToDateCard);
            }
        });
});



//This function create the card given
function createCard(card) {

    //Building the whole HTML card with props for each card (See home.html to check the template)
    let html = '';
    html += `<div id="card${card.id}" class="col-11 mx-auto card shadow py-3 px-3 mb-3">`;
    html += `<div class="row">`;
    html += `<div class="col-6 text-left">`;
    html += `<h5 id="titleOffer" class="px-2">${card.title}</h2>`;
    html += `</div>`;
    html += `<div class="col-6 ">`;
    html += `<h5 id="destinationOffer" class="lead text-end px-2">${card.destination}</h2>`;
    html += `</div>`;
    html += `</div>`;
    html += `<div class="row mt-2">`;
    html += `<div class="col-7">`;
    html += `<div id="img${card.id}">`;
    html += `<img class="img-fluid rounded" src="../../assets/img/bali.jpeg">`;
    html += `</div>`;
    html += `</div>`;
    html += `<div class="col-5">`;
    html += `<div class="row mt-2">`;
    html += `<div class="col-7">`;
    html += `<div id="shortDescriptionOffer" class="lead pt-2 border-top">`;
    html += card.shortDescription;
    html += `</div>`;
    html += `<div class="lead fw-bold mt-3">`;
    html += `<span>Les plus : </span>`;
    html += `<div class="lead">`;
    html += `<ul id="advantagesOffer">`;
    card.advantages.forEach((advantage, index) => {
        html += `<li id="advantage${index}">${advantage}</li>`;
    });
    html += `</ul>`;
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;
    html += `<div class="col-5">`;
    html += `<div id="priceOffer" class="lead text-danger display-5 text-end px-2">`;
    html += card.price;
    html += ` €</div>`;
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;
    html += `<div class="row mt-3">`;
    html += `<div class="col border-top">`;
    html += `<p id="longDescriptionOffer">${card.longDescription}</p>`;
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;

    //Finally adding the whole HTML card template at the end of parent node.
    content.insertAdjacentHTML('afterbegin', html);
}

function updateContent(editedCard) {
    titleOffer.innerText = editedCard.title !== undefined ? editedCard.title : '';
    shortDescriptionOffer.innerText = editedCard.shortDescription !== undefined ? editedCard.shortDescription : '';
    destinationOffer.innerText = editedCard.destination !== undefined ? editedCard.destination : '';
    longDescriptionOffer.innerText = editedCard.longDescription !== undefined ? editedCard.longDescription : '';

    let html = '';
    editedCard.advantages.forEach((advantage, index) => {
        html += `<li id="advantage${index}">${advantage}</li>`
    })
    advantagesOffer.innerHTML = '';
    advantagesOffer.insertAdjacentHTML('afterbegin', html);
    priceOffer.innerText = editedCard.price !== undefined ? editedCard.price + '€' : '';
}
