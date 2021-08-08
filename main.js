////////////////////////// APP VARIABLES INIT ////////////////////////
const {
        app,
        BrowserWindow,
        ipcMain,
        dialog,
        Tray
    } = require('electron'),
    path = require('path'),
    Store = require('electron-store');

ICON_NAME = 'cvapp.png'

/////////////// Persistence variable ////////////
const store = new Store();

//////////////// App windows variables //////////////////
let mainWindow;
let newCardWindow;
let detailedCardWindow;
let editCardWindow;

////////////////   System Tray /////////////////////
let tray = null;

function showSystemTray() {
    //TODO manage tray icon for mac users
    tray = new Tray(path.join(__dirname, 'assets', 'img', ICON_NAME));
    tray.setToolTip("Mets moi 20/20 lol.");
}


//Let's get the data from our local storage DB.
let cards = store.get('cards');

//If there is no data in our DB we're actually adding one so new user can see a card sample.
if (!cards || cards.length === 0) {
    //Creating the object following this template.
    cards = [{
        id: 1,
        title: "Voyage incroyable au soleil",
        shortDescription: "Jamais vous n'oublierez ce voyage.",
        longDescription: "Vraiment, je vous assure, vraiment, vous n'oublierez ce voyage tellement incroyable.",
        destination: 'Bali',
        advantages: [
            "Hotel inclus",
            "Excursion en pirogue avec la population locale"
        ],
        price: '1299',
        imgUrl: ''
    }];

    //And finnaly store it in the local DB.
    store.set('cards', cards);
}


//The function used to create all our windows.
const createWindow = (viewName, data, width = 1400, height = 1000) => {
    const win = new BrowserWindow({
        width: width,
        height: height,
        icon: path.join(__dirname, 'assets', 'img', ICON_NAME),
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile(path.join(__dirname, 'views', viewName, `${viewName}.html`));

    if (data) {
        win.webContents.on('did-finish-load', () => {
            win.webContents.send('init-data', data);
        });
    }

    return win;
};

//Creating the main window and showing the systray as soon as application is fully loaded
app.whenReady().then(() => {
    mainWindow = createWindow('home', cards);
    showSystemTray();

    mainWindow.on('close', () => {
        //TODO ADD popup modal "Are you sure you want to quit the app ?"
        app.quit();
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow('home', null);
        mainWindow.webContents.on('did-finish-load', () => {
            mainWindow.webContents.send('init-data', cards);
        });

        mainWindow.on('close', () => {
            //TODO ADD popup modal "Are you sure you want to quit the app ?"
            app.quit();
        })
    }
});

//IPC listener that handle the opening of the new offer window
ipcMain.on("show-new-card-window", () => {

    //We give the focus back to the window if already opened or we create a brand new one.
    if (newCardWindow) {
        newCardWindow.focus();
    } else {
        newCardWindow = createWindow('new-card', null, 800, 600);

        ipcMain.handle("new-offer", (e, newOffer) => {

            //We get the id for the new offer
            if (cards.length === 0) {
                newOffer.id = 1;
            } else {
                newOffer.id = cards.length + 1;
            }

            cards.push(newOffer);

            //Need to refresh the content
            mainWindow.webContents.reloadIgnoringCache();

            // Update the DB with the new offer
            store.set('cards', cards);

            // Return a message to the new form for show a success message
            return {
                msg: 'Offre ajoutée avec succès !'
            };
        });

        //We have to empty the variable on close to prevent bug on close and pressing the new offer button again.
        newCardWindow.on('close', () => {
            ipcMain.removeHandler("new-offer");
            newCardWindow = null;
        });
    }
})

//IPC listener that handle the opening of the detailed-offer window
ipcMain.on("open-offer-detailed-window", (e, cardId) => {

    //We give the focus back to the window if already opened or we create a brand new one.
    if (detailedCardWindow) {
        detailedCardWindow.focus();
    } else {

        //Before opening the detailed-card window, we need to get the card object from the storage in order to send it
        let cardToEdit = getCardById(cardId);
        if (cardToEdit != null) {
            detailedCardWindow = createWindow('detailed-card', cardToEdit, 1200, 900);
        }
        //We have to empty the variable on close to prevent bug on close and pressing the new offer button again.
        detailedCardWindow.on('close', () => {
            detailedCardWindow = null;
        });
    }
});

//IPC listener that handle the opening of the detailed-offer window
ipcMain.on("open-edit-offer-window", (e, card) => {


    //We give the focus back to the window if already opened or we create a brand new one.
    if (editCardWindow) {
        editCardWindow.webContents.reloadIgnoringCache();
        editCardWindow.focus();
    } else {

        editCardWindow = createWindow('edit-card', card, 800, 600);

        //We have to empty the variable on close to prevent bug on close and pressing the new offer button again.
        editCardWindow.on('close', () => {
            editCardWindow = null;
        });
    }
});

//IPC listener that handle when the edit-offer window send the new edited offer
ipcMain.handle("edit-offer", (e, editedCard) => {

    //First, we need to get the index of our card in our array
    let index = cards.findIndex((card => card.id === editedCard.id));

    //The findIndex method return -1 if the object was not found, we shouldn't have any problems but let's make sure that our object is in our array before pushing it in
    if (index !== -1) {
        cards[index] = editedCard;

        // Update the DB with the new offer
        store.set('cards', cards);

        // Here we need to reload main window to take change into consideration
        // But we also need to get the detailed window up to date with the new content
        mainWindow.webContents.reloadIgnoringCache();
        detailedCardWindow.webContents.reloadIgnoringCache();

        // Return a message to the new form for show a success message
        return {
            type: "success",
            msg: "L'offre a été éditée avec succès !",
        };
    } else {
        return {
            type: "danger",
            msg: "L'offre n'a pas pu être éditée",
        };
    }
});

ipcMain.on("delete-offer", (e, deletedCard) => {

    //First, we need to get the index of our card in our array
    let index = cards.findIndex((card => card.id === deletedCard.id));

    //Same thing that for the edition, we check it before deleting it
    if (index !== -1) {

        cards.splice(index, 1);

        //Need to refresh the content
        mainWindow.webContents.reloadIgnoringCache();

        // Update the DB with the new offer
        store.set('cards', cards);

        //The offer has been deleted so we no longer to show the detailed window so we close it and give back the focus to the main window
        detailedCardWindow.close();
        mainWindow.focus();

        //Timeout is needed cause the previous reloading prevent modal to popup.
        setTimeout(() => {
            //We also can popup the information modal to confirm the user that the offer has been successfully deleted
            mainWindow.webContents.send("offer-deleted", {
                type: "success",
                msg: "L'offre a bien été supprimée !",
            });
        }, 200);


    } else {
        //The offer has not been deleted we close the detailed window, give the focus back to main window and inform the user
        detailedCardWindow.close();
        mainWindow.focus();
        setTimeout(() => {
            mainWindow.webContents.send("offer-deleted", {
                type: "danger",
                msg: "L'offre n'a pas pu être supprimée",
            });
        }, 200);
    }
});

//This listener is here to manage when a window is reloaded and need to have its content updated
ipcMain.handle("reload-window", (e, cardId)=>{
    let upToDateCard = getCardById(cardId);
    if (upToDateCard !== null){
        return upToDateCard;
    }
})

//function that return the unique card with a given id (can be number or string, this function can handle both) or null if the given id doesn't exist
function getCardById(cardId) {
    let id = !isNaN(cardId) ? parseInt(cardId) : cardId;
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].id === id) {
            return cards[i];
        }
    }
    return null;
}