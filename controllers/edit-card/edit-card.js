const {ipcRenderer} = require('electron');
const bootstrap = require('bootstrap');


// content variable
const titleOffer = document.querySelector("#titleOffer");
const priceOffer = document.querySelector("#priceOffer");
const destinationOffer = document.querySelector("#destinationOffer");
const shortDescriptionOffer = document.querySelector("#shortDescriptionOffer");
const longDescriptionOffer = document.querySelector("#longDescriptionOffer");
const firstAdvantageOffer = document.querySelector("#firstAdvantageOffer");
const secondAdvantageOffer = document.querySelector("#secondAdvantageOffer");
const thirdAdvantageOffer = document.querySelector("#thirdAdvantageOffer");
const applyModificationButton = document.querySelector("#applyModificationButton");

var modalInfoElement = document.querySelector("#modalInfo");
var modalInfoContent = modalInfoElement.querySelector(".modal-body");
var modalInfo = new bootstrap.Modal(modalInfoElement);

// IPCRenderer initialization data function
ipcRenderer.on('init-data', (e, card) => {

    let cardUpToDate;

    //If the page is reloaded we need to get up to date card infos
    ipcRenderer.invoke("reload-window", card.id)
        .then((response) =>{
            cardUpToDate = response;

            //We initialize each form input with the offer content if not undefined
            titleOffer.value = cardUpToDate.title !== undefined ? cardUpToDate.title : '';
            shortDescriptionOffer.value = cardUpToDate.shortDescription !== undefined ? cardUpToDate.shortDescription : '';
            destinationOffer.value = cardUpToDate.destination !== undefined ? cardUpToDate.destination : '';
            longDescriptionOffer.value = cardUpToDate.longDescription !== undefined ? cardUpToDate.longDescription : '';
            firstAdvantageOffer.value = cardUpToDate.advantages[0] !== undefined ? cardUpToDate.advantages[0] : '';
            secondAdvantageOffer.value = cardUpToDate.advantages[1] !== undefined ? cardUpToDate.advantages[1] : '';
            thirdAdvantageOffer.value = cardUpToDate.advantages[2] !== undefined ? cardUpToDate.advantages[2] : '';
            priceOffer.value = !cardUpToDate.price !== undefined ? cardUpToDate.price : '';

            //When user clicked on apply modification button, we create the new cardUpToDate object with every input of the form and send it to main.js
            applyModificationButton.addEventListener('click', (e) => {
                e.preventDefault();

                let advantagesOffer = [];
                if (firstAdvantageOffer.value !== ''){
                    advantagesOffer.push(firstAdvantageOffer.value);
                }
                if (secondAdvantageOffer.value !== ''){
                    advantagesOffer.push(secondAdvantageOffer.value);
                }
                if (thirdAdvantageOffer.value !== ''){
                    advantagesOffer.push(thirdAdvantageOffer.value);
                }

                let newOfferCard = {
                    id: cardUpToDate.id,
                    title: titleOffer.value,
                    shortDescription: shortDescriptionOffer.value,
                    longDescription: longDescriptionOffer.value,
                    destination: destinationOffer.value,
                    advantages: advantagesOffer,
                    price: priceOffer.value,
                    imgUrl: ''
                }

                ipcRenderer
                    .invoke("edit-offer", newOfferCard)
                    .then((response) => {
                        modalInfoContent.classList.remove('text-danger', 'text-success');
                        modalInfoContent.classList.add(`text-${response.type}`);
                        modalInfoContent.textContent = response.msg;
                        modalInfo.toggle();
                    });
            })
        });
});

