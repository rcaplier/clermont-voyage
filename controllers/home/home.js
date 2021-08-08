const {ipcRenderer} = require('electron');
const bootstrap = require('bootstrap');

// content variable
const content = document.querySelector("#content");
const newOfferBtn = document.querySelector("#newTravelOfferBtn");

var modalInfoDOM = document.querySelector("#modalInfo");
var modalInfoBody = modalInfoDOM.querySelector(".modal-body");
var modalInfo = new bootstrap.Modal(modalInfoDOM);

//We gather all the cards in this variable
let cardElements = null;


// IPCRenderer initialization data function
ipcRenderer.on('init-data', (e, cards) => {

    //calling the createCards function in order to create all cards on the home window
    createCards(cards);

    //then we can add each one in the variable we just create above (cvcard = Clermond Voyage Card)
    cardElements = document.querySelectorAll(".cvcard");

    //then we can add the on click event listener on each on in order to open the fullcard window
    cardElements.forEach((card)=>{
        card.addEventListener('click',(e)=>{

            //We only keep numbers from the card id which is like "card23" using regexp
            let cardId = card.id.match(/(\d+)/)[0];
            ipcRenderer.send("open-offer-detailed-window", cardId);
        })
    });

    //Adding the on click event on the new offer button to open the newCard window.
    newOfferBtn.addEventListener('click', () =>{
        ipcRenderer.send('show-new-card-window');
    })

    ipcRenderer.on("offer-deleted", (e, data) => {
        //Adding the bootstrap text color class
        modalInfoBody.classList.remove('text-danger', 'text-success');
        modalInfoBody.classList.add(`text-${data.type}`);
        modalInfoBody.textContent = data.msg;
        modalInfo.toggle();
    })
});



//This function create each cards saved in local DB
function createCards(cards) {

    //Building the whole HTML card with props for each card (See home.html to check the template)
    let html = '';
    cards.forEach((card)=> {
        html += `<div id="card${card.id}" class="cvcard col-11 mx-auto card shadow py-3 px-3 mb-3">`;
        html += `<div class="row">`;
        html += `<div class="col-6 text-left">`;
        html += `<h5 id="title" class="px-2">${card.title}</h2>`;
        html += `</div>`;
        html += `<div class="col-6 ">`;
        html += `<h5 id="destination" class="lead text-end px-2">${card.destination}</h2>`;
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
        html += `<div id="shortDesc" class="lead pt-2 border-top">`;
        html+= card.shortDescription;
        html += `</div>`;
        html += `<div class="lead fw-bold mt-3">`;
        html += `<span>Les plus : </span>`;
        html += `<div class="lead" id ="advantages${card.id}">`;
        html += `<ul>`;
        card.advantages.forEach((advantage)=>{
            html += `<li>${advantage}</li>`;
        });
        html += `</ul>`;
        html += `</div>`;
        html += `</div>`;
        html += `</div>`;
        html += `<div class="col-5">`;
        html += `<div id="prix${card.id}" class="lead text-danger display-5 text-end px-2">`;
        html += card.price;
        html += ` €</div>`;
        html += `</div>`;
        html += `</div>`;
        html += `</div>`;
        html += `</div>`;
        html += `</div>`;
    });

    //Finally adding the whole HTML card template at the end of parent node.
    content.insertAdjacentHTML('beforeend',html);
}


