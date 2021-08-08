const {ipcRenderer} = require('electron');
const bootstrap = require('bootstrap');



// content variable
const titleOffer = document.querySelector("#titleOffer");
const priceOffer = document.querySelector("#priceOffer");
const destinationOffer = document.querySelector("#destinationOffer");
const shortDescription = document.querySelector("#shortDescription");
const longDescriptionOffer = document.querySelector("#longDescriptionOffer");
const firstAdvantageOffer = document.querySelector("#firstAdvantageOffer");
const secondAdvantageOffer = document.querySelector("#secondAdvantageOffer");
const thirdAdvantageOffer = document.querySelector("#thirdAdvantageOffer");
const addNewOfferButton = document.querySelector("#addNewOfferButton");

var myModal = document.querySelector("#myModal");
var myModalPopUp = new bootstrap.Modal(document.getElementById('myModal'));

addNewOfferButton.addEventListener('click', (e) => {
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
        id: -1,
        title: titleOffer.value,
        shortDescription: shortDescription.value,
        longDescription: longDescriptionOffer.value,
        destination: destinationOffer.value,
        advantages: advantagesOffer,
        price: priceOffer.value,
        imgUrl: ''
    }

    ipcRenderer
        .invoke("new-offer", newOfferCard)
        .then((response) => {
            myModal.querySelector(".modal-body").textContent = response.msg;
            console.log(myModalPopUp);
            myModalPopUp.toggle();
        });
})